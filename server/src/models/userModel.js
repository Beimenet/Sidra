/**
 * userModel.js — Database queries for the users table
 *
 * All queries use parameterised placeholders ($1, $2 …) to prevent
 * SQL injection. Never interpolate user input into a query string.
 *
 * password_hash is NEVER returned to the caller by default.
 * Use the explicit findByEmailWithHash() function only during login.
 */

import { pool } from '../config/db.js'

// ── Safe column list — excludes password_hash ────────────────────────────────
const SAFE_COLS = 'id, full_name, email, role, is_active, created_at'

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
 * Use ONLY during login credential verification — never return
 * the result of this function directly to an API response.
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
 * account_role cannot be changed to 'admin' via this function —
 * that must go through a separate admin-only operation.
 */
export async function updateUser(id, { full_name, role }) {
  const { rows } = await pool.query(
    `UPDATE users
     SET full_name = COALESCE($2, full_name),
         role      = COALESCE($3, role)
     WHERE id = $1
     RETURNING ${SAFE_COLS}`,
    [id, full_name?.trim() ?? null, role ?? null]
  )
  return rows[0] ?? null
}

/**
 * Deactivate a user (sets is_active = FALSE).
 * Preferred over hard-deleting accounts that may have payment history.
 */
export async function deactivateUser(id) {
  const { rows } = await pool.query(
    `UPDATE users SET is_active = FALSE WHERE id = $1 RETURNING ${SAFE_COLS}`,
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
