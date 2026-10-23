/**
 * health.js — API and database health-check route
 *
 * GET /api/health
 *
 * Returns server status and tests the live PostgreSQL connection so you
 * can verify both the API and the database are reachable in one request.
 *
 * Response shape:
 * {
 *   status:      'ok' | 'degraded',
 *   service:     'sidra-api',
 *   environment: string,
 *   timestamp:   ISO string,
 *   database: {
 *     status:  'connected' | 'error',
 *     name:    string,
 *     message: string          -- only present on error
 *   }
 * }
 */

import { Router } from 'express'
import { pool } from '../config/db.js'
import { env } from '../config/env.js'

const router = Router()

router.get('/', async (_req, res) => {
  // Attempt a trivial query to confirm the pool can reach PostgreSQL
  let dbResult = { status: 'connected', name: env.DB_NAME }

  try {
    await pool.query('SELECT 1')
  } catch (err) {
    dbResult = {
      status: 'error',
      name: env.DB_NAME,
      message: err.message,
    }
  }

  const healthy = dbResult.status === 'connected'

  res.status(healthy ? 200 : 503).json({
    status: healthy ? 'ok' : 'degraded',
    service: 'sidra-api',
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString(),
    database: dbResult,
  })
})

export default router
