/**
 * auth.js — Authentication API routes
 *
 * STATUS: Not yet implemented.
 *
 * These route stubs define the intended API surface for authentication.
 * They return 501 Not Implemented until the database layer,
 * password hashing (bcrypt), and JWT signing are implemented.
 *
 * Planned routes:
 *   POST  /api/auth/register  — create a new user account
 *   POST  /api/auth/login     — authenticate and receive a JWT
 *   POST  /api/auth/logout    — invalidate the session (if server-side)
 *   GET   /api/auth/me        — return the authenticated user's profile
 *
 * Security reminders for when this is implemented:
 *   - Hash passwords with bcrypt before storing. Never store plaintext.
 *   - Sign JWTs with a secret from environment variables, never hardcoded.
 *   - Validate and sanitise all input server-side.
 *   - Return generic error messages on failed login (do not reveal which field failed).
 */

import { Router } from 'express'

const router = Router()

function notImplemented(req, res) {
  res.status(501).json({
    error: {
      message: 'Not implemented — authentication is planned but not yet built.',
      status: 501,
      route: `${req.method} ${req.originalUrl}`,
    },
  })
}

router.post('/register', notImplemented)
router.post('/login',    notImplemented)
router.post('/logout',   notImplemented)
router.get('/me',        notImplemented)

export default router
