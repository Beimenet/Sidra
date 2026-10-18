import { FORMATS } from '../../data/courses.js'

export default function FormatFilter({ selected, onChange }) {
  return (
    <fieldset>
      <legend className="text-xs font-semibold text-charcoal uppercase tracking-wider mb-3">
        Format
      </legend>
      <ul className="flex flex-col gap-1.5">
        <li>
          <label className="flex items-center gap-2.5 cursor-pointer group">
            <input
              type="radio"
              name="format"
              value=""
              checked={selected === ''}
              onChange={() => onChange('')}
              className="accent-terracotta w-4 h-4 cursor-pointer"
            />
            <span className="text-sm text-charcoal group-hover:text-terracotta transition-colors">
              All Formats
            </span>
          </label>
        </li>
        {FORMATS.map((fmt) => (
          <li key={fmt}>
            <label className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="radio"
                name="format"
                value={fmt}
                checked={selected === fmt}
                onChange={() => onChange(fmt)}
                className="accent-terracotta w-4 h-4 cursor-pointer"
              />
              <span className="text-sm text-charcoal group-hover:text-terracotta transition-colors">
                {fmt}
              </span>
            </label>
          </li>
        ))}
      </ul>
    </fieldset>
  )
}
