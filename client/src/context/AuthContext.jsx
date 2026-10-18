/**
 * AuthContext.jsx — Sidra frontend authentication state
 *
 * CURRENT STATE: Frontend-only session management.
 * No real backend authentication is connected yet.
 *
 * What this does:
 *   - Holds the current user object in React state.
 *   - Provides login(), register(), logout(), and updateProfile() helpers.
 *   - Persists the session to sessionStorage so a page refresh does not
 *     immediately log the user out during development.
 *     ⚠ sessionStorage is cleared when the browser tab is closed.
 *     ⚠ Passwords are NEVER stored — only the non-sensitive profile data.
 *
 * What this does NOT do:
 *   - It does not contact a real API.
 *   - It does not issue or verify JWT tokens.
 *   - It does not communicate with the database.
 *   - It does not provide real security.
 *
 * When the backend auth API is ready:
 *   1. Replace the body of login() with a real POST /api/auth/login call.
 *   2. Replace the body of register() with a real POST /api/auth/register call.
 *   3. Replace the body of updateProfile() with a real PUT /api/auth/me call.
 *   4. Store only the returned JWT token (in memory or httpOnly cookie — not
 *      localStorage) and fetch the user profile via GET /api/auth/me.
 *   5. Remove the sessionStorage simulation.
 */

import { createContext, useContext, useState, useEffect } from 'react'

// ── Role constants ────────────────────────────────────────────────────────────

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
  return FAMILY_ROLES.find((r) => r.value === value)?.label ?? value
}

// ── Context ───────────────────────────────────────────────────────────────────

const SESSION_KEY = 'sidra_dev_session'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Restore dev session on mount
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(SESSION_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        // Basic sanity check — never restore a stored password
        if (parsed && parsed.email && !parsed.password) {
          setUser(parsed)
        }
      }
    } catch {
      sessionStorage.removeItem(SESSION_KEY)
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * register()
   *
   * Frontend-only simulation. Validates fields and stores a non-sensitive
   * profile object in sessionStorage. NO password is stored.
   *
   * When the backend is ready, replace this with:
   *   const res = await fetch('/api/auth/register', { method: 'POST', body: JSON.stringify({ name, email, password, familyRole }) })
   *   const data = await res.json()
   *   // store JWT token securely, then fetch /api/auth/me
   */
  async function register({ name, email, password: _password, familyRole }) {
    if (!ALLOWED_ROLE_VALUES.includes(familyRole)) {
      throw new Error('Invalid family role selected.')
    }
    // Simulate API latency
    await new Promise((r) => setTimeout(r, 600))

    const profile = {
      id: `dev-${Date.now()}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      familyRole,
      createdAt: new Date().toISOString(),
      _devOnly: true,
    }

    sessionStorage.setItem(SESSION_KEY, JSON.stringify(profile))
    setUser(profile)
    return profile
  }

  /**
   * login()
   *
   * Frontend-only simulation. Accepts any non-empty email + password and
   * creates a temporary dev session. NO credentials are stored.
   *
   * ADMIN DEV SHORTCUT: if the email contains "admin", the session gets
   * isAdmin: true so you can test the Admin Dashboard without a backend.
   * This is a development convenience ONLY — it provides no real security.
   *
   * When the backend is ready, replace this with a real POST /api/auth/login.
   */
  async function login({ email, password: _password }) {
    await new Promise((r) => setTimeout(r, 600))

    const isAdmin = email.toLowerCase().includes('admin')

    const profile = {
      id: `dev-${Date.now()}`,
      name: email.split('@')[0],
      email: email.trim().toLowerCase(),
      familyRole: null,
      isAdmin,
      createdAt: new Date().toISOString(),
      _devOnly: true,
    }

    sessionStorage.setItem(SESSION_KEY, JSON.stringify(profile))
    setUser(profile)
    return profile
  }

  /**
   * updateProfile()
   *
   * Updates the in-memory and sessionStorage profile.
   * When the backend is ready, replace with a PUT /api/auth/me call.
   */
  async function updateProfile(updates) {
    if (!user) throw new Error('Not authenticated.')

    const allowed = {}
    if (updates.name !== undefined) allowed.name = updates.name.trim()
    if (updates.familyRole !== undefined) {
      if (!ALLOWED_ROLE_VALUES.includes(updates.familyRole)) {
        throw new Error('Invalid family role.')
      }
      allowed.familyRole = updates.familyRole
    }

    await new Promise((r) => setTimeout(r, 400))

    const updated = { ...user, ...allowed }
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(updated))
    setUser(updated)
    return updated
  }

  function logout() {
    sessionStorage.removeItem(SESSION_KEY)
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
