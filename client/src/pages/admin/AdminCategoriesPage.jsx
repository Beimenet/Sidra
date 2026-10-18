import { CATEGORIES } from '../../data/courses.js'
import DashboardLayout from '../../components/dashboard/DashboardLayout.jsx'
import DashboardPageHeader from '../../components/dashboard/DashboardPageHeader.jsx'

const breadcrumb = [{ label: 'Admin', to: '/admin' }, { label: 'Categories' }]

export default function AdminCategoriesPage() {
  return (
    <DashboardLayout title="Categories" breadcrumb={breadcrumb}>
      <DashboardPageHeader
        title="Course Categories"
        subtitle="Manage the categories used to organise courses across the platform."
        action={
          <button
            type="button"
            disabled
            className="btn-primary text-sm py-2.5 px-5 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Add category — requires backend API"
          >
            + Add Category
          </button>
        }
      />

      {/* Backend notice */}
      <div className="mb-6 flex gap-3 bg-white border border-border rounded-xl p-4 text-sm text-warm-gray">
        <span className="text-terracotta flex-shrink-0" aria-hidden="true">ℹ️</span>
        <span>
          <span className="font-semibold text-charcoal">Demo data — </span>
          categories below are loaded from{' '}
          <code className="text-xs bg-cream px-1.5 py-0.5 rounded font-mono">client/src/data/courses.js</code>.
          Edit and delete actions require the backend API.
        </span>
      </div>

      {/* Category list */}
      <div className="card overflow-hidden">
        <div className="hidden sm:grid sm:grid-cols-[1fr_auto] gap-4 px-5 py-3 bg-cream border-b border-border text-xs font-semibold uppercase tracking-wider text-warm-gray">
          <span>Category Name</span>
          <span>Actions</span>
        </div>
        <ul role="list" className="divide-y divide-border">
          {CATEGORIES.map((cat, i) => (
            <li key={cat} className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-cream/50 transition-colors">
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-full bg-terracotta/10 text-terracotta text-xs font-bold flex items-center justify-center flex-shrink-0">
                  {i + 1}
                </span>
                <span className="text-sm font-medium text-charcoal">{cat}</span>
              </div>
              <div className="flex items-center gap-3">
                <button type="button" disabled className="text-xs font-medium text-warm-gray disabled:opacity-40 disabled:cursor-not-allowed" title="Edit — requires backend">Edit</button>
                <button type="button" disabled className="text-xs font-medium text-red-400 disabled:opacity-40 disabled:cursor-not-allowed" title="Delete — requires backend">Delete</button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </DashboardLayout>
  )
}
