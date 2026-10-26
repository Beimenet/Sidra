import { useState, useEffect, useCallback } from 'react'
import { adminApi } from '../../services/api.js'
import DashboardLayout from '../../components/dashboard/DashboardLayout.jsx'
import DashboardPageHeader from '../../components/dashboard/DashboardPageHeader.jsx'
import DashboardEmptyState from '../../components/dashboard/DashboardEmptyState.jsx'
import VerifiedBadge from '../../components/common/VerifiedBadge.jsx'

const breadcrumb = [{ label: 'Admin', to: '/admin' }, { label: 'Professional Approvals' }]

const STATUS_TABS = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
]

// ── Status badge ───────────────────────────────────────────────────────────
function StatusBadge({ status, isSuspended }) {
  if (status === 'approved' && isSuspended) {
    return (
      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700">
        Suspended
      </span>
    )
  }
  const map = {
    pending: 'bg-amber-50 text-amber-700',
    approved: 'bg-sage/25 text-charcoal',
    rejected: 'bg-red-50 text-red-700',
  }
  return (
    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full capitalize ${map[status] ?? 'bg-cream text-charcoal'}`}>
      {status}
    </span>
  )
}

// ── Toast ──────────────────────────────────────────────────────────────────
function Toast({ message, type = 'success', onDismiss }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 4000)
    return () => clearTimeout(t)
  }, [onDismiss])
  const cls = type === 'success'
    ? 'bg-sage/20 border-sage/40 text-charcoal'
    : 'bg-red-50 border-red-200 text-red-700'
  return (
    <div role="status" className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 border rounded-xl px-4 py-3 shadow-lg text-sm font-medium max-w-sm ${cls}`}>
      <span>{type === 'success' ? '✅' : '❌'}</span>
      <span className="flex-1">{message}</span>
      <button onClick={onDismiss} className="ml-2 opacity-60 hover:opacity-100" aria-label="Dismiss">✕</button>
    </div>
  )
}

// ── Confirm dialog ─────────────────────────────────────────────────────────
function ConfirmDialog({ title, message, confirmLabel, confirmClass = 'btn-primary', onConfirm, onCancel, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/50 backdrop-blur-sm"
      role="dialog" aria-modal="true" aria-labelledby="confirm-title">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 flex flex-col gap-4">
        <h2 id="confirm-title" className="text-lg font-bold text-charcoal">{title}</h2>
        <p className="text-sm text-warm-gray leading-relaxed">{message}</p>
        {children}
        <div className="flex gap-3 justify-end mt-2">
          <button type="button" onClick={onCancel} className="btn-secondary py-2 px-4 text-sm">Cancel</button>
          <button type="button" onClick={onConfirm} className={`${confirmClass} py-2 px-4 text-sm`}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  )
}

