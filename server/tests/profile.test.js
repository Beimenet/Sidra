/**
 * profile.test.js — Integration tests for user profile management
 *
 * Tests:
 *   - Profile retrieval (GET /api/auth/me)
 *   - Profile updates: name, role (PUT /api/auth/me)
 *   - Unauthorized access (no cookie, wrong user)
 *   - Invalid input
 *   - Role escalation prevention
 *   - Change password (POST /api/auth/change-password)
 *   - Session invalidation after password change
 *
 * Requires the server to be running: npm run dev
 * Run: node tests/profile.test.js
 */

import fetch from 'node-fetch'

const BASE = 'http://localhost:5000/api/auth'
const ts   = Date.now()

// Two separate user accounts for testing cross-user access
const USER_A = { email: `profile_a_${ts}@sidra.test`, password: 'TestPass123', name: 'User Alpha' }
const USER_B = { email: `profile_b_${ts}@sidra.test`, password: 'TestPass456', name: 'User Beta' }

let cookieA = ''   // session cookie for User A
let cookieB = ''   // session cookie for User B

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

function extractCookie(res) {
  const raw = res.headers.get('set-cookie') ?? ''
  const match = raw.match(/sid=([^;]+)/)
  return match ? `sid=${match[1]}` : ''
}

async function json(res) {
  try { return await res.json() } catch { return {} }
}

// ── Setup: register both users ────────────────────────────────────────────────

async function setup() {
  console.log('\n── Setup: registering test users ─────────────────────────')

  const ra = await fetch(`${BASE}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ full_name: USER_A.name, email: USER_A.email, password: USER_A.password, role: 'mother' }),
  })
  cookieA = extractCookie(ra)
  assert(ra.status === 201 && cookieA, 'Setup  User A registered successfully')

  const rb = await fetch(`${BASE}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ full_name: USER_B.name, email: USER_B.email, password: USER_B.password, role: 'father' }),
  })
  cookieB = extractCookie(rb)
  assert(rb.status === 201 && cookieB, 'Setup  User B registered successfully')
}

// ── Profile retrieval ─────────────────────────────────────────────────────────

async function testProfileRetrieval() {
  console.log('\n── Profile Retrieval (GET /me) ───────────────────────────')

  // PR-01 Returns correct profile
  const r1 = await fetch(`${BASE}/me`, { headers: { Cookie: cookieA } })
  const d1 = await json(r1)
  assert(r1.status === 200, `PR-01  Returns 200 for authenticated user (got ${r1.status})`)
  assert(d1.user?.email === USER_A.email, 'PR-01  Returns correct email')
  assert(d1.user?.full_name === USER_A.name, 'PR-01  Returns correct name')
  assert(d1.user?.role === 'mother', 'PR-01  Returns correct role')
  assert(d1.user?.is_active === true, 'PR-01  Returns is_active field')
  assert(d1.user?.created_at !== undefined, 'PR-01  Returns created_at field')

  // PR-02 Never exposes password hash
  assert(!d1.user?.password_hash, 'PR-02  password_hash is NOT in profile response')
  assert(!d1.user?.password, 'PR-02  password is NOT in profile response')

  // PR-03 Unauthenticated → 401
  const r3 = await fetch(`${BASE}/me`)
  assert(r3.status === 401, `PR-03  No cookie returns 401 (got ${r3.status})`)

  // PR-04 Expired/invalid session → 401
  const r4 = await fetch(`${BASE}/me`, { headers: { Cookie: 'sid=totally_invalid_session_id' } })
  assert(r4.status === 401, `PR-04  Invalid session returns 401 (got ${r4.status})`)
}

// ── Profile updates ───────────────────────────────────────────────────────────

