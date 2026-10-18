/**
 * priceFilter values:
 *   '' = all
 *   'free' = price === 0
 *   'paid' = price > 0
 */
export default function PriceFilter({ selected, onChange }) {
  const options = [
    { value: '', label: 'All Prices' },
    { value: 'free', label: 'Free only' },
    { value: 'paid', label: 'Paid only' },
  ]

  return (
    <fieldset>
      <legend className="text-xs font-semibold text-charcoal uppercase tracking-wider mb-3">
        Price
      </legend>
      <ul className="flex flex-col gap-1.5">
        {options.map((opt) => (
          <li key={opt.value}>
            <label className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="radio"
                name="price"
                value={opt.value}
                checked={selected === opt.value}
                onChange={() => onChange(opt.value)}
                className="accent-terracotta w-4 h-4 cursor-pointer"
              />
              <span className="text-sm text-charcoal group-hover:text-terracotta transition-colors">
                {opt.label}
              </span>
            </label>
          </li>
        ))}
      </ul>
    </fieldset>
  )
}
