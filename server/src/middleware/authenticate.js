/**
 * authenticate.js — session-based authentication middleware
 *
 * Reads the `sid` cookie, validates the session against PostgreSQL,
 * and attaches the user to req.user.
 *
 * Every request hits the database — this ensures deactivated accounts
 * and explicitly-logged-out sessions are rejected immediately.
 *
 * Usage:
 *   import { authenticate } from '../middleware/authenticate.js'
 *   router.get('/me', authenticate, handler)
 */

import { findSession, deleteSession, COOKIE_NAME, cookieOptions } from '../utils/session.js'
import { findUserById } from '../models/userModel.js'

export async function authenticate(req, res, next) {
  const sessionId = req.cookies?.[COOKIE_NAME]

  if (!sessionId) {
    return res.status(401).json({
      error: { message: 'Not authenticated.', status: 401 },
    })
  }

  try {
    // 1. Look up the session (also checks expires_at > NOW())
    const session = await findSession(sessionId)

    if (!session) {
      // Session expired or deleted — clear the stale cookie
      res.clearCookie(COOKIE_NAME, cookieOptions(0))
      return res.status(401).json({
        error: { message: 'Session expired. Please log in again.', status: 401 },
      })
    }

    // 2. Look up the user
    const user = await findUserById(session.user_id)

    if (!user || !user.is_active) {
      // Account deleted or deactivated — invalidate session
      await deleteSession(sessionId)
      res.clearCookie(COOKIE_NAME, cookieOptions(0))
      return res.status(401).json({
        error: { message: 'Account is inactive. Please contact support.', status: 401 },
      })
    }

    // 3. Attach user to the request for downstream handlers
    req.user      = user
    req.sessionId = sessionId
    next()

  } catch (err) {
    next(err)
  }
}