async function testProfileUpdates() {
  console.log('\n── Profile Updates (PUT /me) ─────────────────────────────')

  // PU-01 Update name
  const u1 = await fetch(`${BASE}/me`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Cookie: cookieA },
    body: JSON.stringify({ full_name: 'Meron Tadesse' }),
  })
  const d1 = await json(u1)
  assert(u1.status === 200, `PU-01  Name update returns 200 (got ${u1.status})`)
  assert(d1.user?.full_name === 'Meron Tadesse', `PU-01  Name was updated (got '${d1.user?.full_name}')`)
  assert(!d1.user?.password_hash, 'PU-01  password_hash NOT in update response')

  // PU-02 Update role to a valid public role
  const u2 = await fetch(`${BASE}/me`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Cookie: cookieA },
    body: JSON.stringify({ role: 'legal_guardian' }),
  })
  const d2 = await json(u2)
  assert(u2.status === 200, `PU-02  Role update to 'legal_guardian' returns 200 (got ${u2.status})`)
  assert(d2.user?.role === 'legal_guardian', `PU-02  Role updated correctly (got '${d2.user?.role}')`)

  // PU-03 Validation: name too short
  const u3 = await fetch(`${BASE}/me`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Cookie: cookieA },
    body: JSON.stringify({ full_name: 'X' }),
  })
  assert(u3.status === 400, `PU-03  Name too short returns 400 (got ${u3.status})`)

  // PU-04 Unauthenticated PUT → 401
  const u4 = await fetch(`${BASE}/me`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ full_name: 'Hacker' }),
  })
  assert(u4.status === 401, `PU-04  Unauthenticated PUT returns 401 (got ${u4.status})`)

  // PU-05 Empty body is accepted gracefully (no-op update)
  const u5 = await fetch(`${BASE}/me`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Cookie: cookieA },
    body: JSON.stringify({}),
  })
  assert(u5.status === 200, `PU-05  Empty body PUT returns 200 (no-op) (got ${u5.status})`)
}

// ── Role escalation prevention ────────────────────────────────────────────────

