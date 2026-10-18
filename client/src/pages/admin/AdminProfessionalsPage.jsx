import DashboardLayout from '../../components/dashboard/DashboardLayout.jsx'
import DashboardPageHeader from '../../components/dashboard/DashboardPageHeader.jsx'
import DashboardEmptyState from '../../components/dashboard/DashboardEmptyState.jsx'

const breadcrumb = [{ label: 'Admin', to: '/admin' }, { label: 'Professional Approvals' }]

// ── Status tab bar ────────────────────────────────────────────────────────────
const TABS = ['Pending', 'Approved', 'Rejected']

function TabBar() {
  return (
    <div className="flex gap-1 mb-6 bg-cream rounded-xl p-1 w-fit" role="tablist" aria-label="Filter by approval status">
      {TABS.map((tab, i) => (
        <button
          key={tab}
          type="button"
          role="tab"
          disabled
          aria-selected={i === 0}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors duration-150
            ${i === 0
              ? 'bg-white text-charcoal shadow-sm'
              : 'text-warm-gray cursor-not-allowed opacity-60'}`}
        >
          {tab}
          {i === 0 && (
            <span className="ml-2 text-xs bg-terracotta/10 text-terracotta px-2 py-0.5 rounded-full">0</span>
          )}
        </button>
      ))}
    </div>
  )
}

export default function AdminProfessionalsPage() {
  return (
    <DashboardLayout title="Professional Approvals" breadcrumb={breadcrumb}>
      <DashboardPageHeader
        title="Professional Applications"
        subtitle="Review, approve, or reject applications from child-development professionals."
      />

      {/* Backend notice */}
      <div className="mb-6 flex gap-3 bg-white border border-border rounded-xl p-4 text-sm text-warm-gray">
        <span className="text-terracotta flex-shrink-0" aria-hidden="true">ℹ️</span>
        <span>
          <span className="font-semibold text-charcoal">Backend required — </span>
          professional applications are not yet available. Connect the{' '}
          <code className="text-xs bg-cream px-1.5 py-0.5 rounded font-mono">GET /api/professionals</code>{' '}
          and{' '}
          <code className="text-xs bg-cream px-1.5 py-0.5 rounded font-mono">PATCH /api/professionals/:id/verify</code>{' '}
          endpoints to populate and enable approvals.
        </span>
      </div>

      <TabBar />

      <div className="card overflow-hidden">
        <DashboardEmptyState
          title="No pending applications"
          message="Professional profile applications awaiting your review will appear here. Professionals can submit applications once the registration flow and backend are connected."
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-warm-gray" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
            </svg>
          }
        />
      </div>
    </DashboardLayout>
  )
}
