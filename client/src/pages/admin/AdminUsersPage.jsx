import { useState, useEffect, useCallback } from 'react'
import { adminApi } from '../../services/api.js'
import { useAuth } from '../../context/AuthContext.jsx'
import DashboardLayout from '../../components/dashboard/DashboardLayout.jsx'
import DashboardPageHeader from '../../components/dashboard/DashboardPageHeader.jsx'
import DashboardEmptyState from '../../components/dashboard/DashboardEmptyState.jsx'

const breadcrumb = [{ label: 'Admin', to: '/admin' }, { label: 'User Management' }]

const VALID_ROLES = ['mother', 'father', 'legal_guardian', 'professional', 'admin']

// ── Role badge ─────────────────────────────────────────────────────────────
function RoleBadge({ role }) {
  const colours = {
    mother: 'bg-terracotta/10 text-terracotta',
    father: 'bg-terracotta/10 text-terracotta',
    legal_guardian: 'bg-sage/25 text-charcoal',
    professional: 'bg-blue-50 text-blue-700',
    admin: 'bg-charcoal/15 text-charcoal',
  }
  const labels = {
    mother: 'Mother', father: 'Father', legal_guardian: 'Legal Guardian',
    professional: 'Professional', admin: 'Admin',
  }
  return (
    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${colours[role] ?? 'bg-cream text-charcoal'}`}>
      {labels[role] ?? role}
    </span>
  )
}

// ── Status badge ───────────────────────────────────────────────────────────
function StatusBadge({ active }) {
  return (
    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${active ? 'bg-sage/25 text-charcoal' : 'bg-red-50 text-red-700'}`}>
      {active ? 'Active' : 'Inactive'}
    </span>
  )
}

