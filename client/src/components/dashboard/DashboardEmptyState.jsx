/**
 * DashboardEmptyState — reusable empty/pending state for dashboard sections.
 *
 * Props:
 *   icon     — JSX SVG element (optional, falls back to info icon)
 *   title    — heading text
 *   message  — supporting explanation
 *   action   — optional { label, onClick | href } for a CTA
 */
export default function DashboardEmptyState({ icon, title, message, action }) {
  const defaultIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-warm-gray" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
    </svg>
  )

  return (
    <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
      <div className="w-16 h-16 rounded-full bg-cream flex items-center justify-center mb-5 border border-border">
        {icon ?? defaultIcon}
      </div>
      <h3 className="text-base font-semibold text-charcoal mb-2">{title}</h3>
      <p className="text-sm text-warm-gray max-w-sm leading-relaxed">{message}</p>
      {action && (
        <div className="mt-5">
          {action.href ? (
            <a href={action.href} className="btn-primary text-sm py-2.5 px-5">{action.label}</a>
          ) : (
            <button type="button" onClick={action.onClick} className="btn-primary text-sm py-2.5 px-5">
              {action.label}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
