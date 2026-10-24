/**
 * userModel.js — Database queries for the users table
 *
 * All queries use parameterised placeholders ($1, $2 …) to prevent
 * SQL injection. Never interpolate user input into a query string.
 *
 * password_hash is NEVER returned to the caller by default.
 * Use findUserByEmailWithHash() ONLY during login credential verification.
 */

import { pool } from '../config/db.js'

// ── Safe column list — excludes password_hash ────────────────────────────────
const SAFE_COLS = 'id, full_name, email, role, is_active, created_at'

/**
 * Roles that are allowed via self-service registration or profile update.
 * 'admin' is intentionally excluded — it must be set directly in the DB
 * or through a separate admin-only operation.
 */
const PUBLIC_ROLES = ['mother', 'father', 'legal_guardian', 'professional']

/**
 * Create a new user.
 * @param {{ full_name, email, password_hash, role }} data
 * @returns {Promise<object>} Created user row (no password_hash)
 */
export async function createUser({ full_name, email, password_hash, role = 'mother' }) {
  const { rows } = await pool.query(
    `INSERT INTO users (full_name, email, password_hash, role)
     VALUES ($1, $2, $3, $4)
     RETURNING ${SAFE_COLS}`,
    [full_name.trim(), email.trim().toLowerCase(), password_hash, role]
  )
  return rows[0]
}

/**
 * Find a user by id (safe — no password_hash).
 * @param {string} id UUID
 */
export async function findUserById(id) {
  const { rows } = await pool.query(
    `SELECT ${SAFE_COLS} FROM users WHERE id = $1`,
    [id]
  )
  return rows[0] ?? null
}

/**
 * Find a user by email (safe — no password_hash).
 * Used for duplicate-email checks during registration.
 */
export async function findUserByEmail(email) {
  const { rows } = await pool.query(
    `SELECT ${SAFE_COLS} FROM users WHERE email = $1`,
    [email.trim().toLowerCase()]
  )
  return rows[0] ?? null
}

/**
 * Find a user by email INCLUDING the password_hash.
 * Use ONLY during login credential verification.
 * NEVER return the result of this function directly to an API response.
 */
export async function findUserByEmailWithHash(email) {
  const { rows } = await pool.query(
    `SELECT id, full_name, email, password_hash, role, is_active, created_at
     FROM users WHERE email = $1`,
    [email.trim().toLowerCase()]
  )
  return rows[0] ?? null
}

/**
 * Update a user's full_name and/or role.
 *
 * SECURITY: The `role` parameter is validated against PUBLIC_ROLES before
 * being applied. This prevents self-promotion to 'admin' even if a caller
 * tries to pass it directly. Role escalation to 'admin' requires a
 * separate admin-only operation with explicit authorization.
 *
 * @param {string} id
 * @param {{ full_name?: string, role?: string }} updates
 */
export async function updateUser(id, { full_name, role } = {}) {
  // Silently reject any role that is not in the public-safe list
  const safeRole = role && PUBLIC_ROLES.includes(role) ? role : null

  const { rows } = await pool.query(
    `UPDATE users
     SET full_name = COALESCE($2, full_name),
         role      = COALESCE($3, role)
     WHERE id = $1
     RETURNING ${SAFE_COLS}`,
    [id, full_name?.trim() ?? null, safeRole]
  )
  return rows[0] ?? null
}

/**
 * Deactivate a user (sets is_active = FALSE).
 * Preferred over hard-deleting accounts that may have payment history.
 * BUG FIX: original version was missing the $1 parameter array.
 * @param {string} id UUID
 */
export async function deactivateUser(id) {
  const { rows } = await pool.query(
    `UPDATE users SET is_active = FALSE WHERE id = $1 RETURNING ${SAFE_COLS}`,
    [id]   // ← was missing in the original; caused a runtime crash
  )
  return rows[0] ?? null
}



/**
 * Update a user's password hash directly.
 * Used only by the change-password endpoint after verifying the current password.
 * NEVER call this without first verifying the user's current password.
 * @param {string} id UUID
 * @param {string} password_hash bcrypt hash of the new password
 */
