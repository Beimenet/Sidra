/**
 * health.js — API health-check route
 *
 * GET /api/health
 * Returns server status and environment so you can verify the server
 * is running before connecting a frontend or database.
 */

import { Router } from 'express'

const router = Router()

router.get('/', (_req, res) => {
  res.json({
    status:      'ok',
    service:     'sidra-api',
    environment: process.env.NODE_ENV ?? 'development',
    timestamp:   new Date().toISOString(),
    database:    'not connected — PostgreSQL integration pending',
    message:     'Sidra API is running. Backend foundation is in place.',
  })
})

export default router
