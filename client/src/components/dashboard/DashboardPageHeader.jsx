/**
 * DashboardPageHeader — section heading used inside a dashboard page body.
 *
 * Props:
 *   title    — section title
 *   subtitle — optional supporting text
 *   action   — optional JSX (e.g. a button) aligned to the right
 */
export default function DashboardPageHeader({ title, subtitle, action }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
      <div>
        <h2 className="text-lg font-bold text-charcoal">{title}</h2>
        {subtitle && <p className="text-sm text-warm-gray mt-0.5">{subtitle}</p>}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  )
}
