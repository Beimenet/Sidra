import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { adminApi } from '../../services/api.js'
import DashboardLayout from '../../components/dashboard/DashboardLayout.jsx'
import DashboardStatCard from '../../components/dashboard/DashboardStatCard.jsx'
import DashboardEmptyState from '../../components/dashboard/DashboardEmptyState.jsx'
import DashboardPageHeader from '../../components/dashboard/DashboardPageHeader.jsx'

// ── Icons ─────────────────────────────────────────────────────────────────────
const icons = {
  users: (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
    </svg>
  ),
  user: (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
    </svg>
  ),
  verified: (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
    </svg>
  ),
  courses: (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
    </svg>
  ),
  pending: (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  ),
  enrollments: (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.627 48.627 0 0 1 12 20.904a48.627 48.627 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 3.741-1.342m-7.482 0c-.36 1.095-.413 2.266-.413 2.266" />
    </svg>
  ),
}

// ── Role badge colours ─────────────────────────────────────────────────────────
const ROLE_BADGE = {
  registration: 'bg-sage/25 text-charcoal',
  enrollment: 'bg-terracotta/10 text-terracotta',
  professional_application: 'bg-amber-50 text-amber-700',
}

const ROLE_LABEL = {
  registration: 'Registration',
  enrollment: 'Enrolment',
  professional_application: 'Application',
}

