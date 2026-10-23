import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth, FAMILY_ROLES, getRoleLabel } from '../context/AuthContext.jsx'
import RoleAvatar from '../components/common/RoleAvatar.jsx'

// ── Role badge ────────────────────────────────────────────────────────────────
function RoleBadge({ value }) {
  if (!value) return <span className="text-warm-gray text-sm italic">Not set</span>
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-terracotta/10 text-terracotta text-sm font-semibold rounded-full">
      {getRoleLabel(value)}
    </span>
  )
}

// ── Initials avatar — removed; replaced by RoleAvatar ────────────────────────
// ProfilePage now uses <RoleAvatar> from components/common/RoleAvatar.jsx

// ── Editable role selector ────────────────────────────────────────────────────
function RoleSelector({ value, onChange }) {
  return (
    <fieldset>
      <legend className="text-sm font-semibold text-charcoal mb-3">Your role in the family</legend>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3" role="radiogroup">
        {FAMILY_ROLES.map((role) => {
          const isSelected = value === role.value
          return (
            <label
              key={role.value}
              className={`flex flex-col items-center text-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all duration-150
                          ${isSelected
                  ? 'border-terracotta bg-terracotta/5'
                  : 'border-border bg-white hover:border-terracotta/40 hover:bg-cream'}`}
            >
              <input
                type="radio"
                name="editFamilyRole"
                value={role.value}
                checked={isSelected}
                onChange={() => onChange(role.value)}
                className="sr-only"
                aria-label={role.label}
              />
              <span className={isSelected ? 'text-terracotta' : 'text-warm-gray'}>
                {role.icon}
              </span>
              <span className={`text-xs font-semibold ${isSelected ? 'text-terracotta' : 'text-charcoal'}`}>
                {role.label}
              </span>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const { user, updateProfile, logout } = useAuth()
  const navigate = useNavigate()

  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [editRole, setEditRole] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [nameError, setNameError] = useState('')

  async function handleLogout() {
    await logout()
    navigate('/')
  }

  function startEditing() {
    setEditName(user.name)
    setEditRole(user.role ?? '')     // backend uses 'role', normalised as both role and familyRole
    setSaveError('')
    setSaveSuccess(false)
    setNameError('')
    setEditing(true)
  }

  function cancelEditing() {
    setEditing(false)
    setSaveError('')
    setNameError('')
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaveError('')
    setNameError('')
    setSaveSuccess(false)

    if (!editName.trim()) {
      setNameError('Full name cannot be empty.')
      return
    }

    setSaving(true)
    try {
      await updateProfile({ name: editName.trim(), familyRole: editRole || undefined })
      setSaveSuccess(true)
      setEditing(false)
    } catch (err) {
      setSaveError(err.message ?? 'Could not save changes. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  // ── Not logged in ─────────────────────────────────────────────────────────
  if (!user) {
    return (
      <main id="main-content" tabIndex={-1} className="bg-cream min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="flex justify-center mb-5">
            <RoleAvatar role={null} size={64} />
          </div>
          <h1 className="text-2xl font-bold text-charcoal mb-2">My Profile</h1>
          <p className="text-warm-gray mb-6 leading-relaxed">
            You need to be logged in to view your profile.
          </p>
          <div className="flex flex-col gap-3">
            <Link to="/login" className="btn-primary w-full">Log In</Link>
            <Link to="/register" className="btn-secondary w-full">Create Account</Link>
          </div>
        </div>
      </main>
    )
  }

  // ── Logged in ─────────────────────────────────────────────────────────────
  return (
    <main id="main-content" tabIndex={-1} className="bg-cream min-h-screen py-10 px-4">
      <div className="max-w-xl mx-auto flex flex-col gap-6">

        {/* Dev notice removed — backend session is now live */}

        {/* Success banner */}
        {saveSuccess && (
          <div role="status" className="flex gap-2 bg-sage/20 border border-sage/40 rounded-xl px-4 py-3 text-sm text-charcoal font-medium">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-sage flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
            </svg>
            Profile updated successfully.
          </div>
        )}

        {/* Profile card */}
        <div className="card p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4 mb-6">
            <h1 className="text-2xl font-bold text-charcoal">My Profile</h1>
            <button
              type="button"
              onClick={handleLogout}
              className="text-sm font-medium text-warm-gray hover:text-red-600 transition-colors flex items-center gap-1.5"
              aria-label="Log out of your account"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
              </svg>
              Log out
            </button>
          </div>

          {!editing ? (
            /* ── View mode ─────────────────────────────────────────────── */
            <div className="flex flex-col gap-6">
              {/* Avatar + name */}
              <div className="flex items-center gap-5">
                <RoleAvatar role={user.role ?? null} size={80} />
                <div>
                  <p className="text-xl font-bold text-charcoal">{user.name}</p>
                  <p className="text-sm text-warm-gray mt-0.5">{user.email}</p>
                </div>
              </div>

              {/* Role */}
              <div className="bg-cream rounded-xl p-4 flex items-center gap-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-warm-gray w-24 flex-shrink-0">
                  Family role
                </span>
                <RoleBadge value={user.role} />
              </div>

              {/* Email note */}
              <p className="text-xs text-warm-gray/80 bg-white border border-border rounded-lg px-3 py-2">
                Email address cannot be changed here. A secure email-update flow will be added when the backend is connected.
              </p>

              <button
                type="button"
                onClick={startEditing}
                className="btn-secondary self-start"
              >
                Edit Profile
              </button>
            </div>

          ) : (
            /* ── Edit mode ─────────────────────────────────────────────── */
            <form onSubmit={handleSave} noValidate className="flex flex-col gap-5">

              {/* Avatar — updates to reflect editRole as user changes selection */}
              <div className="flex justify-center">
                <RoleAvatar role={editRole || user.role || null} size={80} />
              </div>

              {/* Name */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="edit-name" className="text-sm font-semibold text-charcoal">
                  Full name
                </label>
                <input
                  id="edit-name"
                  type="text"
                  value={editName}
                  onChange={(e) => { setEditName(e.target.value); setNameError('') }}
                  autoComplete="name"
                  className="w-full px-4 py-3 bg-white border border-border rounded-xl text-charcoal
                             focus:outline-none focus:ring-2 focus:ring-terracotta focus:border-transparent text-sm"
                />
                {nameError && (
                  <p role="alert" className="text-xs text-red-600">{nameError}</p>
                )}
              </div>

              {/* Email — read-only */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="edit-email" className="text-sm font-semibold text-charcoal">
                  Email address
                </label>
                <input
                  id="edit-email"
                  type="email"
                  value={user.email}
                  readOnly
                  disabled
                  className="w-full px-4 py-3 bg-cream border border-border rounded-xl text-warm-gray text-sm cursor-not-allowed"
                />
                <p className="text-xs text-warm-gray/70">Email cannot be edited at this time.</p>
              </div>

              {/* Role */}
              <RoleSelector value={editRole} onChange={setEditRole} />

              {/* Save error */}
              {saveError && (
                <div role="alert" className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                  {saveError}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 flex-wrap">
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {saving ? 'Saving…' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={cancelEditing}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Back link */}
        <p className="text-center text-xs text-warm-gray">
          <Link to="/" className="hover:text-terracotta transition-colors">← Back to home</Link>
        </p>

      </div>
    </main>
  )
}
