# Authentication Plan — Sidra (ስድራ)

> **Status:** Planning document — partially approved. Five architectural decisions have been confirmed (see Section 10). Nothing has been implemented yet.
> Review remaining open decisions before writing any authentication code.
>
> See also: [Database Design](./DATABASE_DESIGN.md) · [Project Specification](./PROJECT_SPECIFICATION.md) · [System Architecture](./SYSTEM_ARCHITECTURE.md)

---

## Table of Contents

1. [Current State Audit](#1-current-state-audit)
2. [Chosen Architecture](#2-chosen-architecture)
3. [Part A — Registration](#3-part-a--registration)
4. [Part B — Login and Sessions](#4-part-b--login-and-sessions)
5. [Part C — Authorization](#5-part-c--authorization)
6. [Part D — Frontend Integration](#6-part-d--frontend-integration)
7. [Part E — Future Requirements](#7-part-e--future-requirements)
8. [Part F — Testing Plan](#8-part-f--testing-plan)
9. [Implementation Checklist](#9-implementation-checklist)
10. [Decisions Requiring Approval](#10-decisions-requiring-approval)

---

## 1. Current State Audit

### 1.1 Frontend — what exists

| File | Status | Notes |
|---|---|---|
| `client/src/context/AuthContext.jsx` | ⚠ Simulation only | Holds user in React state; persists to `sessionStorage`; no API calls |
| `client/src/pages/LoginPage.jsx` | ✅ UI complete | Form with email + password; calls `AuthContext.login()`; generic error message on failure |
| `client/src/pages/RegisterPage.jsx` | ✅ UI complete | Full name, email, password, confirm password, family role cards; calls `AuthContext.register()`; client-side validation |
| `client/src/pages/ProfilePage.jsx` | ✅ UI complete | View and edit modes; role selector; calls `AuthContext.updateProfile()`; logout button |
| `client/src/routes/AppRoutes.jsx` | ✅ Structure complete | `ProtectedRoute` redirects to `/login`; `AdminRoute` checks `user.isAdmin`; both are UI-only guards |

**What the frontend simulation does right:**
- Passwords are never stored anywhere (the simulation discards the password immediately)
- Generic error messages on login (does not reveal which field failed)
- `sessionStorage` rather than `localStorage` (shorter-lived)
- Clear dev notices on each auth page
- `from` state passed to login so users return to their original destination

**What must change when the real backend is connected:**
- `AuthContext.login()` must call `POST /api/auth/login` instead of simulating
- `AuthContext.register()` must call `POST /api/auth/register` instead of simulating
- `AuthContext.updateProfile()` must call `PUT /api/auth/me` instead of simulating
- `sessionStorage` must be removed entirely — session will live in an `HttpOnly` cookie managed by the server
- The admin dev shortcut (email contains "admin" → `isAdmin: true`) must be removed
- Session restoration on mount must call `GET /api/auth/me` instead of reading `sessionStorage`

### 1.2 Backend — what exists

| File | Status | Notes |
|---|---|---|
| `server/src/routes/auth.js` | ⚠ Stubs only | Four routes defined (`/register`, `/login`, `/logout`, `/me`); all return `501 Not Implemented` |
| `server/src/app.js` | ✅ Wired | Auth router mounted at `/api/auth`; CORS configured with `credentials: true` |
| `server/src/config/env.js` | ⚠ Incomplete | `JWT_SECRET` and `JWT_EXPIRES_IN` commented out; `DATABASE_URL` commented out |
| `server/src/middleware/errorHandler.js` | ✅ Ready | Centralised error handler; suppresses stack traces in production |
| `server/src/config/db.js` | ⚠ Not connected | PostgreSQL `Pool` commented out; exports `null` |

**What the backend has ready:**
- Route structure and mounting points exist
- CORS is configured with `credentials: true` (required for cookies)
- Centralised error handling is in place
- `env.js` has placeholders for `JWT_SECRET` and `DATABASE_URL`

**What must be built:**
- Database connection (`pg` Pool)
- All four auth route implementations
- Password hashing middleware/utility (`bcrypt`)
- Session/token issuance and verification
- Authentication middleware for protected routes
- Role-based authorization middleware
- Input validation

### 1.3 Database — what is designed

The `DATABASE_DESIGN.md` defines:
- `users` table with `password_hash`, `account_role` (`admin`/`parent`/`professional`), `family_role`, and `is_active`
- `CHECK` constraint preventing invalid roles at the database level
- No table yet created; design approved pending review

---

## 2. Chosen Architecture

> **D-01 ✅ APPROVED** · **D-02 ✅ APPROVED** · **D-06 ✅ APPROVED** · **D-07 ✅ APPROVED**

### 2.1 Session mechanism: server-managed sessions stored in PostgreSQL

**Approved decision:** Use server-managed sessions with a PostgreSQL session store. Store only the session identifier (a random, opaque token) in an `HttpOnly` cookie. Do not store the session identifier or any authentication token in `localStorage` or `sessionStorage`.

This replaces the earlier draft proposal of stateless JWTs in cookies. The key distinction:

| Aspect | Stateless JWT in cookie | Server-managed session (approved) |
|---|---|---|
| What the cookie holds | A signed JWT containing user claims | An opaque, random session ID only |
| Where truth lives | Encoded in the token | In the `sessions` table in PostgreSQL |
| Invalidation on logout | Cookie deletion only (token remains valid until expiry) | Session row deleted — immediately and truly invalidated |
| Deactivated account lockout | Requires DB lookup on every request to be immediate | Immediate — next request finds no session row |
| Infrastructure | No session store needed | Requires a `sessions` table in PostgreSQL |

Because Sidra already uses PostgreSQL, adding a `sessions` table adds no new infrastructure dependency.

**`sessions` table (to be added to `DATABASE_DESIGN.md` when approved):**
```sql
CREATE TABLE sessions (
  id            TEXT        PRIMARY KEY,          -- random, cryptographically secure token
  user_id       UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at    TIMESTAMPTZ NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ip_address    TEXT,                              -- optional, for audit logging
  user_agent    TEXT                               -- optional, for audit logging
);

CREATE INDEX idx_sessions_user_id   ON sessions (user_id);
CREATE INDEX idx_sessions_expires   ON sessions (expires_at);
```

Session ID generation: use `crypto.randomBytes(32).toString('hex')` — 64 hex characters, 256 bits of entropy. Never use a predictable value or a sequential ID.

Session expiry: 7 days (configurable). Expired sessions should be cleaned up periodically (a scheduled job or on-read cleanup).

### 2.2 Cookie configuration

**Approved decisions:**
- `HttpOnly: true` — cookie is invisible to JavaScript ✅
- `SameSite: Lax` — initial default ✅
- `Secure: true` in production ✅
- Deployment topology must be confirmed before finalising cookie domain and cross-site settings ✅

**Cookie set on login and registration:**
```http
Set-Cookie: sid=<session_id>; HttpOnly; SameSite=Lax; Path=/; MaxAge=604800; Secure
```

| Setting | Value | Reason |
|---|---|---|
| `HttpOnly` | `true` | Cookie is invisible to JavaScript; prevents XSS token theft |
| `SameSite` | `Lax` | Default; allows top-level navigations (e.g. links from external sites) but blocks cross-site POST requests |
| `Secure` | `true` in production | Cookie is only sent over HTTPS; omitted in development |
| `Path` | `/` | Sent to all paths on the origin; adjust to `/api` if the frontend and API share the same domain |
| `MaxAge` | `604800` (7 days) | Session lifetime |
| `Domain` | Not set initially | Must be confirmed once deployment topology is decided |

**Why `SameSite=Lax` rather than `Strict`:**
`SameSite=Strict` would block the session cookie on any navigation from an external link (e.g. clicking a link from an email or another website). This would log users out unexpectedly when arriving from external sources. `Lax` prevents cross-site POST requests (the most dangerous CSRF vector) while allowing normal cross-site navigations.

**Additional CSRF protection:**
`SameSite=Lax` alone is not sufficient if the frontend and API are on different subdomains. In that case, a CSRF token must be added to all state-changing requests:
- Server generates a CSRF token and stores it in the session
- Server sends the CSRF token in a separate non-`HttpOnly` cookie or response header
- Frontend reads the token and includes it in a request header (e.g. `X-CSRF-Token`)
- Server validates the header token against the session token before processing the request

CSRF protection strategy must be finalised once the deployment topology is confirmed. See D-11 in Section 10.

**CORS configuration:**
The existing `credentials: true` CORS configuration in `server/src/app.js` must be narrowed to trust only specific frontend origins. The wildcard origin (`*`) must never be used with credentialed requests:
```js
app.use(cors({
  origin: env.CLIENT_ORIGIN,   // exact origin, not '*'
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
}))
```
`CLIENT_ORIGIN` in `.env` must list only the trusted frontend origin(s).

### 2.3 Logout and session invalidation

**Approved decision:** Logout must delete the session row in PostgreSQL AND clear the session cookie. Cookie deletion alone is not sufficient.

```
POST /api/auth/logout:
  1. Read session ID from cookie
  2. DELETE FROM sessions WHERE id = sessionId
  3. Clear the cookie: Set-Cookie: sid=; MaxAge=0; HttpOnly; ...
  4. Return 200
```

If the session ID in the cookie does not match any row (already expired or deleted), the server still clears the cookie and returns 200 — logout is always a success from the client's perspective.

**No token blocklist:** Because sessions are server-managed, a separate token blocklist is unnecessary. Deleting the session row achieves true invalidation without additional infrastructure.

### 2.4 Password hashing: bcrypt

Use `bcrypt` with a work factor of **12**.

- Never log passwords
- Never return `password_hash` in any API response
- Hash on the server; the client sends the plaintext password over HTTPS and the server hashes it immediately

### 2.5 What replaces the JWT approach in the authenticate middleware

Because sessions are now server-managed, the `authenticate` middleware reads the session ID from the cookie and looks it up in the database on every request — there is no JWT to verify client-side:

```
authenticate middleware:
  1. Read session ID from the `sid` cookie
  2. If no cookie → 401
  3. SELECT * FROM sessions WHERE id = sessionId AND expires_at > NOW()
  4. If no row found → 401, clear cookie
  5. SELECT * FROM users WHERE id = session.user_id AND is_active = true
  6. If no user or is_active = false → 401, delete session, clear cookie
  7. Attach user to req.user
  8. Call next()
```

`env.js` no longer requires `JWT_SECRET` or `JWT_EXPIRES_IN`. The `SESSION_SECRET` (used for cookie signing, optional) and `SESSION_DURATION_DAYS` are the relevant new variables.

---

## 3. Part A — Registration

### 3.1 API endpoint

```
POST /api/auth/register
Content-Type: application/json
```

### 3.2 Accepted request body

```json
{
  "full_name": "Meron Tadesse",
  "email": "meron@example.com",
  "password": "SecurePass123!",
  "account_role": "parent",
  "family_role": "mother"
}
```

### 3.3 Server-side validation rules

| Field | Rules |
|---|---|
| `full_name` | Required; 2–100 characters; trimmed |
| `email` | Required; valid email format; lowercased; must not already exist in `users` |
| `password` | Required; minimum 8 characters; at least one letter and one number (enforced server-side) |
| `account_role` | Must be `parent` or `professional`; **never `admin`** regardless of what the client sends |
| `family_role` | If provided, must be one of: `mother`, `father`, `legal_guardian`, `other_caregiver`; nullable |

**Critical security rule — admin role prevention:**
```js
// The backend must NEVER accept account_role from the client at face value.
// It must be overridden server-side:
const safeAccountRole = ['parent', 'professional'].includes(body.account_role)
  ? body.account_role
  : 'parent'
```

### 3.4 Registration flow

```
Client                    Server                      Database
  │                          │                            │
  ├─ POST /api/auth/register ─►                           │
  │   { name, email,          │                           │
  │     password, role }      │                           │
  │                          ├─ Validate input            │
  │                          ├─ Force account_role ≠ admin│
  │                          ├─ Check email uniqueness ───►
  │                          │                     ◄─ conflict? → 409
  │                          ├─ bcrypt.hash(password, 12) │
  │                          ├─ INSERT INTO users ────────►
  │                          │                     ◄─ new user row
  │                          ├─ Generate session ID       │
  │                          ├─ INSERT INTO sessions ─────►
  │                          ├─ Set HttpOnly cookie       │
  │◄─ 201 { user profile } ──┤                            │
  │   (no password_hash)      │                           │
```

### 3.5 Response on success (201)

```json
{
  "user": {
    "id": "uuid",
    "full_name": "Meron Tadesse",
    "email": "meron@example.com",
    "account_role": "parent",
    "family_role": "mother",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

`password_hash` is **never** included in the response.

### 3.6 Error responses

| Scenario | HTTP status | Response |
|---|---|---|
| Email already registered | 409 Conflict | `{ "error": { "message": "An account with this email address already exists." } }` |
| Validation failure | 400 Bad Request | `{ "error": { "message": "...", "fields": { "email": "..." } } }` |
| Server error | 500 Internal Server Error | `{ "error": { "message": "An unexpected error occurred." } }` |

### 3.7 Professional registration

**Approved decision (D-10 ✅):** Users may register as either `parent` or `professional` from the public registration form. Professional self-registration is permitted.

A professional registers with `account_role: "professional"`. This creates a `users` row only. The professional directory entry in `professional_profiles` is **not** created at registration — it is created only when the professional submits an application and an administrator approves it.

Until a professional application is approved:
- The professional account can log in and access the same features as a parent account
- The professional has no elevated privileges on the platform
- The professional's profile does not appear in the public directory

`admin` assignment via public registration is permanently blocked regardless of what `account_role` value is submitted. See Section 3.3.

---

## 4. Part B — Login and Sessions

### 4.1 Login endpoint

```
POST /api/auth/login
Content-Type: application/json
```

Request body:
```json
{
  "email": "meron@example.com",
  "password": "SecurePass123!"
}
```

### 4.2 Login flow

```
Client                    Server                      Database
  │                          │                            │
  ├─ POST /api/auth/login ───►                            │
  │   { email, password }     │                           │
  │                          ├─ Validate input            │
  │                          ├─ SELECT user by email ─────►
  │                          │                     ◄─ user row (or null)
  │                          ├─ if not found:             │
  │◄─ 401 generic error ─────┤  same timing as bcrypt     │
  │                          ├─ bcrypt.compare(password,  │
  │                          │    user.password_hash)     │
  │                          ├─ if mismatch:              │
  │◄─ 401 generic error ─────┤                            │
  │                          ├─ if is_active = false:     │
  │◄─ 403 account deactivated┤                            │
  │                          ├─ Generate session ID       │
  │                          ├─ INSERT INTO sessions ─────►
  │                          ├─ Set HttpOnly cookie       │
  │◄─ 200 { user profile } ──┤                            │
```

**Timing attack prevention:** When a user is not found, the server must still call `bcrypt.compare()` against a dummy hash to ensure the response time is identical whether the email exists or not. This prevents an attacker from using timing differences to enumerate registered email addresses.

### 4.3 Generic error messages

The login endpoint must never reveal which field (email or password) was incorrect:

```
✅ "Unable to log in. Please check your details and try again."
✅ "Invalid email or password."
❌ "No account found with that email address."
❌ "Incorrect password."
```

The existing `LoginPage.jsx` already uses a generic error message — this is correct and must be preserved.

### 4.4 Session cookie

**Approved decisions: HttpOnly ✅ · SameSite=Lax ✅ · Secure in production ✅**

On successful login or registration, the server creates a session row in PostgreSQL and sets:

```http
Set-Cookie: sid=<session_id>; HttpOnly; SameSite=Lax; Path=/; MaxAge=604800; Secure
```

- Cookie name: `sid` (non-descriptive; avoid `token`, `jwt`, `auth`, `session`)
- `Secure` is set only in production (`NODE_ENV === 'production'`)
- `MaxAge` = 604800 seconds = 7 days
- `Domain` is not set initially — must be confirmed once deployment topology is decided (see D-11)
- `SameSite=Lax` is the approved default; see Section 2.2 for when CSRF tokens are additionally required

### 4.5 Session restoration (`GET /api/auth/me`)

When the React application loads, `AuthContext` calls `GET /api/auth/me`. The server reads the `sid` cookie, looks up the session ID in the `sessions` table, fetches the user, and returns the profile. If the cookie is absent, the session has expired, or the session row does not exist, the server returns `401` and the frontend sets `user = null`.

```
GET /api/auth/me
Cookie: sid=<session_id>

Response 200:
{
  "user": {
    "id": "uuid",
    "full_name": "Meron Tadesse",
    "email": "meron@example.com",
    "account_role": "parent",
    "family_role": "mother"
  }
}

Response 401 (no valid session):
{
  "error": { "message": "Not authenticated.", "status": 401 }
}
```

### 4.6 Logout endpoint

**Approved decision (D-06 ✅):** Logout must delete the server-side session row AND clear the session cookie. Cookie deletion alone is not sufficient.

```
POST /api/auth/logout
Cookie: sid=<session_id>
```

The server:
1. Reads the session ID from the cookie
2. Deletes the row: `DELETE FROM sessions WHERE id = sessionId`
3. Clears the cookie:

```http
Set-Cookie: sid=; HttpOnly; SameSite=Lax; Path=/; MaxAge=0; Secure
```

If the session ID does not match any row (already expired or previously deleted), the server still clears the cookie and returns 200 — logout is always a success from the client's perspective.

Because sessions are stored server-side, no separate token blocklist is needed. Deleting the row achieves true, immediate invalidation.

### 4.7 Session expiration

- Sessions expire after 7 days (configurable via `SESSION_DURATION_DAYS` environment variable)
- The `sessions` table stores `expires_at`; the `authenticate` middleware checks `expires_at > NOW()`
- On expiry, `GET /api/auth/me` returns `401` and clears the stale cookie
- Expired session rows should be cleaned up periodically — a simple approach is to delete rows where `expires_at < NOW()` as part of a scheduled task or lazily on each login
- The frontend must handle `401` responses from any protected endpoint by clearing user state and redirecting to `/login`

---

## 5. Part C — Authorization

### 5.1 Authentication middleware

All protected routes must apply an `authenticate` middleware before the route handler:

```
authenticate middleware:
  1. Read session ID from the `sid` cookie
  2. If no cookie → 401
  3. SELECT session FROM sessions WHERE id = sessionId AND expires_at > NOW()
  4. If no row found → 401, clear the cookie
  5. SELECT user FROM users WHERE id = session.user_id AND is_active = true
  6. If no user or is_active = false → 401, delete session row, clear cookie
  7. Attach the user object to req.user
  8. Call next()
```

**Approved decision (D-07 ✅):** Every authenticated request performs a database lookup against the `sessions` and `users` tables. This ensures that a deactivated account or an explicitly logged-out session is rejected immediately, with no delay.

### 5.2 Role-based authorization middleware

```
requireRole(...roles) middleware:
  1. Assume authenticate has already run (req.user is set)
  2. If req.user.account_role is not in the allowed roles → 403
  3. Call next()
```

Usage in routes:
```js
// Any authenticated user
router.get('/profile', authenticate, getProfile)

// Admins only
router.get('/admin/users', authenticate, requireRole('admin'), listUsers)

// Admins or professionals
router.get('/professionals', authenticate, requireRole('admin', 'professional'), listProfessionals)
```

### 5.3 Authorization rules by endpoint

| Endpoint | Required role | Additional check |
|---|---|---|
| `GET /api/auth/me` | Authenticated | Own record only |
| `PUT /api/auth/me` | Authenticated | Own record only |
| `GET /api/courses` (public list) | None | `is_published = true` only |
| `POST /api/enrollments` | `parent` or `professional` | — |
| `GET /api/enrollments/:id` | Authenticated | Must be own enrollment |
| `POST /api/lesson-progress` | Authenticated | Must be enrolled in the course |
| `GET /api/admin/*` | `admin` | — |
| `POST /api/courses` | `admin` | — |
| `PUT /api/courses/:id` | `admin` | — |
| `DELETE /api/courses/:id` | `admin` | — |
| `GET /api/professional-applications` | `admin` | — |
| `PATCH /api/professional-applications/:id` | `admin` | — |
| `GET /api/professionals` (public) | None | `is_verified = true` only |

### 5.4 Preventing self-promotion to admin

The `account_role` field must never be updatable via `PUT /api/auth/me`. The profile update endpoint accepts only `full_name` and `family_role`. Any attempt to include `account_role` in the request body is silently ignored:

```js
// Server-side profile update — only these fields accepted
const allowed = {}
if (body.full_name) allowed.full_name = body.full_name.trim()
if (body.family_role) {
  // validate against allowed values
  allowed.family_role = body.family_role
}
// account_role is NOT in the allowed list — never updated via this endpoint
```

Changing `account_role` requires direct database access or a separate admin-only endpoint.

### 5.5 Professional feature restriction

A user with `account_role = 'professional'` who has not been approved has no additional privileges over a `parent` account. The professional features (e.g. a dedicated professional dashboard or special API access) must check both the account role AND the existence of a verified `professional_profiles` row:

```js
// Pseudo-logic for professional-specific endpoints
const profile = await db.query(
  'SELECT is_verified FROM professional_profiles WHERE user_id = $1',
  [req.user.id]
)
if (!profile || !profile.is_verified) {
  return res.status(403).json({ error: { message: 'Professional approval required.' } })
}
```

### 5.6 Ownership checks

For user-owned data (enrollments, progress, saved resources, payments), every query must include `WHERE user_id = req.user.id`. Never trust a user-supplied `user_id` from the request body or URL parameters to grant access.

---

## 6. Part D — Frontend Integration

### 6.1 What changes in AuthContext

When the backend is ready, `AuthContext.jsx` changes in three places only. The rest of the file (FAMILY_ROLES constants, component structure, `useAuth` hook) is preserved exactly.

**`register()`** — replace simulation body:
```js
async function register({ name, email, password, familyRole, accountRole }) {
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include', // sends/receives the HttpOnly session cookie
    body: JSON.stringify({
      full_name: name,
      email,
      password,
      account_role: accountRole ?? 'parent', // 'parent' or 'professional' — never 'admin'
      family_role: familyRole,
    }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error?.message ?? 'Registration failed.')
  setUser(data.user)
  return data.user
}
```

**`login()`** — replace simulation body:
```js
async function login({ email, password }) {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, password }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error?.message ?? 'Login failed.')
  setUser(data.user)
  return data.user
}
```

**`updateProfile()`** — replace simulation body:
```js
async function updateProfile(updates) {
  const res = await fetch('/api/auth/me', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(updates),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error?.message ?? 'Update failed.')
  setUser(data.user)
  return data.user
}
```

**`logout()`** — add an API call before clearing state:
```js
async function logout() {
  await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
  setUser(null)
}
```

**Session restoration on mount** — replace `sessionStorage` read:
```js
useEffect(() => {
  // The server reads the HttpOnly session cookie and returns the user profile
  // if the session exists and has not expired.
  fetch('/api/auth/me', { credentials: 'include' })
    .then(res => res.ok ? res.json() : null)
    .then(data => setUser(data?.user ?? null))
    .catch(() => setUser(null))
    .finally(() => setLoading(false))
}, [])
```

Remove the `SESSION_KEY` constant and all `sessionStorage` calls entirely. Session state lives on the server; the cookie is the only client-side artefact.

### 6.2 What does NOT change in the frontend

- `LoginPage.jsx` — form, validation, error messages, and visual design are preserved as-is
- `RegisterPage.jsx` — form, role cards, validation, and visual design are preserved as-is
- `ProfilePage.jsx` — view/edit modes, role selector, and visual design are preserved as-is
- `AppRoutes.jsx` — `ProtectedRoute` and `AdminRoute` structure is preserved; the admin dev shortcut is removed
- All brand colours, typography, and Tailwind classes are unchanged
- The `from` state redirect after login is preserved

### 6.3 Loading state

`AuthContext` already exposes `loading`. While `GET /api/auth/me` is in flight on app mount, `loading = true`. Both `ProtectedRoute` and `AdminRoute` already handle this with a spinner. No changes needed.

### 6.4 Handling 401 responses from protected endpoints

Once auth is real, any protected API call may return `401` (expired token, deleted account). A global `fetch` wrapper or a custom hook should handle this:

```js
// If any API call returns 401, clear the user and redirect to login
if (res.status === 401) {
  setUser(null)
  navigate('/login', { state: { from: location.pathname } })
}
```

This should be built into a shared `api.js` service module, not duplicated in every component.

### 6.5 Error display

`LoginPage.jsx` and `RegisterPage.jsx` already display error messages from the context functions via `submitError` state. Once real error messages come from the API, they surface automatically through the existing `catch (err) { setSubmitError(err.message) }` pattern. No design changes needed.

### 6.6 Removing dev notices

Once real auth is connected, remove:
- The "Development preview" notice from `LoginPage.jsx`
- The "Development preview" notice from `RegisterPage.jsx`
- The "Development session" notice from `ProfilePage.jsx`
- The `_devOnly` flag from the user object

---

## 7. Part E — Future Requirements

### 7.1 Password recovery

**Approved decision (D-09 ✅):** Password recovery is deferred until an email delivery provider is selected and configured. No password recovery UI or API endpoint will be built or exposed until the email delivery infrastructure is in place.

The existing `LoginPage.jsx` note ("Password reset will be available when authentication is implemented") is accurate and must remain until recovery is fully implemented and tested.

**What must NOT happen before email delivery is configured:**
- No `/forgot-password` route should be created that appears functional but does not send email
- No password reset tokens should be generated and stored without a delivery mechanism
- The frontend must not imply that a recovery email has been sent when it has not

**Planned flow when email delivery is ready (design only, not approved for implementation yet):**

1. User visits `/forgot-password` and submits their email address
2. Server generates a short-lived, single-use token (`crypto.randomBytes(32).toString('hex')`)
3. Server stores a **hash** of the token (not the token itself) in a `password_reset_tokens` table with a 1-hour expiry
4. Server sends an email with a link: `https://sidra.et/reset-password?token=<token>`
5. User clicks the link and enters a new password
6. Server validates the token (exists, not expired, not already used), hashes the new password, updates `users.password_hash`, marks the token as used
7. All existing sessions for the user should be deleted to force re-authentication

**`password_reset_tokens` table (planned, not yet added to DATABASE_DESIGN.md):**
```sql
CREATE TABLE password_reset_tokens (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash  TEXT        NOT NULL UNIQUE,
  expires_at  TIMESTAMPTZ NOT NULL,
  used_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

This table will be added to `DATABASE_DESIGN.md` when the email delivery task begins.

### 7.2 Email verification

**Planned flow (not implemented now):**

1. On registration, generate a short-lived email verification token
2. Store the token hash in an `email_verification_tokens` table
3. Send an email with a verification link
4. User clicks the link; server marks `users.email_verified = true`
5. Unverified users may be allowed limited access (browsing only) until verified

Add `email_verified BOOLEAN NOT NULL DEFAULT FALSE` to the `users` table when this is implemented.

**Note:** Email delivery (SMTP, SendGrid, Resend, etc.) is not planned in this task. Design the token generation and storage separately from the email delivery mechanism so they can be connected independently.

---

## 8. Part F — Testing Plan

The following test cases must pass before the authentication implementation is considered complete. Tests should be written using a test framework (Jest + Supertest for the backend is recommended).

### 8.1 Registration tests

| # | Test | Expected result |
|---|---|---|
| R-01 | Register with valid name, email, password, and family role | 201; user object returned; cookie set; `password_hash` not in response |
| R-02 | Register with duplicate email | 409; error message "already exists" |
| R-03 | Register with missing full name | 400; `fields.full_name` error |
| R-04 | Register with invalid email format | 400; `fields.email` error |
| R-05 | Register with password shorter than 8 characters | 400; `fields.password` error |
| R-06 | Register with `account_role: "admin"` in request body | 201; returned user has `account_role: "parent"` — role is ignored |
| R-07 | Register with invalid `family_role` value | 400; field error |
| R-08 | Register with `family_role` omitted | 201; `family_role` is `null` in response |

### 8.2 Login tests

| # | Test | Expected result |
|---|---|---|
| L-01 | Login with correct email and password | 200; user object returned; `HttpOnly` cookie set |
| L-02 | Login with correct email, wrong password | 401; generic error message; no cookie |
| L-03 | Login with unregistered email | 401; same generic error message; same response time as L-02 |
| L-04 | Login with deactivated account | 403; account deactivated message |
| L-05 | Login with empty email | 400; validation error |
| L-06 | Login with empty password | 400; validation error |

### 8.3 Session tests

| # | Test | Expected result |
|---|---|---|
| S-01 | `GET /api/auth/me` with valid session cookie | 200; user object; `password_hash` not in response |
| S-02 | `GET /api/auth/me` with no cookie | 401 |
| S-03 | `GET /api/auth/me` with expired JWT | 401; cookie should be cleared |
| S-04 | `GET /api/auth/me` with tampered JWT signature | 401 |
| S-05 | `POST /api/auth/logout` with valid session | 200; `Set-Cookie` clears `sid`; subsequent `GET /api/auth/me` returns 401 |

### 8.4 Authorization tests

| # | Test | Expected result |
|---|---|---|
| A-01 | Access `/api/admin/users` as `parent` | 403 Forbidden |
| A-02 | Access `/api/admin/users` with no session | 401 Unauthorized |
| A-03 | Access `/api/admin/users` as `admin` | 200 |
| A-04 | `PUT /api/auth/me` with `account_role: "admin"` in body | 200; returned user still has original role — field is ignored |
| A-05 | `GET /api/enrollments/:id` where `:id` belongs to another user | 403 or 404 |
| A-06 | `GET /api/enrollments/:id` for own enrollment | 200 |

### 8.5 Professional approval tests

| # | Test | Expected result |
|---|---|---|
| P-01 | `professional` account accesses professional-only features before approval | 403 |
| P-02 | Admin approves professional application | `professional_profiles.is_verified` becomes `true` |
| P-03 | Approved professional accesses professional-only features | 200 |
| P-04 | Admin rejects application; professional tries to access features | 403 |
| P-05 | Unverified professional profile does not appear in public directory | Public directory returns only verified profiles |

---

## 9. Implementation Checklist

Use this as a step-by-step guide when implementation begins.

### Step 1 — Dependencies
- [ ] Install `bcrypt` in `server/`
- [ ] Install `cookie-parser` in `server/`
- [ ] Install `pg` in `server/` (for database connection if not already done)

### Step 2 — Environment variables
- [ ] Add `SESSION_DURATION_DAYS` to `server/src/config/env.js` (default: `7`)
- [ ] Add `COOKIE_SECRET` to `server/src/config/env.js` (for signed cookies, optional)
- [ ] Uncomment `DATABASE_URL` in `server/src/config/env.js`
- [ ] Remove the commented-out `JWT_SECRET` and `JWT_EXPIRES_IN` references (not used with server-managed sessions)
- [ ] Update `server/.env.example` with all new variables

### Step 3 — Database
- [ ] Connect the PostgreSQL pool in `server/src/config/db.js`
- [ ] Run migrations to create the `users` table (from DATABASE_DESIGN.md)
- [ ] Add the `sessions` table (defined in Section 2.1 of this document)

### Step 4 — Backend auth implementation
- [ ] Add `cookie-parser` middleware to `server/src/app.js`
- [ ] Create `server/src/utils/password.js` — bcrypt hash and compare helpers
- [ ] Create `server/src/utils/session.js` — session ID generation and session CRUD helpers
- [ ] Implement `POST /api/auth/register`
- [ ] Implement `POST /api/auth/login`
- [ ] Implement `POST /api/auth/logout` (delete session row + clear cookie)
- [ ] Implement `GET /api/auth/me`
- [ ] Implement `PUT /api/auth/me` (full_name + family_role only)
- [ ] Create `server/src/middleware/authenticate.js` (session lookup, not JWT verify)
- [ ] Create `server/src/middleware/requireRole.js`
- [ ] Add expired session cleanup logic (delete rows where `expires_at < NOW()`)

### Step 5 — Frontend integration
- [ ] Replace `AuthContext.register()` simulation with real fetch
- [ ] Replace `AuthContext.login()` simulation with real fetch
- [ ] Replace `AuthContext.logout()` simulation with real API call (server deletes session)
- [ ] Replace `AuthContext.updateProfile()` simulation with real fetch
- [ ] Replace sessionStorage session restoration with `GET /api/auth/me` on mount
- [ ] Remove `SESSION_KEY` constant and all `sessionStorage` calls
- [ ] Remove admin dev shortcut from `AuthContext.login()`
- [ ] Remove admin dev shortcut from `AppRoutes.jsx` AdminRoute comments
- [ ] Remove dev notices from `LoginPage`, `RegisterPage`, `ProfilePage`
- [ ] Create `client/src/services/api.js` for shared fetch with 401 handling
- [ ] Update `RegisterPage.jsx` to pass `accountRole` to `register()` (parent or professional)

### Step 6 — Testing
- [ ] Write and pass all tests in Section 8

---

## 10. Decisions Requiring Approval

Decisions marked ✅ have been approved. Decisions marked ❓ are still open and must be resolved before implementation begins.

| # | Decision | Status | Notes |
|---|---|---|---|
| D-01 | **HttpOnly session cookie** — store only the session ID in the cookie; no localStorage, no sessionStorage | ✅ **Approved** | |
| D-02 | **`SameSite=Lax`** as the initial default cookie setting | ✅ **Approved** | Deployment topology must be confirmed before finalising `Domain` and cross-site settings |
| D-03 | **bcrypt work factor 12** | ❓ Open | Confirm or adjust based on server hardware |
| D-04 | **Server-managed sessions in PostgreSQL** — opaque session ID stored server-side; not stateless JWT | ✅ **Approved** (replaces original D-01) | `sessions` table required; see Section 2.1 |
| D-05 | **`GET /api/auth/me` on every app load** to restore session | ❓ Open | Confirm this is acceptable for your expected load |
| D-06 | **Logout deletes the server-side session row AND clears the cookie** | ✅ **Approved** | Cookie deletion alone is not sufficient; no separate token blocklist needed |
| D-07 | **Database lookup on every authenticated request** via `authenticate` middleware | ✅ **Approved** | Ensures deactivated accounts are locked out immediately |
| D-08 | **Professional privileges gated on `is_verified`** in addition to `account_role` | ❓ Open | Confirm |
| D-09 | **Password recovery deferred** until email delivery provider is configured | ✅ **Approved** | No nonfunctional recovery flow will be exposed |
| D-10 | **Professional self-registration is permitted** from the public registration form | ✅ **Approved** | `admin` assignment via public registration is permanently blocked |
| D-11 | **CSRF token requirement** — needed if frontend and API are on different subdomains | ❓ **Open — needs deployment topology** | `SameSite=Lax` alone is sufficient for same-site; cross-subdomain requires an explicit CSRF token header. Confirm your production deployment: will the React frontend and Express API share the same origin, or different subdomains? |
| D-12 | **`sessions` table to be added to DATABASE_DESIGN.md** | ❓ Open | Section 2.1 defines the schema; confirm before the database task begins |
| D-13 | **Expired session cleanup strategy** | ❓ Open | Options: (a) delete on read when `expires_at < NOW()`, (b) a scheduled cleanup job, (c) both. Confirm preferred approach |
| D-14 | **`RegisterPage.jsx` account role selection** — the current form does not include an account role selector (only family role). Professional registration requires the user to choose `professional`. | ❓ Open | Options: (a) add a visible "I am a professional" toggle to the registration form, (b) create a separate `/register/professional` route, (c) default all public registrations to `parent` and let professionals contact an admin. Confirm which approach to build |
