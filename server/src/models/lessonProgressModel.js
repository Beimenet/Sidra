/**
 * lessonProgressModel.js — Queries for the lesson_progress table
 *
 * Tracks per-user lesson completion.
 * The UNIQUE (user_id, lesson_id) constraint prevents duplicate rows.
 * Uses INSERT … ON CONFLICT to safely toggle completion.
 */

import { pool } from '../config/db.js'

/**
 * Mark a lesson as complete or incomplete for a user.
 * Creates the row if it does not exist; updates it if it does.
 */
export async function upsertProgress({ user_id, lesson_id, completed }) {
  const { rows } = await pool.query(
    `INSERT INTO lesson_progress (user_id, lesson_id, completed, updated_at)
     VALUES ($1, $2, $3, NOW())
     ON CONFLICT (user_id, lesson_id) DO UPDATE
       SET completed  = EXCLUDED.completed,
           updated_at = NOW()
     RETURNING *`,
    [user_id, lesson_id, completed]
  )
  return rows[0]
}

/**
 * Get a user's progress for all lessons in a given course.
 */
export async function getProgressByCourse(user_id, course_id) {
  const { rows } = await pool.query(
    `SELECT lp.*
     FROM   lesson_progress lp
     JOIN   lessons l ON l.id = lp.lesson_id
     WHERE  lp.user_id  = $1
       AND  l.course_id = $2
     ORDER  BY l.position ASC`,
    [user_id, course_id]
  )
  return rows
}

/**
 * Count completed lessons for a user in a course.
 * Used to compute a completion percentage.
 */
export async function countCompleted(user_id, course_id) {
  const { rows } = await pool.query(
    `SELECT COUNT(*) AS completed_count
     FROM   lesson_progress lp
     JOIN   lessons l ON l.id = lp.lesson_id
     WHERE  lp.user_id   = $1
       AND  l.course_id  = $2
       AND  lp.completed = TRUE`,
    [user_id, course_id]
  )
  return Number(rows[0].completed_count)
}
