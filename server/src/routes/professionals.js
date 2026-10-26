/**
 * professionals.js — Professional Directory API routes
 *
 * Mounts under /api/professionals in app.js.
 *
 * ── Public directory ─────────────────────────────────────────────────────────
 *   GET    /api/professionals               — list approved/public profiles
 *   GET    /api/professionals/:professionalId — single profile (approved only)
 *
 * ── Professional self-service ────────────────────────────────────────────────
 *   POST   /api/professionals               — submit/create own profile (professional role)
 *   PATCH  /api/professionals/me            — update own profile (professional role)
 *
 * ── Admin verification ────────────────────────────────────────────────────────
 *   PATCH  /api/professionals/:professionalId/verification — update status (admin)
 *
 * Authentication: PostgreSQL session cookies (authenticate middleware).
 * Authorization:  role-based via requireRole.
 *
 * DESIGN NOTES:
 * - Only 'approved' profiles appear in the public listing.
 * - Professionals cannot change their own verification_status.
 * - Admins already have approve/reject endpoints in /api/admin/professionals.
 *   The PATCH .../verification endpoint here provides the same capability
 *   with a single generic status field.
 * - Sensitive fields (rejection_reason) are omitted from public responses.
 */

import { Router } from 'express'
import { authenticate } from '../middleware/authenticate.js'
import { requireRole } from '../middleware/requireRole.js'
import {
  upsertProfile,
  findProfileByUserId,
  findProfileById,
  listApprovedProfiles,
  setVerificationStatus,
} from '../models/professionalProfileModel.js'

const router = Router()

// ── Helpers ───────────────────────────────────────────────────────────────────

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
function isUUID(v) { return UUID_RE.test(v) }

/**
 * Strip private fields from a profile before returning to a public caller.
 * rejection_reason is private — only the owning professional and admins see it.
 */
function publicProfile(profile) {
  const { rejection_reason: _r, ...pub } = profile
  return pub
}

// =============================================================================
// PUBLIC DIRECTORY
// =============================================================================

/**
 * GET /api/professionals
 * Public — list all approved professional profiles.
 *
 * Query params (all optional):
 *   search        — partial match on full_name, specialization, or bio
 *   specialization — exact match filter
 *   page          — page number (default 1)
 *   limit         — results per page (default 20, max 100)
 */
router.get('/', async (req, res, next) => {
  try {
    const { search = '', specialization = '', page = 1, limit = 20 } = req.query

    const safePage = Math.max(1, parseInt(page, 10) || 1)
    const safeLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 20))

    // Fetch all approved profiles and apply in-memory filtering.
    // For larger datasets a DB-level filter would be preferred, but the
    // existing listApprovedProfiles() model function covers the use case.
    // We extend it inline here to avoid modifying the shared model.
    let profiles = await listApprovedProfiles()

    if (search.trim()) {
      const q = search.trim().toLowerCase()
      profiles = profiles.filter(
        (p) =>
          p.full_name?.toLowerCase().includes(q) ||
          p.specialization?.toLowerCase().includes(q) ||
          p.bio?.toLowerCase().includes(q)
      )
    }

    if (specialization.trim()) {
      profiles = profiles.filter(
        (p) => p.specialization?.toLowerCase() === specialization.trim().toLowerCase()
      )
    }

    const total = profiles.length
    const offset = (safePage - 1) * safeLimit
    const paged = profiles.slice(offset, offset + safeLimit).map(publicProfile)

    return res.status(200).json({
      professionals: paged,
      total,
      page: safePage,
      limit: safeLimit,
      pages: Math.ceil(total / safeLimit),
    })
  } catch (err) {
    next(err)
  }
})

/**
 * GET /api/professionals/me
 * Authenticated (professional) — view own profile including private fields.
 * NOTE: must be defined before /:professionalId to avoid "me" being matched as UUID.
 */