// ── Profile card ───────────────────────────────────────────────────────────
function ProfileCard({ profile, onApprove, onReject, onSuspend, onUnsuspend }) {
  const [expanded, setExpanded] = useState(false)
  const isPending = profile.verification_status === 'pending'
  const isApproved = profile.verification_status === 'approved'
  const isSuspended = !!profile.is_suspended

  return (
    <div className="card p-5 flex flex-col gap-4">
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Initial avatar */}
          <div className="w-11 h-11 rounded-full bg-terracotta/15 text-terracotta text-base font-bold flex items-center justify-center flex-shrink-0 select-none">
            {(profile.full_name ?? '?')[0].toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-semibold text-charcoal">{profile.full_name}</p>
              {/* Show badge only when approved and not suspended */}
              <VerifiedBadge
                verificationStatus={profile.verification_status}
                isSuspended={profile.is_suspended}
                size="sm"
                showTooltip={false}
              />
            </div>
            <p className="text-xs text-warm-gray">{profile.email}</p>
          </div>
        </div>
        <StatusBadge status={profile.verification_status} isSuspended={profile.is_suspended} />
      </div>

      {/* Specialization */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-warm-gray uppercase tracking-wide">Specialty:</span>
        <span className="text-sm text-charcoal">{profile.specialization}</span>
      </div>

      {/* Reverification due */}
      {isSuspended && profile.reverification_due_at && (
        <div className="flex items-center gap-2 bg-amber-50 rounded-lg px-3 py-2">
          <svg className="w-4 h-4 text-amber-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
          <span className="text-xs text-amber-700">
            Re-verification due: <strong>{new Date(profile.reverification_due_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>
          </span>
        </div>
      )}

      {/* Expandable details */}
      <button
        type="button"
        onClick={() => setExpanded(v => !v)}
        className="text-xs font-semibold text-terracotta hover:text-terracotta-hover transition-colors text-left"
        aria-expanded={expanded}
      >
        {expanded ? '▲ Hide details' : '▼ View full application'}
      </button>

      {expanded && (
        <div className="flex flex-col gap-3 bg-cream rounded-xl p-4 text-sm">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-warm-gray mb-1">Qualifications</p>
            <p className="text-charcoal leading-relaxed">{profile.qualifications}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-warm-gray mb-1">Bio</p>
            <p className="text-charcoal leading-relaxed">{profile.bio}</p>
          </div>
          {/* Extended credential fields */}
          {(profile.institution_name || profile.license_number || profile.years_experience != null) && (
            <div className="flex flex-col gap-1.5">
              <p className="text-xs font-semibold uppercase tracking-wide text-warm-gray mb-0.5">Credentials</p>
              {profile.institution_name && (
                <p className="text-xs text-charcoal"><span className="text-warm-gray">Institution:</span> {profile.institution_name}</p>
              )}
              {profile.license_number && (
                <p className="text-xs text-charcoal"><span className="text-warm-gray">License #:</span> {profile.license_number}</p>
              )}
              {profile.license_authority && (
                <p className="text-xs text-charcoal"><span className="text-warm-gray">Issued by:</span> {profile.license_authority}</p>
              )}
              {profile.license_expires_at && (
                <p className="text-xs text-charcoal"><span className="text-warm-gray">Expires:</span> {new Date(profile.license_expires_at).toLocaleDateString('en-GB')}</p>
              )}
              {profile.years_experience != null && (
                <p className="text-xs text-charcoal"><span className="text-warm-gray">Experience:</span> {profile.years_experience} years</p>
              )}
              {profile.workplace && (
                <p className="text-xs text-charcoal"><span className="text-warm-gray">Workplace:</span> {profile.workplace}</p>
              )}
            </div>
          )}
          {profile.rejection_reason && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-xs font-semibold text-red-700 mb-1">Rejection reason</p>
              <p className="text-red-700 text-xs leading-relaxed">{profile.rejection_reason}</p>
            </div>
          )}
          {profile.review_notes && (
            <div className="bg-white border border-border rounded-lg p-3">
              <p className="text-xs font-semibold text-warm-gray mb-1">Review notes</p>
              <p className="text-charcoal text-xs leading-relaxed">{profile.review_notes}</p>
            </div>
          )}
          {profile.reviewed_at && (
            <p className="text-xs text-warm-gray">
              Last reviewed {new Date(profile.reviewed_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          )}
          <p className="text-xs text-warm-gray">
            Submitted {new Date(profile.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-1 border-t border-border flex-wrap">
        {/* Pending → approve / reject */}
        {isPending && (
          <>
            <button type="button" onClick={() => onApprove(profile)} className="btn-primary flex-1 py-2 text-sm">
              ✓ Approve
            </button>
            <button
              type="button"
              onClick={() => onReject(profile)}
              className="flex-1 py-2 text-sm font-semibold rounded-lg border-2 border-red-200 text-red-600 hover:bg-red-50 transition-colors"
            >
              ✕ Reject
            </button>
          </>
        )}

        {/* Approved → suspend (if not suspended) */}
        {isApproved && !isSuspended && (
          <button
            type="button"
            onClick={() => onSuspend(profile)}
            className="flex-1 py-2 text-sm font-semibold rounded-lg border-2 border-amber-300 text-amber-700 hover:bg-amber-50 transition-colors"
          >
            ⚠ Suspend
          </button>
        )}

        {/* Approved + Suspended → lift suspension */}
        {isApproved && isSuspended && (
          <button
            type="button"
            onClick={() => onUnsuspend(profile)}
            className="flex-1 py-2 text-sm font-semibold rounded-lg border-2 border-sage/60 text-charcoal hover:bg-sage/10 transition-colors"
          >
            ↩ Lift Suspension
          </button>
        )}
      </div>
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────
export default function AdminProfessionalsPage() {
  const [activeTab, setActiveTab] = useState('pending')
  const [profiles, setProfiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Dialog state
  const [approveTarget, setApproveTarget] = useState(null)
  const [rejectTarget, setRejectTarget] = useState(null)
  const [rejectReason, setRejectReason] = useState('')
  const [suspendTarget, setSuspendTarget] = useState(null)
  const [suspendNotes, setSuspendNotes] = useState('')
  const [suspendDue, setSuspendDue] = useState('')
  const [unsuspendTarget, setUnsuspendTarget] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [toast, setToast] = useState(null)

  const fetchProfiles = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await adminApi.getAllProfessionals({ status: activeTab })
      setProfiles(res.profiles ?? [])
    } catch (err) {
      setError(err.message ?? 'Could not load profiles.')
    } finally {
      setLoading(false)
    }
  }, [activeTab])

  useEffect(() => { fetchProfiles() }, [fetchProfiles])

  // ── Approve ────────────────────────────────────────────────────────────
  async function confirmApprove() {
    if (!approveTarget) return
    setActionLoading(true)
    try {
      await adminApi.approveProfile(approveTarget.id)
      setToast({ message: `${approveTarget.full_name} approved as a verified professional.`, type: 'success' })
      await fetchProfiles()
    } catch (err) {
      setToast({ message: err.message ?? 'Approval failed.', type: 'error' })
    } finally {
      setActionLoading(false)
      setApproveTarget(null)
    }
  }

  // ── Reject ─────────────────────────────────────────────────────────────
  async function confirmReject() {
    if (!rejectTarget) return
    setActionLoading(true)
    try {
      await adminApi.rejectProfile(rejectTarget.id, rejectReason.trim() || null)
      setToast({ message: `${rejectTarget.full_name}'s application rejected.`, type: 'success' })
      await fetchProfiles()
    } catch (err) {
      setToast({ message: err.message ?? 'Rejection failed.', type: 'error' })
    } finally {
      setActionLoading(false)
      setRejectTarget(null)
      setRejectReason('')
    }
  }

  // ── Suspend ────────────────────────────────────────────────────────────
  async function confirmSuspend() {
    if (!suspendTarget) return
    setActionLoading(true)
    try {
      await adminApi.suspendProfile(suspendTarget.id, {
        notes: suspendNotes.trim() || undefined,
        reverification_due_at: suspendDue || undefined,
      })
      setToast({ message: `${suspendTarget.full_name} suspended.`, type: 'success' })
      await fetchProfiles()
    } catch (err) {
      setToast({ message: err.message ?? 'Suspension failed.', type: 'error' })
    } finally {
      setActionLoading(false)
      setSuspendTarget(null)
      setSuspendNotes('')
      setSuspendDue('')
    }
  }

  // ── Unsuspend ──────────────────────────────────────────────────────────
  async function confirmUnsuspend() {
    if (!unsuspendTarget) return
    setActionLoading(true)
    try {
      await adminApi.unsuspendProfile(unsuspendTarget.id)
      setToast({ message: `Suspension lifted for ${unsuspendTarget.full_name}.`, type: 'success' })
      await fetchProfiles()
    } catch (err) {
      setToast({ message: err.message ?? 'Could not lift suspension.', type: 'error' })
    } finally {
      setActionLoading(false)
      setUnsuspendTarget(null)
    }
  }

  const pendingCount = activeTab === 'pending' ? profiles.length : undefined

  return (
    <DashboardLayout title="Professional Approvals" breadcrumb={breadcrumb}>

      <DashboardPageHeader
        title="Professional Profiles"
        subtitle="Review, approve, reject and suspend professional applications"
      />

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-border" role="tablist">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`px-5 py-2.5 text-sm font-semibold rounded-t-lg border-b-2 transition-colors duration-150 -mb-px
              ${activeTab === tab.value
                ? 'border-terracotta text-terracotta bg-terracotta/5'
                : 'border-transparent text-warm-gray hover:text-charcoal hover:border-border'
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div role="alert" className="mb-5 flex gap-3 bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
          <span>⚠️</span>
          <span>{error} <button onClick={fetchProfiles} className="underline font-semibold">Retry</button></span>
        </div>
      )}

      {/* Info note for pending tab */}
      {!loading && !error && activeTab === 'pending' && (
        <div className="mb-6 flex gap-3 bg-white border border-border rounded-xl p-4 text-sm text-warm-gray">
          <span className="text-terracotta flex-shrink-0" aria-hidden="true">ℹ️</span>
          <span>
            Approved profiles appear in the public directory. Use the <strong className="text-charcoal">Approved</strong> tab to manage verified professionals, including suspension.
          </span>
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 rounded-full border-4 border-terracotta/30 border-t-terracotta animate-spin" role="status" aria-label="Loading profiles" />
        </div>
      ) : profiles.length === 0 ? (
        <div className="card overflow-hidden">
          <DashboardEmptyState
            title={`No ${activeTab} applications`}
            message={
              activeTab === 'pending'
                ? 'Applications awaiting review will appear here.'
                : activeTab === 'approved'
                  ? 'No approved professionals yet.'
                  : 'No rejected applications.'
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {profiles.map(profile => (
            <ProfileCard
              key={profile.id}
              profile={profile}
              onApprove={setApproveTarget}
              onReject={p => { setRejectTarget(p); setRejectReason('') }}
              onSuspend={p => { setSuspendTarget(p); setSuspendNotes(''); setSuspendDue('') }}
              onUnsuspend={setUnsuspendTarget}
            />
          ))}
        </div>
      )}

      {/* Approve confirm */}
      {approveTarget && (
        <ConfirmDialog
          title="Approve professional application?"
          message={`${approveTarget.full_name} will be approved as a verified professional and their profile will become visible in the public directory.`}
          confirmLabel={actionLoading ? 'Approving…' : 'Approve'}
          onConfirm={confirmApprove}
          onCancel={() => setApproveTarget(null)}
        />
      )}

      {/* Reject confirm */}
      {rejectTarget && (
        <ConfirmDialog
          title="Reject application?"
          message={`You are about to reject ${rejectTarget.full_name}'s application. Optionally provide a reason below.`}
          confirmLabel={actionLoading ? 'Rejecting…' : 'Reject'}
          confirmClass="inline-flex items-center justify-center px-5 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
          onConfirm={confirmReject}
          onCancel={() => { setRejectTarget(null); setRejectReason('') }}
        >
          <textarea
            value={rejectReason}
            onChange={e => setRejectReason(e.target.value)}
            placeholder="Optional: reason for rejection (shown to the applicant)"
            rows={3}
            className="w-full text-sm border border-border rounded-lg px-3 py-2.5 bg-white text-charcoal placeholder:text-warm-gray/60 focus:outline-none focus:ring-2 focus:ring-terracotta resize-none"
            aria-label="Rejection reason"
          />
        </ConfirmDialog>
      )}

      {/* Suspend confirm */}
      {suspendTarget && (
        <ConfirmDialog
          title="Suspend professional?"
          message={`${suspendTarget.full_name}'s profile will be hidden from the public directory and their Verified badge will be suppressed. Their account remains active.`}
          confirmLabel={actionLoading ? 'Suspending…' : 'Suspend'}
          confirmClass="inline-flex items-center justify-center px-5 py-2 bg-amber-600 text-white font-semibold rounded-lg hover:bg-amber-700 transition-colors"
          onConfirm={confirmSuspend}
          onCancel={() => { setSuspendTarget(null); setSuspendNotes(''); setSuspendDue('') }}
        >
          <div className="flex flex-col gap-3">
            <textarea
              value={suspendNotes}
              onChange={e => setSuspendNotes(e.target.value)}
              placeholder="Optional: internal notes about this suspension"
              rows={2}
              className="w-full text-sm border border-border rounded-lg px-3 py-2.5 bg-white text-charcoal placeholder:text-warm-gray/60 focus:outline-none focus:ring-2 focus:ring-terracotta resize-none"
              aria-label="Suspension notes"
            />
            <div className="flex flex-col gap-1">
              <label htmlFor="reverification-date" className="text-xs font-semibold text-warm-gray">
                Re-verification due date (optional)
              </label>
              <input
                id="reverification-date"
                type="date"
                value={suspendDue}
                onChange={e => setSuspendDue(e.target.value)}
                className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-white text-charcoal focus:outline-none focus:ring-2 focus:ring-terracotta"
              />
            </div>
          </div>
        </ConfirmDialog>
      )}

      {/* Unsuspend confirm */}
      {unsuspendTarget && (
        <ConfirmDialog
          title="Lift suspension?"
          message={`${unsuspendTarget.full_name}'s profile will be restored to the public directory and their Verified badge will be displayed again.`}
          confirmLabel={actionLoading ? 'Reinstating…' : 'Lift Suspension'}
          onConfirm={confirmUnsuspend}
          onCancel={() => setUnsuspendTarget(null)}
        />
      )}

      {/* Toast */}
      {toast && (
        <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />
      )}

    </DashboardLayout>
  )
}
