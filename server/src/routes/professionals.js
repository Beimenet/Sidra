/**
 * professionals.js — Professional Directory API routes
 *
 * STATUS: Not yet implemented.
 *
 * These route stubs define the intended API surface for the
 * professional directory feature.
 *
 * Planned routes:
 *   GET    /api/professionals          — list verified professionals
 *   GET    /api/professionals/:id      — get a single professional profile
 *   POST   /api/professionals          — submit a professional profile (admin)
 *   PUT    /api/professionals/:id      — update a profile (admin)
 *   PATCH  /api/professionals/:id/verify — verify a profile (admin)
 *   DELETE /api/professionals/:id      — remove a profile (admin)
 */

import { Router } from 'express'

const router = Router()

function notImplemented(req, res) {
  res.status(501).json({
    error: {
      message: 'Not implemented — the professional directory API is planned but not yet built.',
      status: 501,
      route: `${req.method} ${req.originalUrl}`,
    },
  })
}

router.get('/',               notImplemented)
router.get('/:id',            notImplemented)
router.post('/',              notImplemented)
router.put('/:id',            notImplemented)
router.patch('/:id/verify',   notImplemented)
router.delete('/:id',         notImplemented)

export default router
