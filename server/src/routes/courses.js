/**
 * courses.js — Course, Lesson, Enrollment & Progress API routes
 *
 * Mounts under /api/courses in app.js.
 * The enrollmentsRouter is exported separately and mounted at /api/enrollments.
 *
 * Route order matters:
 *  - Static paths  (/all, /lessons/:id, /enrollments/me) before param paths
 *  - /reorder      before /:lessonId  (both share the same prefix)
 */

import { Router } from 'express'
import { authenticate } from '../middleware/authenticate.js'
import { requireRole }  from '../middleware/requireRole.js'
import {
  listPublishedCourses, listAllCourses, findCourseById,
  createCourse, updateCourse, deleteCourse,
} from '../models/courseModel.js'
import {
  listLessonsByCourse, findLessonById,
  createLesson, updateLesson, deleteLesson,
} from '../models/lessonModel.js'
import {
  enrollUser, findEnrollment, findEnrollmentById, listEnrollmentsByUser,
} from '../models/enrollmentModel.js'
import {
  upsertProgress, getProgressByCourse, countCompleted,
} from '../models/lessonProgressModel.js'
import { pool } from '../config/db.js'

const router = Router()

// ── Helpers ───────────────────────────────────────────────────────────────────

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const isUUID = (v) => UUID_RE.test(v)

async function totalLessonsInCourse(course_id) {
  const { rows } = await pool.query(
    'SELECT COUNT(*) AS cnt FROM lessons WHERE course_id = $1', [course_id]
  )
  return Number(rows[0].cnt)
}

async function calcProgress(user_id, course_id) {
  const [completed, total] = await Promise.all([
    countCompleted(user_id, course_id),
    totalLessonsInCourse(course_id),
  ])
  return {
    completed,
    total,
    percentage: total === 0 ? 0 : Math.round((completed / total) * 100),
  }
}

/**
 * Soft admin check from session cookie — used on public routes that give
 * admins elevated visibility without requiring authentication for everyone.
 */
async function isAdminFromCookie(req) {
  const sessionId = req.cookies?.sid
  if (!sessionId) return false
  try {
    const { findSession } = await import('../utils/session.js')
    const { findUserById } = await import('../models/userModel.js')
    const session = await findSession(sessionId)
    if (!session) return false
    const user = await findUserById(session.user_id)
    return !!(user?.is_active && user?.role === 'admin')
  } catch (_) {
    return false
  }
}

// =============================================================================
// COURSE MANAGEMENT
// =============================================================================

/** GET /api/courses — public published course list */
router.get('/', async (req, res, next) => {
  try {
    const courses = await listPublishedCourses()
    return res.status(200).json({ courses })
  } catch (err) { next(err) }
})

/** GET /api/courses/all — admin: all courses incl. drafts */
router.get('/all', authenticate, requireRole('admin'), async (req, res, next) => {
  try {
    const courses = await listAllCourses()
    return res.status(200).json({ courses })
  } catch (err) { next(err) }
})

/** POST /api/courses — admin: create a course */
router.post('/', authenticate, requireRole('admin'), async (req, res, next) => {
  try {
    const { title, description, category, price_etb, thumbnail_url, published } = req.body
    const fields = {}
    if (!title || typeof title !== 'string' || title.trim().length < 3)
      fields.title = 'Title is required (minimum 3 characters).'
    if (!description || typeof description !== 'string' || description.trim().length < 10)
      fields.description = 'Description is required (minimum 10 characters).'
    if (!category || typeof category !== 'string' || category.trim().length < 2)
      fields.category = 'Category is required.'
    if (price_etb !== undefined && (isNaN(Number(price_etb)) || Number(price_etb) < 0))
      fields.price_etb = 'price_etb must be a non-negative number.'
    if (Object.keys(fields).length > 0)
      return res.status(400).json({ error: { message: 'Please correct the errors below.', fields } })

    const course = await createCourse({
      title: title.trim(), description: description.trim(), category: category.trim(),
      price_etb: price_etb !== undefined ? Number(price_etb) : 0,
      thumbnail_url: thumbnail_url?.trim() || null,
      published: published === true || published === 'true',
    })
    return res.status(201).json({ course })
  } catch (err) { next(err) }
})

