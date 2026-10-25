/**
 * admin.js — Admin-only API routes
 *
 * All routes require:
 *   1. authenticate  — valid session cookie
 *   2. requireRole('admin') — account role must be 'admin'
 *
 * ── Task 6: User management ───────────────────────────────────
 *   GET    /api/admin/users              — paginated + filtered user list
 *   GET    /api/admin/users/:id          — single user detail
 *   PATCH  /api/admin/users/:id/status   — activate / deactivate
 *
 * ── Task 7: Role management & professional approval ───────────
 *   PATCH  /api/admin/users/:id/role     — set any role (incl. admin)
 *   GET    /api/admin/professionals/pending       — pending applications
 *   PATCH  /api/admin/professionals/:id/approve   — approve application
 *   PATCH  /api/admin/professionals/:id/reject    — reject application
 *
 * ── Task 8: Dashboard statistics ─────────────────────────────
 *   GET    /api/admin/dashboard/stats         — platform statistics
 *   GET    /api/admin/dashboard/recent-users  — recently registered users
 *   GET    /api/admin/dashboard/recent-activity — recent platform activity
 */

import { Router } from 'express'
import { authenticate } from '../middleware/authenticate.js'
import { requireRole } from '../middleware/requireRole.js'
import { deleteAllUserSessions } from '../utils/session.js'
import {
  findUserById,
  adminListUsers,
  setUserStatus,
  adminSetRole,
  countActiveAdmins,
  getDashboardStats,
  getRecentUsers,
  getRecentActivity,
} from '../models/userModel.js'
import {
  findProfileById,
  listPendingProfiles,
  approveProfile,
  rejectProfile,
} from '../models/professionalProfileModel.js'

const router = Router()

// Apply authentication + admin authorisation to every route in this file
router.use(authenticate)
router.use(requireRole('admin'))

// ── Helpers ───────────────────────────────────────────────────────────────────

/** UUID v4 format check */
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
function isUUID(v) { return UUID_RE.test(v) }

// ═════════════════════════════════════════════════════════════════════════════
// TASK 6 — User Management
// ═════════════════════════════════════════════════════════════════════════════

/**
 * GET /api/admin/users
 * List all users with pagination, search, and filtering.
 *
 * Query params:
 *   search    — partial match on name or email
 *   role      — exact role filter (mother|father|legal_guardian|professional|admin)
 *   is_active — 'true' | 'false'
 *   sort      — 'newest' (default) | 'oldest'
 *   page      — page number (default 1)
 *   limit     — results per page (default 20, max 100)
 */
router.get('/users', async (req, res, next) => {
  try {
    const { search, role, is_active, sort, page, limit } = req.query

    // Validate role if provided
    const VALID_ROLES = ['mother', 'father', 'legal_guardian', 'professional', 'admin']
    if (role && !VALID_ROLES.includes(role)) {
      return res.status(400).json({
        error: { message: `Invalid role filter. Must be one of: ${VALID_ROLES.join(', ')}` },
      })
    }

    // Parse is_active
    let activeFilter
    if (is_active === 'true') activeFilter = true
    if (is_active === 'false') activeFilter = false

    // Validate sort
    const VALID_SORTS = ['newest', 'oldest']
    if (sort && !VALID_SORTS.includes(sort)) {
      return res.status(400).json({
        error: { message: `Invalid sort value. Must be 'newest' or 'oldest'.` },
      })
    }

    const result = await adminListUsers({
      search: search ?? '',
      role: role ?? '',
      is_active: activeFilter,
      sort: sort ?? 'newest',
      page: page ?? 1,
      limit: limit ?? 20,
    })

    return res.status(200).json(result)
  } catch (err) {
    next(err)
  }
})

/**
 * GET /api/admin/users/:id
 * Retrieve a single user's safe profile by UUID.
 */
router.get('/users/:id', async (req, res, next) => {
  try {
    const { id } = req.params
    if (!isUUID(id)) {
      return res.status(400).json({ error: { message: 'Invalid user ID format.' } })
    }

    const user = await findUserById(id)
    if (!user) {
      return res.status(404).json({ error: { message: 'User not found.' } })
    }

    return res.status(200).json({ user })
  } catch (err) {
    next(err)
  }
})

/**
 * PATCH /api/admin/users/:id/status
 * Activate or deactivate a user account.
 *
 * Body: { is_active: boolean }
 *
 * Rules:
 *  - Admins cannot deactivate their own account through this endpoint.
 *  - Deactivation invalidates all active sessions immediately.
 */
