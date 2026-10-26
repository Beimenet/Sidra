/**
 * media.test.js — Cloudinary Upload API Integration Tests
 *
 * Tests the /api/media endpoints without requiring real Cloudinary credentials.
 * Covers:
 *   - Authentication / authorization guards on all endpoints
 *   - Invalid upload_type rejection
 *   - Invalid record_id rejection
 *   - Confirm validation (folder, resource_type, size checks)
 *   - 503 response when Cloudinary is not configured
 *
 * Tests that require real Cloudinary credentials (actual file upload flow)
 * are marked with [MANUAL] and documented separately.
 *
 * Prerequisite:  server must be running on localhost:5000
 * Run with:      node tests/media.test.js
 */

import fetch from 'node-fetch'

const BASE = 'http://localhost:5000'
let passed = 0
let failed = 0

function assert(label, condition, details = '') {
  if (condition) {
    console.log(`  ✅ PASS  ${label}`)
    passed++
  } else {
    console.error(`  ❌ FAIL  ${label}${details ? `\n         ${details}` : ''}`)
    failed++
  }
}

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers ?? {}) },
  })
  let data
  try { data = await res.json() } catch { data = {} }
  return { status: res.status, data, headers: res.headers }
}

// ── Setup: register and log in a test user and an admin ─────────────────────

const RUN = Date.now()
const userEmail  = `media_user_${RUN}@sidra.test`
const adminEmail = `media_admin_${RUN}@sidra.test`
let userCookie  = ''
let adminCookie = ''

async function setup() {
  // Register regular user
  const ur = await fetch(`${BASE}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ full_name: 'Media User', email: userEmail, password: 'Test1234', role: 'mother' }),
  })
  const ud = await ur.json()
  assert('Setup: regular user registered', ur.status === 201)
  userCookie = ur.headers.get('set-cookie') ?? ''

  // Register admin candidate, then promote via DB (or use existing admin if env set)
  const TEST_ADMIN_EMAIL = process.env.TEST_ADMIN_EMAIL
  const TEST_ADMIN_PASS  = process.env.TEST_ADMIN_PASS
  if (TEST_ADMIN_EMAIL && TEST_ADMIN_PASS) {
    const ar = await fetch(`${BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: TEST_ADMIN_EMAIL, password: TEST_ADMIN_PASS }),
    })
    if (ar.status === 200) {
      adminCookie = ar.headers.get('set-cookie') ?? ''
      assert('Setup: admin logged in', true)
    } else {
      console.warn('  ⚠  Could not log in as admin — admin-only tests will verify 403.')
    }
  }
}

// ── Tests ─────────────────────────────────────────────────────────────────────