// ── Quick action card ─────────────────────────────────────────────────────────
function QuickAction({ to, icon, label, description }) {
  return (
    <Link to={to} className="card p-5 flex items-start gap-4 hover:shadow-md hover:border-terracotta/30 transition-all duration-150 group">
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

// ── Pending application row ───────────────────────────────────────────────────
function PendingRow({ profile }) {
  return (
    <div className="flex items-center gap-3 px-5 py-3 hover:bg-cream/50 transition-colors">
      <div className="w-8 h-8 rounded-full bg-terracotta/15 text-terracotta text-xs font-bold flex items-center justify-center flex-shrink-0 select-none">
        {(profile.full_name ?? '?')[0].toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-charcoal truncate">{profile.full_name}</p>
        <p className="text-xs text-warm-gray truncate">{profile.specialization}</p>
      </div>
      <Link to="/admin/professionals" className="text-xs font-semibold text-terracotta hover:text-terracotta-hover transition-colors flex-shrink-0">
        Review →
      </Link>
    </div>
  )
}

// ── Activity row ──────────────────────────────────────────────────────────────
function ActivityRow({ item }) {
  const badge = ROLE_BADGE[item.event_type] ?? 'bg-cream text-charcoal'
  const label = ROLE_LABEL[item.event_type] ?? item.event_type
  const date = new Date(item.occurred_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
  return (
    <div className="flex items-center gap-3 px-5 py-3 hover:bg-cream/50 transition-colors">
      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${badge}`}>{label}</span>
      <p className="flex-1 text-sm text-charcoal truncate">{item.label}</p>
      <span className="text-xs text-warm-gray flex-shrink-0">{date}</span>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function AdminOverviewPage() {
  const { user } = useAuth()

  const [stats, setStats] = useState(null)
  const [pending, setPending] = useState([])
  const [activity, setActivity] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [statsRes, pendingRes, activityRes] = await Promise.all([
        adminApi.getStats(),
        adminApi.getPendingProfessionals(),
        adminApi.getRecentActivity(10),
      ])
      setStats(statsRes.stats)
      setPending(pendingRes.profiles ?? [])
      setActivity(activityRes.activity ?? [])
    } catch (err) {
      setError(err.message ?? 'Could not load dashboard data.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

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
        {error && (
          <div role="alert" className="mt-4 flex gap-3 bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
            <span aria-hidden="true">⚠️</span>
            <span>{error} <button onClick={load} className="underline font-semibold">Retry</button></span>
          </div>
        )}
      </div>

      {/* ── Statistics cards ─────────────────────────────────────────────── */}
      <section aria-labelledby="stats-heading" className="mb-10">
        <h3 id="stats-heading" className="text-sm font-semibold uppercase tracking-wider text-warm-gray mb-4">
          Platform Overview
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <DashboardStatCard label="Total Users" loading={loading} value={stats?.users?.total} icon={icons.users} accent="bg-terracotta/10 text-terracotta" />
          <DashboardStatCard label="Active" loading={loading} value={stats?.users?.active} icon={icons.user} accent="bg-sage/20 text-charcoal" />
          <DashboardStatCard label="Professionals" loading={loading} value={stats?.users?.by_role?.professional} icon={icons.verified} accent="bg-terracotta/10 text-terracotta-hover" />
          <DashboardStatCard label="Approved Pros" loading={loading} value={stats?.professionals?.approved} icon={icons.verified} accent="bg-sage/20 text-charcoal" />
          <DashboardStatCard label="Pending Reviews" loading={loading} value={stats?.professionals?.pending_applications} icon={icons.pending} accent="bg-amber-50 text-amber-600" />
          <DashboardStatCard label="Courses" loading={loading} value={stats?.courses?.total} icon={icons.courses} accent="bg-sage/20 text-charcoal" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
          <DashboardStatCard label="Mothers" loading={loading} value={stats?.users?.by_role?.mother} icon={icons.user} accent="bg-terracotta/10 text-terracotta" />
          <DashboardStatCard label="Fathers" loading={loading} value={stats?.users?.by_role?.father} icon={icons.user} accent="bg-terracotta/10 text-terracotta" />
          <DashboardStatCard label="Legal Guardians" loading={loading} value={stats?.users?.by_role?.legal_guardian} icon={icons.user} accent="bg-terracotta/10 text-terracotta" />
        </div>
      </section>

      {/* ── Two-column lower section ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">

        {/* Pending professional applications */}
        <section className="card overflow-hidden" aria-labelledby="pending-heading">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h3 id="pending-heading" className="text-sm font-semibold text-charcoal">
              Pending Professional Applications
              {!loading && pending.length > 0 && (
                <span className="ml-2 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">{pending.length}</span>
              )}
            </h3>
            <Link to="/admin/professionals" className="text-xs font-semibold text-terracotta hover:text-terracotta-hover transition-colors">
              View all →
            </Link>
          </div>
          {loading ? (
            <div className="px-5 py-8 flex justify-center">
              <div className="w-6 h-6 rounded-full border-4 border-terracotta/30 border-t-terracotta animate-spin" role="status" aria-label="Loading" />
            </div>
          ) : pending.length === 0 ? (
            <DashboardEmptyState title="No pending applications" message="Professional applications awaiting review will appear here." />
          ) : (
            <ul className="divide-y divide-border" role="list">
              {pending.slice(0, 5).map(p => (
                <li key={p.id}><PendingRow profile={p} /></li>
              ))}
            </ul>
          )}
        </section>

        {/* Recent activity */}
        <section className="card overflow-hidden" aria-labelledby="activity-heading">
          <div className="px-5 py-4 border-b border-border">
            <h3 id="activity-heading" className="text-sm font-semibold text-charcoal">Recent Activity</h3>
          </div>
          {loading ? (
            <div className="px-5 py-8 flex justify-center">
              <div className="w-6 h-6 rounded-full border-4 border-terracotta/30 border-t-terracotta animate-spin" role="status" aria-label="Loading" />
            </div>
          ) : activity.length === 0 ? (
            <DashboardEmptyState title="No activity yet" message="Platform activity will appear here as users register and enrol." />
          ) : (
            <ul className="divide-y divide-border" role="list">
              {activity.map((item, i) => (
                <li key={`${item.event_type}-${item.entity_id}-${i}`}><ActivityRow item={item} /></li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* ── Quick actions ─────────────────────────────────────────────────── */}
      <section aria-labelledby="actions-heading">
        <DashboardPageHeader title="Quick Actions" subtitle="Jump to the most common admin tasks" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickAction to="/admin/users" label="Manage Users" description="View, search, and manage registered users" icon={icons.users} />
          <QuickAction to="/admin/professionals" label="Review Professionals" description="Approve or reject professional applications" icon={icons.verified} />
          <QuickAction to="/admin/courses" label="Manage Courses" description="Create, edit, and publish courses and lessons" icon={icons.courses} />
          <QuickAction to="/admin/resources" label="Manage Resources" description="Organise external resources and learning materials" icon={icons.pending} />
        </div>
      </section>

    </DashboardLayout>
  )
}
