import { Link } from 'react-router-dom'
import { COURSES } from '../../data/courses.js'
import DashboardLayout from '../../components/dashboard/DashboardLayout.jsx'
import DashboardPageHeader from '../../components/dashboard/DashboardPageHeader.jsx'

const breadcrumb = [{ label: 'Admin', to: '/admin' }, { label: 'Course Management' }]

// ── Status badge ──────────────────────────────────────────────────────────────
function StatusBadge({ price }) {
  const isFree = price === 0
  return (
    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
      isFree ? 'bg-sage/25 text-charcoal' : 'bg-terracotta/10 text-terracotta'
    }`}>
      {isFree ? 'Free' : `ETB ${price}`}
    </span>
  )
}

// ── Level badge ───────────────────────────────────────────────────────────────
function LevelBadge({ level }) {
  const colours = {
    Beginner:     'bg-green-50 text-green-700',
    Intermediate: 'bg-amber-50 text-amber-700',
    Advanced:     'bg-red-50 text-red-700',
  }
  return (
    <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${colours[level] ?? 'bg-cream text-charcoal'}`}>
      {level}
    </span>
  )
}

export default function AdminCoursesPage() {
  return (
    <DashboardLayout title="Course Management" breadcrumb={breadcrumb}>
      <DashboardPageHeader
        title="Courses"
        subtitle={`${COURSES.length} demo courses loaded from static data. Real course management requires the backend API.`}
        action={
          <button
            type="button"
            disabled
            className="btn-primary text-sm py-2.5 px-5 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Create course — requires backend API"
          >
            + New Course
          </button>
        }
      />

      {/* Backend notice */}
      <div className="mb-6 flex gap-3 bg-white border border-border rounded-xl p-4 text-sm text-warm-gray">
        <span className="text-terracotta flex-shrink-0" aria-hidden="true">ℹ️</span>
        <span>
          <span className="font-semibold text-charcoal">Demo data — </span>
          courses below are loaded from{' '}
          <code className="text-xs bg-cream px-1.5 py-0.5 rounded font-mono">client/src/data/courses.js</code>.
          Create, edit, and delete actions require the{' '}
          <code className="text-xs bg-cream px-1.5 py-0.5 rounded font-mono">POST / PUT / DELETE /api/courses</code>{' '}
          endpoints.
        </span>
      </div>

      {/* Course table */}
      <div className="card overflow-hidden">
        {/* Header row */}
        <div className="hidden sm:grid sm:grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 px-5 py-3 bg-cream border-b border-border text-xs font-semibold uppercase tracking-wider text-warm-gray">
          <span>Title</span>
          <span>Category</span>
          <span>Level</span>
          <span>Price</span>
          <span>Actions</span>
        </div>

        {/* Rows */}
        <ul role="list" className="divide-y divide-border">
          {COURSES.map((course) => (
            <li key={course.id} className="flex flex-col sm:grid sm:grid-cols-[2fr_1fr_1fr_1fr_auto] gap-2 sm:gap-4 px-5 py-4 items-start sm:items-center hover:bg-cream/50 transition-colors duration-100">
              {/* Title */}
              <div>
                <p className="text-sm font-semibold text-charcoal leading-snug">{course.title}</p>
                <p className="text-xs text-warm-gray mt-0.5">{course.lessonCount} lessons · {course.duration}</p>
              </div>
              {/* Category */}
              <span className="text-xs text-warm-gray leading-snug hidden sm:block">{course.category}</span>
              {/* Level */}
              <div className="hidden sm:block"><LevelBadge level={course.level} /></div>
              {/* Price */}
              <div className="hidden sm:block"><StatusBadge price={course.price} /></div>
              {/* Actions */}
              <div className="flex items-center gap-2">
                <Link
                  to={`/courses/${course.id}`}
                  className="text-xs font-medium text-terracotta hover:text-terracotta-hover transition-colors"
                  aria-label={`View ${course.title}`}
                >
                  View
                </Link>
                <button
                  type="button"
                  disabled
                  className="text-xs font-medium text-warm-gray disabled:opacity-40 disabled:cursor-not-allowed"
                  title="Edit — requires backend API"
                >
                  Edit
                </button>
                <button
                  type="button"
                  disabled
                  className="text-xs font-medium text-red-400 disabled:opacity-40 disabled:cursor-not-allowed"
                  title="Delete — requires backend API"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </DashboardLayout>
  )
}
