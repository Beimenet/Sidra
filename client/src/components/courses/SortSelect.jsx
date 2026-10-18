export const SORT_OPTIONS = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'price-asc',   label: 'Price: Low to High' },
  { value: 'price-desc',  label: 'Price: High to Low' },
  { value: 'newest',      label: 'Newest' },
]

export default function SortSelect({ value, onChange }) {
  return (
    <div className="flex items-center gap-2">
      <label htmlFor="sort-select" className="text-sm text-warm-gray whitespace-nowrap font-medium">
        Sort by:
      </label>
      <select
        id="sort-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="text-sm text-charcoal bg-white border border-border rounded-lg px-3 py-2
                   focus:outline-none focus:ring-2 focus:ring-terracotta focus:border-transparent
                   cursor-pointer"
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}
