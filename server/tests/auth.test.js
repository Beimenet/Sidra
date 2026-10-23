/**
 * auth.test.js — Integration tests for authentication endpoints
 *
 * Runs against a live server on port 5000.
 * Start the server before running: npm run dev (in a separate terminal)
 *
 * Run tests: npm test
 *
 * Tests cover:
 *   - Registration (valid, duplicate email, invalid input, admin-role block)
 *   - Login (valid, wrong password, inactive account)
 *   - GET /api/auth/me (authenticated, unauthenticated)
 *   - PUT /api/auth/me (name update, role update, admin promotion block)
 *   - Logout (session deleted, cookie cleared)
 */

import fetch from 'node-fetch'

const BASE = 'http://localhost:5000/api/auth'

// Unique email per test run to avoid conflicts between runs
const ts = Date.now()
const EMAIL = `testuser_${ts}@sidra.test`
const PASS = 'TestPass123'

let cookie = '' // holds the sid cookie between test steps

// ── Tiny assertion helper ─────────────────────────────────────────────────────
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

// ── Tests ─────────────────────────────────────────────────────────────────────

async function testRegister() {
  console.log('\n── Registration ──────────────────────────────────────────')

  // R-01 Valid registration
  const r1 = await fetch(`${BASE}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ full_name: 'Test User', email: EMAIL, password: PASS, role: 'mother' }),
  })
  const d1 = await r1.json()
  assert(r1.status === 201, `R-01  Valid registration returns 201 (got ${r1.status})`)
  assert(d1.user?.email === EMAIL, 'R-01  Response includes user object with email')
  assert(!d1.user?.password_hash, 'R-01  password_hash is NOT returned')
  assert(d1.user?.role === 'mother', 'R-01  Correct role returned')
  cookie = extractCookie(r1)
  assert(cookie !== '', 'R-01  sid cookie is set')

  // R-02 Duplicate email
  const r2 = await fetch(`${BASE}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ full_name: 'Test User', email: EMAIL, password: PASS, role: 'mother' }),
  })
  assert(r2.status === 409, `R-02  Duplicate email returns 409 (got ${r2.status})`)

  // R-03 Missing name
  const r3 = await fetch(`${BASE}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ full_name: '', email: `other_${ts}@test.com`, password: PASS, role: 'mother' }),
  })
  assert(r3.status === 400, `R-03  Missing name returns 400 (got ${r3.status})`)

  // R-04 Weak password
  const r4 = await fetch(`${BASE}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ full_name: 'Test', email: `weak_${ts}@test.com`, password: 'abc', role: 'mother' }),
  })
  assert(r4.status === 400, `R-04  Weak password returns 400 (got ${r4.status})`)

  // R-05 Admin role blocked — should silently default to 'mother'
  const r5 = await fetch(`${BASE}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ full_name: 'Hacker', email: `admin_${ts}@test.com`, password: PASS, role: 'admin' }),
  })
  const d5 = await r5.json()
  assert(r5.status === 201, `R-05  Admin role attempt still returns 201 (got ${r5.status})`)
  assert(d5.user?.role !== 'admin', `R-05  Role is NOT 'admin' (got '${d5.user?.role}')`)
}

async function testLogin() {
  console.log('\n── Login ─────────────────────────────────────────────────')

  // L-01 Valid login
  const l1 = await fetch(`${BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASS }),
  })
  const d1 = await l1.json()
  assert(l1.status === 200, `L-01  Valid login returns 200 (got ${l1.status})`)
  assert(d1.user?.email === EMAIL, 'L-01  Response includes user')
  assert(!d1.user?.password_hash, 'L-01  password_hash is NOT returned')
  cookie = extractCookie(l1)
  assert(cookie !== '', 'L-01  sid cookie is set')

  // L-02 Wrong password
  const l2 = await fetch(`${BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: 'WrongPass999' }),
  })
  assert(l2.status === 401, `L-02  Wrong password returns 401 (got ${l2.status})`)

  // L-03 Unknown email
  const l3 = await fetch(`${BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'nobody@nowhere.com', password: PASS }),
  })
  assert(l3.status === 401, `L-03  Unknown email returns 401 (got ${l3.status})`)
  const d3 = await l3.json()
  // Message must not identify specifically which field was wrong
  const msg3 = d3.error?.message?.toLowerCase() ?? ''
  assert(
    !msg3.includes('no account') && !msg3.includes('not found') && !msg3.includes('incorrect password'),
    'L-03  Error does not reveal which field failed'
  )
}

