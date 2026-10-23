/**
 * courseModel.js — Queries for the courses table
 *
 * Published courses (published = TRUE) are visible to all users.
 * Unpublished courses are visible only to administrators.
 */

import { pool } from '../config/db.js'

/**
 * List all published courses (public catalog).
 */
export async function listPublishedCourses() {
  const { rows } = await pool.query(
    `SELECT id, title, description, category, price_etb, thumbnail_url, created_at
     FROM   courses
     WHERE  published = TRUE
     ORDER  BY created_at DESC`
  )
  return rows
}

/**
 * List all courses regardless of published status — admin only.
 */
export async function listAllCourses() {
  const { rows } = await pool.query(
    `SELECT * FROM courses ORDER BY created_at DESC`
  )
  return rows
}

/**
 * Get a single course by id.
 * Returns null if not found.
 */
export async function findCourseById(id) {
  const { rows } = await pool.query(
    `SELECT * FROM courses WHERE id = $1`,
    [id]
  )
  return rows[0] ?? null
}

/**
 * Create a new course — admin only.
 */
export async function createCourse({ title, description, category, price_etb = 0, thumbnail_url = null, published = false }) {
  const { rows } = await pool.query(
    `INSERT INTO courses (title, description, category, price_etb, thumbnail_url, published)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [title, description, category, price_etb, thumbnail_url, published]
  )
  return rows[0]
}

/**
 * Update a course — admin only.
 */
export async function updateCourse(id, fields) {
  const { title, description, category, price_etb, thumbnail_url, published } = fields
  const { rows } = await pool.query(
    `UPDATE courses
     SET title         = COALESCE($2, title),
         description   = COALESCE($3, description),
         category      = COALESCE($4, category),
         price_etb     = COALESCE($5, price_etb),
         thumbnail_url = COALESCE($6, thumbnail_url),
         published     = COALESCE($7, published),
         updated_at    = NOW()
     WHERE id = $1
     RETURNING *`,
    [id, title ?? null, description ?? null, category ?? null,
     price_etb ?? null, thumbnail_url ?? null, published ?? null]
  )
  return rows[0] ?? null
}

/**
 * Delete a course — admin only.
 * Cascades to lessons, enrollments, and lesson_progress.
 */
export async function deleteCourse(id) {
  const { rowCount } = await pool.query(
    `DELETE FROM courses WHERE id = $1`,
    [id]
  )
  return rowCount > 0
}
