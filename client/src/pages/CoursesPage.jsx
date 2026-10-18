import { useState, useMemo } from 'react'
import { COURSES } from '../data/courses.js'
import CourseCard from '../components/courses/CourseCard.jsx'
import SearchBar from '../components/courses/SearchBar.jsx'
import CategoryFilter from '../components/courses/CategoryFilter.jsx'
import LevelFilter from '../components/courses/LevelFilter.jsx'
import PriceFilter from '../components/courses/PriceFilter.jsx'
import FormatFilter from '../components/courses/FormatFilter.jsx'
import SortSelect from '../components/courses/SortSelect.jsx'
import ActiveFilters from '../components/courses/ActiveFilters.jsx'

const EMPTY_FILTERS = {
  search:   '',
  category: '',
  level:    '',
  price:    '',
  format:   '',
}

function applyFilters(courses, filters, sort) {
  let result = [...courses]

  // Search
  if (filters.search.trim()) {
    const q = filters.search.toLowerCase()
    result = result.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.shortDescription.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q)
    )
  }

  // Category
  if (filters.category) {
    result = result.filter((c) => c.category === filters.category)
  }

  // Level
  if (filters.level) {
    result = result.filter((c) => c.level === filters.level)
  }

  // Price
  if (filters.price === 'free') result = result.filter((c) => c.price === 0)
  if (filters.price === 'paid') result = result.filter((c) => c.price > 0)

  // Format
  if (filters.format) {
    result = result.filter((c) => c.format === filters.format)
  }

  // Sort
  if (sort === 'price-asc')  result.sort((a, b) => a.price - b.price)
  if (sort === 'price-desc') result.sort((a, b) => b.price - a.price)
  if (sort === 'newest')     result.sort((a, b) => b.id - a.id)
  // 'recommended' = default order (id ascending)

  return result
}

