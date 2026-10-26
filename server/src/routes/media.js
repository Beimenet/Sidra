/**
 * media.js — Cloudinary upload management routes
 *
 * Mounts under /api/media in app.js.
 * All routes require authentication. Upload operations require admin role.
 *
 * ── Signature generation (browser-to-Cloudinary direct upload) ─────────────
 *   POST /api/media/sign
 *     Body:  { upload_type: 'thumbnail' | 'video', course_id?, lesson_id? }
 *     Returns: signed upload params for the browser to use with Cloudinary JS SDK
 *
 * ── Confirm upload (save metadata to DB after browser→Cloudinary upload) ──
 *   POST /api/media/confirm
 *     Body: { upload_type, record_id, public_id, secure_url, resource_type,
 *              bytes, duration?, poster_url? }
 *     Updates the correct courses or lessons row.
 *
 * ── Delete media ────────────────────────────────────────────────────────────
 *   DELETE /api/media/:upload_type/:record_id
 *     Removes Cloudinary asset and clears DB columns.
 *     upload_type: 'thumbnail' | 'video'
 *     record_id:   course UUID (thumbnail) or lesson UUID (video)
 *
 * Security:
 *   - All routes authenticate via existing session cookie middleware.
 *   - Only admins can sign uploads or delete assets.
 *   - Signatures lock in folder, timestamp, and resource_type — tampering
 *     causes Cloudinary to reject the upload.
 *   - The API secret never leaves this module.
 *   - The confirm endpoint re-validates public_id folder, resource_type, and
 *     file size before persisting anything.
 */

import { Router }  from 'express'
import { pool }    from '../config/db.js'
import { authenticate }  from '../middleware/authenticate.js'
import { requireRole }   from '../middleware/requireRole.js'
import { isCloudinaryConfigured, ALLOWED_MIME, MAX_BYTES } from '../config/cloudinary.js'
import {
  generateSignature,
  deleteCloudinaryAsset,
  validateUploadResult,
} from '../services/uploadService.js'

const router = Router()

// All routes require a valid session
router.use(authenticate)

// Helper
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const isUUID = (v) => UUID_RE.test(v)

function cloudinaryNotConfigured(res) {
  return res.status(503).json({
    error: {
      message:
        'Media uploads are not yet configured. ' +
        'Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET ' +
        'in the server .env file.',
    },
  })
}

// =============================================================================
// POST /api/media/sign
// Generate a signed upload signature for browser → Cloudinary direct upload.
// Admin only.
// =============================================================================
router.post('/sign', requireRole('admin'), async (req, res, next) => {
  try {
    if (!isCloudinaryConfigured()) return cloudinaryNotConfigured(res)

    const { upload_type } = req.body
    if (!upload_type || !['thumbnail', 'video'].includes(upload_type)) {
      return res.status(400).json({
        error: { message: "upload_type must be 'thumbnail' or 'video'." },
      })
    }

    const signedParams = generateSignature(upload_type)

    // Return everything the browser needs to POST directly to Cloudinary
    return res.status(200).json({
      ...signedParams,
      allowed_formats: upload_type === 'thumbnail'
        ? ['jpg', 'jpeg', 'png', 'webp', 'gif']
        : ['mp4', 'webm', 'mov', 'mkv'],
      max_file_size: MAX_BYTES[upload_type],
    })
  } catch (err) {
    next(err)
  }
})

