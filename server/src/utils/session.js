/**
 * session.js — Server-managed session helpers
 *
 * Sessions are stored in the PostgreSQL `sessions` table.
 * The browser holds only an opaque session ID in an HttpOnly cookie.
 * No user data or secrets are ever stored client-side.
 */

import { randomBytes } from 'crypto'
import { pool } from '../config/db.js'
import { env } from '../config/env.js'

/** Session lifetime in seconds (default 7 days). */
const DURATION_DAYS = Number(env.SESSION_DURATION_DAYS ?? 7)
const DURATION_MS = DURATION_DAYS * 24 * 60 * 60 * 1000

/** Cookie name — non-descriptive to avoid leaking implementation details. */
export const COOKIE_NAME = 'sid'

/**
 * Build the Set-Cookie options object for Express res.cookie().
 * Secure is enabled only in production (HTTPS required).
 */
export function cookieOptions(maxAge = DURATION_MS) {
  const isProd = env.NODE_ENV === 'production'
  return {
    httpOnly: true,
    // Cross-origin production deployment (Vercel frontend → Render backend):
    // The browser only sends cookies to a different origin when both
    // SameSite=None AND Secure are set.  In development (same origin via Vite
    // proxy) 'lax' is fine; in production we must use 'none'.
    sameSite: isProd ? 'none' : 'lax',
    secure: isProd,   // SameSite=None requires Secure — both must be true
    path: '/',
    maxAge,           // milliseconds
  }
}

/**
 * Generate a cryptographically secure session ID.
 * 64 hex characters = 32 bytes = 256 bits of entropy.
 */
function generateSessionId() {
  return randomBytes(32).toString('hex')
}

/**
 * Create a new session row and return the session ID.
 * @param {string} userId
 * @param {{ ip?: string, userAgent?: string }} meta
 * @returns {Promise<string>} session ID to store in the cookie
 */
export async function createSession(userId, { ip = null, userAgent = null } = {}) {
  const id = generateSessionId()
  const expiresAt = new Date(Date.now() + DURATION_MS)

  await pool.query(
    `INSERT INTO sessions (id, user_id, expires_at, ip_address, user_agent)
     VALUES ($1, $2, $3, $4, $5)`,
    [id, userId, expiresAt, ip, userAgent]
  )
  return id
}

/**
 * Look up a session by ID.
 * Returns the session row if valid and not expired, otherwise null.
 * @param {string} sessionId
 */
export async function findSession(sessionId) {
  const { rows } = await pool.query(
    `SELECT * FROM sessions
     WHERE id = $1 AND expires_at > NOW()`,
    [sessionId]
  )
  return rows[0] ?? null
}

/**
 * Delete a session by ID (logout / forced invalidation).
 * No-op if the session does not exist.
 * @param {string} sessionId
 */
export async function deleteSession(sessionId) {
  await pool.query(`DELETE FROM sessions WHERE id = $1`, [sessionId])
}

/**
 * Delete all sessions for a user (e.g. on deactivation or password change).
 * @param {string} userId
 */
export async function deleteAllUserSessions(userId) {
  await pool.query(`DELETE FROM sessions WHERE user_id = $1`, [userId])
}

/**
 * Lazily purge expired sessions.
 * Call this occasionally (e.g. on each login) to keep the table tidy.
 */
export async function purgeExpiredSessions() {
  await pool.query(`DELETE FROM sessions WHERE expires_at <= NOW()`)
}
