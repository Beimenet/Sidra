import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth, FAMILY_ROLES, getRoleLabel, isProfessional } from '../context/AuthContext.jsx'
import RoleAvatar from '../components/common/RoleAvatar.jsx'
import VerifiedBadge, { isVerified } from '../components/common/VerifiedBadge.jsx'
import { professionalsApi } from '../services/api.js'

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

  // Professional profile state — only loaded when user.role === 'professional'
  const [proProfile, setProProfile] = useState(null)
  const [proLoading, setProLoading] = useState(false)

  useEffect(() => {
    if (isProfessional(user)) {
      setProLoading(true)
      professionalsApi.getMine()
        .then((data) => setProProfile(data.profile ?? null))
        .catch(() => setProProfile(null))
        .finally(() => setProLoading(false))
    }
  }, [user])

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
      const updates = { name: editName.trim() }
      // Only pass familyRole for non-professional accounts
      if (!isProfessional(user)) {
        updates.familyRole = editRole || undefined
      }
      await updateProfile(updates)
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
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-xl font-bold text-charcoal">{user.name}</p>
                    {proProfile && (
                      <VerifiedBadge
                        verificationStatus={proProfile.verification_status}
                        isSuspended={proProfile.is_suspended}
                        size="lg"
                      />
                    )}
                  </div>
                  <p className="text-sm text-warm-gray mt-0.5">{user.email}</p>
                  {isProfessional(user) && (
                    <p className="text-xs font-semibold text-[#4389C7] mt-0.5">Professional account</p>
                  )}
                </div>
              </div>

              {/* Role */}
              <div className="bg-cream rounded-xl p-4 flex items-center gap-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-warm-gray w-24 flex-shrink-0">
                  {isProfessional(user) ? 'Account role' : 'Family role'}
                </span>
                <RoleBadge value={user.role} />
              </div>

              {/* Professional profile section */}
              {isProfessional(user) && (
                <div className="bg-[#E5EEF8] border border-[#4389C7]/25 rounded-xl p-4 flex flex-col gap-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-charcoal">Professional Profile</p>
                    {proLoading && (
                      <span className="text-xs text-warm-gray">Loading…</span>
                    )}
                    {!proLoading && proProfile && (
                      <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full capitalize
                        ${proProfile.verification_status === 'approved' && !proProfile.is_suspended
                          ? 'bg-[#4389C7]/15 text-[#4389C7]'
                          : proProfile.is_suspended
                            ? 'bg-amber-50 text-amber-700'
                            : proProfile.verification_status === 'rejected'
                              ? 'bg-red-50 text-red-700'
                              : 'bg-amber-50 text-amber-700'
                        }`}>
                        {proProfile.is_suspended
                          ? 'Suspended'
                          : proProfile.verification_status === 'approved'
                            ? '✓ Verified'
                            : proProfile.verification_status === 'rejected'
                              ? 'Rejected'
                              : 'Pending review'}
                      </span>
                    )}
                  </div>
                  {!proLoading && !proProfile && (
                    <p className="text-sm text-warm-gray">
                      You have not submitted a professional profile yet.
                    </p>
                  )}
                  {!proLoading && proProfile && (
                    <>
                      <p className="text-sm text-charcoal leading-relaxed line-clamp-2">{proProfile.bio}</p>
                      <p className="text-xs text-warm-gray">
                        <strong className="text-charcoal">Specialization:</strong> {proProfile.specialization}
                      </p>
                      {proProfile.institution_name && (
                        <p className="text-xs text-warm-gray">
                          <strong className="text-charcoal">Institution:</strong> {proProfile.institution_name}
                        </p>
                      )}
                      {proProfile.verification_status === 'rejected' && proProfile.rejection_reason && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-1">
                          <p className="text-xs font-semibold text-red-700 mb-0.5">Rejection reason</p>
                          <p className="text-xs text-red-700 leading-relaxed">{proProfile.rejection_reason}</p>
                        </div>
                      )}
                      {proProfile.is_suspended && (
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-1">
                          <p className="text-xs font-semibold text-amber-700 mb-0.5">Account suspended</p>
                          <p className="text-xs text-amber-700 leading-relaxed">
                            Your professional profile has been suspended by an administrator.
                            Contact support for more information.
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Email note */}
              <p className="text-xs text-warm-gray/80 bg-white border border-border rounded-lg px-3 py-2">
                Email address cannot be changed here. A secure email-update flow will be available in a future update.
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

              {/* Role — only editable for parent accounts */}
              {!isProfessional(user) && (
                <RoleSelector value={editRole} onChange={setEditRole} />
              )}

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
