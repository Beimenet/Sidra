import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { COURSES } from '../../data/courses.js'
import DashboardLayout from '../../components/dashboard/DashboardLayout.jsx'
import DashboardStatCard from '../../components/dashboard/DashboardStatCard.jsx'
import DashboardEmptyState from '../../components/dashboard/DashboardEmptyState.jsx'
import DashboardPageHeader from '../../components/dashboard/DashboardPageHeader.jsx'

// ── Stat icons ────────────────────────────────────────────────────────────────
function UsersIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
    </svg>
  )
}
function ParentsIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
    </svg>
  )
}
function ProfessionalsIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
    </svg>
  )
}
function CoursesIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
    </svg>
  )
}
function PendingIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  )
}

// ── Quick action card ─────────────────────────────────────────────────────────
function QuickAction({ to, icon, label, description }) {
  return (
    <Link
      to={to}
      className="card p-5 flex items-start gap-4 hover:shadow-md hover:border-terracotta/30 transition-all duration-150 group"
    >
      <div className="w-10 h-10 rounded-xl bg-terracotta/10 text-terracotta flex items-center justify-center flex-shrink-0 group-hover:bg-terracotta group-hover:text-white transition-colors duration-150">
        {icon}
      </div>
      <div>
        <p className="text-sm font-semibold text-charcoal group-hover:text-terracotta transition-colors">{label}</p>
        <p className="text-xs text-warm-gray mt-0.5 leading-snug">{description}</p>
      </div>
    </Link>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function AdminOverviewPage() {
  const { user } = useAuth()

  // Course count from static data — real value comes from API when backend is ready
  const publishedCourseCount = COURSES.length

  const breadcrumb = [{ label: 'Admin' }, { label: 'Overview' }]

  return (
    <DashboardLayout title="Overview" breadcrumb={breadcrumb}>

      {/* ── Welcome ──────────────────────────────────────────────────────── */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-charcoal">
          Welcome to Sidra Administration
          {user?.name ? `, ${user.name.split(' ')[0]}` : ''}
        </h2>
        <p className="mt-1 text-warm-gray">
          Manage learning resources, users, and professional applications from one place.
        </p>

        {/* Dev notice */}
        {user?._devOnly && (
          <div className="mt-4 flex gap-3 bg-white border border-border rounded-xl p-4 text-sm text-warm-gray">
            <span className="text-terracotta flex-shrink-0" aria-hidden="true">ℹ️</span>
            <div>
              <span className="font-semibold text-charcoal">Development session — </span>
              statistics below reflect demo data only. Real counts require the backend API and PostgreSQL database.
            </div>
          </div>
        )}
      </div>

      {/* ── Statistics cards ─────────────────────────────────────────────── */}
      <section aria-labelledby="stats-heading" className="mb-10">
        <h3 id="stats-heading" className="text-sm font-semibold uppercase tracking-wider text-warm-gray mb-4">
          Platform Overview
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          <DashboardStatCard
            label="Total Users"
            value={null}
            icon={<UsersIcon />}
            accent="bg-terracotta/10 text-terracotta"
            note="Requires backend API"
          />
          <DashboardStatCard
            label="Parents"
            value={null}
            icon={<ParentsIcon />}
            accent="bg-sage/20 text-charcoal"
            note="Requires backend API"
          />
          <DashboardStatCard
            label="Professionals"
            value={null}
            icon={<ProfessionalsIcon />}
            accent="bg-terracotta/10 text-terracotta-hover"
            note="Requires backend API"
          />
          <DashboardStatCard
            label="Published Courses"
            value={publishedCourseCount}
            icon={<CoursesIcon />}
            accent="bg-sage/20 text-charcoal"
            note="Demo data (static)"
          />
          <DashboardStatCard
            label="Pending Applications"
            value={null}
            icon={<PendingIcon />}
            accent="bg-amber-50 text-amber-600"
            note="Requires backend API"
          />
        </div>
      </section>

      {/* ── Two-column lower section ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">

        {/* Pending professional applications */}
        <section className="card overflow-hidden" aria-labelledby="pending-heading">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h3 id="pending-heading" className="text-sm font-semibold text-charcoal">
              Pending Professional Applications
            </h3>
            <Link
              to="/admin/professionals"
              className="text-xs font-semibold text-terracotta hover:text-terracotta-hover transition-colors"
            >
              View all →
            </Link>
          </div>
          <DashboardEmptyState
            title="No pending applications"
            message="Professional applications awaiting review will appear here once the application feature and backend API are connected."
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-warm-gray" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
              </svg>
            }
          />
        </section>

        {/* Recent activity */}
        <section className="card overflow-hidden" aria-labelledby="activity-heading">
          <div className="px-5 py-4 border-b border-border">
            <h3 id="activity-heading" className="text-sm font-semibold text-charcoal">
              Recent Activity
            </h3>
          </div>
          <DashboardEmptyState
            title="No activity yet"
            message="Platform activity such as new registrations, enrolments, and content changes will appear here once activity tracking is connected to the backend."
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-warm-gray" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            }
          />
        </section>
      </div>

      {/* ── Quick actions ─────────────────────────────────────────────────── */}
      <section aria-labelledby="actions-heading">
        <DashboardPageHeader
          title="Quick Actions"
          subtitle="Jump to the most common admin tasks"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickAction
            to="/admin/users"
            label="Manage Users"
            description="View, search, and manage registered users"
            icon={<UsersIcon />}
          />
          <QuickAction
            to="/admin/professionals"
            label="Review Professionals"
            description="Approve or reject professional applications"
            icon={<ProfessionalsIcon />}
          />
          <QuickAction
            to="/admin/courses"
            label="Manage Courses"
            description="Create, edit, and publish courses and lessons"
            icon={<CoursesIcon />}
          />
          <QuickAction
            to="/admin/resources"
            label="Manage Resources"
            description="Organise external resources and learning materials"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
              </svg>
            }
          />
        </div>
      </section>

    </DashboardLayout>
  )
}
