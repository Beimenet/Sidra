import DashboardLayout from '../../components/dashboard/DashboardLayout.jsx'
import DashboardPageHeader from '../../components/dashboard/DashboardPageHeader.jsx'
import DashboardEmptyState from '../../components/dashboard/DashboardEmptyState.jsx'

const breadcrumb = [{ label: 'Admin', to: '/admin' }, { label: 'User Management' }]

// ── Filter / search toolbar ───────────────────────────────────────────────────
function Toolbar() {
  return (
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
          placeholder="Search users by name or email…"
          disabled
          className="w-full pl-9 pr-4 py-2.5 text-sm border border-border rounded-lg bg-white text-charcoal
                     placeholder:text-warm-gray/60 focus:outline-none focus:ring-2 focus:ring-terracotta
                     disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Search users (requires backend)"
        />
      </div>

      {/* Role filter */}
      <select
        disabled
        className="text-sm border border-border rounded-lg px-3 py-2.5 bg-white text-warm-gray
                   focus:outline-none focus:ring-2 focus:ring-terracotta
                   disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Filter by role (requires backend)"
      >
        <option>All roles</option>
        <option>Parent</option>
        <option>Caregiver</option>
        <option>Professional</option>
      </select>

      {/* Add user — placeholder */}
      <button
        type="button"
        disabled
        className="btn-primary text-sm py-2.5 px-5 disabled:opacity-50 disabled:cursor-not-allowed"
        title="Requires backend API"
      >
        + Add User
      </button>
    </div>
  )
}

// ── Table skeleton ────────────────────────────────────────────────────────────
function TableSkeleton() {
  return (
    <div className="card overflow-hidden">
      {/* Table header */}
      <div className="grid grid-cols-4 gap-4 px-5 py-3 bg-cream border-b border-border text-xs font-semibold uppercase tracking-wider text-warm-gray">
        <span>Name</span>
        <span>Email</span>
        <span>Role</span>
        <span>Joined</span>
      </div>
      {/* Empty state inside table shell */}
      <DashboardEmptyState
        title="No users to display"
        message="User accounts will appear here once the backend API and PostgreSQL database are connected. The search, filter, and table above show the planned interface."
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-warm-gray" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
          </svg>
        }
      />
    </div>
  )
}

export default function AdminUsersPage() {
  return (
    <DashboardLayout title="User Management" breadcrumb={breadcrumb}>
      <DashboardPageHeader
        title="Users"
        subtitle="View and manage all registered parents, caregivers, and professionals."
      />

      {/* Backend notice */}
      <div className="mb-6 flex gap-3 bg-white border border-border rounded-xl p-4 text-sm text-warm-gray">
        <span className="text-terracotta flex-shrink-0" aria-hidden="true">ℹ️</span>
        <span>
          <span className="font-semibold text-charcoal">Backend required — </span>
          user data is not yet available. Connect the{' '}
          <code className="text-xs bg-cream px-1.5 py-0.5 rounded font-mono">GET /api/users</code>{' '}
          endpoint and PostgreSQL database to populate this page.
        </span>
      </div>

      <Toolbar />
      <TableSkeleton />
    </DashboardLayout>
  )
}
