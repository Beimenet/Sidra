import DashboardLayout from '../../components/dashboard/DashboardLayout.jsx'
import DashboardPageHeader from '../../components/dashboard/DashboardPageHeader.jsx'
import DashboardEmptyState from '../../components/dashboard/DashboardEmptyState.jsx'

const breadcrumb = [{ label: 'Admin', to: '/admin' }, { label: 'Reports' }]

const PLANNED_REPORTS = [
  { title: 'User Growth', description: 'New registrations over time, broken down by family role.' },
  { title: 'Course Enrolments', description: 'Enrolment counts per course and completion rates.' },
  { title: 'Professional Applications', description: 'Application volumes, approval rates, and turnaround times.' },
  { title: 'Revenue Summary', description: 'Paid course purchases and revenue by period.' },
  { title: 'Platform Activity', description: 'Daily active users, lesson completions, and session data.' },
]

export default function AdminReportsPage() {
  return (
    <DashboardLayout title="Reports" breadcrumb={breadcrumb}>
      <DashboardPageHeader
        title="Reports"
        subtitle="Platform analytics and reporting — available once the backend and database are connected."
      />

      {/* Backend notice */}
      <div className="mb-6 flex gap-3 bg-white border border-border rounded-xl p-4 text-sm text-warm-gray">
        <span className="text-terracotta flex-shrink-0" aria-hidden="true">ℹ️</span>
        <span>
          <span className="font-semibold text-charcoal">Backend required — </span>
          reports require real user, enrolment, and activity data from PostgreSQL.
          The planned report types are listed below.
        </span>
      </div>

      {/* Planned reports preview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {PLANNED_REPORTS.map((report) => (
          <div key={report.title} className="card p-5 opacity-60">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-terracotta/40" aria-hidden="true" />
              <p className="text-sm font-semibold text-charcoal">{report.title}</p>
            </div>
            <p className="text-xs text-warm-gray leading-relaxed">{report.description}</p>
            <p className="mt-3 text-xs font-medium text-warm-gray/60 uppercase tracking-wider">Planned</p>
          </div>
        ))}
      </div>

      <div className="card overflow-hidden">
        <DashboardEmptyState
          title="No report data available"
          message="Connect the backend API and database to generate platform reports. Charts and exportable data will appear here."
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-warm-gray" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
            </svg>
          }
        />
      </div>
    </DashboardLayout>
  )
}
