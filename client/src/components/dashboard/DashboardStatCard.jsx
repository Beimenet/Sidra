/**
 * DashboardStatCard — reusable metric card for dashboard overview pages.
 *
 * Props:
 *   label     — metric name (string)
 *   value     — metric value (string | number | null)
 *   icon      — JSX SVG element
 *   accent    — Tailwind colour class for the icon background, e.g. 'bg-terracotta/10 text-terracotta'
 *   loading   — show skeleton state (boolean)
 *   note      — optional small caption below the value
 */
export default function DashboardStatCard({ label, value, icon, accent = 'bg-terracotta/10 text-terracotta', loading = false, note }) {
  return (
    <div className="card p-5 flex items-start gap-4">
      {/* Icon */}
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${accent}`}>
        {icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wider text-warm-gray mb-1">{label}</p>
        {loading ? (
          <div className="h-7 w-16 bg-border rounded animate-pulse" aria-label="Loading" />
        ) : (
          <p className="text-2xl font-bold text-charcoal leading-tight">
            {value ?? <span className="text-warm-gray text-base font-medium">—</span>}
          </p>
        )}
        {note && !loading && (
          <p className="text-xs text-warm-gray mt-1">{note}</p>
        )}
      </div>
    </div>
  )
}
