/**
 * enrollmentModel.js — Queries for the enrollments table
 *
 * The UNIQUE (user_id, course_id) constraint is enforced at the database
 * level, preventing duplicate enrollments regardless of application logic.
 *
 * IMPORTANT — payment_status:
 * Do not set payment_status = 'completed' from the frontend alone.
 * Enrollment with a paid course must only be granted after the payment
 * provider's backend callback has been verified server-side.
 */

import { pool } from '../config/db.js'

/**
 * Enroll a user in a course.
 * @param {'free'|'pending'|'completed'} payment_status
 * @throws if the user is already enrolled (unique constraint violation)
 */
export async function enrollUser({ user_id, course_id, payment_status = 'free' }) {
  const { rows } = await pool.query(
    `INSERT INTO enrollments (user_id, course_id, payment_status)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [user_id, course_id, payment_status]
  )
  return rows[0]
}

/**
 * Find a specific enrollment.
 */
export async function findEnrollment(user_id, course_id) {
  const { rows } = await pool.query(
    `SELECT * FROM enrollments WHERE user_id = $1 AND course_id = $2`,
    [user_id, course_id]
  )
  return rows[0] ?? null
}

/**
 * List all enrollments for a user (their enrolled courses).
 */
export async function listEnrollmentsByUser(user_id) {
  const { rows } = await pool.query(
    `SELECT e.*, c.title, c.category, c.thumbnail_url
     FROM   enrollments e
     JOIN   courses c ON c.id = e.course_id
     WHERE  e.user_id = $1
     ORDER  BY e.enrolled_at DESC`,
    [user_id]
  )
  return rows
}

/**
 * Update the payment status of an enrollment — backend/admin only.
 */
export async function updatePaymentStatus(id, payment_status) {
  const { rows } = await pool.query(
    `UPDATE enrollments
     SET payment_status = $2
     WHERE id = $1
     RETURNING *`,
    [id, payment_status]
  )
  return rows[0] ?? null
}
