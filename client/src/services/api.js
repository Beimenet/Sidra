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
  /**
   * Register a new user account.
   * @param {{ full_name, email, password, role }} body
   */
  register: (body) => request('/api/auth/register', { method: 'POST', body: JSON.stringify(body) }),

  /**
   * Log in with email and password.
   * @param {{ email, password }} body
   */
  login: (body) => request('/api/auth/login', { method: 'POST', body: JSON.stringify(body) }),

  /**
   * Log out — deletes the session on the server and clears the cookie.
   */
  logout: () => request('/api/auth/logout', { method: 'POST' }),

  /**
   * Get the authenticated user's profile (also used to restore session on mount).
   * Returns null-ish data on 401 rather than throwing, so callers can treat it
   * as "not logged in" gracefully.
   */
  me: () => request('/api/auth/me'),

  /**
   * Update the authenticated user's name and/or role.
   * @param {{ full_name?: string, role?: string }} body
   */
  updateMe: (body) => request('/api/auth/me', { method: 'PUT', body: JSON.stringify(body) }),
}