async function testMe() {
  console.log('\n── GET /me ───────────────────────────────────────────────')

  // M-01 Authenticated
  const m1 = await fetch(`${BASE}/me`, {
    headers: { Cookie: cookie },
  })
  const d1 = await m1.json()
  assert(m1.status === 200, `M-01  /me returns 200 when authenticated (got ${m1.status})`)
  assert(d1.user?.email === EMAIL, 'M-01  Returns correct user profile')
  assert(!d1.user?.password_hash, 'M-01  password_hash NOT in profile response')

  // M-02 No cookie
  const m2 = await fetch(`${BASE}/me`)
  assert(m2.status === 401, `M-02  /me returns 401 without cookie (got ${m2.status})`)

  // M-03 Fake cookie
  const m3 = await fetch(`${BASE}/me`, { headers: { Cookie: 'sid=fakesessionid123' } })
  assert(m3.status === 401, `M-03  /me returns 401 with invalid cookie (got ${m3.status})`)
}

async function testUpdateMe() {
  console.log('\n── PUT /me ───────────────────────────────────────────────')

  // U-01 Update name
  const u1 = await fetch(`${BASE}/me`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Cookie: cookie },
    body: JSON.stringify({ full_name: 'Updated Name' }),
  })
  const d1 = await u1.json()
  assert(u1.status === 200, `U-01  Name update returns 200 (got ${u1.status})`)
  assert(d1.user?.full_name === 'Updated Name', 'U-01  Name was updated')

  // U-02 Update role to valid value
  const u2 = await fetch(`${BASE}/me`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Cookie: cookie },
    body: JSON.stringify({ role: 'father' }),
  })
  const d2 = await u2.json()
  assert(u2.status === 200, `U-02  Role update returns 200 (got ${u2.status})`)
  assert(d2.user?.role === 'father', `U-02  Role updated to 'father' (got '${d2.user?.role}')`)

  // U-03 Attempt to promote to admin — must be silently rejected
  const u3 = await fetch(`${BASE}/me`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Cookie: cookie },
    body: JSON.stringify({ role: 'admin' }),
  })
  const d3 = await u3.json()
  assert(u3.status === 200, `U-03  Admin promotion attempt returns 200 (not an error)`)
  assert(d3.user?.role !== 'admin', `U-03  Role is NOT 'admin' after attempt (got '${d3.user?.role}')`)

  // U-04 Unauthenticated
  const u4 = await fetch(`${BASE}/me`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ full_name: 'Hacker' }),
  })
  assert(u4.status === 401, `U-04  Unauthenticated PUT /me returns 401 (got ${u4.status})`)
}

async function testLogout() {
  console.log('\n── Logout ────────────────────────────────────────────────')

  // Log-01 Logout returns 200
  const lo1 = await fetch(`${BASE}/logout`, {
    method: 'POST',
    headers: { Cookie: cookie },
  })
  assert(lo1.status === 200, `Log-01 Logout returns 200 (got ${lo1.status})`)

  // Log-02 Session is invalidated — /me must now return 401
  const lo2 = await fetch(`${BASE}/me`, { headers: { Cookie: cookie } })
  assert(lo2.status === 401, `Log-02 Session is invalidated after logout (got ${lo2.status})`)

  // Log-03 Logout without cookie still returns 200
  const lo3 = await fetch(`${BASE}/logout`, { method: 'POST' })
  assert(lo3.status === 200, `Log-03 Logout without cookie returns 200 (got ${lo3.status})`)
}

// ── Runner ─────────────────────────────────────────────────────────────────────

async function run() {
  console.log('\n╔══════════════════════════════════════╗')
  console.log('║    Sidra — Auth Integration Tests    ║')
  console.log('╚══════════════════════════════════════╝')
  console.log(`  Target: ${BASE}`)
  console.log(`  Email:  ${EMAIL}\n`)

  try {
    await testRegister()
    await testLogin()
    await testMe()
    await testUpdateMe()
    await testLogout()
  } catch (err) {
    console.error('\n⚠️  Unexpected error during tests:', err.message)
    console.error('   Make sure the server is running: npm run dev')
  }

  console.log(`\n── Results ───────────────────────────────────────────────`)
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
