import { useState, useMemo, useEffect, useCallback } from 'react'
import { COURSES as STATIC_COURSES } from '../data/courses.js'
import { coursesApi } from '../services/api.js'
import CourseCard from '../components/courses/CourseCard.jsx'
import SearchBar from '../components/courses/SearchBar.jsx'
import CategoryFilter from '../components/courses/CategoryFilter.jsx'
import LevelFilter from '../components/courses/LevelFilter.jsx'
import PriceFilter from '../components/courses/PriceFilter.jsx'
import FormatFilter from '../components/courses/FormatFilter.jsx'
import SortSelect from '../components/courses/SortSelect.jsx'
import ActiveFilters from '../components/courses/ActiveFilters.jsx'

const EMPTY_FILTERS = {
  search: '',
  category: '',
  level: '',
  price: '',
  format: '',
}

/**
 * Normalise a course object from either the real API or static data so
 * the components always receive a consistent shape.
 *
 * Real API fields:  id (UUID), title, description, category, price_etb,
 *                   thumbnail_url, published
 * Static data fields: id (number), title, shortDescription, category, price,
 *                     level, format, thumbnail, ...
 */
function normalise(course, fromApi = false) {
  if (!fromApi) return course          // static data already has the right shape
  return {
    // core
    id: course.id,
    slug: course.id,       // use UUID as slug for API courses
    title: course.title,
    shortDescription: course.description ?? '',
    fullDescription: course.description ?? '',
    category: course.category,
    price: parseFloat(course.price_etb ?? 0),
    level: 'Beginner',      // API doesn't expose level yet — default
    format: 'Mixed',
    instructor: 'Sidra Instructor',
    thumbnail: course.thumbnail_url ?? null,
    lessonCount: course.lesson_count ?? 0,
    duration: course.duration ?? '—',
    demoNotice: '',
    objectives: [],
    audience: '',
    modules: [],
    resources: [],
    fromApi: true,
  }
}

function applyFilters(courses, filters, sort) {
  let result = [...courses]

  if (filters.search.trim()) {
    const q = filters.search.toLowerCase()
    result = result.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        (c.shortDescription ?? '').toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q)
    )
  }
  if (filters.category) result = result.filter((c) => c.category === filters.category)
  if (filters.level) result = result.filter((c) => c.level === filters.level)
  if (filters.format) result = result.filter((c) => c.format === filters.format)
  if (filters.price === 'free') result = result.filter((c) => c.price === 0)
  if (filters.price === 'paid') result = result.filter((c) => c.price > 0)

  if (sort === 'price-asc') result.sort((a, b) => a.price - b.price)
  if (sort === 'price-desc') result.sort((a, b) => b.price - a.price)
  if (sort === 'newest') result.sort((a, b) => (b.id > a.id ? 1 : -1))

  return result
}