async function testRoleEscalation() {
  console.log('\n── Role Escalation Prevention ────────────────────────────')

  // RE-01 Attempt to set role to 'admin' via PUT /me
  const r1 = await fetch(`${BASE}/me`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Cookie: cookieB },
    body: JSON.stringify({ role: 'admin' }),
  })
  const d1 = await json(r1)
  // Server should return 200 but silently ignore the role change
  assert(r1.status === 200, `RE-01  Admin role attempt returns 200 (not 500) (got ${r1.status})`)
  assert(d1.user?.role !== 'admin', `RE-01  Role was NOT changed to 'admin' (got '${d1.user?.role}')`)

  // RE-02 Attempt via registration (should default to 'mother')
  const r2 = await fetch(`${BASE}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      full_name: 'Escalation Test',
      email:     `escalation_${ts}@sidra.test`,
      password:  'TestPass123',
      role:      'admin',
    }),
  })
  const d2 = await json(r2)
  assert(r2.status === 201, `RE-02  Registration with admin role returns 201 (got ${r2.status})`)
  assert(d2.user?.role !== 'admin', `RE-02  Registered role is NOT 'admin' (got '${d2.user?.role}')`)

  // RE-03 Verify current role after escalation attempt
  const r3 = await fetch(`${BASE}/me`, { headers: { Cookie: cookieB } })
  const d3 = await json(r3)
  assert(d3.user?.role !== 'admin', `RE-03  /me confirms role is still NOT 'admin' (got '${d3.user?.role}')`)
}

// ── Change password ───────────────────────────────────────────────────────────

async function testChangePassword() {
  console.log('\n── Change Password (POST /change-password) ───────────────')

  const NEW_PASS = 'NewPass456!'

  // CP-01 Missing fields
  const c1 = await fetch(`${BASE}/change-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookieA },
    body: JSON.stringify({ current_password: USER_A.password }),
  })
  assert(c1.status === 400, `CP-01  Missing new_password returns 400 (got ${c1.status})`)

  // CP-02 Wrong current password
  const c2 = await fetch(`${BASE}/change-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookieA },
    body: JSON.stringify({ current_password: 'WrongCurrent1', new_password: NEW_PASS }),
  })
  assert(c2.status === 401, `CP-02  Wrong current password returns 401 (got ${c2.status})`)

  // CP-03 Weak new password
  const c3 = await fetch(`${BASE}/change-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookieA },
    body: JSON.stringify({ current_password: USER_A.password, new_password: 'weak' }),
  })
  assert(c3.status === 400, `CP-03  Weak new password returns 400 (got ${c3.status})`)

  // CP-04 New password same as current
  const c4 = await fetch(`${BASE}/change-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookieA },
    body: JSON.stringify({ current_password: USER_A.password, new_password: USER_A.password }),
  })
  assert(c4.status === 400, `CP-04  Same-as-current password returns 400 (got ${c4.status})`)

  // CP-05 Unauthenticated
  const c5 = await fetch(`${BASE}/change-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ current_password: USER_A.password, new_password: NEW_PASS }),
  })
  assert(c5.status === 401, `CP-05  Unauthenticated returns 401 (got ${c5.status})`)

  // CP-06 Valid change — opens a second session first to test invalidation
  // Open a second session for User A (simulate another device)
  const loginRes = await fetch(`${BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: USER_A.email, password: USER_A.password }),
  })
  const secondCookie = extractCookie(loginRes)
  assert(secondCookie !== '', 'CP-06  Second session created for User A')

  // Change password using the first (original) session
  const c6 = await fetch(`${BASE}/change-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookieA },
    body: JSON.stringify({ current_password: USER_A.password, new_password: NEW_PASS }),
  })
  const d6 = await json(c6)
  assert(c6.status === 200, `CP-06  Valid password change returns 200 (got ${c6.status})`)
  assert(typeof d6.message === 'string', 'CP-06  Response includes a message')

  // CP-07 New session cookie was issued — update cookieA
  const newCookie = extractCookie(c6)
  assert(newCookie !== '', 'CP-07  New session cookie issued after password change')
  cookieA = newCookie   // update for subsequent tests

  // CP-08 Second session is now invalid
  const c8 = await fetch(`${BASE}/me`, { headers: { Cookie: secondCookie } })
  assert(c8.status === 401, `CP-08  Second session invalidated after password change (got ${c8.status})`)

  // CP-09 Current session (new cookie) still works
  const c9 = await fetch(`${BASE}/me`, { headers: { Cookie: cookieA } })
  assert(c9.status === 200, `CP-09  Current session still valid after password change (got ${c9.status})`)

  // CP-10 Old password no longer works for login
  const c10 = await fetch(`${BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: USER_A.email, password: USER_A.password }),
  })
  assert(c10.status === 401, `CP-10  Old password rejected after change (got ${c10.status})`)

  // CP-11 New password works for login
  const c11 = await fetch(`${BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: USER_A.email, password: NEW_PASS }),
  })
  assert(c11.status === 200, `CP-11  New password accepted for login (got ${c11.status})`)
}

// ── Runner ────────────────────────────────────────────────────────────────────

async function run() {
  console.log('\n╔══════════════════════════════════════════════╗')
  console.log('║    Sidra — Profile Management Tests          ║')
  console.log('╚══════════════════════════════════════════════╝')
  console.log(`  Target: ${BASE}`)
  console.log(`  User A: ${USER_A.email}`)
  console.log(`  User B: ${USER_B.email}`)

  try {
    await setup()
    await testProfileRetrieval()
    await testProfileUpdates()
    await testRoleEscalation()
    await testChangePassword()
  } catch (err) {
    console.error('\n⚠️  Unexpected error during tests:', err.message)
    console.error('   Make sure the server is running: npm run dev')
    process.exit(1)
  }

  console.log('\n── Results ───────────────────────────────────────────────')
  console.log(`  Passed: ${passed}`)
  console.log(`  Failed: ${failed}`)
  console.log(`  Total:  ${passed + failed}`)

  if (failed > 0) {
    console.error('\n❌  Some tests failed.')
    process.exit(1)
  } else {
    console.log('\n✅  All tests passed.')
  }
}

run()
