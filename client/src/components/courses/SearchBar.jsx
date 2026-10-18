export default function SearchBar({ value, onChange }) {
  return (
    <div className="relative w-full max-w-xl">
      <label htmlFor="course-search" className="sr-only">
        Search courses by title or description
      </label>
      {/* Search icon */}
      <span className="absolute inset-y-0 left-4 flex items-center pointer-events-none" aria-hidden="true">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-warm-gray" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
        </svg>
      </span>
      <input
        id="course-search"
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search courses by title or topic…"
        className="w-full pl-11 pr-4 py-3 bg-white border border-border rounded-xl text-charcoal placeholder:text-warm-gray/70
                   focus:outline-none focus:ring-2 focus:ring-terracotta focus:border-transparent
                   text-sm shadow-sm"
        autoComplete="off"
      />
      {/* Clear button */}
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute inset-y-0 right-3 flex items-center px-1 text-warm-gray hover:text-charcoal transition-colors"
          aria-label="Clear search"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  )
}
