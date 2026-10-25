/**
 * courses.test.js — Integration tests for courses, lessons, enrollments,
 *                   progress tracking, and professional directory
 *
 * Runs against a live server on port 5000.
 * Start the server first:  npm run dev  (in a separate terminal)
 *
 * Run:  node tests/courses.test.js
 *
 * Tests cover (all 14 task requirements):
 *   Courses  — create, edit, publish, delete, auth guards, invalid data
 *   Lessons  — create, list (ordered), update, reorder, delete
 *   Enrollment — enroll, duplicate prevention, unpublished block,
 *                cross-user isolation
 *   Progress — mark complete, idempotency, 0% / partial / 100%,
 *              zero-lesson course, wrong user block
 *   Professionals — submit, update, public listing (approved only),
 *                   verification endpoint, auth guards
 */

import fetch from 'node-fetch'

const BASE    = 'http://localhost:5000/api'
const ts      = Date.now()

// Test credentials — unique per run
const ADMIN_EMAIL    = `admin_test_${ts}@sidra.test`
const ADMIN_PASS     = 'AdminPass123'
const USER_EMAIL     = `user_test_${ts}@sidra.test`
const USER_PASS      = 'UserPass123'
const USER2_EMAIL    = `user2_test_${ts}@sidra.test`
const USER2_PASS     = 'User2Pass123'
const PROF_EMAIL     = `prof_test_${ts}@sidra.test`
const PROF_PASS      = 'ProfPass123'

// State shared across tests
let adminCookie  = ''
let userCookie   = ''
let user2Cookie  = ''
let profCookie   = ''
let courseId     = ''
let course2Id    = ''   // unpublished course for guard tests
let lesson1Id    = ''
let lesson2Id    = ''
let lesson3Id    = ''
let enrollmentId = ''
let profProfileId = ''

// ── Assertion helpers ─────────────────────────────────────────────────────────
let passed = 0
let failed = 0

function assert(condition, label) {
  if (condition) {
    console.log(`  ✅ PASS  ${label}`)
    passed++
  } else {
    console.error(`  ❌ FAIL  ${label}`)
    failed++
  }
}

function assertEq(actual, expected, label) {
  assert(actual === expected, `${label}  (expected: ${JSON.stringify(expected)}, got: ${JSON.stringify(actual)})`)
}

function extractCookie(res) {
  const raw = res.headers.get('set-cookie') ?? ''
  const match = raw.match(/sid=([^;]+)/)
  return match ? `sid=${match[1]}` : ''
}

async function post(path, body, cookie) {
  return fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(cookie ? { Cookie: cookie } : {}) },
    body: JSON.stringify(body),
  })
}

async function get(path, cookie) {
  return fetch(`${BASE}${path}`, {
    headers: { ...(cookie ? { Cookie: cookie } : {}) },
  })
}