// ── Confirm dialog ─────────────────────────────────────────────────────────
function ConfirmDialog({ title, message, confirmLabel, confirmClass = 'btn-primary', onConfirm, onCancel, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/50 backdrop-blur-sm"
      role="dialog" aria-modal="true" aria-labelledby="confirm-title">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 flex flex-col gap-4">
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

// ── Page ───────────────────────────────────────────────────────────────────
export default function AdminUsersPage() {
  const { user: currentUser } = useAuth()

  // List state
  const [users, setUsers] = useState([])
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Filter / pagination
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [activeFilter, setActiveFilter] = useState('')
  const [sort, setSort] = useState('newest')
  const [page, setPage] = useState(1)
  const LIMIT = 15

  // Action modals
  const [statusTarget, setStatusTarget] = useState(null)  // { user, newStatus }
  const [roleTarget, setRoleTarget] = useState(null)  // { user }
  const [newRole, setNewRole] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [toast, setToast] = useState(null)  // { message, type }

  // ── Fetch users ────────────────────────────────────────────────────────
  const fetchUsers = useCallback(async (overridePage) => {
    setLoading(true)
    setError('')
    try {
      const activePage = overridePage ?? page
      const isActiveParam = activeFilter === 'active' ? true : activeFilter === 'inactive' ? false : undefined
      const res = await adminApi.listUsers({ search, role: roleFilter, is_active: isActiveParam, sort, page: activePage, limit: LIMIT })
      setUsers(res.users ?? [])
      setTotal(res.total ?? 0)
      setPages(res.pages ?? 1)
    } catch (err) {
      setError(err.message ?? 'Could not load users.')
    } finally {
      setLoading(false)
    }
  }, [search, roleFilter, activeFilter, sort, page])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  // Reset page to 1 when filters change — pass 1 directly to avoid stale page fetch
  useEffect(() => {
    if (page !== 1) {
      setPage(1)
      // fetchUsers will be called again when page state updates via the effect above
    } else {
      // If already on page 1, trigger a fresh fetch directly
      fetchUsers(1)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, roleFilter, activeFilter, sort])

  // ── Status change ──────────────────────────────────────────────────────
  async function confirmStatusChange() {
    if (!statusTarget) return
    setActionLoading(true)
    try {
      await adminApi.setStatus(statusTarget.user.id, statusTarget.newStatus)
      setToast({ message: `Account ${statusTarget.newStatus ? 'activated' : 'deactivated'} successfully.`, type: 'success' })
      await fetchUsers()
    } catch (err) {
      setToast({ message: err.message ?? 'Action failed.', type: 'error' })
    } finally {
      setActionLoading(false)
      setStatusTarget(null)
    }
  }

  // ── Role change ────────────────────────────────────────────────────────
  async function confirmRoleChange() {
    if (!roleTarget || !newRole) return
    setActionLoading(true)
    try {
      await adminApi.setRole(roleTarget.id, newRole)
      setToast({ message: `Role updated to '${newRole}'.`, type: 'success' })
      await fetchUsers()
    } catch (err) {
      setToast({ message: err.message ?? 'Role change failed.', type: 'error' })
    } finally {
      setActionLoading(false)
      setRoleTarget(null)
      setNewRole('')
    }
  }

  const isSelf = (u) => u.id === currentUser?.id

  return (
    <DashboardLayout title="User Management" breadcrumb={breadcrumb}>

      <DashboardPageHeader
        title="Users"
        subtitle={loading ? 'Loading…' : `${total} user${total !== 1 ? 's' : ''} in total`}
      />

      {/* ── Error banner ────────────────────────────────────────────────── */}
      {error && (
        <div role="alert" className="mb-5 flex gap-3 bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
          <span>⚠️</span>
          <span>{error} <button onClick={fetchUsers} className="underline font-semibold">Retry</button></span>
        </div>
      )}

      {/* ── Filters ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none" aria-hidden="true">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-warm-gray" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
          </span>
          <input
            type="search"
            placeholder="Search by name or email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-border rounded-lg bg-white text-charcoal placeholder:text-warm-gray/60 focus:outline-none focus:ring-2 focus:ring-terracotta"
            aria-label="Search users"
          />
        </div>

        {/* Role filter */}
        <select
          value={roleFilter}
          onChange={e => setRoleFilter(e.target.value)}
          className="text-sm border border-border rounded-lg px-3 py-2.5 bg-white text-charcoal focus:outline-none focus:ring-2 focus:ring-terracotta"
          aria-label="Filter by role"
        >
          <option value="">All roles</option>
          {VALID_ROLES.map(r => <option key={r} value={r}>{r.replace('_', ' ')}</option>)}
        </select>

        {/* Status filter */}
        <select
          value={activeFilter}
          onChange={e => setActiveFilter(e.target.value)}
          className="text-sm border border-border rounded-lg px-3 py-2.5 bg-white text-charcoal focus:outline-none focus:ring-2 focus:ring-terracotta"
          aria-label="Filter by status"
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>

        {/* Sort */}
        <select
          value={sort}
          onChange={e => setSort(e.target.value)}
          className="text-sm border border-border rounded-lg px-3 py-2.5 bg-white text-charcoal focus:outline-none focus:ring-2 focus:ring-terracotta"
          aria-label="Sort order"
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
        </select>
      </div>

      {/* ── User table ──────────────────────────────────────────────────── */}
      <div className="card overflow-hidden mb-6">
        {/* Header row */}
        <div className="hidden sm:grid sm:grid-cols-[2fr_2fr_1fr_1fr_auto] gap-4 px-5 py-3 bg-cream border-b border-border text-xs font-semibold uppercase tracking-wider text-warm-gray">
          <span>Name</span><span>Email</span><span>Role</span><span>Status</span><span>Actions</span>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 rounded-full border-4 border-terracotta/30 border-t-terracotta animate-spin" role="status" aria-label="Loading users" />
          </div>
        ) : users.length === 0 ? (
          <DashboardEmptyState
            title="No users found"
            message="No users match your current filters. Try adjusting the search or filter options."
            action={{ label: 'Clear filters', onClick: () => { setSearch(''); setRoleFilter(''); setActiveFilter('') } }}
          />
        ) : (
          <ul className="divide-y divide-border" role="list" aria-label="User list">
            {users.map(u => (
              <li key={u.id}
                className="flex flex-col sm:grid sm:grid-cols-[2fr_2fr_1fr_1fr_auto] gap-2 sm:gap-4 px-5 py-4 items-start sm:items-center hover:bg-cream/40 transition-colors">
                {/* Name */}
                <div>
                  <p className="text-sm font-semibold text-charcoal">{u.full_name}</p>
                  <p className="text-xs text-warm-gray mt-0.5">
                    Joined {new Date(u.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                {/* Email */}
                <p className="text-sm text-warm-gray truncate hidden sm:block">{u.email}</p>
                {/* Role */}
                <div className="hidden sm:block"><RoleBadge role={u.role} /></div>
                {/* Status */}
                <div className="hidden sm:block"><StatusBadge active={u.is_active} /></div>
                {/* Actions */}
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Toggle status — disabled for self */}
                  <button
                    type="button"
                    disabled={isSelf(u)}
                    onClick={() => setStatusTarget({ user: u, newStatus: !u.is_active })}
                    title={isSelf(u) ? 'Cannot modify your own account' : u.is_active ? 'Deactivate' : 'Activate'}
                    className={`text-xs font-medium px-2.5 py-1 rounded-lg border transition-colors
                      ${isSelf(u)
                        ? 'opacity-30 cursor-not-allowed border-border text-warm-gray'
                        : u.is_active
                          ? 'border-red-200 text-red-600 hover:bg-red-50'
                          : 'border-sage/50 text-charcoal hover:bg-sage/10'
                      }`}
                  >
                    {u.is_active ? 'Deactivate' : 'Activate'}
                  </button>

                  {/* Change role — disabled for self */}
                  <button
                    type="button"
                    disabled={isSelf(u)}
                    onClick={() => { setRoleTarget(u); setNewRole(u.role) }}
                    title={isSelf(u) ? 'Cannot modify your own account' : 'Change role'}
                    className={`text-xs font-medium px-2.5 py-1 rounded-lg border border-border transition-colors
                      ${isSelf(u) ? 'opacity-30 cursor-not-allowed text-warm-gray' : 'text-charcoal hover:bg-cream'}`}
                  >
                    Role
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ── Pagination ───────────────────────────────────────────────────── */}
      {pages > 1 && (
        <nav aria-label="Pagination" className="flex items-center justify-between">
          <p className="text-sm text-warm-gray">
            Page {page} of {pages} · {total} users
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="text-sm px-3 py-1.5 rounded-lg border border-border hover:bg-cream disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >← Prev</button>
            <button
              type="button"
              onClick={() => setPage(p => Math.min(pages, p + 1))}
              disabled={page === pages}
              className="text-sm px-3 py-1.5 rounded-lg border border-border hover:bg-cream disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >Next →</button>
          </div>
        </nav>
      )}

      {/* ── Status confirm dialog ────────────────────────────────────────── */}
      {statusTarget && (
        <ConfirmDialog
          title={statusTarget.newStatus ? 'Activate account?' : 'Deactivate account?'}
          message={statusTarget.newStatus
            ? `This will re-activate ${statusTarget.user.full_name}'s account and allow them to log in.`
            : `This will deactivate ${statusTarget.user.full_name}'s account and immediately sign them out of all active sessions.`
          }
          confirmLabel={actionLoading ? 'Working…' : (statusTarget.newStatus ? 'Activate' : 'Deactivate')}
          confirmClass={statusTarget.newStatus ? 'btn-primary' : 'inline-flex items-center justify-center px-5 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors'}
          onConfirm={confirmStatusChange}
          onCancel={() => setStatusTarget(null)}
        />
      )}

      {/* ── Role change dialog ───────────────────────────────────────────── */}
      {roleTarget && (
        <ConfirmDialog
          title="Change user role"
          message={`Changing ${roleTarget.full_name}'s role. Select the new role below.`}
          confirmLabel={actionLoading ? 'Saving…' : 'Save role'}
          onConfirm={confirmRoleChange}
          onCancel={() => { setRoleTarget(null); setNewRole('') }}
        >
          <select
            value={newRole}
            onChange={e => setNewRole(e.target.value)}
            className="w-full text-sm border border-border rounded-lg px-3 py-2.5 bg-white text-charcoal focus:outline-none focus:ring-2 focus:ring-terracotta"
            aria-label="Select new role"
          >
            {VALID_ROLES.map(r => <option key={r} value={r}>{r.replace('_', ' ')}</option>)}
          </select>
        </ConfirmDialog>
      )}

      {/* ── Toast notification ───────────────────────────────────────────── */}
      {toast && (
        <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />
      )}

    </DashboardLayout>
  )
}
