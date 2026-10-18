/**
 * courses.js — Course API routes
 *
 * STATUS: Not yet implemented.
 *
 * These route stubs define the intended API surface for the courses
 * feature. They return 501 Not Implemented until the database layer
 * and controllers are built.
 *
 * Planned routes:
 *   GET    /api/courses          — list all published courses
 *   GET    /api/courses/:id      — get a single course by id
 *   POST   /api/courses          — create a course (admin only)
 *   PUT    /api/courses/:id      — update a course (admin only)
 *   DELETE /api/courses/:id      — delete a course (admin only)
 */

import { Router } from 'express'

const router = Router()

function notImplemented(req, res) {
  res.status(501).json({
    error: {
      message: 'Not implemented — this endpoint is planned but not yet built.',
      status: 501,
      route: `${req.method} ${req.originalUrl}`,
    },
  })
}

router.get('/',     notImplemented)
router.get('/:id',  notImplemented)
router.post('/',    notImplemented)
router.put('/:id',  notImplemented)
router.delete('/:id', notImplemented)

export default router