router.get('/me', authenticate, requireRole('professional', 'admin'), async (req, res, next) => {
  try {
    const profile = await findProfileByUserId(req.user.id)
    if (!profile) {
      return res.status(404).json({ error: { message: 'You do not have a professional profile yet.' } })
    }
    // Return full profile including rejection_reason to the owner
    return res.status(200).json({ profile })
  } catch (err) {
    next(err)
  }
})

/**
 * GET /api/professionals/:professionalId
 * Public — retrieve a single approved professional profile.
 * Admins can view profiles of any status.
 */
router.get('/:professionalId', async (req, res, next) => {
  try {
    const { professionalId } = req.params
    if (!isUUID(professionalId)) {
      return res.status(400).json({ error: { message: 'Invalid professional ID format.' } })
    }

    const profile = await findProfileById(professionalId)
    if (!profile) {
      return res.status(404).json({ error: { message: 'Professional profile not found.' } })
    }

    // Check if requester is an admin (soft check — no hard auth required for public listing)
    const sessionId = req.cookies?.sid
    let isAdmin = false
    if (sessionId) {
      try {
        const { findSession } = await import('../utils/session.js')
        const { findUserById } = await import('../models/userModel.js')
        const session = await findSession(sessionId)
        if (session) {
          const user = await findUserById(session.user_id)
          if (user?.is_active && user?.role === 'admin') isAdmin = true
        }
      } catch (_) { /* treat as unauthenticated */ }
    }

    // Non-admins can only see approved, non-suspended profiles
    if ((profile.verification_status !== 'approved' || profile.is_suspended) && !isAdmin) {
      return res.status(404).json({ error: { message: 'Professional profile not found.' } })
    }

    const responseProfile = isAdmin ? profile : publicProfile(profile)
    return res.status(200).json({ profile: responseProfile })
  } catch (err) {
    next(err)
  }
})

// =============================================================================
// PROFESSIONAL SELF-SERVICE
// =============================================================================

/**
 * POST /api/professionals
 * Authenticated (role = professional) — submit or resubmit a professional profile.
 *
 * Uses upsertProfile (INSERT ON CONFLICT) so a professional can update
 * their application. Resubmission resets verification_status to 'pending'.
 *
 * Body: { specialization, bio, qualifications }
 */
router.post('/', authenticate, requireRole('professional'), async (req, res, next) => {
  try {
    const {
      specialization, bio, qualifications,
      professional_category, institution_name, license_number,
      license_authority, license_expires_at, years_experience, workplace,
    } = req.body

    // ── Validation ────────────────────────────────────────────────────────────
    const fields = {}
    if (!specialization || typeof specialization !== 'string' || specialization.trim().length < 3)
      fields.specialization = 'Specialization is required (minimum 3 characters).'
    if (!bio || typeof bio !== 'string' || bio.trim().length < 20)
      fields.bio = 'Bio is required (minimum 20 characters).'
    if (!qualifications || typeof qualifications !== 'string' || qualifications.trim().length < 5)
      fields.qualifications = 'Qualifications are required (minimum 5 characters).'

    if (Object.keys(fields).length > 0) {
      return res.status(400).json({
        error: { message: 'Please correct the errors below.', fields },
      })
    }

    const profile = await upsertProfile({
      user_id: req.user.id,
      specialization: specialization.trim(),
      bio: bio.trim(),
      qualifications: qualifications.trim(),
      professional_category: professional_category?.trim() || null,
      institution_name: institution_name?.trim() || null,
      license_number: license_number?.trim() || null,
      license_authority: license_authority?.trim() || null,
      license_expires_at: license_expires_at || null,
      years_experience: years_experience ?? null,
      workplace: workplace?.trim() || null,
    })

    return res.status(201).json({
      profile,
      message: 'Professional profile submitted for review.',
    })
  } catch (err) {
    next(err)
  }
})