async function runTests() {
  console.log('\n╔══════════════════════════════════════════════════╗')
  console.log('║     Sidra — Media Upload API Tests               ║')
  console.log('╚══════════════════════════════════════════════════╝')
  console.log(`  Target: ${BASE}/api/media\n`)

  await setup()

  // ── 1. Authentication guards ───────────────────────────────────────────
  console.log('── Authentication guards ─────────────────────────────────────')

  const { status: s1 } = await request('/api/media/sign', { method: 'POST', body: '{}' })
  assert('MU-01  POST /api/media/sign without cookie → 401', s1 === 401)

  const { status: s2 } = await request('/api/media/confirm', { method: 'POST', body: '{}' })
  assert('MU-02  POST /api/media/confirm without cookie → 401', s2 === 401)

  const { status: s3 } = await request('/api/media/thumbnail/00000000-0000-4000-a000-000000000001', {
    method: 'DELETE',
  })
  assert('MU-03  DELETE /api/media without cookie → 401', s3 === 401)

  // ── 2. Authorization guards (regular user must get 403) ─────────────
  console.log('── Authorization guards (non-admin → 403) ────────────────────')

  const opts = (body) => ({
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: userCookie },
    body: JSON.stringify(body),
  })

  const { status: s4 } = await request('/api/media/sign', opts({ upload_type: 'thumbnail' }))
  assert('MU-04  Non-admin sign → 403', s4 === 403, `got ${s4}`)

  const { status: s5 } = await request('/api/media/confirm', opts({ upload_type: 'thumbnail' }))
  assert('MU-05  Non-admin confirm → 403', s5 === 403, `got ${s5}`)

  const { status: s6 } = await request('/api/media/thumbnail/00000000-0000-4000-a000-000000000001', {
    method: 'DELETE',
    headers: { Cookie: userCookie },
  })
  assert('MU-06  Non-admin delete → 403', s6 === 403, `got ${s6}`)

  // ── 3. Input validation (these return 400 or 503; not 500) ────────────
  console.log('── Input validation ──────────────────────────────────────────')

  if (adminCookie) {
    const adminOpts = (method, body) => ({
      method,
      headers: { 'Content-Type': 'application/json', Cookie: adminCookie },
      body: body ? JSON.stringify(body) : undefined,
    })

    // Bad upload_type on sign
    const { status: sv1, data: dv1 } = await request(
      '/api/media/sign',
      adminOpts('POST', { upload_type: 'invalid' })
    )
    assert('MU-07  Bad upload_type on sign → 400 or 503', sv1 === 400 || sv1 === 503, `got ${sv1}`)

    // Missing record_id on confirm
    const { status: sv2 } = await request(
      '/api/media/confirm',
      adminOpts('POST', { upload_type: 'thumbnail' })
    )
    assert('MU-08  Missing record_id on confirm → 400 or 503', sv2 === 400 || sv2 === 503, `got ${sv2}`)

    // Non-UUID record_id on confirm
    const { status: sv3 } = await request(
      '/api/media/confirm',
      adminOpts('POST', { upload_type: 'thumbnail', record_id: 'not-a-uuid', public_id: 'x', secure_url: 'https://x' })
    )
    assert('MU-09  Non-UUID record_id on confirm → 400 or 503', sv3 === 400 || sv3 === 503, `got ${sv3}`)

    // Wrong folder in public_id
    const { status: sv4 } = await request(
      '/api/media/confirm',
      adminOpts('POST', {
        upload_type:   'thumbnail',
        record_id:     '00000000-0000-4000-a000-000000000001',
        public_id:     'wrong/folder/file.jpg',
        secure_url:    'https://res.cloudinary.com/test/image/upload/wrong/folder/file.jpg',
        resource_type: 'image',
        bytes:         1000,
      })
    )
    assert('MU-10  Wrong Cloudinary folder → 400 or 503', sv4 === 400 || sv4 === 503, `got ${sv4}`)

    // Resource type mismatch
    const { status: sv5 } = await request(
      '/api/media/confirm',
      adminOpts('POST', {
        upload_type:   'thumbnail',
        record_id:     '00000000-0000-4000-a000-000000000001',
        public_id:     'sidra/courses/thumbnails/file.mp4',
        secure_url:    'https://res.cloudinary.com/test/image/upload/sidra/courses/thumbnails/file.mp4',
        resource_type: 'video',   // wrong for thumbnail
        bytes:         1000,
      })
    )
    assert('MU-11  resource_type mismatch → 400 or 503', sv5 === 400 || sv5 === 503, `got ${sv5}`)

    // File too large (thumbnail > 5 MB)
    const { status: sv6 } = await request(
      '/api/media/confirm',
      adminOpts('POST', {
        upload_type:   'thumbnail',
        record_id:     '00000000-0000-4000-a000-000000000001',
        public_id:     'sidra/courses/thumbnails/bigfile.jpg',
        secure_url:    'https://res.cloudinary.com/test/image/upload/sidra/courses/thumbnails/bigfile.jpg',
        resource_type: 'image',
        bytes:         10 * 1024 * 1024,   // 10 MB > 5 MB limit
      })
    )
    assert('MU-12  File > 5 MB thumbnail → 400 or 503', sv6 === 400 || sv6 === 503, `got ${sv6}`)

    // Invalid upload_type on sign
    const { status: sv7 } = await request(
      '/api/media/sign',
      adminOpts('POST', {})
    )
    assert('MU-13  Missing upload_type on sign → 400 or 503', sv7 === 400 || sv7 === 503, `got ${sv7}`)

    // DELETE with bad upload_type
    const { status: sv8 } = await request(
      '/api/media/badtype/00000000-0000-4000-a000-000000000001',
      adminOpts('DELETE')
    )
    assert('MU-14  Bad upload_type on delete → 400 or 503', sv8 === 400 || sv8 === 503, `got ${sv8}`)

    // DELETE with non-UUID record_id
    const { status: sv9 } = await request(
      '/api/media/thumbnail/not-a-uuid',
      adminOpts('DELETE')
    )
    assert('MU-15  Non-UUID record_id on delete → 400 or 503', sv9 === 400 || sv9 === 503, `got ${sv9}`)

  } else {
    console.log('  ℹ  Skipping admin-only input validation tests — no admin cookie.')
    console.log('     Set TEST_ADMIN_EMAIL and TEST_ADMIN_PASS to run these.')
  }

  // ── 4. Cloudinary not configured (503) check ─────────────────────────
  // If Cloudinary credentials ARE configured in the env, the 503 path
  // won't fire; we skip this assertion.
  console.log('── Cloudinary configuration check ────────────────────────────')
  const hasCloudinary = !!(process.env.CLOUDINARY_CLOUD_NAME &&
                           process.env.CLOUDINARY_API_KEY   &&
                           process.env.CLOUDINARY_API_SECRET)
  if (hasCloudinary) {
    console.log('  ℹ  Cloudinary credentials found — 503 path will not fire in these tests.')
    console.log('     Use the manual upload test documented in the README to test the full flow.')
  } else {
    console.log('  ℹ  No Cloudinary credentials — verifying admin gets 503 (not 500).')
    if (adminCookie) {
      const { status: sc } = await request('/api/media/sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Cookie: adminCookie },
        body: JSON.stringify({ upload_type: 'thumbnail' }),
      })
      assert('MU-16  Sign without Cloudinary config → 503', sc === 503, `got ${sc}`)
    }
  }

  // ── Results ───────────────────────────────────────────────────────────
  console.log('\n── Results ─────────────────────────────────────────────────')
  console.log(`  Passed : ${passed}`)
  console.log(`  Failed : ${failed}`)
  console.log(`  Total  : ${passed + failed}`)
  if (failed === 0) {
    console.log('✅  All tests passed.')
  } else {
    console.error(`❌  ${failed} test(s) failed.`)
    process.exit(1)
  }

  console.log(`
╔══════════════════════════════════════════════════════════════╗
║  MANUAL UPLOAD TEST INSTRUCTIONS                             ║
║                                                              ║
║  To test the full browser-to-Cloudinary upload flow:         ║
║                                                              ║
║  1. Add real Cloudinary credentials to server/.env:          ║
║       CLOUDINARY_CLOUD_NAME=your_cloud_name                  ║
║       CLOUDINARY_API_KEY=your_api_key                        ║
║       CLOUDINARY_API_SECRET=your_api_secret                  ║
║                                                              ║
║  2. Start the server:  npm run dev  (from server/)           ║
║  3. Start the client:  npm run dev  (from client/)           ║
║  4. Log in as admin at http://localhost:5173/admin           ║
║  5. Go to Admin → Course Management                          ║
║  6. Create a course, then click "Manage" to expand it        ║
║  7. Click "+ Upload" next to "Course Thumbnail"              ║
║  8. Select a JPG/PNG/WebP image (≤ 5 MB)                     ║
║  9. Click "Upload Thumbnail"                                 ║
║     ✔ Progress bar should fill from 0% to 100%               ║
║     ✔ Thumbnail preview should appear immediately            ║
║     ✔ On refresh, thumbnail should persist (stored in DB)    ║
║                                                              ║
║  10. Click "+ Add Lesson", fill in a title, save             ║
║  11. On the lesson row click "+ Video"                       ║
║  12. Select an MP4/WebM video (test with a short clip)       ║
║  13. Click "Upload Video"                                    ║
║      ✔ Progress should update as file uploads                ║
║      ✔ On the course detail page, VideoPlayer should appear  ║
║      ✔ Video should play back from Cloudinary CDN URL        ║
║                                                              ║
║  Unauthorized upload test:                                   ║
║    Log out / log in as a regular parent user.                ║
║    POST /api/media/sign → should return 403.                 ║
║                                                              ║
║  Protected access test:                                      ║
║    For paid courses (price_etb > 0):                         ║
║    - Non-enrolled users should not receive video_url         ║
║      in the lesson API response (enforced server-side).      ║
╚══════════════════════════════════════════════════════════════╝
`)
}

runTests().catch((err) => {
  console.error('Unexpected test error:', err)
  process.exit(1)
})