export async function updatePasswordHash(id, password_hash) {
  await pool.query(
    `UPDATE users SET password_hash = $2 WHERE id = $1`,
    [id, password_hash]
  )
}

/**
 * Find a user by id INCLUDING the password_hash.
 * Use ONLY for change-password verification.
 * NEVER return the result of this function directly to an API response.
 * @param {string} id UUID
 */
export async function findUserByIdWithHash(id) {
  const { rows } = await pool.query(
    `SELECT id, full_name, email, password_hash, role, is_active, created_at
     FROM users WHERE id = $1`,
    [id]
  )
  return rows[0] ?? null
}

/**
 * List all users — admin use only.
 */
export async function listUsers() {
  const { rows } = await pool.query(
    `SELECT ${SAFE_COLS} FROM users ORDER BY created_at DESC`
  )
  return rows
}

// ── Admin-only model functions ────────────────────────────────────────────────

/**
 * Paginated, filterable user list for the admin dashboard.
 *
 * @param {{ search?, role?, is_active?, sort?, page?, limit? }} opts
 * @returns {{ users: object[], total: number, page: number, limit: number, pages: number }}
 */
export async function adminListUsers({
  search = '',
  role = '',
  is_active,          // true | false | undefined
  sort = 'newest', // 'newest' | 'oldest'
  page = 1,
  limit = 20,
} = {}) {
  // Clamp pagination to safe values
  const safePage = Math.max(1, parseInt(page, 10) || 1)
  const safeLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 20))
  const offset = (safePage - 1) * safeLimit

  const conditions = []
  const params = []

  if (search.trim()) {
    params.push(`%${search.trim().toLowerCase()}%`)
    conditions.push(`(LOWER(full_name) LIKE $${params.length} OR LOWER(email) LIKE $${params.length})`)
  }
  if (role) {
    params.push(role)
    conditions.push(`role = $${params.length}`)
  }
  if (is_active !== undefined) {
    params.push(is_active)
    conditions.push(`is_active = $${params.length}`)
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''
  const orderBy = sort === 'oldest' ? 'ORDER BY created_at ASC' : 'ORDER BY created_at DESC'

  // Count query (no pagination)
  const countRes = await pool.query(
    `SELECT COUNT(*) AS total FROM users ${where}`,
    params
  )
  const total = Number(countRes.rows[0].total)

  // Data query
  params.push(safeLimit, offset)
  const dataRes = await pool.query(
    `SELECT ${SAFE_COLS} FROM users ${where} ${orderBy}
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  )

  return {
    users: dataRes.rows,
    total,
    page: safePage,
    limit: safeLimit,
    pages: Math.ceil(total / safeLimit),
  }
}

/**
 * Set a user's is_active flag — admin only.
 * Returns the updated user row or null if not found.
 * @param {string} id
 * @param {boolean} isActive
 */
export async function setUserStatus(id, isActive) {
  const { rows } = await pool.query(
    `UPDATE users SET is_active = $2 WHERE id = $1 RETURNING ${SAFE_COLS}`,
    [id, isActive]
  )
  return rows[0] ?? null
}

/**
 * Set a user's role — admin only.
 * Accepts any valid schema role including 'admin'.
 * Caller is responsible for access control and last-admin checks.
 * @param {string} id
 * @param {string} role
 */
export async function adminSetRole(id, role) {
  const { rows } = await pool.query(
    `UPDATE users SET role = $2 WHERE id = $1 RETURNING ${SAFE_COLS}`,
    [id, role]
  )
  return rows[0] ?? null
}

/**
 * Count active admin accounts.
 * Used to prevent removing the last admin.
 * @returns {Promise<number>}
 */
export async function countActiveAdmins() {
  const { rows } = await pool.query(
    `SELECT COUNT(*) AS cnt FROM users WHERE role = 'admin' AND is_active = TRUE`
  )
  return Number(rows[0].cnt)
}

/**
 * Dashboard statistics — single efficient query over all tables.
 * Returns real counts from the database; no fabricated values.
 */
export async function getDashboardStats() {
  const { rows } = await pool.query(`
    SELECT
      -- User counts
      COUNT(*)                                             AS total_users,
      COUNT(*) FILTER (WHERE is_active = TRUE)            AS active_users,
      COUNT(*) FILTER (WHERE is_active = FALSE)           AS inactive_users,
      COUNT(*) FILTER (WHERE role = 'mother')             AS total_mothers,
      COUNT(*) FILTER (WHERE role = 'father')             AS total_fathers,
      COUNT(*) FILTER (WHERE role = 'legal_guardian')     AS total_legal_guardians,
      COUNT(*) FILTER (WHERE role = 'professional')       AS total_professionals,
      COUNT(*) FILTER (WHERE role = 'admin')              AS total_admins
    FROM users
  `)
  const userStats = rows[0]

  // Professional approval counts
  const profRes = await pool.query(`
    SELECT
      COUNT(*) FILTER (WHERE verification_status = 'pending')  AS pending_applications,
      COUNT(*) FILTER (WHERE verification_status = 'approved') AS approved_professionals,
      COUNT(*) FILTER (WHERE verification_status = 'rejected') AS rejected_applications
    FROM professional_profiles
  `)
  const profStats = profRes.rows[0]

  // Course counts
  const courseRes = await pool.query(`
    SELECT
      COUNT(*)                                         AS total_courses,
      COUNT(*) FILTER (WHERE published = TRUE)        AS published_courses,
      COUNT(*) FILTER (WHERE published = FALSE)       AS draft_courses
    FROM courses
  `)
  const courseStats = courseRes.rows[0]

  // Enrollment count
  const enrollRes = await pool.query(`SELECT COUNT(*) AS total_enrollments FROM enrollments`)
  const enrollStats = enrollRes.rows[0]

  // Convert BigInt-like strings to numbers
  const n = (v) => Number(v)

  return {
    users: {
      total: n(userStats.total_users),
      active: n(userStats.active_users),
      inactive: n(userStats.inactive_users),
      by_role: {
        mother: n(userStats.total_mothers),
        father: n(userStats.total_fathers),
        legal_guardian: n(userStats.total_legal_guardians),
        professional: n(userStats.total_professionals),
        admin: n(userStats.total_admins),
      },
    },
    professionals: {
      pending_applications: n(profStats.pending_applications),
      approved: n(profStats.approved_professionals),
      rejected: n(profStats.rejected_applications),
    },
    courses: {
      total: n(courseStats.total_courses),
      published: n(courseStats.published_courses),
      drafts: n(courseStats.draft_courses),
    },
    enrollments: {
      total: n(enrollStats.total_enrollments),
    },
  }
}

/**
 * Recently registered users — admin dashboard widget.
 * @param {number} limit  max rows (1–50)
 */
export async function getRecentUsers(limit = 10) {
  const safeLimit = Math.min(50, Math.max(1, parseInt(limit, 10) || 10))
  const { rows } = await pool.query(
    `SELECT ${SAFE_COLS} FROM users ORDER BY created_at DESC LIMIT $1`,
    [safeLimit]
  )
  return rows
}

/**
 * Recent platform activity — built from real database timestamps.
 * Combines latest registrations, enrollments, and professional applications
 * into a single chronological feed. No fabricated data.
 * @param {number} limit  max items (1–50)
 */
export async function getRecentActivity(limit = 20) {
  const safeLimit = Math.min(50, Math.max(1, parseInt(limit, 10) || 20))

  const { rows } = await pool.query(`
    SELECT *
    FROM (
      SELECT
        'registration'             AS event_type,
        u.id                       AS entity_id,
        u.full_name                AS label,
        u.role,
        u.created_at               AS occurred_at
      FROM users u

      UNION ALL

      SELECT
        'enrollment'               AS event_type,
        e.id                       AS entity_id,
        c.title                    AS label,
        NULL                       AS role,
        e.enrolled_at              AS occurred_at
      FROM enrollments e
      JOIN courses c ON c.id = e.course_id

      UNION ALL

      SELECT
        'professional_application' AS event_type,
        pp.id                      AS entity_id,
        u.full_name                AS label,
        pp.verification_status     AS role,
        pp.created_at              AS occurred_at
      FROM professional_profiles pp
      JOIN users u ON u.id = pp.user_id
    ) activity
    ORDER BY occurred_at DESC
    LIMIT $1
  `, [safeLimit])

  return rows
}
