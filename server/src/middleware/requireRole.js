/**
 * requireRole.js — role-based authorization middleware
 *
 * Must be used AFTER authenticate middleware (requires req.user).
 *
 * Usage:
 *   import { requireRole } from '../middleware/requireRole.js'
 *
 *   // Admin only
 *   router.get('/admin/users', authenticate, requireRole('admin'), listUsers)
 *
 *   // Multiple allowed roles
 *   router.get('/dashboard', authenticate, requireRole('admin', 'professional'), handler)
 */

export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      // authenticate middleware should have run first
      return res.status(401).json({
        error: { message: 'Not authenticated.', status: 401 },
      })
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: {
          message: 'You do not have permission to access this resource.',
          status: 403,
        },
      })
    }

    next()
  }
}
