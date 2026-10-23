/**
 * app.js — Sidra Express server entry point
 *
 * Current state:
 *   ✅  Server starts and responds to requests
 *   ✅  CORS configured for the React frontend
 *   ✅  Centralised error handling
 *   ✅  PostgreSQL connection pool — connected to sidra_db
 *   ✅  Database schema applied (7 tables including sessions)
 *   ✅  Authentication — server-managed sessions with HttpOnly cookies
 *   🔲  Course / professional / enrollment endpoints — stubs only (501)
 */

import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { env } from './config/env.js'
import { testConnection } from './config/db.js'

// Route handlers
import healthRouter from './routes/health.js'
import authRouter from './routes/auth.js'
import coursesRouter from './routes/courses.js'
import professionalsRouter from './routes/professionals.js'

// Middleware
import { notFound } from './middleware/notFound.js'
import { errorHandler } from './middleware/errorHandler.js'

const app = express()

// ── Global middleware ─────────────────────────────────────────────────────────

app.use(cors({
  origin: env.CLIENT_ORIGIN,
  credentials: true,
}))

app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// ── Routes ────────────────────────────────────────────────────────────────────

// Root — friendly API info so opening http://localhost:5000/ is not a 404
app.get('/', (_req, res) => {
  res.json({
    service: 'sidra-api',
    description: 'Sidra (ስድራ) — Parenting Education Platform API',
    status: 'running',
    version: '0.1.0',
    endpoints: {
      health: 'GET /api/health',
      auth: 'POST /api/auth/register  |  POST /api/auth/login',
      courses: 'GET /api/courses',
      professionals: 'GET /api/professionals',
    },
    note: 'Authentication and data endpoints are under development.',
  })
})

app.use('/api/health', healthRouter)
app.use('/api/auth', authRouter)
app.use('/api/courses', coursesRouter)
app.use('/api/professionals', professionalsRouter)

// ── 404 + error handling ──────────────────────────────────────────────────────
// Must be registered after all routes

app.use(notFound)
app.use(errorHandler)

// ── Start server ──────────────────────────────────────────────────────────────

const PORT = Number(env.PORT)

app.listen(PORT, async () => {
  // Test the database connection on startup so problems are visible immediately
  let dbStatus = 'connected ✅'
  try {
    await testConnection()
  } catch (err) {
    dbStatus = `FAILED ❌  ${err.message}`
  }

  console.log(`
╔══════════════════════════════════════════════╗
║          Sidra API Server — Running          ║
╠══════════════════════════════════════════════╣
║  Environment : ${env.NODE_ENV.padEnd(28)}║
║  Port        : ${String(PORT).padEnd(28)}║
║  Health check: http://localhost:${PORT}/api/health  ║
║  Database    : ${env.DB_NAME.padEnd(28)}║
╚══════════════════════════════════════════════╝
  DB connection: ${dbStatus}
  `.trim())
})

export default app
