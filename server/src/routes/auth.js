/**
 * auth.js — Authentication routes
 *
 * POST  /api/auth/register  — create a new account
 * POST  /api/auth/login     — verify credentials and open a session
 * POST  /api/auth/logout    — delete the session and clear the cookie
 * GET   /api/auth/me        — return the authenticated user's profile
 * PUT   /api/auth/me        — update name and/or role (no admin promotion)
 *
 * Sessions are stored in the PostgreSQL `sessions` table.
 * The browser receives only an opaque session ID in an HttpOnly cookie.
 * Password hashes are NEVER returned in any response.
 */

import { Router } from 'express'
import {
  createUser,
  findUserByEmail,
  findUserByEmailWithHash,
  updateUser,
  findUserByIdWithHash,
  updatePasswordHash,
} from '../models/userModel.js'
import { hashPassword, verifyPassword, DUMMY_HASH } from '../utils/password.js'
import {
  createSession,
  deleteSession,
  purgeExpiredSessions,
  COOKIE_NAME,
  cookieOptions,
  deleteAllUserSessions,
} from '../utils/session.js'
import { authenticate } from '../middleware/authenticate.js'

const router = Router()

// ── Allowed roles for public self-registration ────────────────────────────────
const REGISTRATION_ROLES = ['mother', 'father', 'legal_guardian', 'professional']

// ── Validation helpers ────────────────────────────────────────────────────────

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function isValidPassword(password) {
  // Min 8 chars, at least one letter and one digit
  return (
    typeof password === 'string' &&
    password.length >= 8 &&
    /[A-Za-z]/.test(password) &&
    /[0-9]/.test(password)
  )
}

// ── POST /api/auth/register ───────────────────────────────────────────────────

router.post('/register', async (req, res, next) => {
  try {
    const { full_name, email, password, role } = req.body

    // ── Input validation ────────────────────────────────────────────────────
    const fields = {}
    if (!full_name || full_name.trim().length < 2)
      fields.full_name = 'Full name must be at least 2 characters.'
    if (!email || !isValidEmail(email))
      fields.email = 'A valid email address is required.'
    if (!isValidPassword(password))
      fields.password = 'Password must be at least 8 characters and include a letter and a number.'

    if (Object.keys(fields).length > 0) {
      return res.status(400).json({
        error: { message: 'Please correct the errors below.', fields },
      })
    }

    // ── Role safety: never allow admin via public registration ───────────────
    const safeRole = REGISTRATION_ROLES.includes(role) ? role : 'mother'

    // ── Duplicate email check ────────────────────────────────────────────────
    const existing = await findUserByEmail(email)
    if (existing) {
      return res.status(409).json({
        error: { message: 'An account with this email address already exists.' },
      })
    }

    // ── Hash password and create user ────────────────────────────────────────
    const password_hash = await hashPassword(password)
    const user = await createUser({
      full_name: full_name.trim(),
      email: email.trim().toLowerCase(),
      password_hash,
      role: safeRole,
    })

    // ── Create session ───────────────────────────────────────────────────────
    const sessionId = await createSession(user.id, {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    })

    res.cookie(COOKIE_NAME, sessionId, cookieOptions())

    return res.status(201).json({ user })

  } catch (err) {
    next(err)
  }
})

// ── POST /api/auth/login ──────────────────────────────────────────────────────

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body

    // ── Basic input validation ───────────────────────────────────────────────
    if (!email || !password) {
      return res.status(400).json({
        error: { message: 'Email and password are required.' },
      })
    }

    // ── Fetch user WITH hash (login-only function) ───────────────────────────
    const user = await findUserByEmailWithHash(email)

    // ── Always run bcrypt to prevent email enumeration via timing ────────────
    const hashToCompare = user ? user.password_hash : DUMMY_HASH
    const passwordMatch = await verifyPassword(password, hashToCompare)

    // ── Generic error — never reveal which field was wrong ───────────────────
    if (!user || !passwordMatch) {
      return res.status(401).json({
        error: { message: 'Invalid email or password.' },
      })
    }

    // ── Reject inactive accounts ─────────────────────────────────────────────
    if (!user.is_active) {
      return res.status(403).json({
        error: { message: 'This account has been deactivated. Please contact support.' },
      })
    }

    // ── Create session + lazily purge expired ones ───────────────────────────
    await purgeExpiredSessions()
    const sessionId = await createSession(user.id, {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    })

    res.cookie(COOKIE_NAME, sessionId, cookieOptions())

    // ── Return user profile — never include password_hash ────────────────────
    const { password_hash: _omit, ...safeUser } = user
    return res.status(200).json({ user: safeUser })

  } catch (err) {
    next(err)
  }
})

