/**
 * AuthContext.jsx — Sidra frontend authentication state
 *
 * Connected to the real Express + PostgreSQL backend.
 * Sessions are managed server-side; the browser holds only an HttpOnly
 * cookie. No authentication data is stored in localStorage or sessionStorage.
 *
 * Backend field names differ slightly from the frontend display names:
 *   backend: full_name, role
 *   frontend display: name (derived), role (same)
 *
 * The `user` object exposed to the rest of the app is normalised so
 * components can use user.name, user.role, user.email consistently.
 */

import { createContext, useContext, useState, useEffect } from 'react'
import { authApi } from '../services/api.js'

// ── Role constants ────────────────────────────────────────────────────────────
// These are the family/account roles supported by the platform.
// Used in registration forms, profile selectors, and role-based avatar display.

export const FAMILY_ROLES = [
  {
    value: 'mother',
    label: 'Mother',
    description: 'You are the primary maternal caregiver for your child.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7" aria-hidden="true">
        <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    value: 'father',
    label: 'Father',
    description: 'You are the primary paternal caregiver for your child.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7" aria-hidden="true">
        <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    value: 'legal_guardian',
    label: 'Legal Guardian',
    description: 'You have legal responsibility for a child\'s care and wellbeing.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7" aria-hidden="true">
        <path fillRule="evenodd" d="M12.516 2.17a.75.75 0 0 0-1.032 0 11.209 11.209 0 0 1-7.877 3.08.75.75 0 0 0-.722.515A12.74 12.74 0 0 0 2.25 9.75c0 5.942 4.064 10.933 9.563 12.348a.749.749 0 0 0 .374 0c5.499-1.415 9.563-6.406 9.563-12.348 0-1.39-.223-2.73-.635-3.985a.75.75 0 0 0-.722-.516l-.143.001c-2.996 0-5.717-1.17-7.705-3.078Z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    value: 'other_caregiver',
    label: 'Other Caregiver',
    description: 'You care for or support a child in another important capacity.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7" aria-hidden="true">
        <path d="M4.5 6.375a4.125 4.125 0 1 1 8.25 0 4.125 4.125 0 0 1-8.25 0ZM14.25 8.625a3.375 3.375 0 1 1 6.75 0 3.375 3.375 0 0 1-6.75 0ZM1.5 19.125a7.125 7.125 0 0 1 14.25 0v.003l-.001.119a.75.75 0 0 1-.363.63 13.067 13.067 0 0 1-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 0 1-.364-.63l-.001-.122ZM17.25 19.128l-.001.144a2.25 2.25 0 0 1-.233.96 10.088 10.088 0 0 0 5.06-1.01.75.75 0 0 0 .42-.643 4.875 4.875 0 0 0-6.957-4.611 8.586 8.586 0 0 1 1.71 5.157v.003Z" />
      </svg>
    ),
  },
]

export const ALLOWED_ROLE_VALUES = FAMILY_ROLES.map((r) => r.value)

export function getRoleLabel(value) {
  // Covers DB roles that are not in the registration picker
  const extra = {
    professional: 'Professional',
    admin: 'Administrator',
  }
  return FAMILY_ROLES.find((r) => r.value === value)?.label ?? extra[value] ?? value
}

// ── Normalise the backend user object ─────────────────────────────────────────
// Backend returns: { id, full_name, email, role, is_active, created_at }
// Frontend expects: { id, name, email, role, is_active, created_at }
// This single function keeps the mapping in one place.
function normaliseUser(backendUser) {
  if (!backendUser) return null
  return {
    ...backendUser,
    name: backendUser.full_name,  // alias for display convenience
  }
}

// ── Context ───────────────────────────────────────────────────────────────────

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // On mount: call GET /api/auth/me to restore session from the HttpOnly cookie.
  // If the cookie is absent or expired the server returns 401 — we just set
  // user to null (not logged in). No sessionStorage or localStorage involved.
  useEffect(() => {
    authApi.me()
      .then((data) => setUser(normaliseUser(data.user)))
      .catch(() => setUser(null))          // 401 = not logged in, not an error
      .finally(() => setLoading(false))
  }, [])

  /**
   * register()
   *
   * Maps frontend field names to backend field names and calls
   * POST /api/auth/register. On success the server sets the session
   * cookie and returns the user profile.
   *
   * @param {{ name, email, password, familyRole }} params
   */
  async function register({ name, email, password, familyRole }) {
    const data = await authApi.register({
      full_name: name,         // backend field name
      email,
      password,
      role: familyRole,        // backend field name
    })
    const normalised = normaliseUser(data.user)
    setUser(normalised)
    return normalised
  }

  /**
   * login()
   *
   * Calls POST /api/auth/login. On success the server sets the session
   * cookie and returns the user profile.
   *
   * @param {{ email, password }} params
   */
  async function login({ email, password }) {
    const data = await authApi.login({ email, password })
    const normalised = normaliseUser(data.user)
    setUser(normalised)
    return normalised
  }

  /**
   * updateProfile()
   *
   * Calls PUT /api/auth/me with the allowed update fields.
   * Maps familyRole → role for the backend.
   *
   * @param {{ name?: string, familyRole?: string }} updates
   */
  async function updateProfile({ name, familyRole } = {}) {
    const body = {}
    if (name !== undefined) body.full_name = name
    if (familyRole !== undefined) body.role = familyRole
    const data = await authApi.updateMe(body)
    const normalised = normaliseUser(data.user)
    setUser(normalised)
    return normalised
  }

  /**
   * logout()
   *
   * Calls POST /api/auth/logout which deletes the session row in
   * PostgreSQL and clears the cookie. Then clears the local user state.
   * Always resolves — a network error on logout still clears local state.
   */
  async function logout() {
    try {
      await authApi.logout()
    } catch {
      // Best-effort — clear local state regardless
    }
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, register, login, updateProfile, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