export default function CoursesPage() {
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const [sort, setSort] = useState('recommended')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // API state
  const [apiCourses, setApiCourses] = useState(null)   // null = not loaded yet
  const [apiLoading, setApiLoading] = useState(true)
  const [apiError, setApiError] = useState('')

  // Try fetching from the real API once on mount
  const fetchApiCourses = useCallback(async () => {
    setApiLoading(true)
    setApiError('')
    try {
      const data = await coursesApi.list()
      const courses = (data.courses ?? []).map((c) => normalise(c, true))
      setApiCourses(courses)
    } catch {
      // API not reachable or no published courses — fall back to static data silently
      setApiCourses(null)
    } finally {
      setApiLoading(false)
    }
  }, [])

  useEffect(() => { fetchApiCourses() }, [fetchApiCourses])

  // Use API courses if available and non-empty; otherwise fall back to static demo data
  const allCourses = useMemo(() => {
    if (apiCourses && apiCourses.length > 0) return apiCourses
    return STATIC_COURSES
  }, [apiCourses])

  const usingStaticData = !apiCourses || apiCourses.length === 0

  const filtered = useMemo(() => applyFilters(allCourses, filters, sort), [allCourses, filters, sort])

  const hasActiveFilters = Object.values(filters).some(Boolean)

  function setFilter(key, value) { setFilters((prev) => ({ ...prev, [key]: value })) }
  function removeFilter(key) { setFilters((prev) => ({ ...prev, [key]: '' })) }
  function resetFilters() { setFilters(EMPTY_FILTERS); setSort('recommended') }

  const FilterPanel = () => (
    <aside aria-label="Course filters" className="flex flex-col gap-6">
      <CategoryFilter selected={filters.category} onChange={(v) => setFilter('category', v)} />
      <hr className="border-border" />
      <LevelFilter selected={filters.level} onChange={(v) => setFilter('level', v)} />
      <hr className="border-border" />
      <PriceFilter selected={filters.price} onChange={(v) => setFilter('price', v)} />
      <hr className="border-border" />
      <FormatFilter selected={filters.format} onChange={(v) => setFilter('format', v)} />
      {hasActiveFilters && (
        <>
          <hr className="border-border" />
          <button type="button" onClick={resetFilters} className="btn-secondary text-sm py-2">
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
            </p>
            <p className="mt-2 text-sm text-warm-gray/80 italic">
              "ቤተሰብ ማለት ሀገር ነው፤ ቤተሰብን ማስተማር ሀገርን ማስተማር ነው።"
            </p>
          </div>

          <div className="mt-7">
            <SearchBar value={filters.search} onChange={(v) => setFilter('search', v)} />
          </div>

          {/* Data source indicator */}
          {!apiLoading && usingStaticData && (
            <p className="mt-4 text-xs text-warm-gray bg-white inline-block px-4 py-2 rounded-full border border-border shadow-sm">
              💚 Showing demo courses — real courses will appear here once published to the database.
            </p>
          )}
          {!apiLoading && !usingStaticData && (
            <p className="mt-4 text-xs text-warm-gray bg-white inline-block px-4 py-2 rounded-full border border-border shadow-sm">
              ✅ {apiCourses.length} course{apiCourses.length !== 1 ? 's' : ''} loaded from the database.
            </p>
          )}
        </div>
      </section>

      {/* ── Main content ──────────────────────────────────────────────────────── */}
      <div className="section-container py-8 sm:py-10">

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <button
            type="button"
            className="sm:hidden flex items-center gap-2 text-sm font-medium text-charcoal border border-border bg-white px-4 py-2.5 rounded-xl shadow-sm self-start"
            onClick={() => setSidebarOpen((o) => !o)}
            aria-expanded={sidebarOpen}
            aria-controls="mobile-filter-panel"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
            </svg>
            Filters
            {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-terracotta" aria-label="Active filters applied" />}
          </button>

          <p className="text-sm text-warm-gray" aria-live="polite" aria-atomic="true">
            {apiLoading
              ? 'Loading courses…'
              : filtered.length === 0
                ? 'No courses match your filters'
                : `Showing ${filtered.length} of ${allCourses.length} course${allCourses.length !== 1 ? 's' : ''}`}
          </p>

          <SortSelect value={sort} onChange={setSort} />
        </div>

        {hasActiveFilters && (
          <div className="mb-5">
            <ActiveFilters filters={filters} onRemove={removeFilter} onReset={resetFilters} />
          </div>
        )}

        <div className="flex gap-8 items-start">
          {/* Desktop sidebar */}
          <div className="hidden sm:block w-52 flex-shrink-0 card p-5 sticky top-20">
            <FilterPanel />
          </div>

          {/* Mobile filter drawer */}
          {sidebarOpen && (
            <div id="mobile-filter-panel" className="sm:hidden fixed inset-0 z-40 flex" role="dialog" aria-modal="true" aria-label="Filter courses">
              <div className="flex-1 bg-charcoal/40" onClick={() => setSidebarOpen(false)} aria-hidden="true" />
              <div className="w-72 bg-white h-full overflow-y-auto shadow-xl p-6 flex flex-col gap-5">
                <div className="flex items-center justify-between mb-1">
                  <h2 className="text-base font-bold text-charcoal">Filters</h2>
                  <button type="button" onClick={() => setSidebarOpen(false)} className="p-1.5 rounded-lg text-warm-gray hover:bg-cream" aria-label="Close filters">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <FilterPanel />
              </div>
            </div>
          )}

          {/* Course grid */}
          <div className="flex-1 min-w-0">
            {/* Loading skeleton */}
            {apiLoading ? (
              <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5" aria-label="Loading courses">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <li key={n} className="card overflow-hidden animate-pulse">
                    <div className="h-36 bg-border/60" />
                    <div className="p-5 flex flex-col gap-3">
                      <div className="h-3 bg-border/60 rounded w-2/3" />
                      <div className="h-4 bg-border/60 rounded" />
                      <div className="h-3 bg-border/60 rounded w-full" />
                      <div className="h-3 bg-border/60 rounded w-4/5" />
                    </div>
                  </li>
                ))}
              </ul>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16 px-4">
                <div className="w-16 h-16 rounded-full bg-terracotta/10 flex items-center justify-center mx-auto mb-5" aria-hidden="true">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-terracotta" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-charcoal mb-2">No courses found</h2>
                <p className="text-warm-gray mb-6">Try adjusting your search terms or clearing some filters.</p>
                <button type="button" onClick={resetFilters} className="btn-primary">
                  Clear all filters
                </button>
              </div>
            ) : (
              <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5" role="list" aria-label="Course list">
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