router.patch('/users/:id/status', async (req, res, next) => {
  try {
    const { id } = req.params
    if (!isUUID(id)) {
      return res.status(400).json({ error: { message: 'Invalid user ID format.' } })
    }

    const { is_active } = req.body
    if (typeof is_active !== 'boolean') {
      return res.status(400).json({
        error: { message: 'is_active must be a boolean (true or false).' },
      })
    }

    // Prevent self-deactivation
    if (!is_active && id === req.user.id) {
      return res.status(403).json({
        error: { message: 'You cannot deactivate your own account.' },
      })
    }

    const target = await findUserById(id)
    if (!target) {
      return res.status(404).json({ error: { message: 'User not found.' } })
    }

    // No-op if already in the requested state
    if (target.is_active === is_active) {
      return res.status(200).json({
        user: target,
        message: `Account is already ${is_active ? 'active' : 'inactive'}.`,
      })
    }

    const updated = await setUserStatus(id, is_active)

    // Invalidate all sessions immediately on deactivation
    if (!is_active) {
      await deleteAllUserSessions(id)
    }

    return res.status(200).json({
      user: updated,
      message: `Account ${is_active ? 'activated' : 'deactivated'} successfully.`,
    })
  } catch (err) {
    next(err)
  }
})

// ═════════════════════════════════════════════════════════════════════════════
// TASK 7A — Role Management
// ═════════════════════════════════════════════════════════════════════════════

/**
 * PATCH /api/admin/users/:id/role
 * Set any valid role for a user, including 'admin'.
 *
 * Body: { role: string }
 *
 * Rules:
 *  - Admins cannot change their own role (prevents accidental self-demotion).
 *  - Cannot remove the last active admin.
 */
router.patch('/users/:id/role', async (req, res, next) => {
  try {
    const { id } = req.params
    if (!isUUID(id)) {
      return res.status(400).json({ error: { message: 'Invalid user ID format.' } })
    }

    const { role } = req.body
    const VALID_ROLES = ['mother', 'father', 'legal_guardian', 'professional', 'admin']
    if (!role || !VALID_ROLES.includes(role)) {
      return res.status(400).json({
        error: { message: `role must be one of: ${VALID_ROLES.join(', ')}` },
      })
    }

    // Prevent self-role-change
    if (id === req.user.id) {
      return res.status(403).json({
        error: { message: 'Administrators cannot change their own role.' },
      })
    }

    const target = await findUserById(id)
    if (!target) {
      return res.status(404).json({ error: { message: 'User not found.' } })
    }

    // Last-admin guard: prevent removing the last active admin
    if (target.role === 'admin' && role !== 'admin') {
      const adminCount = await countActiveAdmins()
      if (adminCount <= 1) {
        return res.status(403).json({
          error: {
            message: 'Cannot remove the last active administrator. Promote another user first.',
          },
        })
      }
    }

    const updated = await adminSetRole(id, role)
    return res.status(200).json({
      user: updated,
      message: `Role updated to '${role}'.`,
    })
  } catch (err) {
    next(err)
  }
})

// ═════════════════════════════════════════════════════════════════════════════
// TASK 7B — Professional Approval
// ═════════════════════════════════════════════════════════════════════════════

/**
 * GET /api/admin/professionals/pending
 * List all professional profiles awaiting review, oldest first.
 */
router.get('/professionals/pending', async (req, res, next) => {
  try {
    const profiles = await listPendingProfiles()
    return res.status(200).json({ profiles })
  } catch (err) {
    next(err)
  }
})

/**
 * PATCH /api/admin/professionals/:id/approve
 * Approve a professional application.
 * Safe against duplicate approvals — re-approving an already-approved
 * profile returns 200 with the current state.
 */
router.patch('/professionals/:id/approve', async (req, res, next) => {
  try {
    const { id } = req.params
    if (!isUUID(id)) {
      return res.status(400).json({ error: { message: 'Invalid profile ID format.' } })
    }

    const profile = await findProfileById(id)
    if (!profile) {
      return res.status(404).json({ error: { message: 'Professional profile not found.' } })
    }

    if (profile.verification_status === 'approved') {
      return res.status(200).json({
        profile,
        message: 'This application is already approved.',
      })
    }

    const updated = await approveProfile(id, req.user.id)
    return res.status(200).json({
      profile: updated,
      message: 'Professional application approved.',
    })
  } catch (err) {
    next(err)
  }
})

/**
 * PATCH /api/admin/professionals/:id/reject
 * Reject a professional application with an optional reason.
 * Safe against duplicate rejections.
 *
 * Body: { reason?: string }
 */
router.patch('/professionals/:id/reject', async (req, res, next) => {
  try {
    const { id } = req.params
    if (!isUUID(id)) {
      return res.status(400).json({ error: { message: 'Invalid profile ID format.' } })
    }

    const profile = await findProfileById(id)
    if (!profile) {
      return res.status(404).json({ error: { message: 'Professional profile not found.' } })
    }

    if (profile.verification_status === 'rejected') {
      return res.status(200).json({
        profile,
        message: 'This application has already been rejected.',
      })
    }

    const reason = typeof req.body.reason === 'string' ? req.body.reason.trim() : null
    const updated = await rejectProfile(id, req.user.id, reason || null)

    return res.status(200).json({
      profile: updated,
      message: 'Professional application rejected.',
    })
  } catch (err) {
    next(err)
  }
})