export default function CoursesPage() {
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const [sort, setSort]       = useState('recommended')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const filtered = useMemo(() => applyFilters(COURSES, filters, sort), [filters, sort])

  const hasActiveFilters = Object.values(filters).some(Boolean)

  function setFilter(key, value) {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  function removeFilter(key) {
    setFilters((prev) => ({ ...prev, [key]: '' }))
  }

  function resetFilters() {
    setFilters(EMPTY_FILTERS)
    setSort('recommended')
  }

  const FilterPanel = () => (
    <aside aria-label="Course filters" className="flex flex-col gap-6">
      <CategoryFilter selected={filters.category} onChange={(v) => setFilter('category', v)} />
      <hr className="border-border" />
      <LevelFilter    selected={filters.level}    onChange={(v) => setFilter('level', v)} />
      <hr className="border-border" />
      <PriceFilter    selected={filters.price}    onChange={(v) => setFilter('price', v)} />
      <hr className="border-border" />
      <FormatFilter   selected={filters.format}   onChange={(v) => setFilter('format', v)} />

      {hasActiveFilters && (
        <>
          <hr className="border-border" />
          <button
            type="button"
            onClick={resetFilters}
            className="btn-secondary text-sm py-2"
          >
            Reset All Filters
          </button>
        </>
      )}
    </aside>
  )

  return (
    <main id="main-content" tabIndex={-1}>
      {/* ── Page Hero ─────────────────────────────────────────────────────────── */}
      <section className="bg-cream py-12 sm:py-16 border-b border-border" aria-labelledby="courses-page-heading">
        <div className="section-container">
          <div className="max-w-2xl">
            <p className="text-terracotta text-sm font-semibold uppercase tracking-widest mb-3">
              Course Catalog
            </p>
            <h1
              id="courses-page-heading"
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-charcoal leading-tight"
            >
              Learn, Grow, and Thrive Together
            </h1>
            <p className="mt-4 text-lg text-warm-gray leading-relaxed">
              Practical, accessible parenting education for every family.
              Browse our demonstration courses below — all content is clearly labelled and free to explore.
            </p>
            <p className="mt-2 text-sm text-warm-gray/80 italic">
              "ቤተሰብ ማለት ሀገር ነው፤ ቤተሰብን ማስተማር ሀገርን ማስተማር ነው።"
            </p>
          </div>

          {/* Search — hero placement */}
          <div className="mt-7">
            <SearchBar
              value={filters.search}
              onChange={(v) => setFilter('search', v)}
            />
          </div>

          {/* Affordability note */}
          <p className="mt-4 text-xs text-warm-gray bg-white inline-block px-4 py-2 rounded-full border border-border shadow-sm">
            💚 Sidra aims to keep educational resources affordable and accessible to all Ethiopian families. Some courses are always free.
          </p>
        </div>
      </section>

      {/* ── Main content ──────────────────────────────────────────────────────── */}
      <div className="section-container py-8 sm:py-10">

        {/* Toolbar row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          {/* Mobile filter toggle */}
          <button
            type="button"
            className="sm:hidden flex items-center gap-2 text-sm font-medium text-charcoal border border-border
                       bg-white px-4 py-2.5 rounded-xl shadow-sm self-start"
            onClick={() => setSidebarOpen((o) => !o)}
            aria-expanded={sidebarOpen}
            aria-controls="mobile-filter-panel"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
            </svg>
            Filters
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-terracotta" aria-label="Active filters applied" />
            )}
          </button>

          {/* Results count */}
          <p className="text-sm text-warm-gray" aria-live="polite" aria-atomic="true">
            {filtered.length === 0
              ? 'No courses match your filters'
              : `Showing ${filtered.length} of ${COURSES.length} course${COURSES.length !== 1 ? 's' : ''}`}
          </p>

          {/* Sort */}
          <SortSelect value={sort} onChange={setSort} />
        </div>

        {/* Active filter chips */}
        {hasActiveFilters && (
          <div className="mb-5">
            <ActiveFilters
              filters={filters}
              onRemove={removeFilter}
              onReset={resetFilters}
            />
          </div>
        )}

        <div className="flex gap-8 items-start">

          {/* ── Sidebar filters — desktop ──────────────────────────────────── */}
          <div className="hidden sm:block w-52 flex-shrink-0 card p-5 sticky top-20">
            <FilterPanel />
          </div>

          {/* ── Mobile filter drawer ───────────────────────────────────────── */}
          {sidebarOpen && (
            <div
              id="mobile-filter-panel"
              className="sm:hidden fixed inset-0 z-40 flex"
              role="dialog"
              aria-modal="true"
              aria-label="Filter courses"
            >
              {/* Backdrop */}
              <div
                className="flex-1 bg-charcoal/40"
                onClick={() => setSidebarOpen(false)}
                aria-hidden="true"
              />
              {/* Drawer */}
              <div className="w-72 bg-white h-full overflow-y-auto shadow-xl p-6 flex flex-col gap-5">
                <div className="flex items-center justify-between mb-1">
                  <h2 className="text-base font-bold text-charcoal">Filters</h2>
                  <button
                    type="button"
                    onClick={() => setSidebarOpen(false)}
                    className="p-1.5 rounded-lg text-warm-gray hover:bg-cream"
                    aria-label="Close filters"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <FilterPanel />
              </div>
            </div>
          )}

          {/* ── Course grid ────────────────────────────────────────────────── */}
          <div className="flex-1 min-w-0">
            {filtered.length === 0 ? (
              /* Empty state */
              <div className="text-center py-16 px-4">
                <div className="w-16 h-16 rounded-full bg-terracotta/10 flex items-center justify-center mx-auto mb-5" aria-hidden="true">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-terracotta" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-charcoal mb-2">
                  No courses found
                </h2>
                <p className="text-warm-gray mb-6">
                  Try adjusting your search terms or clearing some filters.
                </p>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="btn-primary"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <ul
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
                role="list"
                aria-label="Course list"
              >
                {filtered.map((course) => (
                  <li key={course.id}>
                    <CourseCard course={course} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
