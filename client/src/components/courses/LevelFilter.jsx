import { LEVELS } from '../../data/courses.js'

export default function LevelFilter({ selected, onChange }) {
  return (
    <fieldset>
      <legend className="text-xs font-semibold text-charcoal uppercase tracking-wider mb-3">
        Level
      </legend>
      <ul className="flex flex-col gap-1.5">
        <li>
          <label className="flex items-center gap-2.5 cursor-pointer group">
            <input
              type="radio"
              name="level"
              value=""
              checked={selected === ''}
              onChange={() => onChange('')}
              className="accent-terracotta w-4 h-4 cursor-pointer"
            />
            <span className="text-sm text-charcoal group-hover:text-terracotta transition-colors">
              All Levels
            </span>
          </label>
        </li>
        {LEVELS.map((lvl) => (
          <li key={lvl}>
            <label className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="radio"
                name="level"
                value={lvl}
                checked={selected === lvl}
                onChange={() => onChange(lvl)}
                className="accent-terracotta w-4 h-4 cursor-pointer"
              />
              <span className="text-sm text-charcoal group-hover:text-terracotta transition-colors">
                {lvl}
              </span>
            </label>
          </li>
        ))}
      </ul>
    </fieldset>
  )
}
