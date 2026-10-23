/**
 * lessonModel.js — Queries for the lessons table
 *
 * Lessons belong to a course and are ordered by the `position` column.
 * The UNIQUE (course_id, position) constraint is enforced at the
 * database level, so no two lessons in the same course share a position.
 */

import { pool } from '../config/db.js'

/**
 * List all lessons for a course, ordered by position.
 */
export async function listLessonsByCourse(course_id) {
  const { rows } = await pool.query(
    `SELECT * FROM lessons
     WHERE  course_id = $1
     ORDER  BY position ASC`,
    [course_id]
  )
  return rows
}

/**
 * Get a single lesson by id.
 */
export async function findLessonById(id) {
  const { rows } = await pool.query(
    `SELECT * FROM lessons WHERE id = $1`,
    [id]
  )
  return rows[0] ?? null
}

/**
 * Create a lesson — admin only.
 */
export async function createLesson({ course_id, title, description = null, video_url = null, resource_url = null, position }) {
  const { rows } = await pool.query(
    `INSERT INTO lessons (course_id, title, description, video_url, resource_url, position)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [course_id, title, description, video_url, resource_url, position]
  )
  return rows[0]
}

/**
 * Update a lesson — admin only.
 */
export async function updateLesson(id, fields) {
  const { title, description, video_url, resource_url, position } = fields
  const { rows } = await pool.query(
    `UPDATE lessons
     SET title        = COALESCE($2, title),
         description  = COALESCE($3, description),
         video_url    = COALESCE($4, video_url),
         resource_url = COALESCE($5, resource_url),
         position     = COALESCE($6, position),
         updated_at   = NOW()
     WHERE id = $1
     RETURNING *`,
    [id, title ?? null, description ?? null,
     video_url ?? null, resource_url ?? null, position ?? null]
  )
  return rows[0] ?? null
}

/**
 * Delete a lesson — admin only.
 * Cascades to lesson_progress rows for this lesson.
 */
export async function deleteLesson(id) {
  const { rowCount } = await pool.query(
    `DELETE FROM lessons WHERE id = $1`,
    [id]
  )
  return rowCount > 0
}