// ═════════════════════════════════════════════════════════════════════════════
// TASK 8 — Dashboard Statistics
// ═════════════════════════════════════════════════════════════════════════════

/**
 * GET /api/admin/dashboard/stats
 * Real platform statistics from the database.
 * All counts reflect live data; no fabricated values.
 */
router.get('/dashboard/stats', async (req, res, next) => {
  try {
    const stats = await getDashboardStats()
    return res.status(200).json({ stats })
  } catch (err) {
    next(err)
  }
})

/**
 * GET /api/admin/dashboard/recent-users
 * Recently registered users.
 *
 * Query params:
 *   limit — number of users (default 10, max 50)
 */
router.get('/dashboard/recent-users', async (req, res, next) => {
  try {
    const { limit } = req.query
    const safeLimit = Math.min(50, Math.max(1, parseInt(limit, 10) || 10))

    if (limit !== undefined && (isNaN(parseInt(limit, 10)) || parseInt(limit, 10) < 1)) {
      return res.status(400).json({
        error: { message: 'limit must be a positive integer (1–50).' },
      })
    }

    const users = await getRecentUsers(safeLimit)
    return res.status(200).json({ users })
  } catch (err) {
    next(err)
  }
})

/**
 * GET /api/admin/dashboard/recent-activity
 * Recent platform activity from real database records.
 * Combines registrations, enrollments, and professional applications.
 *
 * Query params:
 *   limit — number of items (default 20, max 50)
 *
 * NOTE: This endpoint uses existing timestamp data.
 * A dedicated audit/activity log table would provide richer activity
 * data and is recommended for a future implementation.
 */
router.get('/dashboard/recent-activity', async (req, res, next) => {
  try {
    const { limit } = req.query
    const safeLimit = Math.min(50, Math.max(1, parseInt(limit, 10) || 20))

    if (limit !== undefined && (isNaN(parseInt(limit, 10)) || parseInt(limit, 10) < 1)) {
      return res.status(400).json({
        error: { message: 'limit must be a positive integer (1–50).' },
      })
    }

    const activity = await getRecentActivity(safeLimit)
    return res.status(200).json({
      activity,
      note: 'Activity is derived from registration, enrollment, and application timestamps. A dedicated audit log is recommended for production.',
    })
  } catch (err) {
    next(err)
  }
})

export default router


// ═════════════════════════════════════════════════════════════════════════════
// ENROLLMENT MANAGEMENT — admin view
// ═════════════════════════════════════════════════════════════════════════════

import { pool as _pool } from '../config/db.js'

/**
 * GET /api/admin/enrollments
 * List all enrollments with user and course details.
 *
 * Query params:
 *   course_id — filter by course UUID
 *   user_id   — filter by user UUID
 *   status    — filter by payment_status
 *   page      — page number (default 1)
 *   limit     — results per page (default 20, max 100)
 */
router.get('/enrollments', async (req, res, next) => {
  try {
    const { course_id, user_id, status, page, limit } = req.query

    const safePage = Math.max(1, parseInt(page, 10) || 1)
    const safeLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 20))
    const offset = (safePage - 1) * safeLimit

    const VALID_STATUSES = ['free', 'pending', 'completed', 'failed', 'refunded']
    if (status && !VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        error: { message: `Invalid status filter. Must be one of: ${VALID_STATUSES.join(', ')}` },
      })
    }

    const UUID_RE2 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    if (course_id && !UUID_RE2.test(course_id))
      return res.status(400).json({ error: { message: 'Invalid course_id format.' } })
    if (user_id && !UUID_RE2.test(user_id))
      return res.status(400).json({ error: { message: 'Invalid user_id format.' } })

    const conditions = []
    const params = []

    if (course_id) { params.push(course_id); conditions.push(`e.course_id = $${params.length}`) }
    if (user_id) { params.push(user_id); conditions.push(`e.user_id = $${params.length}`) }
    if (status) { params.push(status); conditions.push(`e.payment_status = $${params.length}`) }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''

    // Count
    const countRes = await _pool.query(
      `SELECT COUNT(*) AS total FROM enrollments e ${where}`, params
    )
    const total = Number(countRes.rows[0].total)

    // Data with user + course info
    params.push(safeLimit, offset)
    const { rows } = await _pool.query(
      `SELECT
         e.id, e.user_id, e.course_id, e.enrolled_at, e.payment_status,
         u.full_name AS user_name, u.email AS user_email, u.role AS user_role,
         c.title AS course_title, c.price_etb, c.published AS course_published
       FROM enrollments e
       JOIN users u   ON u.id = e.user_id
       JOIN courses c ON c.id = e.course_id
       ${where}
       ORDER BY e.enrolled_at DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    )

    return res.status(200).json({
      enrollments: rows,
      total,
      page: safePage,
      limit: safeLimit,
      pages: Math.ceil(total / safeLimit),
    })
  } catch (err) {
    next(err)
  }
})