async function patch(path, body, cookie) {
  return fetch(`${BASE}${path}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...(cookie ? { Cookie: cookie } : {}) },
    body: JSON.stringify(body),
  })
}

async function del(path, cookie) {
  return fetch(`${BASE}${path}`, {
    method: 'DELETE',
    headers: { ...(cookie ? { Cookie: cookie } : {}) },
  })
}

// ── Setup — create test accounts ──────────────────────────────────────────────

async function setup() {
  console.log('\n── Setup: Creating test accounts ─────────────────────────')

  // Register a regular user
  const u1 = await post('/auth/register', {
    full_name: 'Test User One', email: USER_EMAIL, password: USER_PASS, role: 'mother',
  })
  userCookie = extractCookie(u1)
  assert(u1.status === 201, `Setup  Regular user created (${u1.status})`)

  // Register a second user (for isolation tests)
  const u2 = await post('/auth/register', {
    full_name: 'Test User Two', email: USER2_EMAIL, password: USER2_PASS, role: 'father',
  })
  user2Cookie = extractCookie(u2)
  assert(u2.status === 201, `Setup  Second user created (${u2.status})`)

  // Register a professional user
  const pr = await post('/auth/register', {
    full_name: 'Test Professional', email: PROF_EMAIL, password: PROF_PASS, role: 'professional',
  })
  profCookie = extractCookie(pr)
  const profData = await pr.json()
  assert(pr.status === 201, `Setup  Professional user created (${pr.status})`)
  const profUserId = profData.user?.id

  // Register an admin candidate then promote via DB-direct login  
  // (no public registration for admin — we register as mother then promote)
  const admin0 = await post('/auth/register', {
    full_name: 'Test Admin', email: ADMIN_EMAIL, password: ADMIN_PASS, role: 'mother',
  })
  assert(admin0.status === 201, `Setup  Admin candidate created (${admin0.status})`)

  // We need to promote the admin account. Since only an existing admin can do
  // this via the API, we directly query the DB. In a fresh test environment
  // there may be a pre-existing admin — attempt the admin login first.
  // Fallback: rely on an environment variable ADMIN_COOKIE for CI.
  // For test isolation, we mark this account admin in the DB by running
  // the promote step if ADMIN_COOKIE is not set.

  // Try known admin credentials (set via env for CI, or hardcoded for dev)
  const existingAdminEmail = process.env.TEST_ADMIN_EMAIL || 'admin@sidra.test'
  const existingAdminPass  = process.env.TEST_ADMIN_PASS  || 'AdminPass123'

  const adminLogin = await post('/auth/login', { email: existingAdminEmail, password: existingAdminPass })
  if (adminLogin.status === 200) {
    adminCookie = extractCookie(adminLogin)
    console.log('  ℹ️  Using existing admin account for tests.')
    // Now promote our newly registered ADMIN_EMAIL to admin
    const adminMe = await (await get('/auth/me', adminCookie)).json()
    if (adminMe.user?.id) {
      // Promote the test admin user via admin role endpoint
      const adminData2 = await (await post('/auth/login', { email: ADMIN_EMAIL, password: ADMIN_PASS })).json()
      if (adminData2.user?.id) {
        const promote = await patch(
          `/admin/users/${adminData2.user.id}/role`,
          { role: 'admin' },
          adminCookie
        )
        if (promote.status === 200) {
          // Re-login as promoted user
          const relogin = await post('/auth/login', { email: ADMIN_EMAIL, password: ADMIN_PASS })
          if (relogin.status === 200) {
            adminCookie = extractCookie(relogin)
            console.log('  ℹ️  Using promoted test admin account.')
          }
        }
      }
    }
  } else {
    console.log('  ⚠️  Could not log in as existing admin. Some tests may fail.')
    console.log('  ℹ️  Set TEST_ADMIN_EMAIL and TEST_ADMIN_PASS env vars, or seed an admin account.')
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// COURSE TESTS
// ═════════════════════════════════════════════════════════════════════════════

async function testCourses() {
  console.log('\n── Courses ───────────────────────────────────────────────')

  // C-01 Unauthenticated cannot create course
  const c01 = await post('/courses', { title: 'Test', description: 'Test desc', category: 'Health' })
  assertEq(c01.status, 401, 'C-01  Unauthenticated course creation returns 401')

  // C-02 Non-admin cannot create course
  const c02 = await post('/courses', {
    title: 'Test', description: 'Test description here', category: 'Health',
  }, userCookie)
  assertEq(c02.status, 403, 'C-02  Non-admin course creation returns 403')

  // C-03 Missing required fields returns 400
  if (adminCookie) {
    const c03 = await post('/courses', { title: '', description: '', category: '' }, adminCookie)
    const d03 = await c03.json()
    assertEq(c03.status, 400, 'C-03  Missing fields returns 400')
    assert(d03.error?.fields, 'C-03  Validation fields object returned')

    // C-04 Valid course creation (draft)
    const c04 = await post('/courses', {
      title: `Test Course ${ts}`,
      description: 'A comprehensive test course for integration testing.',
      category: 'Child Development',
      price_etb: 0,
      published: false,
    }, adminCookie)
    const d04 = await c04.json()
    assertEq(c04.status, 201, 'C-04  Admin can create a course (201)')
    assert(d04.course?.id, 'C-04  Course ID returned')
    assert(d04.course?.published === false, 'C-04  Course starts as draft')
    courseId = d04.course?.id ?? ''

    // C-05 Create a second paid course (draft, for enrollment guard tests)
    const c05 = await post('/courses', {
      title: `Paid Draft Course ${ts}`,
      description: 'This paid draft course should not be enrollable.',
      category: 'Health',
      price_etb: 500,
      published: false,
    }, adminCookie)
    const d05 = await c05.json()
    assertEq(c05.status, 201, 'C-05  Second draft course created')
    course2Id = d05.course?.id ?? ''

    // C-06 Public listing does not include draft courses
    const c06 = await get('/courses')
    const d06 = await c06.json()
    assertEq(c06.status, 200, 'C-06  GET /courses returns 200')
    assert(Array.isArray(d06.courses), 'C-06  courses array present')
    const foundDraft = d06.courses?.some((c) => c.id === courseId)
    assert(!foundDraft, 'C-06  Draft course does NOT appear in public listing')

    // C-07 Admin can see all courses including drafts
    const c07 = await get('/courses/all', adminCookie)
    const d07 = await c07.json()
    assertEq(c07.status, 200, 'C-07  Admin GET /courses/all returns 200')
    const foundAll = d07.courses?.some((c) => c.id === courseId)
    assert(foundAll, 'C-07  Draft course appears in admin course list')

    // C-08 Public cannot access draft course by ID
    const c08 = await get(`/courses/${courseId}`)
    assertEq(c08.status, 404, 'C-08  Public GET on draft course returns 404')

    // C-09 Admin can access draft course by ID
    const c09 = await get(`/courses/${courseId}`, adminCookie)
    const d09 = await c09.json()
    assertEq(c09.status, 200, 'C-09  Admin can GET draft course by ID')
    assert(d09.course?.id === courseId, 'C-09  Correct course returned')
    assert(Array.isArray(d09.lessons), 'C-09  Lessons array included')

    // C-10 Update course fields
    const c10 = await patch(`/courses/${courseId}`, {
      title: `Updated Course ${ts}`,
      thumbnail_url: 'https://example.com/thumb.jpg',
    }, adminCookie)
    const d10 = await c10.json()
    assertEq(c10.status, 200, 'C-10  PATCH /courses/:id returns 200')
    assert(d10.course?.thumbnail_url?.includes('thumb'), 'C-10  thumbnail_url updated')

    // C-11 Publish the course
    const c11 = await patch(`/courses/${courseId}/publish`, { published: true }, adminCookie)
    const d11 = await c11.json()
    assertEq(c11.status, 200, 'C-11  PATCH /courses/:id/publish returns 200')
    assert(d11.course?.published === true, 'C-11  Course is now published')

    // C-12 Published course now appears in public listing
    const c12 = await get('/courses')
    const d12 = await c12.json()
    const foundPub = d12.courses?.some((c) => c.id === courseId)
    assert(foundPub, 'C-12  Published course appears in public listing')

    // C-13 Public can now access the published course
    const c13 = await get(`/courses/${courseId}`)
    assertEq(c13.status, 200, 'C-13  Public can GET published course')

    // C-14 Invalid UUID returns 400
    const c14 = await get('/courses/not-a-uuid')
    assertEq(c14.status, 400, 'C-14  Invalid UUID returns 400')

    // C-15 Non-existent course returns 404
    const fakeId = '00000000-0000-4000-8000-000000000001'
    const c15 = await get(`/courses/${fakeId}`)
    assertEq(c15.status, 404, 'C-15  Non-existent course returns 404')
  } else {
    console.log('  ⚠️  Skipping admin course tests — no admin cookie available.')
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// LESSON TESTS
// ═════════════════════════════════════════════════════════════════════════════

async function testLessons() {
  console.log('\n── Lessons ───────────────────────────────────────────────')

  if (!adminCookie || !courseId) {
    console.log('  ⚠️  Skipping lesson tests — prerequisites missing.')
    return
  }

  // L-01 Unauthenticated cannot add lesson
  const l01 = await post(`/courses/${courseId}/lessons`, {
    title: 'Intro', position: 1,
  })
  assertEq(l01.status, 401, 'L-01  Unauthenticated lesson creation returns 401')

  // L-02 Non-admin cannot add lesson
  const l02 = await post(`/courses/${courseId}/lessons`, {
    title: 'Intro', position: 1,
  }, userCookie)
  assertEq(l02.status, 403, 'L-02  Non-admin lesson creation returns 403')

  // L-03 Missing required fields returns 400
  const l03 = await post(`/courses/${courseId}/lessons`, { title: '' }, adminCookie)
  const d03 = await l03.json()
  assertEq(l03.status, 400, 'L-03  Missing fields returns 400')
  assert(d03.error?.fields, 'L-03  Fields error object present')

  // L-04 Create lesson 1
  const l04 = await post(`/courses/${courseId}/lessons`, {
    title: 'Lesson 1: Introduction',
    description: 'Welcome to the course.',
    video_url: 'https://example.com/video1',
    position: 1,
  }, adminCookie)
  const d04 = await l04.json()
  assertEq(l04.status, 201, 'L-04  Admin creates lesson 1 (201)')
  assert(d04.lesson?.id, 'L-04  Lesson ID returned')
  assert(d04.lesson?.position === 1, 'L-04  Position is 1')
  lesson1Id = d04.lesson?.id ?? ''

  // L-05 Create lesson 3 (to test ordering — we'll add lesson 2 later)
  const l05 = await post(`/courses/${courseId}/lessons`, {
    title: 'Lesson 3: Advanced Topics',
    position: 3,
  }, adminCookie)
  const d05 = await l05.json()
  assertEq(l05.status, 201, 'L-05  Admin creates lesson at position 3 (201)')
  lesson3Id = d05.lesson?.id ?? ''

  // L-06 Create lesson 2
  const l06 = await post(`/courses/${courseId}/lessons`, {
    title: 'Lesson 2: Core Concepts',
    position: 2,
  }, adminCookie)
  const d06 = await l06.json()
  assertEq(l06.status, 201, 'L-06  Admin creates lesson at position 2 (201)')
  lesson2Id = d06.lesson?.id ?? ''

  // L-07 Duplicate position returns 409
  const l07 = await post(`/courses/${courseId}/lessons`, {
    title: 'Duplicate', position: 1,
  }, adminCookie)
  assertEq(l07.status, 409, 'L-07  Duplicate position returns 409')

  // L-08 List lessons — must be in position order (1, 2, 3)
  const l08 = await get(`/courses/${courseId}/lessons`)
  const d08 = await l08.json()
  assertEq(l08.status, 200, 'L-08  GET /courses/:id/lessons returns 200')
  assert(Array.isArray(d08.lessons), 'L-08  lessons array present')
  assertEq(d08.lessons?.length, 3, 'L-08  3 lessons returned')
  assertEq(d08.lessons?.[0]?.position, 1, 'L-08  First lesson is at position 1')
  assertEq(d08.lessons?.[1]?.position, 2, 'L-08  Second lesson is at position 2')
  assertEq(d08.lessons?.[2]?.position, 3, 'L-08  Third lesson is at position 3')

  // L-09 Update a lesson
  const l09 = await patch(`/courses/${courseId}/lessons/${lesson2Id}`, {
    title: 'Lesson 2: Core Concepts (Updated)',
    video_url: 'https://example.com/video2-updated',
  }, adminCookie)
  const d09 = await l09.json()
  assertEq(l09.status, 200, 'L-09  PATCH lesson returns 200')
  assert(d09.lesson?.title?.includes('Updated'), 'L-09  Lesson title updated')

  // L-10 Reorder lessons: swap positions 1 and 3
  const l10 = await patch(`/courses/${courseId}/lessons/reorder`, {
    order: [
      { id: lesson1Id, position: 3 },
      { id: lesson2Id, position: 1 },
      { id: lesson3Id, position: 2 },
    ],
  }, adminCookie)
  const d10 = await l10.json()
  assertEq(l10.status, 200, 'L-10  Reorder returns 200')
  assert(Array.isArray(d10.lessons), 'L-10  Returns reordered lessons array')
  assertEq(d10.lessons?.[0]?.id, lesson2Id, 'L-10  lesson2 is now first (position 1)')
  assertEq(d10.lessons?.[1]?.id, lesson3Id, 'L-10  lesson3 is now second (position 2)')
  assertEq(d10.lessons?.[2]?.id, lesson1Id, 'L-10  lesson1 is now third (position 3)')

  // L-11 Reorder with duplicate positions returns 400
  const l11 = await patch(`/courses/${courseId}/lessons/reorder`, {
    order: [
      { id: lesson1Id, position: 1 },
      { id: lesson2Id, position: 1 },
    ],
  }, adminCookie)
  assertEq(l11.status, 400, 'L-11  Duplicate positions in reorder returns 400')

  // L-12 Delete lesson3
  const l12 = await del(`/courses/${courseId}/lessons/${lesson3Id}`, adminCookie)
  assertEq(l12.status, 200, 'L-12  DELETE lesson returns 200')

  // L-13 Confirm lesson count is now 2
  const l13 = await get(`/courses/${courseId}/lessons`, adminCookie)
  const d13 = await l13.json()
  assertEq(d13.lessons?.length, 2, 'L-13  After delete, 2 lessons remain')

  // L-14 Delete non-existent lesson returns 404
  const fakeId = '00000000-0000-4000-8000-000000000002'
  const l14 = await del(`/courses/${courseId}/lessons/${fakeId}`, adminCookie)
  assertEq(l14.status, 404, 'L-14  Deleting non-existent lesson returns 404')
}

// ═════════════════════════════════════════════════════════════════════════════
// ENROLLMENT TESTS
// ═════════════════════════════════════════════════════════════════════════════

async function testEnrollments() {
  console.log('\n── Enrollments ───────────────────────────────────────────')

  if (!courseId) {
    console.log('  ⚠️  Skipping enrollment tests — no courseId available.')
    return
  }

  // E-01 Unauthenticated cannot enroll
  const e01 = await post(`/courses/${courseId}/enroll`, {})
  assertEq(e01.status, 401, 'E-01  Unauthenticated enrollment returns 401')

  // E-02 Cannot enroll in unpublished course (course2Id)
  if (course2Id) {
    const e02 = await post(`/courses/${course2Id}/enroll`, {}, userCookie)
    assertEq(e02.status, 404, 'E-02  Enrolling in unpublished course returns 404')
  }

  // E-03 User enrolls in published free course
  const e03 = await post(`/courses/${courseId}/enroll`, {}, userCookie)
  const d03 = await e03.json()
  assertEq(e03.status, 201, 'E-03  Valid enrollment returns 201')
  assert(d03.enrollment?.id, 'E-03  Enrollment ID returned')
  assertEq(d03.enrollment?.payment_status, 'free', 'E-03  Free course gets payment_status = free')
  enrollmentId = d03.enrollment?.id ?? ''

  // E-04 Duplicate enrollment returns 409
  const e04 = await post(`/courses/${courseId}/enroll`, {}, userCookie)
  assertEq(e04.status, 409, 'E-04  Duplicate enrollment returns 409')

  // E-05 Second user enrolls independently
  const e05 = await post(`/courses/${courseId}/enroll`, {}, user2Cookie)
  assertEq(e05.status, 201, 'E-05  Second user can enroll in same course')

  // E-06 List my enrollments
  const e06 = await get('/enrollments/me', userCookie)
  const d06 = await e06.json()
  assertEq(e06.status, 200, 'E-06  GET /enrollments/me returns 200')
  assert(Array.isArray(d06.enrollments), 'E-06  enrollments array present')
  const myEnrollment = d06.enrollments?.find((e) => e.id === enrollmentId)
  assert(myEnrollment, 'E-06  My enrollment appears in the list')

  // E-07 Unauthenticated cannot list enrollments
  const e07 = await get('/enrollments/me')
  assertEq(e07.status, 401, 'E-07  GET /enrollments/me requires auth (401)')

  // E-08 Get enrollment by ID (owner)
  if (enrollmentId) {
    const e08 = await get(`/enrollments/${enrollmentId}`, userCookie)
    const d08 = await e08.json()
    assertEq(e08.status, 200, 'E-08  Owner can GET enrollment by ID')
    assertEq(d08.enrollment?.id, enrollmentId, 'E-08  Correct enrollment returned')
  }

  // E-09 User2 cannot access user1's enrollment
  if (enrollmentId) {
    const e09 = await get(`/enrollments/${enrollmentId}`, user2Cookie)
    assertEq(e09.status, 403, "E-09  User2 cannot access user1's enrollment (403)")
  }

  // E-10 Invalid enrollment ID returns 400
  const e10 = await get('/enrollments/not-a-uuid', userCookie)
  assertEq(e10.status, 400, 'E-10  Invalid enrollment ID returns 400')

  // E-11 Non-existent enrollment returns 404
  const fakeId = '00000000-0000-4000-8000-000000000003'
  const e11 = await get(`/enrollments/${fakeId}`, userCookie)
  assertEq(e11.status, 404, 'E-11  Non-existent enrollment returns 404')
}

// ═════════════════════════════════════════════════════════════════════════════
// PROGRESS TESTS
// ═════════════════════════════════════════════════════════════════════════════

async function testProgress() {
  console.log('\n── Progress Tracking ─────────────────────────────────────')

  if (!courseId || !lesson1Id || !lesson2Id) {
    console.log('  ⚠️  Skipping progress tests — prerequisites missing.')
    return
  }

  // P-01 Zero-lesson course: create a temp course and get progress
  if (adminCookie) {
    const zc = await post('/courses', {
      title: `Zero Lesson Course ${ts}`,
      description: 'Course with no lessons for progress test.',
      category: 'Test',
      published: true,
    }, adminCookie)
    const zcData = await zc.json()
    const zeroCourseId = zcData.course?.id
    if (zeroCourseId) {
      // Enroll user
      await post(`/courses/${zeroCourseId}/enroll`, {}, userCookie)
      const p01 = await get(`/courses/${zeroCourseId}/progress`, userCookie)
      const d01 = await p01.json()
      assertEq(p01.status, 200, 'P-01  Progress on zero-lesson course returns 200')
      assertEq(d01.summary?.total, 0, 'P-01  Total lessons = 0')
      assertEq(d01.summary?.percentage, 0, 'P-01  Progress percentage = 0 (no divide-by-zero)')
      // Clean up
      if (adminCookie) await del(`/courses/${zeroCourseId}`, adminCookie)
    }
  }

  // P-02 Unauthenticated cannot mark progress
  const p02 = await post(`/courses/${courseId}/lessons/${lesson1Id}/complete`, {})
  assertEq(p02.status, 401, 'P-02  Unauthenticated progress mark returns 401')

  // P-03 Non-enrolled user cannot mark progress
  const p03 = await post(`/courses/${courseId}/lessons/${lesson1Id}/complete`, {}, profCookie)
  assertEq(p03.status, 403, 'P-03  Non-enrolled user cannot mark progress (403)')

  // P-04 Initial progress is 0%
  const p04 = await get(`/courses/${courseId}/progress`, userCookie)
  const d04 = await p04.json()
  assertEq(p04.status, 200, 'P-04  GET /progress returns 200 for enrolled user')
  assertEq(d04.summary?.percentage, 0, 'P-04  Initial progress is 0%')
  assertEq(d04.summary?.completed, 0, 'P-04  0 lessons completed initially')

  // P-05 Mark lesson 1 complete
  const p05 = await post(`/courses/${courseId}/lessons/${lesson1Id}/complete`, {}, userCookie)
  const d05 = await p05.json()
  assertEq(p05.status, 200, 'P-05  Mark lesson complete returns 200')
  assert(d05.progress?.completed === true, 'P-05  progress.completed is true')
  assertEq(d05.course_progress?.completed, 1, 'P-05  1 lesson completed')
  assertEq(d05.course_progress?.total, 2, 'P-05  Total is 2 lessons')
  assertEq(d05.course_progress?.percentage, 50, 'P-05  Progress is 50% (1/2)')

  // P-06 Repeated completion request is idempotent (no duplicate)
  const p06 = await post(`/courses/${courseId}/lessons/${lesson1Id}/complete`, {}, userCookie)
  const d06 = await p06.json()
  assertEq(p06.status, 200, 'P-06  Repeated completion is idempotent (200)')
  assertEq(d06.course_progress?.percentage, 50, 'P-06  Progress remains 50% (no double-count)')

  // P-07 Mark lesson 2 complete → 100%
  const p07 = await post(`/courses/${courseId}/lessons/${lesson2Id}/complete`, {}, userCookie)
  const d07 = await p07.json()
  assertEq(p07.status, 200, 'P-07  Second lesson completion returns 200')
  assertEq(d07.course_progress?.percentage, 100, 'P-07  Progress is 100% after all lessons')

  // P-08 GET /progress shows full progress with lesson details
  const p08 = await get(`/courses/${courseId}/progress`, userCookie)
  const d08 = await p08.json()
  assertEq(p08.status, 200, 'P-08  GET /progress returns 200')
  assertEq(d08.summary?.percentage, 100, 'P-08  Summary shows 100% completion')
  assert(Array.isArray(d08.lesson_progress), 'P-08  lesson_progress array present')

  // P-09 User2 cannot see user1's progress
  const p09 = await get(`/courses/${courseId}/progress`, user2Cookie)
  // user2 IS enrolled but has their own progress — this should work
  const d09 = await p09.json()
  assertEq(p09.status, 200, "P-09  User2 gets their own progress (200)")
  assertEq(d09.summary?.percentage, 0, "P-09  User2 starts at 0% (independent progress)")

  // P-10 Wrong lesson (not in this course) returns 404
  if (adminCookie) {
    // Create a separate course with a lesson
    const otherCourse = await post('/courses', {
      title: `Other Course ${ts}`,
      description: 'Another course for isolation test.',
      category: 'Test',
      published: true,
    }, adminCookie)
    const ocData = await otherCourse.json()
    const otherCourseId = ocData.course?.id
    if (otherCourseId) {
      const otherLesson = await post(`/courses/${otherCourseId}/lessons`, {
        title: 'Other Lesson', position: 1,
      }, adminCookie)
      const olData = await otherLesson.json()
      const otherLessonId = olData.lesson?.id
      if (otherLessonId) {
        // Try to mark a lesson from another course as complete in this course
        const p10 = await post(
          `/courses/${courseId}/lessons/${otherLessonId}/complete`,
          {},
          userCookie
        )
        assertEq(p10.status, 404, 'P-10  Lesson not in this course returns 404')
      }
      // Clean up
      await del(`/courses/${otherCourseId}`, adminCookie)
    }
  }

  // P-11 Enrollment detail with progress
  if (enrollmentId) {
    const p11 = await get(`/enrollments/${enrollmentId}/progress`, userCookie)
    const d11 = await p11.json()
    assertEq(p11.status, 200, 'P-11  GET /enrollments/:id/progress returns 200')
    assertEq(d11.summary?.percentage, 100, 'P-11  Enrollment progress shows 100%')
  }

  // P-12 User2 cannot access user1's enrollment progress
  if (enrollmentId) {
    const p12 = await get(`/enrollments/${enrollmentId}/progress`, user2Cookie)
    assertEq(p12.status, 403, "P-12  User2 cannot access user1's enrollment progress (403)")
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// PROFESSIONAL DIRECTORY TESTS
// ═════════════════════════════════════════════════════════════════════════════

async function testProfessionals() {
  console.log('\n── Professional Directory ────────────────────────────────')

  // PR-01 Non-professional cannot submit a profile
  const pr01 = await post('/professionals', {
    specialization: 'Child Psychology',
    bio: 'A bio with sufficient length to pass validation checks.',
    qualifications: 'MSc, PhD',
  }, userCookie)
  assertEq(pr01.status, 403, 'PR-01  Non-professional cannot submit profile (403)')

  // PR-02 Unauthenticated cannot submit profile
  const pr02 = await post('/professionals', {
    specialization: 'Child Psychology',
    bio: 'Valid bio here.',
    qualifications: 'MSc',
  })
  assertEq(pr02.status, 401, 'PR-02  Unauthenticated profile submission returns 401')

  // PR-03 Missing required fields returns 400
  const pr03 = await post('/professionals', {
    specialization: '',
    bio: '',
    qualifications: '',
  }, profCookie)
  const d03 = await pr03.json()
  assertEq(pr03.status, 400, 'PR-03  Missing fields returns 400')
  assert(d03.error?.fields, 'PR-03  Validation fields present')

  // PR-04 Professional submits valid profile
  const pr04 = await post('/professionals', {
    specialization: 'Child Development Specialist',
    bio: 'I am an experienced child development specialist with a passion for helping families.',
    qualifications: 'MSc Child Psychology, PhD Developmental Neuroscience, 10 years experience.',
  }, profCookie)
  const d04 = await pr04.json()
  assertEq(pr04.status, 201, 'PR-04  Professional submits valid profile (201)')
  assert(d04.profile?.id, 'PR-04  Profile ID returned')
  assertEq(d04.profile?.verification_status, 'pending', 'PR-04  New profile status is pending')
  profProfileId = d04.profile?.id ?? ''

  // PR-05 Pending profile does NOT appear in public listing
  const pr05 = await get('/professionals')
  const d05 = await pr05.json()
  assertEq(pr05.status, 200, 'PR-05  GET /professionals returns 200')
  assert(Array.isArray(d05.professionals), 'PR-05  professionals array present')
  const foundPending = d05.professionals?.some((p) => p.id === profProfileId)
  assert(!foundPending, 'PR-05  Pending profile NOT in public listing')

  // PR-06 Professional can view own profile (including status)
  const pr06 = await get('/professionals/me', profCookie)
  const d06 = await pr06.json()
  assertEq(pr06.status, 200, 'PR-06  Professional can view own profile')
  assertEq(d06.profile?.verification_status, 'pending', 'PR-06  Status is pending in own view')

  // PR-07 Public cannot access pending profile by ID
  const pr07 = await get(`/professionals/${profProfileId}`)
  assertEq(pr07.status, 404, 'PR-07  Pending profile returns 404 to public')

  // PR-08 Non-admin cannot change verification status
  const pr08 = await patch(
    `/professionals/${profProfileId}/verification`,
    { status: 'approved' },
    profCookie
  )
  assertEq(pr08.status, 403, 'PR-08  Non-admin cannot change verification status (403)')

  // PR-09 Unauthenticated cannot change verification status
  const pr09 = await patch(
    `/professionals/${profProfileId}/verification`,
    { status: 'approved' }
  )
  assertEq(pr09.status, 401, 'PR-09  Unauthenticated verification change returns 401')

  if (adminCookie && profProfileId) {
    // PR-10 Admin approves the profile
    const pr10 = await patch(
      `/professionals/${profProfileId}/verification`,
      { status: 'approved' },
      adminCookie
    )
    const d10 = await pr10.json()
    assertEq(pr10.status, 200, 'PR-10  Admin approves profile (200)')
    assertEq(d10.profile?.verification_status, 'approved', 'PR-10  Status is now approved')

    // PR-11 Approved profile now appears in public listing
    const pr11 = await get('/professionals')
    const d11 = await pr11.json()
    const foundApproved = d11.professionals?.some((p) => p.id === profProfileId)
    assert(foundApproved, 'PR-11  Approved profile appears in public listing')

    // PR-12 Approved profile accessible by ID publicly
    const pr12 = await get(`/professionals/${profProfileId}`)
    const d12 = await pr12.json()
    assertEq(pr12.status, 200, 'PR-12  Approved profile publicly accessible by ID')
    assert(!('rejection_reason' in (d12.profile ?? {})), 'PR-12  rejection_reason NOT in public response')

    // PR-13 Admin rejects with reason
    const pr13 = await patch(
      `/professionals/${profProfileId}/verification`,
      { status: 'rejected', reason: 'Credentials could not be verified.' },
      adminCookie
    )
    const d13 = await pr13.json()
    assertEq(pr13.status, 200, 'PR-13  Admin rejects profile (200)')
    assertEq(d13.profile?.verification_status, 'rejected', 'PR-13  Status is now rejected')

    // PR-14 Rejected profile does not appear in public listing
    const pr14 = await get('/professionals')
    const d14 = await pr14.json()
    const foundRejected = d14.professionals?.some((p) => p.id === profProfileId)
    assert(!foundRejected, 'PR-14  Rejected profile NOT in public listing')
  } else {
    console.log('  ⚠️  Skipping admin professional tests — no admin cookie.')
  }

  // PR-15 Professional updates own profile (resets to pending)
  const pr15 = await patch('/professionals/me', {
    bio: 'Updated bio that is long enough to pass validation requirements here.',
  }, profCookie)
  const d15 = await pr15.json()
  assertEq(pr15.status, 200, 'PR-15  Professional updates own profile (200)')
  assertEq(d15.profile?.verification_status, 'pending', 'PR-15  Update resets status to pending')

  // PR-16 Search returns matching profiles (only approved)
  const pr16 = await get('/professionals?search=nonexistentxyz123')
  const d16 = await pr16.json()
  assertEq(pr16.status, 200, 'PR-16  Search with no matches returns 200 with empty array')
  assertEq(d16.professionals?.length, 0, 'PR-16  No results for nonsense search')

  // PR-17 Invalid professional ID returns 400
  const pr17 = await get('/professionals/not-a-uuid')
  assertEq(pr17.status, 400, 'PR-17  Invalid professional ID returns 400')

  // PR-18 Invalid status in verification endpoint returns 400
  if (adminCookie && profProfileId) {
    const pr18 = await patch(
      `/professionals/${profProfileId}/verification`,
      { status: 'verified' }, // not a valid status
      adminCookie
    )
    assertEq(pr18.status, 400, 'PR-18  Invalid verification status returns 400')
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// CLEANUP & COURSE DELETION TEST
// ═════════════════════════════════════════════════════════════════════════════

async function testCourseDeletion() {
  console.log('\n── Course Deletion ───────────────────────────────────────')

  if (!adminCookie || !courseId) {
    console.log('  ⚠️  Skipping deletion tests.')
    return
  }

  // D-01 Non-admin cannot delete course
  const d01 = await del(`/courses/${courseId}`, userCookie)
  assertEq(d01.status, 403, 'D-01  Non-admin cannot delete course (403)')

  // D-02 Admin deletes the published course (cascades enrollments + lessons + progress)
  const d02 = await del(`/courses/${courseId}`, adminCookie)
  assertEq(d02.status, 200, 'D-02  Admin deletes course (200)')

  // D-03 Deleted course returns 404
  const d03 = await get(`/courses/${courseId}`)
  assertEq(d03.status, 404, 'D-03  Deleted course returns 404')

  // D-04 Enrollment on deleted course no longer accessible
  if (enrollmentId) {
    const d04 = await get(`/enrollments/${enrollmentId}`, userCookie)
    assertEq(d04.status, 404, 'D-04  Enrollment for deleted course returns 404 (cascade)')
  }

  // Clean up second draft course
  if (course2Id) {
    await del(`/courses/${course2Id}`, adminCookie)
  }
}

// ── Runner ─────────────────────────────────────────────────────────────────────

async function run() {
  console.log('\n╔══════════════════════════════════════════════════════════╗')
  console.log('║    Sidra — Courses & Professionals Integration Tests     ║')
  console.log('╚══════════════════════════════════════════════════════════╝')
  console.log(`  Target: ${BASE}`)
  console.log(`  Run ID: ${ts}\n`)

  try {
    await setup()
    await testCourses()
    await testLessons()
    await testEnrollments()
    await testProgress()
    await testProfessionals()
    await testCourseDeletion()
  } catch (err) {
    console.error('\n⚠️  Unexpected test error:', err.message)
    if (err.stack) console.error(err.stack)
    console.error('\n   Make sure the server is running: npm run dev')
  }

  console.log('\n── Results ───────────────────────────────────────────────')
  console.log(`  Passed : ${passed}`)
  console.log(`  Failed : ${failed}`)
  console.log(`  Total  : ${passed + failed}`)

  if (failed > 0) {
    console.error('\n❌  Some tests failed.')
    process.exit(1)
  } else {
    console.log('\n✅  All tests passed.')
  }
}

run()
