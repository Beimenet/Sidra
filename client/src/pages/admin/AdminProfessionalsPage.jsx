import { useState, useEffect, useCallback } from 'react'
import { adminApi } from '../../services/api.js'
import DashboardLayout from '../../components/dashboard/DashboardLayout.jsx'
import DashboardPageHeader from '../../components/dashboard/DashboardPageHeader.jsx'
import DashboardEmptyState from '../../components/dashboard/DashboardEmptyState.jsx'

const breadcrumb = [{ label: 'Admin', to: '/admin' }, { label: 'Professional Approvals' }]

// ── Status badge ───────────────────────────────────────────────────────────
function StatusBadge({ status }) {
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
function ProfileCard({ profile, onApprove, onReject }) {
  const [expanded, setExpanded] = useState(false)
  const isPending = profile.verification_status === 'pending'

  return (
    <div className="card p-5 flex flex-col gap-4">
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="w-11 h-11 rounded-full bg-terracotta/15 text-terracotta text-base font-bold flex items-center justify-center flex-shrink-0 select-none">
            {(profile.full_name ?? '?')[0].toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-semibold text-charcoal">{profile.full_name}</p>
            <p className="text-xs text-warm-gray">{profile.email}</p>
          </div>
        </div>
        <StatusBadge status={profile.verification_status} />
      </div>

      {/* Specialization */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-warm-gray uppercase tracking-wide">Specialty:</span>
        <span className="text-sm text-charcoal">{profile.specialization}</span>
      </div>

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
          {profile.rejection_reason && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-xs font-semibold text-red-700 mb-1">Rejection reason</p>
              <p className="text-red-700 text-xs leading-relaxed">{profile.rejection_reason}</p>
            </div>
          )}
          <p className="text-xs text-warm-gray">
            Submitted {new Date(profile.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
      )}

      {/* Actions — only shown for pending */}
      {isPending && (
        <div className="flex gap-3 pt-1 border-t border-border">
          <button
            type="button"
            onClick={() => onApprove(profile)}
            className="btn-primary flex-1 py-2 text-sm"
          >
            ✓ Approve
          </button>
          <button
            type="button"
            onClick={() => onReject(profile)}
            className="flex-1 py-2 text-sm font-semibold rounded-lg border-2 border-red-200 text-red-600 hover:bg-red-50 transition-colors"
          >
            ✕ Reject
          </button>
        </div>
      )}
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────
export default function AdminProfessionalsPage() {
  const [profiles, setProfiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Dialogs
  const [approveTarget, setApproveTarget] = useState(null)
  const [rejectTarget, setRejectTarget] = useState(null)
  const [rejectReason, setRejectReason] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [toast, setToast] = useState(null)

  const fetchProfiles = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await adminApi.getPendingProfessionals()
      setProfiles(res.profiles ?? [])
    } catch (err) {
      setError(err.message ?? 'Could not load applications.')
    } finally {
      setLoading(false)
    }
  }, [])

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

  return (
    <DashboardLayout title="Professional Approvals" breadcrumb={breadcrumb}>

      <DashboardPageHeader
        title="Pending Applications"
        subtitle={loading ? 'Loading…' : `${profiles.length} application${profiles.length !== 1 ? 's' : ''} awaiting review`}
      />

      {/* Error */}
      {error && (
        <div role="alert" className="mb-5 flex gap-3 bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
          <span>⚠️</span>
          <span>{error} <button onClick={fetchProfiles} className="underline font-semibold">Retry</button></span>
        </div>
      )}

      {/* Info note */}
      {!loading && !error && (
        <div className="mb-6 flex gap-3 bg-white border border-border rounded-xl p-4 text-sm text-warm-gray">
          <span className="text-terracotta flex-shrink-0" aria-hidden="true">ℹ️</span>
          <span>
            This page shows <strong className="text-charcoal">pending</strong> applications.
            Approved and rejected profiles appear in the public professional directory once approved.
          </span>
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 rounded-full border-4 border-terracotta/30 border-t-terracotta animate-spin" role="status" aria-label="Loading applications" />
        </div>
      ) : profiles.length === 0 ? (
        <div className="card overflow-hidden">
          <DashboardEmptyState
            title="No pending applications"
            message="Professional profile applications awaiting your review will appear here when professionals submit their applications."
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
            placeholder="Optional: reason for rejection (will be stored with the application)"
            rows={3}
            className="w-full text-sm border border-border rounded-lg px-3 py-2.5 bg-white text-charcoal placeholder:text-warm-gray/60 focus:outline-none focus:ring-2 focus:ring-terracotta resize-none"
            aria-label="Rejection reason"
          />
        </ConfirmDialog>
      )}

      {/* Toast */}
      {toast && (
        <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />
      )}

    </DashboardLayout>
  )
}
