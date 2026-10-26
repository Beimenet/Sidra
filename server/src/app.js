/**
 * app.js — Sidra Express + Socket.IO server entry point
 *
 * ✅  Server starts and responds to requests
 * ✅  CORS configured for the React frontend
 * ✅  Centralised error handling
 * ✅  PostgreSQL connection pool — connected to sidra_db
 * ✅  Database schema applied (9 tables including chat tables)
 * ✅  Authentication — server-managed sessions with HttpOnly cookies
 * ✅  Course, lesson, enrollment, and progress APIs
 * ✅  Professional directory
 * ✅  Admin user management, professional approvals, dashboard stats
 * ✅  Cloudinary media upload endpoints
 * ✅  Real-time chat — Socket.IO with PostgreSQL persistence
 * 🔲  Payment provider integration (Chapa / Telebirr) — pending
 */

import { createServer } from 'http'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { env } from './config/env.js'
import { testConnection } from './config/db.js'
import { initSocket } from './socket/chatSocket.js'

// Route handlers
import healthRouter from './routes/health.js'
import authRouter from './routes/auth.js'
import coursesRouter, { enrollmentsRouter } from './routes/courses.js'
import professionalsRouter from './routes/professionals.js'
import adminRouter from './routes/admin.js'
import mediaRouter from './routes/media.js'
import chatRouter from './routes/chat.js'

// Middleware
import { notFound } from './middleware/notFound.js'
import { errorHandler } from './middleware/errorHandler.js'

const app = express()
const httpServer = createServer(app)   // wrap Express in a plain HTTP server

// ── Global middleware ─────────────────────────────────────────────────────────

app.use(cors({
  origin: env.CLIENT_ORIGIN,
  credentials: true,
}))

app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// ── Routes ────────────────────────────────────────────────────────────────────

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
      chat: 'GET /api/chat/conversations  |  Socket.IO /socket.io',
    },
  })
})

app.use('/api/health', healthRouter)
app.use('/api/auth', authRouter)
app.use('/api/courses', coursesRouter)
app.use('/api/enrollments', enrollmentsRouter)
app.use('/api/professionals', professionalsRouter)
app.use('/api/admin', adminRouter)
app.use('/api/media', mediaRouter)
app.use('/api/chat', chatRouter)

// ── 404 + error handling ──────────────────────────────────────────────────────
app.use(notFound)
app.use(errorHandler)

// ── Attach Socket.IO ──────────────────────────────────────────────────────────
initSocket(httpServer, env.CLIENT_ORIGIN)

// ── Start server ──────────────────────────────────────────────────────────────
const PORT = Number(env.PORT)

httpServer.listen(PORT, async () => {
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
║  Socket.IO   : ws://localhost:${PORT}/socket.io   ║
╚══════════════════════════════════════════════╝
  DB connection: ${dbStatus}
  `.trim())
})

export default app