/** GET /api/courses/:courseId — public if published; admin can see drafts */
router.get('/:courseId', async (req, res, next) => {
  try {
    const { courseId } = req.params
    if (!isUUID(courseId))
      return res.status(400).json({ error: { message: 'Invalid course ID format.' } })
    const course = await findCourseById(courseId)
    if (!course) return res.status(404).json({ error: { message: 'Course not found.' } })
    if (!course.published && !(await isAdminFromCookie(req)))
      return res.status(404).json({ error: { message: 'Course not found.' } })
    const lessons = await listLessonsByCourse(courseId)
    return res.status(200).json({ course, lessons })
  } catch (err) { next(err) }
})

/** PATCH /api/courses/:courseId — admin: partial update */
router.patch('/:courseId', authenticate, requireRole('admin'), async (req, res, next) => {
  try {
    const { courseId } = req.params
    if (!isUUID(courseId))
      return res.status(400).json({ error: { message: 'Invalid course ID format.' } })
    const course = await findCourseById(courseId)
    if (!course) return res.status(404).json({ error: { message: 'Course not found.' } })

    const { title, description, category, price_etb, thumbnail_url } = req.body
    const fields = {}
    if (title !== undefined && (typeof title !== 'string' || title.trim().length < 3))
      fields.title = 'Title must be at least 3 characters.'
    if (description !== undefined && (typeof description !== 'string' || description.trim().length < 10))
      fields.description = 'Description must be at least 10 characters.'
    if (category !== undefined && (typeof category !== 'string' || category.trim().length < 2))
      fields.category = 'Category must be at least 2 characters.'
    if (price_etb !== undefined && (isNaN(Number(price_etb)) || Number(price_etb) < 0))
      fields.price_etb = 'price_etb must be a non-negative number.'
    if (Object.keys(fields).length > 0)
      return res.status(400).json({ error: { message: 'Please correct the errors below.', fields } })

    const updated = await updateCourse(courseId, {
      title: title?.trim() ?? null,
      description: description?.trim() ?? null,
      category: category?.trim() ?? null,
      price_etb: price_etb !== undefined ? Number(price_etb) : null,
      thumbnail_url: thumbnail_url !== undefined ? (thumbnail_url?.trim() || null) : null,
    })
    return res.status(200).json({ course: updated })
  } catch (err) { next(err) }
})

/** PATCH /api/courses/:courseId/publish — admin: publish/unpublish */
router.patch('/:courseId/publish', authenticate, requireRole('admin'), async (req, res, next) => {
  try {
    const { courseId } = req.params
    if (!isUUID(courseId))
      return res.status(400).json({ error: { message: 'Invalid course ID format.' } })
    const course = await findCourseById(courseId)
    if (!course) return res.status(404).json({ error: { message: 'Course not found.' } })
    const { published } = req.body
    if (typeof published !== 'boolean')
      return res.status(400).json({ error: { message: 'published must be a boolean.' } })
    if (course.published === published)
      return res.status(200).json({ course, message: `Course is already ${published ? 'published' : 'unpublished'}.` })
    const updated = await updateCourse(courseId, { published })
    return res.status(200).json({ course: updated, message: `Course ${published ? 'published' : 'unpublished'} successfully.` })
  } catch (err) { next(err) }
})

/** DELETE /api/courses/:courseId — admin: delete (cascades) */
router.delete('/:courseId', authenticate, requireRole('admin'), async (req, res, next) => {
  try {
    const { courseId } = req.params
    if (!isUUID(courseId))
      return res.status(400).json({ error: { message: 'Invalid course ID format.' } })
    const course = await findCourseById(courseId)
    if (!course) return res.status(404).json({ error: { message: 'Course not found.' } })
    await deleteCourse(courseId)
    return res.status(200).json({ message: 'Course deleted successfully.' })
  } catch (err) { next(err) }
})

// =============================================================================
// LESSON MANAGEMENT
// Route order: /reorder MUST come before /:lessonId to avoid Express treating
// the literal "reorder" as a :lessonId parameter value.
// =============================================================================

