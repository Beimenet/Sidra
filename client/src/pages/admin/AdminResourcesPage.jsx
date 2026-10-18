import { COURSES } from '../../data/courses.js'
import DashboardLayout from '../../components/dashboard/DashboardLayout.jsx'
import DashboardPageHeader from '../../components/dashboard/DashboardPageHeader.jsx'

const breadcrumb = [{ label: 'Admin', to: '/admin' }, { label: 'Resource Management' }]

// Flatten all resources from all courses into one list for the overview
const ALL_RESOURCES = COURSES.flatMap((course) =>
  course.resources.map((r) => ({ ...r, courseName: course.title }))
)

const TYPE_COLOURS = {
  article: 'bg-blue-50 text-blue-700',
  guide:   'bg-sage/25 text-charcoal',
  tool:    'bg-terracotta/10 text-terracotta',
  video:   'bg-amber-50 text-amber-700',
}

export default function AdminResourcesPage() {
  return (
    <DashboardLayout title="Resource Management" breadcrumb={breadcrumb}>
      <DashboardPageHeader
        title="Learning Resources"
        subtitle={`${ALL_RESOURCES.length} external resources linked across ${COURSES.length} demo courses.`}
        action={
          <button
            type="button"
            disabled
            className="btn-primary text-sm py-2.5 px-5 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Add resource — requires backend API"
          >
            + Add Resource
          </button>
        }
      />

      {/* Backend notice */}
      <div className="mb-6 flex gap-3 bg-white border border-border rounded-xl p-4 text-sm text-warm-gray">
        <span className="text-terracotta flex-shrink-0" aria-hidden="true">ℹ️</span>
        <span>
          <span className="font-semibold text-charcoal">Demo data — </span>
          resources below are sourced from{' '}
          <code className="text-xs bg-cream px-1.5 py-0.5 rounded font-mono">client/src/data/courses.js</code>.
          Full resource management requires the backend API.
        </span>
      </div>

      <div className="card overflow-hidden">
        <div className="hidden sm:grid sm:grid-cols-[2fr_1fr_1fr_auto] gap-4 px-5 py-3 bg-cream border-b border-border text-xs font-semibold uppercase tracking-wider text-warm-gray">
          <span>Resource</span>
          <span>Type</span>
          <span>Course</span>
          <span>Link</span>
        </div>
        <ul role="list" className="divide-y divide-border">
          {ALL_RESOURCES.map((r) => (
            <li key={r.id} className="flex flex-col sm:grid sm:grid-cols-[2fr_1fr_1fr_auto] gap-2 sm:gap-4 px-5 py-4 items-start sm:items-center hover:bg-cream/50 transition-colors">
              <div>
                <p className="text-sm font-medium text-charcoal leading-snug">{r.title}</p>
                {r.publisher && <p className="text-xs text-warm-gray mt-0.5">{r.publisher}</p>}
              </div>
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full w-fit ${TYPE_COLOURS[r.type] ?? 'bg-cream text-charcoal'}`}>
                {r.type}
              </span>
              <p className="text-xs text-warm-gray leading-snug hidden sm:block truncate max-w-[160px]" title={r.courseName}>
                {r.courseName}
              </p>
              <a
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-terracotta hover:text-terracotta-hover transition-colors"
                aria-label={`Open ${r.title} in new tab`}
              >
                Open ↗
              </a>
            </li>
          ))}
        </ul>
      </div>
    </DashboardLayout>
  )
}
