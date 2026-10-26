/**
 * env.js — centralised environment variable access
 *
 * All process.env reads go through this module so that missing
 * required variables are caught early with a clear error message
 * rather than failing silently at runtime.
 */

import 'dotenv/config'

function required(name) {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

function optional(name, defaultValue = '') {
  return process.env[name] ?? defaultValue
}

export const env = {
  // ── Server ────────────────────────────────────────────────────────────────
  PORT: optional('PORT', '5000'),
  NODE_ENV: optional('NODE_ENV', 'development'),

  // ── CORS ──────────────────────────────────────────────────────────────────
  // Comma-separated list of allowed frontend origins.
  //   development:  http://localhost:5173
  //   production:   https://sidra-pi-one.vercel.app
  //   both:         https://sidra-pi-one.vercel.app,http://localhost:5173
  CLIENT_ORIGIN: optional('CLIENT_ORIGIN', 'http://localhost:5173'),

  // ── Database ──────────────────────────────────────────────────────────────
  DB_HOST: optional('DB_HOST', 'localhost'),
  DB_PORT: optional('DB_PORT', '5432'),
  DB_NAME: required('DB_NAME'),
  DB_USER: required('DB_USER'),
  DB_PASSWORD: optional('DB_PASSWORD', ''),

  // ── Authentication ────────────────────────────────────────────────────────
  // Generate SESSION_SECRET with:
  //   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
  SESSION_SECRET: required('SESSION_SECRET'),
  SESSION_DURATION_DAYS: optional('SESSION_DURATION_DAYS', '7'),

  // ── Cloudinary (optional until media uploads are enabled) ─────────────────
  CLOUDINARY_CLOUD_NAME: optional('CLOUDINARY_CLOUD_NAME', ''),
  CLOUDINARY_API_KEY: optional('CLOUDINARY_API_KEY', ''),
  CLOUDINARY_API_SECRET: optional('CLOUDINARY_API_SECRET', ''),

  // ── Socket.IO / Chat ──────────────────────────────────────────────────────
  // The client connects directly to the backend via VITE_SOCKET_URL.
  // Nothing extra is needed server-side beyond CLIENT_ORIGIN above.
}