/** POST /api/courses/:courseId/lessons — admin: add a lesson */
router.post('/:courseId/lessons', authenticate, requireRole('admin'), async (req, res, next) => {
  try {
    const { courseId } = req.params
    if (!isUUID(courseId))
      return res.status(400).json({ error: { message: 'Invalid course ID format.' } })
    const course = await findCourseById(courseId)
    if (!course) return res.status(404).json({ error: { message: 'Course not found.' } })

    const { title, description, video_url, resource_url, position } = req.body
    const fields = {}
    if (!title || typeof title !== 'string' || title.trim().length < 2)
      fields.title = 'Title is required (minimum 2 characters).'
    if (position === undefined || position === null)
      fields.position = 'position is required.'
    else if (!Number.isInteger(Number(position)) || Number(position) < 1)
      fields.position = 'position must be a positive integer.'
    if (Object.keys(fields).length > 0)
      return res.status(400).json({ error: { message: 'Please correct the errors below.', fields } })

    const lesson = await createLesson({
      course_id: courseId, title: title.trim(),
      description: description?.trim() || null,
      video_url: video_url?.trim() || null,
      resource_url: resource_url?.trim() || null,
      position: Number(position),
    })
    return res.status(201).json({ lesson })
  } catch (err) {
    if (err.code === '23505')
      return res.status(409).json({ error: { message: `A lesson already exists at position ${req.body.position} in this course.` } })
    next(err)
  }
})

/** GET /api/courses/:courseId/lessons — list lessons (public if published) */
router.get('/:courseId/lessons', async (req, res, next) => {
  try {
    const { courseId } = req.params
    if (!isUUID(courseId))
      return res.status(400).json({ error: { message: 'Invalid course ID format.' } })
    const course = await findCourseById(courseId)
    if (!course) return res.status(404).json({ error: { message: 'Course not found.' } })
    if (!course.published && !(await isAdminFromCookie(req)))
      return res.status(404).json({ error: { message: 'Course not found.' } })
    const lessons = await listLessonsByCourse(courseId)
    return res.status(200).json({ lessons })
  } catch (err) { next(err) }
})

/**
 * PATCH /api/courses/:courseId/lessons/reorder — admin: reorder lessons
 * MUST be registered before /:courseId/lessons/:lessonId
 */
router.patch('/:courseId/lessons/reorder', authenticate, requireRole('admin'), async (req, res, next) => {
  try {
    const { courseId } = req.params
    if (!isUUID(courseId))
      return res.status(400).json({ error: { message: 'Invalid course ID format.' } })
    const course = await findCourseById(courseId)
    if (!course) return res.status(404).json({ error: { message: 'Course not found.' } })

    const { order } = req.body
    if (!Array.isArray(order) || order.length === 0)
      return res.status(400).json({ error: { message: 'order must be a non-empty array of { id, position } objects.' } })

    for (const item of order) {
      if (!isUUID(item?.id))
        return res.status(400).json({ error: { message: `Invalid lesson ID in order array: ${item?.id}` } })
      if (!Number.isInteger(Number(item?.position)) || Number(item?.position) < 1)
        return res.status(400).json({ error: { message: `position must be a positive integer for lesson ${item?.id}.` } })
    }
    const positions = order.map((i) => Number(i.position))
    if (new Set(positions).size !== positions.length)
      return res.status(400).json({ error: { message: 'Duplicate positions found in the order array.' } })

    const client = await pool.connect()
    try {
      await client.query('BEGIN')
      const maxPos = Math.max(...positions)
      // Step 1: shift to temporary values to avoid UNIQUE constraint violations mid-swap
      for (const item of order) {
        await client.query(
          'UPDATE lessons SET position = $1 WHERE id = $2 AND course_id = $3',
          [Number(item.position) + maxPos + 1000, item.id, courseId]
        )
      }
      // Step 2: apply final values
      for (const item of order) {
        await client.query(
          'UPDATE lessons SET position = $1, updated_at = NOW() WHERE id = $2 AND course_id = $3',
          [Number(item.position), item.id, courseId]
        )
      }
      await client.query('COMMIT')
    } catch (txErr) {
      await client.query('ROLLBACK')
      throw txErr
    } finally {
      client.release()
    }

    const lessons = await listLessonsByCourse(courseId)
    return res.status(200).json({ lessons, message: 'Lessons reordered successfully.' })
  } catch (err) { next(err) }
})

