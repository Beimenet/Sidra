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
  // Server
  PORT:     optional('PORT', '5000'),
  NODE_ENV: optional('NODE_ENV', 'development'),

  // Database — required when database is connected
  // Uncomment and call required() once PostgreSQL is set up:
  // DATABASE_URL: required('DATABASE_URL'),

  // Authentication — required when auth is implemented
  // JWT_SECRET:    required('JWT_SECRET'),
  // JWT_EXPIRES_IN: optional('JWT_EXPIRES_IN', '7d'),

  // CORS — the URL of the React frontend
  CLIENT_ORIGIN: optional('CLIENT_ORIGIN', 'http://localhost:5173'),
}