// =============================================================================
// POST /api/media/confirm
// After a successful browser → Cloudinary upload, call this endpoint to
// persist the asset metadata in PostgreSQL.
// Admin only.
// =============================================================================
router.post('/confirm', requireRole('admin'), async (req, res, next) => {
  try {
    if (!isCloudinaryConfigured()) return cloudinaryNotConfigured(res)

    const {
      upload_type,  // 'thumbnail' | 'video'
      record_id,    // course UUID (thumbnail) or lesson UUID (video)
      public_id,
      secure_url,
      resource_type,
      bytes,
      duration,     // seconds, returned by Cloudinary for videos
      poster_url,   // optional: auto-generated poster frame URL
    } = req.body

    // Validate inputs
    if (!upload_type || !['thumbnail', 'video'].includes(upload_type)) {
      return res.status(400).json({ error: { message: "upload_type must be 'thumbnail' or 'video'." } })
    }
    if (!record_id || !isUUID(record_id)) {
      return res.status(400).json({ error: { message: 'record_id must be a valid UUID.' } })
    }
    if (!public_id || !secure_url) {
      return res.status(400).json({ error: { message: 'public_id and secure_url are required.' } })
    }

    // Re-validate the upload result (folder, resource_type, size)
    try {
      validateUploadResult(upload_type, { public_id, resource_type, bytes })
    } catch (validationErr) {
      return res.status(400).json({ error: { message: validationErr.message } })
    }

    if (upload_type === 'thumbnail') {
      // Verify the course exists
      const { rows: courseRows } = await pool.query(
        'SELECT id FROM courses WHERE id = $1', [record_id]
      )
      if (!courseRows.length) {
        return res.status(404).json({ error: { message: 'Course not found.' } })
      }

      // Delete old Cloudinary asset if it exists
      const { rows: oldRows } = await pool.query(
        'SELECT thumbnail_public_id FROM courses WHERE id = $1', [record_id]
      )
      const oldPid = oldRows[0]?.thumbnail_public_id
      if (oldPid && oldPid !== public_id) {
        try { await deleteCloudinaryAsset(oldPid, 'image') } catch (_) { /* non-fatal */ }
      }

      // Update course
      const { rows } = await pool.query(
        `UPDATE courses
         SET thumbnail_url       = $2,
             thumbnail_public_id = $3,
             thumbnail_resource_type = 'image',
             updated_at          = NOW()
         WHERE id = $1
         RETURNING id, title, thumbnail_url, thumbnail_public_id`,
        [record_id, secure_url, public_id]
      )
      return res.status(200).json({
        course: rows[0],
        message: 'Thumbnail saved.',
      })

    } else {
      // video upload — record_id is a lesson UUID
      const { rows: lessonRows } = await pool.query(
        'SELECT id FROM lessons WHERE id = $1', [record_id]
      )
      if (!lessonRows.length) {
        return res.status(404).json({ error: { message: 'Lesson not found.' } })
      }

      // Delete old Cloudinary asset if it exists
      const { rows: oldRows } = await pool.query(
        'SELECT video_public_id FROM lessons WHERE id = $1', [record_id]
      )
      const oldPid = oldRows[0]?.video_public_id
      if (oldPid && oldPid !== public_id) {
        try { await deleteCloudinaryAsset(oldPid, 'video') } catch (_) { /* non-fatal */ }
      }

      // Generate auto-poster URL from Cloudinary if not provided
      // Format: https://res.cloudinary.com/<cloud>/video/upload/so_0/<public_id>.jpg
      const autoPoster = poster_url ??
        (public_id
          ? `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/video/upload/so_0/${public_id}.jpg`
          : null)

      const { rows } = await pool.query(
        `UPDATE lessons
         SET video_url          = $2,
             video_public_id    = $3,
             video_resource_type = 'video',
             video_duration_sec  = $4,
             video_poster_url    = $5,
             updated_at         = NOW()
         WHERE id = $1
         RETURNING id, title, video_url, video_public_id, video_duration_sec, video_poster_url`,
        [record_id, secure_url, public_id, duration ? Math.round(Number(duration)) : null, autoPoster]
      )
      return res.status(200).json({
        lesson: rows[0],
        message: 'Video saved.',
      })
    }
  } catch (err) {
    next(err)
  }
})

// =============================================================================
// DELETE /api/media/:upload_type/:record_id
// Remove a Cloudinary asset and clear the DB columns.
// Admin only.
// =============================================================================
router.delete('/:upload_type/:record_id', requireRole('admin'), async (req, res, next) => {
  try {
    if (!isCloudinaryConfigured()) return cloudinaryNotConfigured(res)

    const { upload_type, record_id } = req.params
    if (!['thumbnail', 'video'].includes(upload_type)) {
      return res.status(400).json({ error: { message: "upload_type must be 'thumbnail' or 'video'." } })
    }
    if (!isUUID(record_id)) {
      return res.status(400).json({ error: { message: 'record_id must be a valid UUID.' } })
    }

    if (upload_type === 'thumbnail') {
      const { rows } = await pool.query(
        'SELECT thumbnail_public_id FROM courses WHERE id = $1', [record_id]
      )
      if (!rows.length) {
        return res.status(404).json({ error: { message: 'Course not found.' } })
      }
      const pid = rows[0].thumbnail_public_id
      if (pid) {
        try { await deleteCloudinaryAsset(pid, 'image') } catch (_) { /* log but proceed */ }
      }
      await pool.query(
        `UPDATE courses
         SET thumbnail_url = NULL, thumbnail_public_id = NULL, updated_at = NOW()
         WHERE id = $1`,
        [record_id]
      )
      return res.status(200).json({ message: 'Thumbnail removed.' })

    } else {
      const { rows } = await pool.query(
        'SELECT video_public_id FROM lessons WHERE id = $1', [record_id]
      )
      if (!rows.length) {
        return res.status(404).json({ error: { message: 'Lesson not found.' } })
      }
      const pid = rows[0].video_public_id
      if (pid) {
        try { await deleteCloudinaryAsset(pid, 'video') } catch (_) { /* log but proceed */ }
      }
      await pool.query(
        `UPDATE lessons
         SET video_url = NULL, video_public_id = NULL,
             video_duration_sec = NULL, video_poster_url = NULL,
             updated_at = NOW()
         WHERE id = $1`,
        [record_id]
      )
      return res.status(200).json({ message: 'Video removed.' })
    }
  } catch (err) {
    next(err)
  }
})

export default router