/** PATCH /api/courses/:courseId/lessons/:lessonId — admin: update a lesson */
router.patch('/:courseId/lessons/:lessonId', authenticate, requireRole('admin'), async (req, res, next) => {
  try {
    const { courseId, lessonId } = req.params
    if (!isUUID(courseId))
      return res.status(400).json({ error: { message: 'Invalid course ID format.' } })
    if (!isUUID(lessonId))
      return res.status(400).json({ error: { message: 'Invalid lesson ID format.' } })
    const lesson = await findLessonById(lessonId)
    if (!lesson || lesson.course_id !== courseId)
      return res.status(404).json({ error: { message: 'Lesson not found.' } })

    const { title, description, video_url, resource_url, position } = req.body
    const fields = {}
    if (title !== undefined && (typeof title !== 'string' || title.trim().length < 2))
      fields.title = 'Title must be at least 2 characters.'
    if (position !== undefined && (!Number.isInteger(Number(position)) || Number(position) < 1))
      fields.position = 'position must be a positive integer.'
    if (Object.keys(fields).length > 0)
      return res.status(400).json({ error: { message: 'Please correct the errors below.', fields } })

    const updated = await updateLesson(lessonId, {
      title: title?.trim() ?? null,
      description: description?.trim() ?? null,
      video_url: video_url?.trim() ?? null,
      resource_url: resource_url?.trim() ?? null,
      position: position !== undefined ? Number(position) : null,
    })
    return res.status(200).json({ lesson: updated })
  } catch (err) {
    if (err.code === '23505')
      return res.status(409).json({ error: { message: 'A lesson already exists at that position in this course.' } })
    next(err)
  }
})

/** DELETE /api/courses/:courseId/lessons/:lessonId — admin: delete a lesson */
router.delete('/:courseId/lessons/:lessonId', authenticate, requireRole('admin'), async (req, res, next) => {
  try {
    const { courseId, lessonId } = req.params
    if (!isUUID(courseId))
      return res.status(400).json({ error: { message: 'Invalid course ID format.' } })
    if (!isUUID(lessonId))
      return res.status(400).json({ error: { message: 'Invalid lesson ID format.' } })
    const lesson = await findLessonById(lessonId)
    if (!lesson || lesson.course_id !== courseId)
      return res.status(404).json({ error: { message: 'Lesson not found.' } })
    await deleteLesson(lessonId)
    return res.status(200).json({ message: 'Lesson deleted successfully.' })
  } catch (err) { next(err) }
})

// =============================================================================
// ENROLLMENT
// =============================================================================

/**
 * POST /api/courses/:courseId/enroll
 * Authenticated — enroll in a published course.
 * Free (price_etb=0): payment_status='free'
 * Paid: payment_status='pending' (payment flow handled separately)
 */
router.post('/:courseId/enroll', authenticate, async (req, res, next) => {
  try {
    const { courseId } = req.params
    if (!isUUID(courseId))
      return res.status(400).json({ error: { message: 'Invalid course ID format.' } })

    const course = await findCourseById(courseId)
    if (!course || !course.published)
      return res.status(404).json({ error: { message: 'Course not found.' } })

    const existing = await findEnrollment(req.user.id, courseId)
    if (existing)
      return res.status(409).json({ error: { message: 'You are already enrolled in this course.' }, enrollment: existing })

    const isFree = parseFloat(course.price_etb) === 0
    const enrollment = await enrollUser({
      user_id: req.user.id,
      course_id: courseId,
      payment_status: isFree ? 'free' : 'pending',
    })

    return res.status(201).json({
      enrollment,
      message: isFree ? 'Enrolled successfully.' : 'Enrollment created. Complete payment to access course content.',
    })
  } catch (err) {
    if (err.code === '23505')
      return res.status(409).json({ error: { message: 'You are already enrolled in this course.' } })
    next(err)
  }
})

// =============================================================================
// PROGRESS TRACKING
// =============================================================================

/**
 * POST /api/courses/:courseId/lessons/:lessonId/complete
 * Authenticated + enrolled — mark a lesson complete/incomplete (idempotent).
 * Body: { completed?: boolean }  (default: true)
 */
