/**
 * api.js — Shared fetch wrapper for the Sidra API
 *
 * All requests include credentials: 'include' so the browser sends and
 * receives the HttpOnly session cookie automatically.
 *
 * Development:
 *   The Vite dev proxy forwards /api/* to http://localhost:5000, so
 *   VITE_API_URL can be left unset (BASE defaults to '').
 *
 * Production (Vercel frontend → Render backend):
 *   Set VITE_API_URL=https://sidra-api-or0n.onrender.com in Vercel's
 *   environment variable settings.  The cookie will be sent cross-origin
 *   because the backend sets SameSite=None; Secure in production.
 */

const BASE = import.meta.env.VITE_API_URL ?? import.meta.env.VITE_API_BASE ?? ''

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

// ── Professional endpoints ─────────────────────────────────────────────────────

export const professionalsApi = {
  /** GET /api/professionals — public approved professional directory */
  list: ({ search, specialization, page, limit } = {}) => {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (specialization) params.set('specialization', specialization)
    if (page) params.set('page', page)
    if (limit) params.set('limit', limit)
    const qs = params.toString()
    return request(`/api/professionals${qs ? `?${qs}` : ''}`)
  },

  /** GET /api/professionals/:id — public single profile (approved only) */
  get: (id) => request(`/api/professionals/${id}`),

  /** GET /api/professionals/me — own profile (professional role) */
  getMine: () => request('/api/professionals/me'),

  /** POST /api/professionals — submit or resubmit own profile (professional role) */
  submitProfile: (body) => request('/api/professionals', { method: 'POST', body: JSON.stringify(body) }),

  /** PATCH /api/professionals/me — update own profile (professional role) */
  updateProfile: (body) => request('/api/professionals/me', { method: 'PATCH', body: JSON.stringify(body) }),
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

// ── Chat / conversation endpoints ────────────────────────────────────────────

export const chatApi = {
  /** GET /api/chat/users/search?q=... — find users to start a chat with */
  searchUsers: (q) => request(`/api/chat/users/search?q=${encodeURIComponent(q)}`),

  /** GET /api/chat/conversations — list my conversations */
  listConversations: () => request('/api/chat/conversations'),

  /**
   * POST /api/chat/conversations — find or create a direct conversation
   * @param {string} other_user_id
   */
  openConversation: (other_user_id) =>
    request('/api/chat/conversations', { method: 'POST', body: JSON.stringify({ other_user_id }) }),

  /**
   * GET /api/chat/conversations/:id/messages — paginated history
   * @param {string} conversationId
   * @param {{ limit?, before? }} opts
   */
  getMessages: (conversationId, { limit, before } = {}) => {
    const params = new URLSearchParams()
    if (limit) params.set('limit', limit)
    if (before) params.set('before', before)
    const qs = params.toString()
    return request(`/api/chat/conversations/${conversationId}/messages${qs ? `?${qs}` : ''}`)
  },
}

// ── Media / Cloudinary upload endpoints ──────────────────────────────────────

export const mediaApi = {
  /**
   * POST /api/media/sign
   * Get a signed upload signature from the backend.
   * @param {'thumbnail'|'video'} upload_type
   * @returns {{ signature, timestamp, api_key, cloud_name, folder, ... }}
   */
  sign: (upload_type) =>
    request('/api/media/sign', { method: 'POST', body: JSON.stringify({ upload_type }) }),

  /**
   * POST /api/media/confirm
   * After a successful browser→Cloudinary upload, persist the metadata to the DB.
   * @param {object} payload
   */
  confirm: (payload) =>
    request('/api/media/confirm', { method: 'POST', body: JSON.stringify(payload) }),

  /**
   * DELETE /api/media/:upload_type/:record_id
   * Remove a Cloudinary asset and clear the DB columns.
   * @param {'thumbnail'|'video'} upload_type
   * @param {string} record_id  — course UUID (thumbnail) or lesson UUID (video)
   */
  remove: (upload_type, record_id) =>
    request(`/api/media/${upload_type}/${record_id}`, { method: 'DELETE' }),
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
  getAllProfessionals: ({ status } = {}) => {
    const params = new URLSearchParams()
    if (status) params.set('status', status)
    const qs = params.toString()
    return request(`/api/admin/professionals${qs ? `?${qs}` : ''}`)
  },
  approveProfile: (id) => request(`/api/admin/professionals/${id}/approve`, { method: 'PATCH' }),
  rejectProfile: (id, reason) => request(`/api/admin/professionals/${id}/reject`, {
    method: 'PATCH', body: JSON.stringify({ reason }),
  }),
  suspendProfile: (id, { notes, reverification_due_at } = {}) =>
    request(`/api/admin/professionals/${id}/suspend`, {
      method: 'PATCH', body: JSON.stringify({ notes, reverification_due_at }),
    }),
  unsuspendProfile: (id) => request(`/api/admin/professionals/${id}/unsuspend`, { method: 'PATCH' }),

  // ── Course management (admin) ──────────────────────────────────────────────
  listAllCourses: () => request('/api/courses/all'),
  createCourse: (body) => request('/api/courses', { method: 'POST', body: JSON.stringify(body) }),
  updateCourse: (id, body) => request(`/api/courses/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  publishCourse: (id, published) => request(`/api/courses/${id}/publish`, {
    method: 'PATCH', body: JSON.stringify({ published }),
  }),
  deleteCourse: (id) => request(`/api/courses/${id}`, { method: 'DELETE' }),

  // ── Lesson management (admin) ──────────────────────────────────────────────
  createLesson: (courseId, body) => request(`/api/courses/${courseId}/lessons`, {
    method: 'POST', body: JSON.stringify(body),
  }),
  updateLesson: (courseId, lessonId, body) => request(`/api/courses/${courseId}/lessons/${lessonId}`, {
    method: 'PATCH', body: JSON.stringify(body),
  }),
  deleteLesson: (courseId, lessonId) => request(`/api/courses/${courseId}/lessons/${lessonId}`, {
    method: 'DELETE',
  }),
  reorderLessons: (courseId, order) => request(`/api/courses/${courseId}/lessons/reorder`, {
    method: 'PATCH', body: JSON.stringify({ order }),
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
