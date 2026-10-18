import { CATEGORIES } from '../../data/courses.js'

export default function CategoryFilter({ selected, onChange }) {
  return (
    <fieldset>
      <legend className="text-xs font-semibold text-charcoal uppercase tracking-wider mb-3">
        Category
      </legend>
      <ul className="flex flex-col gap-1.5">
        <li>
          <label className="flex items-center gap-2.5 cursor-pointer group">
            <input
              type="radio"
              name="category"
              value=""
              checked={selected === ''}
              onChange={() => onChange('')}
              className="accent-terracotta w-4 h-4 cursor-pointer"
            />
            <span className="text-sm text-charcoal group-hover:text-terracotta transition-colors">
              All Categories
            </span>
          </label>
        </li>
        {CATEGORIES.map((cat) => (
          <li key={cat}>
            <label className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="radio"
                name="category"
                value={cat}
                checked={selected === cat}
                onChange={() => onChange(cat)}
                className="accent-terracotta w-4 h-4 cursor-pointer"
              />
              <span className="text-sm text-charcoal group-hover:text-terracotta transition-colors leading-snug">
                {cat}
              </span>
            </label>
          </li>
        ))}
      </ul>
    </fieldset>
  )
}