router.post('/:courseId/lessons/:lessonId/complete', authenticate, async (req, res, next) => {
  try {
    const { courseId, lessonId } = req.params
    if (!isUUID(courseId))
      return res.status(400).json({ error: { message: 'Invalid course ID format.' } })
    if (!isUUID(lessonId))
      return res.status(400).json({ error: { message: 'Invalid lesson ID format.' } })

    const course = await findCourseById(courseId)
    if (!course || !course.published)
      return res.status(404).json({ error: { message: 'Course not found.' } })

    const lesson = await findLessonById(lessonId)
    if (!lesson || lesson.course_id !== courseId)
      return res.status(404).json({ error: { message: 'Lesson not found in this course.' } })

    const enrollment = await findEnrollment(req.user.id, courseId)
    if (!enrollment)
      return res.status(403).json({ error: { message: 'You must be enrolled in this course to track progress.' } })

    if (enrollment.payment_status !== 'free' && enrollment.payment_status !== 'completed')
      return res.status(403).json({ error: { message: 'Complete your payment before tracking progress.' } })

    const completed = req.body.completed !== false
    const progress = await upsertProgress({ user_id: req.user.id, lesson_id: lessonId, completed })
    const course_progress = await calcProgress(req.user.id, courseId)

    return res.status(200).json({ progress, course_progress })
  } catch (err) { next(err) }
})

/** GET /api/courses/:courseId/progress — enrolled user's progress summary */
router.get('/:courseId/progress', authenticate, async (req, res, next) => {
  try {
    const { courseId } = req.params
    if (!isUUID(courseId))
      return res.status(400).json({ error: { message: 'Invalid course ID format.' } })

    const course = await findCourseById(courseId)
    if (!course || !course.published)
      return res.status(404).json({ error: { message: 'Course not found.' } })

    const enrollment = await findEnrollment(req.user.id, courseId)
    if (!enrollment)
      return res.status(403).json({ error: { message: 'You are not enrolled in this course.' } })

    const [lesson_progress, summary] = await Promise.all([
      getProgressByCourse(req.user.id, courseId),
      calcProgress(req.user.id, courseId),
    ])

    return res.status(200).json({ enrollment, lesson_progress, summary })
  } catch (err) { next(err) }
})

export default router

// =============================================================================
// ENROLLMENTS ROUTER — mounted at /api/enrollments in app.js
// =============================================================================

export const enrollmentsRouter = Router()

/** GET /api/enrollments/me — authenticated user's enrollment list */
enrollmentsRouter.get('/me', authenticate, async (req, res, next) => {
  try {
    const enrollments = await listEnrollmentsByUser(req.user.id)
    return res.status(200).json({ enrollments })
  } catch (err) { next(err) }
})

/** GET /api/enrollments/:enrollmentId — owner or admin only */
enrollmentsRouter.get('/:enrollmentId', authenticate, async (req, res, next) => {
  try {
    const { enrollmentId } = req.params
    if (!isUUID(enrollmentId))
      return res.status(400).json({ error: { message: 'Invalid enrollment ID format.' } })

    const enrollment = await findEnrollmentById(enrollmentId)
    if (!enrollment)
      return res.status(404).json({ error: { message: 'Enrollment not found.' } })

    if (enrollment.user_id !== req.user.id && req.user.role !== 'admin')
      return res.status(403).json({ error: { message: 'You do not have permission to view this enrollment.' } })

    return res.status(200).json({ enrollment })
  } catch (err) { next(err) }
})

/** GET /api/enrollments/:enrollmentId/progress — owner or admin only */
enrollmentsRouter.get('/:enrollmentId/progress', authenticate, async (req, res, next) => {
  try {
    const { enrollmentId } = req.params
    if (!isUUID(enrollmentId))
      return res.status(400).json({ error: { message: 'Invalid enrollment ID format.' } })

    const enrollment = await findEnrollmentById(enrollmentId)
    if (!enrollment)
      return res.status(404).json({ error: { message: 'Enrollment not found.' } })

    if (enrollment.user_id !== req.user.id && req.user.role !== 'admin')
      return res.status(403).json({ error: { message: 'You do not have permission to view this enrollment.' } })

    const [lesson_progress, summary] = await Promise.all([
      getProgressByCourse(enrollment.user_id, enrollment.course_id),
      calcProgress(enrollment.user_id, enrollment.course_id),
    ])

    return res.status(200).json({ enrollment, lesson_progress, summary })
  } catch (err) { next(err) }
})
