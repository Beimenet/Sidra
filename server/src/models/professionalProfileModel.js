/**
 * professionalProfileModel.js — Queries for the professional_profiles table
 *
 * A professional_profile row is created when a professional submits an
 * application. It becomes visible in the public directory only after an
 * administrator sets verification_status = 'approved'.
 */

import { pool } from '../config/db.js'

/**
 * Create or update a professional profile for a user.
 * Uses INSERT … ON CONFLICT so a professional can resubmit.
 */
export async function upsertProfile({ user_id, specialization, bio, qualifications }) {
  const { rows } = await pool.query(
    `INSERT INTO professional_profiles
       (user_id, specialization, bio, qualifications)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (user_id) DO UPDATE
       SET specialization      = EXCLUDED.specialization,
           bio                 = EXCLUDED.bio,
           qualifications      = EXCLUDED.qualifications,
           verification_status = 'pending',
           updated_at          = NOW()
     RETURNING *`,
    [user_id, specialization, bio, qualifications]
  )
  return rows[0]
}

/**
 * Get a single profile by user_id.
 */
export async function findProfileByUserId(user_id) {
  const { rows } = await pool.query(
    `SELECT * FROM professional_profiles WHERE user_id = $1`,
    [user_id]
  )
  return rows[0] ?? null
}

/**
 * List all approved profiles — used by the public directory.
 */
export async function listApprovedProfiles() {
  const { rows } = await pool.query(
    `SELECT pp.*, u.full_name, u.email
     FROM   professional_profiles pp
     JOIN   users u ON u.id = pp.user_id
     WHERE  pp.verification_status = 'approved'
     ORDER  BY u.full_name`
  )
  return rows
}

/**
 * List all profiles regardless of status — admin use only.
 */
export async function listAllProfiles() {
  const { rows } = await pool.query(
    `SELECT pp.*, u.full_name, u.email
     FROM   professional_profiles pp
     JOIN   users u ON u.id = pp.user_id
     ORDER  BY pp.created_at DESC`
  )
  return rows
}

/**
 * Update the verification status of a profile — admin only.
 * @param {string} id Profile UUID
 * @param {'approved'|'rejected'|'pending'} status
 */
export async function setVerificationStatus(id, status) {
  const { rows } = await pool.query(
    `UPDATE professional_profiles
     SET verification_status = $2, updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [id, status]
  )
  return rows[0] ?? null
}

// ── Admin-only model functions ────────────────────────────────────────────────

/**
 * List pending professional applications — admin only.
 */
export async function listPendingProfiles() {
  const { rows } = await pool.query(
    `SELECT pp.*, u.full_name, u.email
     FROM   professional_profiles pp
     JOIN   users u ON u.id = pp.user_id
     WHERE  pp.verification_status = 'pending'
     ORDER  BY pp.created_at ASC`   // oldest first — review in submission order
  )
  return rows
}

/**
 * Find a single professional profile by its own UUID (not user_id).
 * Returns null if not found.
 * @param {string} id Profile UUID
 */
export async function findProfileById(id) {
  const { rows } = await pool.query(
    `SELECT pp.*, u.full_name, u.email
     FROM   professional_profiles pp
     JOIN   users u ON u.id = pp.user_id
     WHERE  pp.id = $1`,
    [id]
  )
  return rows[0] ?? null
}

/**
 * Approve a professional application.
 * Sets verification_status = 'approved' and clears any prior rejection reason.
 * @param {string} id Profile UUID
 * @param {string} reviewedBy Admin user UUID
 */
export async function approveProfile(id, reviewedBy) {
  const { rows } = await pool.query(
    `UPDATE professional_profiles
     SET verification_status = 'approved',
         rejection_reason    = NULL,
         updated_at          = NOW()
     WHERE id = $1
     RETURNING *`,
    [id]
  )
  return rows[0] ?? null
}

/**
 * Reject a professional application with an optional reason.
 * @param {string} id Profile UUID
 * @param {string} reviewedBy Admin user UUID
 * @param {string|null} reason Human-readable rejection reason
 */
export async function rejectProfile(id, reviewedBy, reason = null) {
  const { rows } = await pool.query(
    `UPDATE professional_profiles
     SET verification_status = 'rejected',
         rejection_reason    = $2,
         updated_at          = NOW()
     WHERE id = $1
     RETURNING *`,
    [id, reason ?? null]
  )
  return rows[0] ?? null
}
