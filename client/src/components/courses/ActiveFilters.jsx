/**
 * ActiveFilters — shows chips for each active filter and a Reset All button.
 * Only renders when at least one filter is active.
 */
export default function ActiveFilters({ filters, onRemove, onReset }) {
  const chips = []

  if (filters.search)   chips.push({ key: 'search',   label: `"${filters.search}"` })
  if (filters.category) chips.push({ key: 'category', label: filters.category })
  if (filters.level)    chips.push({ key: 'level',    label: filters.level })
  if (filters.format)   chips.push({ key: 'format',   label: filters.format })
  if (filters.price)    chips.push({ key: 'price',    label: filters.price === 'free' ? 'Free only' : 'Paid only' })

  if (chips.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-2" role="region" aria-label="Active filters">
      <span className="text-xs font-semibold text-warm-gray uppercase tracking-wide">
        Filters:
      </span>
      {chips.map((chip) => (
        <button
          key={chip.key}
          type="button"
          onClick={() => onRemove(chip.key)}
          className="inline-flex items-center gap-1.5 px-3 py-1 bg-terracotta/10 text-terracotta
                     text-xs font-medium rounded-full hover:bg-terracotta/20 transition-colors duration-150"
          aria-label={`Remove filter: ${chip.label}`}
        >
          {chip.label}
          <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>
      ))}
      <button
        type="button"
        onClick={onReset}
        className="text-xs font-medium text-warm-gray underline underline-offset-2 hover:text-charcoal transition-colors ml-1"
      >
        Reset all
      </button>
    </div>
  )
}
