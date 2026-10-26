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
 *
 * Resubmission resets verification_status to 'pending' and clears
 * is_suspended so the profile goes through the full review cycle again.
 *
 * Extended fields (Migration 2025-02) are optional — they enrich the
 * application but are not required to submit.
 */
export async function upsertProfile({
  user_id, specialization, bio, qualifications,
  professional_category = null, institution_name = null,
  license_number = null, license_authority = null,
  license_expires_at = null, years_experience = null, workplace = null,
}) {
  const { rows } = await pool.query(
    `INSERT INTO professional_profiles
       (user_id, specialization, bio, qualifications,
        professional_category, institution_name, license_number,
        license_authority, license_expires_at, years_experience, workplace)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
     ON CONFLICT (user_id) DO UPDATE
       SET specialization        = EXCLUDED.specialization,
           bio                   = EXCLUDED.bio,
           qualifications        = EXCLUDED.qualifications,
           professional_category = EXCLUDED.professional_category,
           institution_name     = EXCLUDED.institution_name,
           license_number        = EXCLUDED.license_number,
           license_authority     = EXCLUDED.license_authority,
           license_expires_at    = EXCLUDED.license_expires_at,
           years_experience      = EXCLUDED.years_experience,
           workplace             = EXCLUDED.workplace,
           verification_status   = 'pending',
           is_suspended          = FALSE,
           reverification_due_at = NULL,
           updated_at            = NOW()
     RETURNING *`,
    [user_id, specialization, bio, qualifications,
      professional_category, institution_name, license_number,
      license_authority, license_expires_at, years_experience, workplace]
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
 * List all approved, non-suspended profiles — used by the public directory.
 * Suspended professionals are hidden from the public listing even though
 * their verification_status remains 'approved'.
 */
export async function listApprovedProfiles() {
  const { rows } = await pool.query(
    `SELECT pp.*, u.full_name, u.email
     FROM   professional_profiles pp
     JOIN   users u ON u.id = pp.user_id
     WHERE  pp.verification_status = 'approved'
       AND  pp.is_suspended = FALSE
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
 * Sets verification_status = 'approved', records the reviewer, and
 * clears any prior rejection reason.
 * @param {string} id Profile UUID
 * @param {string} reviewedBy Admin user UUID
 */
export async function approveProfile(id, reviewedBy) {
  const { rows } = await pool.query(
    `UPDATE professional_profiles
     SET verification_status = 'approved',
         rejection_reason    = NULL,
         reviewed_by         = $2,
         reviewed_at         = NOW(),
         updated_at          = NOW()
     WHERE id = $1
     RETURNING *`,
    [id, reviewedBy]
  )
  return rows[0] ?? null
}

/**
 * Reject a professional application with an optional reason.
 * Records the reviewer and timestamp.
 * @param {string} id Profile UUID
 * @param {string} reviewedBy Admin user UUID
 * @param {string|null} reason Human-readable rejection reason
 */
export async function rejectProfile(id, reviewedBy, reason = null) {
  const { rows } = await pool.query(
    `UPDATE professional_profiles
     SET verification_status = 'rejected',
         rejection_reason    = $3,
         reviewed_by         = $2,
         reviewed_at         = NOW(),
         updated_at          = NOW()
     WHERE id = $1
     RETURNING *`,
    [id, reviewedBy, reason ?? null]
  )
  return rows[0] ?? null
}

/**
 * Suspend a previously approved professional profile.
 * The profile stays in 'approved' status but is hidden from the public
 * directory and the VerifiedBadge is suppressed (is_suspended = true).
 *
 * @param {string} id           Profile UUID
 * @param {string} reviewedBy   Admin user UUID
 * @param {string|null} notes   Optional reason/notes for the suspension
 * @param {string|null} reverificationDueAt  ISO date for required re-verification
 */
export async function suspendProfile(id, reviewedBy, notes = null, reverificationDueAt = null) {
  const { rows } = await pool.query(
    `UPDATE professional_profiles
     SET is_suspended         = TRUE,
         review_notes          = $3,
         reverification_due_at = $4,
         reviewed_by           = $2,
         reviewed_at           = NOW(),
         updated_at            = NOW()
     WHERE id = $1
     RETURNING *`,
    [id, reviewedBy, notes, reverificationDueAt]
  )
  return rows[0] ?? null
}

/**
 * Lift a suspension on a professional profile.
 * Clears the suspension flag and any reverification due date.
 *
 * @param {string} id         Profile UUID
 * @param {string} reviewedBy Admin user UUID
 */
export async function unsuspendProfile(id, reviewedBy) {
  const { rows } = await pool.query(
    `UPDATE professional_profiles
     SET is_suspended         = FALSE,
         reverification_due_at = NULL,
         reviewed_by           = $2,
         reviewed_at           = NOW(),
         updated_at            = NOW()
     WHERE id = $1
     RETURNING *`,
    [id, reviewedBy]
  )
  return rows[0] ?? null
}
