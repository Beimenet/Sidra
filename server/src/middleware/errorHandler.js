/**
 * errorHandler.js — centralised Express error-handling middleware
 *
 * Must be registered LAST in app.js (after all routes).
 * Catches any error passed via next(error) from route handlers.
 *
 * Never exposes stack traces or internal details in production responses.
 */

export function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  const isDev = process.env.NODE_ENV !== 'production'

  const status  = err.status ?? err.statusCode ?? 500
  const message = err.message ?? 'An unexpected error occurred.'

  // Log the full error server-side only
  console.error(`[${new Date().toISOString()}] ${status} ${req.method} ${req.path} —`, err.message)
  if (isDev && err.stack) console.error(err.stack)

  res.status(status).json({
    error: {
      message,
      status,
      // Stack trace shown in development only, never in production
      ...(isDev && { stack: err.stack }),
    },
  })
}
