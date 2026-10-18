/**
 * notFound.js — 404 handler for unmatched API routes.
 * Register this AFTER all routes but BEFORE errorHandler.
 */

export function notFound(req, res, next) {
  const err = new Error(`Route not found: ${req.method} ${req.originalUrl}`)
  err.status = 404
  next(err)
}