/**
 * PATCH /api/professionals/me
 * Authenticated (role = professional) — update own professional profile.
 * Resets verification_status to 'pending' on any update (via upsertProfile).
 *
 * Body: any subset of { specialization, bio, qualifications }
 */
router.patch('/me', authenticate, requireRole('professional'), async (req, res, next) => {
  try {
    const existing = await findProfileByUserId(req.user.id)
    if (!existing) {
      return res.status(404).json({
        error: { message: 'No professional profile found. Submit one first via POST /api/professionals.' },
      })
    }

    const {
      specialization, bio, qualifications,
      professional_category, institution_name, license_number,
      license_authority, license_expires_at, years_experience, workplace,
    } = req.body

    // Merge with existing values (allow partial updates)
    const merged = {
      specialization: specialization?.trim() ?? existing.specialization,
      bio: bio?.trim() ?? existing.bio,
      qualifications: qualifications?.trim() ?? existing.qualifications,
      professional_category: professional_category?.trim() ?? existing.professional_category ?? null,
      institution_name: institution_name?.trim() ?? existing.institution_name ?? null,
      license_number: license_number?.trim() ?? existing.license_number ?? null,
      license_authority: license_authority?.trim() ?? existing.license_authority ?? null,
      license_expires_at: license_expires_at ?? existing.license_expires_at ?? null,
      years_experience: years_experience ?? existing.years_experience ?? null,
      workplace: workplace?.trim() ?? existing.workplace ?? null,
    }

    // ── Validate merged result ─────────────────────────────────────────────────
    const fields = {}
    if (merged.specialization.length < 3) fields.specialization = 'Specialization must be at least 3 characters.'
    if (merged.bio.length < 20) fields.bio = 'Bio must be at least 20 characters.'
    if (merged.qualifications.length < 5) fields.qualifications = 'Qualifications must be at least 5 characters.'

    if (Object.keys(fields).length > 0) {
      return res.status(400).json({
        error: { message: 'Please correct the errors below.', fields },
      })
    }

    const profile = await upsertProfile({ user_id: req.user.id, ...merged })

    return res.status(200).json({
      profile,
      message: 'Profile updated. Your application has been resubmitted for review.',
    })
  } catch (err) {
    next(err)
  }
})

// =============================================================================
// ADMIN VERIFICATION
// =============================================================================

/**
 * PATCH /api/professionals/:professionalId/verification
 * Admin only — set the verification status of a professional profile.
 *
 * Body: { status: 'approved' | 'rejected' | 'pending', reason?: string }
 *
 * Professionals cannot call this endpoint (requireRole('admin') enforces it).
 */
router.patch('/:professionalId/verification', authenticate, requireRole('admin'), async (req, res, next) => {
  try {
    const { professionalId } = req.params
    if (!isUUID(professionalId)) {
      return res.status(400).json({ error: { message: 'Invalid professional ID format.' } })
    }

    const profile = await findProfileById(professionalId)
    if (!profile) {
      return res.status(404).json({ error: { message: 'Professional profile not found.' } })
    }

    const { status, reason } = req.body
    const VALID_STATUSES = ['approved', 'rejected', 'pending']
    if (!status || !VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        error: { message: `status must be one of: ${VALID_STATUSES.join(', ')}` },
      })
    }

    if (profile.verification_status === status) {
      return res.status(200).json({
        profile,
        message: `Profile is already '${status}'.`,
      })
    }

    const updated = await setVerificationStatus(professionalId, status)

    // Optionally store the rejection reason if provided
    if (status === 'rejected' && reason) {
      const { rejectProfile } = await import('../models/professionalProfileModel.js')
      const withReason = await rejectProfile(professionalId, req.user.id, reason.trim())
      return res.status(200).json({
        profile: withReason,
        message: 'Profile verification status updated.',
      })
    }

    return res.status(200).json({
      profile: updated,
      message: 'Profile verification status updated.',
    })
  } catch (err) {
    next(err)
  }
})

export default router
