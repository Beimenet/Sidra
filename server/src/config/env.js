/**
 * env.js — centralised environment variable access
 *
 * All process.env reads go through this module so that missing
 * variables are caught early with a clear error message rather
 * than failing silently at runtime.
 *
 * Add new variables here as features are implemented.
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
  // ── Server ────────────────────────────────────────────────
  PORT: optional('PORT', '5000'),
  NODE_ENV: optional('NODE_ENV', 'development'),

  // ── CORS ──────────────────────────────────────────────────
  CLIENT_ORIGIN: optional('CLIENT_ORIGIN', 'http://localhost:5173'),

  // ── Database ──────────────────────────────────────────────
  // Individual connection parameters — preferred over a single
  // connection string so each value can be managed separately.
  DB_HOST: optional('DB_HOST', 'localhost'),
  DB_PORT: optional('DB_PORT', '5432'),
  DB_NAME: required('DB_NAME'),
  DB_USER: required('DB_USER'),
  DB_PASSWORD: optional('DB_PASSWORD', ''),   // empty string = no password

  // ── Authentication (uncomment when auth is implemented) ────
  // SESSION_SECRET:      required('SESSION_SECRET'),
  // SESSION_DURATION_DAYS: optional('SESSION_DURATION_DAYS', '7'),
}