// ── POST /api/auth/logout ─────────────────────────────────────────────────────

router.post('/logout', async (req, res, next) => {
  try {
    const sessionId = req.cookies?.[COOKIE_NAME]

    if (sessionId) {
      // Delete the session row — cookie deletion alone is not sufficient
      await deleteSession(sessionId)
    }

    // Clear the cookie with matching attributes so the browser removes it
    res.clearCookie(COOKIE_NAME, cookieOptions(0))

    return res.status(200).json({ message: 'Logged out successfully.' })

  } catch (err) {
    next(err)
  }
})

// ── GET /api/auth/me ──────────────────────────────────────────────────────────

router.get('/me', authenticate, (req, res) => {
  // authenticate middleware has already verified the session and
  // attached the safe user object to req.user (no password_hash)
  return res.status(200).json({ user: req.user })
})

// ── PUT /api/auth/me ──────────────────────────────────────────────────────────

router.put('/me', authenticate, async (req, res, next) => {
  try {
    const { full_name, role } = req.body

    // ── Validate name if provided ────────────────────────────────────────────
    if (full_name !== undefined && full_name.trim().length < 2) {
      return res.status(400).json({
        error: { message: 'Full name must be at least 2 characters.' },
      })
    }

    // ── updateUser silently rejects any role not in PUBLIC_ROLES ─────────────
    // This prevents self-promotion to 'admin' at the model layer.
    const updated = await updateUser(req.user.id, {
      full_name: full_name ?? undefined,
      role: role ?? undefined,
    })

    return res.status(200).json({ user: updated })

  } catch (err) {
    next(err)
  }
})

// ── POST /api/auth/change-password ───────────────────────────────────────────
//
// Requires authentication.
// Verifies the current password before applying the new one.
// On success, invalidates ALL other sessions so any other logged-in
// device/browser is forced to re-authenticate.
// The current session is kept alive so the user is not logged out.

router.post('/change-password', authenticate, async (req, res, next) => {
  try {
    const { current_password, new_password } = req.body

    // ── Input validation ────────────────────────────────────────────────────
    if (!current_password || !new_password) {
      return res.status(400).json({
        error: { message: 'current_password and new_password are both required.' },
      })
    }

    if (!isValidPassword(new_password)) {
      return res.status(400).json({
        error: {
          message: 'New password must be at least 8 characters and include a letter and a number.',
          fields: { new_password: 'Must be at least 8 characters and include a letter and a number.' },
        },
      })
    }

    if (current_password === new_password) {
      return res.status(400).json({
        error: { message: 'New password must be different from your current password.' },
      })
    }

    // ── Fetch the user's current hash ────────────────────────────────────────
    const userWithHash = await findUserByIdWithHash(req.user.id)
    if (!userWithHash) {
      return res.status(404).json({
        error: { message: 'User not found.' },
      })
    }

    // ── Verify current password ──────────────────────────────────────────────
    const match = await verifyPassword(current_password, userWithHash.password_hash)
    if (!match) {
      return res.status(401).json({
        error: { message: 'Current password is incorrect.' },
      })
    }

    // ── Hash and store the new password ──────────────────────────────────────
    const newHash = await hashPassword(new_password)
    await updatePasswordHash(req.user.id, newHash)

    // ── Invalidate all OTHER sessions ────────────────────────────────────────
    // Delete every session for this user, then re-create the current one so
    // the caller stays logged in on this device.
    await deleteAllUserSessions(req.user.id)

    const newSessionId = await createSession(req.user.id, {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    })
    res.cookie(COOKIE_NAME, newSessionId, cookieOptions())

    return res.status(200).json({
      message: 'Password changed successfully. Other sessions have been signed out.',
    })

  } catch (err) {
    next(err)
  }
})

export default router
