/**
 * api.js — Shared fetch wrapper for the Sidra API
 *
 * All requests include credentials: 'include' so the browser sends and
 * receives the HttpOnly session cookie automatically.
 *
 * The Vite dev proxy forwards /api/* to http://localhost:5000, so no
 * hard-coded base URL is needed for development.
 *
 * In production, set VITE_API_BASE in the client .env if the API lives
 * on a different origin (e.g. https://api.sidra.et).
 */

const BASE = import.meta.env.VITE_API_BASE ?? ''

/**
 * Core request helper.
 * Throws a plain Error with the API's error.message if the response is not ok.
 * Also propagates field-level errors as err.fields for form validation.
 */
async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
  })

  // Parse body regardless of status so we can read the error message
  let data
  try {
    data = await res.json()
  } catch {
    data = {}
  }

  if (!res.ok) {
    const err = new Error(data.error?.message ?? `Request failed with status ${res.status}`)
    err.status = res.status
    err.fields = data.error?.fields ?? null   // field-level validation errors
    throw err
  }

  return data
}

// ── Auth endpoints ────────────────────────────────────────────────────────────

export const authApi = {
  register: (body) => request('/api/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => request('/api/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  logout: () => request('/api/auth/logout', { method: 'POST' }),
  me: () => request('/api/auth/me'),
  updateMe: (body) => request('/api/auth/me', { method: 'PUT', body: JSON.stringify(body) }),
}

// ── Course endpoints ──────────────────────────────────────────────────────────

export const coursesApi = {
  /** GET /api/courses — public published course list */
  list: () => request('/api/courses'),

  /** GET /api/courses/:id — course detail with lessons (public if published) */
  get: (id) => request(`/api/courses/${id}`),

  /** POST /api/courses/:id/enroll — authenticated enrollment */
  enroll: (courseId) => request(`/api/courses/${courseId}/enroll`, { method: 'POST' }),

  /** GET /api/courses/:id/progress — authenticated, enrolled users only */
  getProgress: (courseId) => request(`/api/courses/${courseId}/progress`),

  /**
   * POST /api/courses/:courseId/lessons/:lessonId/complete
   * Mark a lesson complete or incomplete.
   * @param {string} courseId
   * @param {string} lessonId
   * @param {boolean} completed — default true
   */
  markLesson: (courseId, lessonId, completed = true) =>
    request(`/api/courses/${courseId}/lessons/${lessonId}/complete`, {
      method: 'POST',
      body: JSON.stringify({ completed }),
    }),
}

// ── Enrollment endpoints ──────────────────────────────────────────────────────

export const enrollmentApi = {
  /** GET /api/enrollments/me — authenticated user's enrollment list */
  mine: () => request('/api/enrollments/me'),

  /** GET /api/enrollments/:id — owner or admin */
  get: (id) => request(`/api/enrollments/${id}`),

  /** GET /api/enrollments/:id/progress — owner or admin */
  getProgress: (id) => request(`/api/enrollments/${id}/progress`),
}

// ── Admin endpoints ───────────────────────────────────────────────────────────

export const adminApi = {
  // ── Dashboard ─────────────────────────────────────────────────────────────
  getStats: () => request('/api/admin/dashboard/stats'),
  getRecentUsers: (limit) => request(`/api/admin/dashboard/recent-users?limit=${limit ?? 10}`),
  getRecentActivity: (limit) => request(`/api/admin/dashboard/recent-activity?limit=${limit ?? 20}`),

  // ── User management ────────────────────────────────────────────────────────
  listUsers: ({ search = '', role = '', is_active, sort = 'newest', page = 1, limit = 20 } = {}) => {
    const params = new URLSearchParams({ sort, page, limit })
    if (search) params.set('search', search)
    if (role) params.set('role', role)
    if (is_active !== undefined) params.set('is_active', String(is_active))
    return request(`/api/admin/users?${params}`)
  },
  getUser: (id) => request(`/api/admin/users/${id}`),
  setStatus: (id, is_active) => request(`/api/admin/users/${id}/status`, {
    method: 'PATCH', body: JSON.stringify({ is_active }),
  }),
  setRole: (id, role) => request(`/api/admin/users/${id}/role`, {
    method: 'PATCH', body: JSON.stringify({ role }),
  }),

  // ── Professional approvals ─────────────────────────────────────────────────
  getPendingProfessionals: () => request('/api/admin/professionals/pending'),
  approveProfile: (id) => request(`/api/admin/professionals/${id}/approve`, { method: 'PATCH' }),
  rejectProfile: (id, reason) => request(`/api/admin/professionals/${id}/reject`, {
    method: 'PATCH', body: JSON.stringify({ reason }),
  }),

  // ── Enrollment management ──────────────────────────────────────────────────
  listEnrollments: ({ course_id, user_id, status, page = 1, limit = 20 } = {}) => {
    const params = new URLSearchParams({ page, limit })
    if (course_id) params.set('course_id', course_id)
    if (user_id) params.set('user_id', user_id)
    if (status) params.set('status', status)
    return request(`/api/admin/enrollments?${params}`)
  },
}
