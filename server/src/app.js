/**
 * app.js — Sidra Express server entry point
 *
 * Starts the REST API server for the Sidra parenting education platform.
 *
 * Current state:
 *   ✅  Server starts and responds to health-check requests
 *   ✅  CORS configured for the React frontend
 *   ✅  Centralised error handling
 *   🔲  Database (PostgreSQL) — not yet connected
 *   🔲  Authentication (JWT) — not yet implemented
 *   🔲  Course / professional / enrollment endpoints — stubs only (501)
 */

import express from 'express'
import cors from 'cors'
import { env } from './config/env.js'

// Route handlers
import healthRouter       from './routes/health.js'
import authRouter         from './routes/auth.js'
import coursesRouter      from './routes/courses.js'
import professionalsRouter from './routes/professionals.js'

// Middleware
import { notFound }    from './middleware/notFound.js'
import { errorHandler } from './middleware/errorHandler.js'

const app = express()

// ── Global middleware ──────────────────────────────────────────────────────────

app.use(cors({
  origin: env.CLIENT_ORIGIN,
  credentials: true,
}))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// ── Routes ────────────────────────────────────────────────────────────────────

app.use('/api/health',        healthRouter)
app.use('/api/auth',          authRouter)
app.use('/api/courses',       coursesRouter)
app.use('/api/professionals', professionalsRouter)

// ── 404 + error handling ──────────────────────────────────────────────────────
// Must be registered after all routes

app.use(notFound)
app.use(errorHandler)

// ── Start server ──────────────────────────────────────────────────────────────

const PORT = Number(env.PORT)

app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════╗
║          Sidra API Server — Running          ║
╠══════════════════════════════════════════════╣
║  Environment : ${env.NODE_ENV.padEnd(28)}║
║  Port        : ${String(PORT).padEnd(28)}║
║  Health check: http://localhost:${PORT}/api/health  ║
║  Database    : Not connected (pending)       ║
╚══════════════════════════════════════════════╝
  `.trim())
})

export default app
