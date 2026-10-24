import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { PROFESSIONALS, SPECIALTIES, LANGUAGES, FORMATS } from '../data/professionals.js'

// ── Helpers ────────────────────────────────────────────────────────────────────

function InitialAvatar({ name, size = 'md' }) {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()

  const sizeClass = size === 'lg' ? 'w-20 h-20 text-2xl' : 'w-14 h-14 text-lg'

  return (
    <div
      className={`${sizeClass} rounded-xl bg-terracotta/10 text-terracotta font-bold flex items-center justify-center flex-shrink-0`}
      aria-hidden="true"
    >
      {initials}
    </div>
  )
}

function StarRating({ rating }) {
  const full = Math.floor(rating)
  const half = rating - full >= 0.5
  return (
    <span className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} className={`w-3.5 h-3.5 ${i < full ? 'text-amber-400' : half && i === full ? 'text-amber-300' : 'text-border'}`} fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </span>
  )
}

function Badge({ label, color }) {
  if (!label) return null
  const colorClass =
    color === 'terracotta'
      ? 'bg-terracotta/10 text-terracotta'
      : 'bg-sage/20 text-charcoal'
  return (
    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${colorClass}`}>
      {label}
    </span>
  )
}

function FormatIcon({ format }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs text-warm-gray">
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
        {format === 'Online' ? (
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0H3" />
        ) : format === 'In-Person' ? (
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
        ) : (
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0H3" />
        )}
      </svg>
      {format}
    </span>
  )
}

// ── Professional Card ──────────────────────────────────────────────────────────

function ProfessionalCard({ pro }) {
  return (
    <article className="card p-5 flex flex-col gap-4 hover:shadow-md transition-shadow duration-200">
      {/* Header row */}
      <div className="flex gap-4">
        <InitialAvatar name={pro.name} />
        <div className="flex-1 min-w-0">
          {/* Badges */}
          <div className="flex items-center gap-2 mb-1">
            {pro.verified && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-sage px-2 py-0.5 bg-sage/10 rounded-full">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Verified
              </span>
            )}
            <Badge label={pro.badge} color={pro.badgeColor} />
          </div>

          <h2 className="text-sm font-bold text-charcoal leading-snug truncate">{pro.name}</h2>
          <p className="text-xs text-warm-gray mt-0.5 leading-snug line-clamp-2">{pro.title}</p>
          <p className="text-[11px] text-warm-gray/70 mt-0.5">{pro.institution}</p>
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5">
        {pro.tags.map((tag) => (
          <span key={tag} className="tag text-xs py-0.5 px-2">{tag}</span>
        ))}
      </div>

      {/* Bio */}
      <p className="text-xs text-warm-gray leading-relaxed line-clamp-3">{pro.bio}</p>

      {/* Meta row */}
      <div className="flex items-center gap-3 text-xs text-warm-gray flex-wrap">
        <span className="flex items-center gap-1">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
          </svg>
          {pro.languages.join(' · ')}
        </span>
        <span>·</span>
        <FormatIcon format={pro.format} />
      </div>

      {/* Footer: price + actions */}
      <div className="flex items-center justify-between pt-2 border-t border-border mt-auto">
        <div>
          <span className="text-base font-bold text-charcoal">{pro.price.toLocaleString()} {pro.currency}</span>
          <span className="text-xs text-warm-gray"> / {pro.priceUnit}</span>
        </div>
        <div className="flex items-center gap-2">
          <StarRating rating={pro.rating} />
          <span className="text-xs text-warm-gray">{pro.rating}</span>
          <span className="text-xs text-warm-gray/60">({pro.reviews.toLocaleString()})</span>
        </div>
      </div>

      {/* CTA Buttons */}
      <div className="flex gap-2">
        <Link
          to={`/professionals/${pro.id}`}
          className="flex-1 text-center text-sm font-semibold border border-terracotta text-terracotta py-2 rounded-lg hover:bg-terracotta/5 transition-colors duration-150"
        >
          View Full Profile
        </Link>
        <button
          type="button"
          className="flex-1 text-sm font-semibold bg-terracotta text-white py-2 rounded-lg hover:bg-terracotta-hover transition-colors duration-150"
        >
          Book Consultation
        </button>
      </div>
    </article>
  )
}

// ── Filter Chip ────────────────────────────────────────────────────────────────

function FilterChip({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-sm font-medium px-4 py-1.5 rounded-full border transition-colors duration-150 whitespace-nowrap ${
        active
          ? 'bg-charcoal text-white border-charcoal'
          : 'bg-white text-charcoal border-border hover:border-charcoal/40'
      }`}
    >
      {label}
    </button>
  )
}

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function ProfessionalsPage() {
  const [search, setSearch] = useState('')
  const [specialty, setSpecialty] = useState('All Specialties')
  const [language, setLanguage] = useState('All')
  const [format, setFormat] = useState('All Modes')

  const filtered = useMemo(() => {
    let result = [...PROFESSIONALS]

    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.specialty.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q)) ||
          p.bio.toLowerCase().includes(q)
      )
    }

    if (specialty !== 'All Specialties') {
      result = result.filter((p) => p.specialty === specialty)
    }

    if (language !== 'All') {
      result = result.filter((p) => p.languages.includes(language))
    }

    if (format !== 'All Modes') {
      result = result.filter((p) => p.format === format || p.format === 'Both')
    }

    return result
  }, [search, specialty, language, format])

  const hasFilters = specialty !== 'All Specialties' || language !== 'All' || format !== 'All Modes' || search.trim()

  return (
    <main id="main-content" tabIndex={-1}>

      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <section className="bg-cream border-b border-border py-14 sm:py-18" aria-labelledby="professionals-heading">
        <div className="section-container">
          <div className="max-w-3xl">
            {/* Breadcrumb */}
            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-warm-gray mb-5">
              <Link to="/" className="hover:text-terracotta transition-colors">Home</Link>
              <svg className="w-3.5 h-3.5 text-warm-gray/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
              <span className="text-charcoal font-medium">Specialists Directory</span>
            </nav>

            <h1
              id="professionals-heading"
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-charcoal leading-tight"
            >
              Connect with Compassionate,{' '}
              <span className="text-terracotta italic">Licensed Experts.</span>
            </h1>
            <p className="mt-4 text-base sm:text-lg text-warm-gray leading-relaxed max-w-2xl">
              Book confidential 1-on-1 virtual or clinic consultations with vetted pediatricians,
              child psychologists, psychiatrists, and family therapists across Addis Ababa and globally.
            </p>
          </div>

          {/* Stats row */}
          <div className="mt-8 flex flex-wrap gap-6 sm:gap-10">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-terracotta flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
              </svg>
              <div>
                <p className="text-xl font-bold text-charcoal">45+</p>
                <p className="text-xs text-warm-gray">Verified Specialists</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-amber-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <div>
                <p className="text-xl font-bold text-charcoal">4.9 Rating</p>
                <p className="text-xs text-warm-gray">From 1,500+ family visits</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-sage flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
              </svg>
              <div>
                <p className="text-xl font-bold text-charcoal">Seamless Local Pay</p>
                <p className="text-xs text-warm-gray">Telebirr & CBE Birr Accepted</p>
              </div>
            </div>
          </div>

          {/* Trust banner */}
          <div className="mt-7 inline-flex items-start gap-3 bg-white border border-border rounded-xl px-5 py-4 shadow-sm max-w-xl">
            <svg className="w-5 h-5 text-sage flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
            </svg>
            <div>
              <p className="text-sm font-semibold text-charcoal">Clinical Assurance Standard</p>
              <p className="text-xs text-warm-gray mt-0.5">
                Every professional holds active certification from the Ethiopian Ministry of Health.
                All consultations are 100% confidential and clinically reviewed.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Search + Filters ────────────────────────────────────────────────── */}
      <section className="bg-white border-b border-border py-5 sticky top-16 z-30" aria-label="Search and filter professionals">
        <div className="section-container space-y-4">
          {/* Search bar */}
          <div className="relative">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-gray/60 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search specialists by name, specialty, or condition (e.g. ADHD, speech delay, sleep, anxiety…)"
              className="w-full pl-11 pr-24 py-3 bg-cream border border-border rounded-xl text-sm text-charcoal placeholder:text-warm-gray/60 focus:outline-none focus:ring-2 focus:ring-terracotta focus:border-transparent transition"
              aria-label="Search professionals"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-terracotta text-white text-sm font-semibold px-4 py-1.5 rounded-lg hover:bg-terracotta-hover transition-colors"
            >
              Search
            </button>
          </div>

          {/* Specialty chips */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide" role="group" aria-label="Filter by specialty">
            {SPECIALTIES.map((s) => (
              <FilterChip
                key={s}
                label={s === 'All Specialties' ? `All Specialties (${PROFESSIONALS.length})` : s}
                active={specialty === s}
                onClick={() => setSpecialty(s)}
              />
            ))}
          </div>

          {/* Dropdown filters row */}
          <div className="flex flex-wrap gap-3 items-center">
            {/* Language */}
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="text-sm border border-border rounded-lg px-3 py-2 bg-white text-charcoal focus:outline-none focus:ring-2 focus:ring-terracotta"
              aria-label="Filter by language"
            >
              {LANGUAGES.map((l) => (
                <option key={l}>{l === 'All' ? 'Language: All' : l}</option>
              ))}
            </select>

            {/* Format */}
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              className="text-sm border border-border rounded-lg px-3 py-2 bg-white text-charcoal focus:outline-none focus:ring-2 focus:ring-terracotta"
              aria-label="Filter by consultation format"
            >
              {FORMATS.map((f) => (
                <option key={f}>{f === 'All Modes' ? 'Format: All Modes' : f}</option>
              ))}
            </select>

            {/* Fee placeholder */}
            <select
              className="text-sm border border-border rounded-lg px-3 py-2 bg-white text-charcoal focus:outline-none focus:ring-2 focus:ring-terracotta"
              aria-label="Filter by fee"
            >
              <option>Fee: Any Budget</option>
              <option>Under 800 ETB</option>
              <option>800–1,000 ETB</option>
              <option>Over 1,000 ETB</option>
            </select>

            <div className="ml-auto text-sm text-warm-gray" aria-live="polite" aria-atomic="true">
              Showing <span className="font-semibold text-charcoal">{filtered.length}</span> of{' '}
              {PROFESSIONALS.length} specialists
            </div>

            {hasFilters && (
              <button
                type="button"
                onClick={() => { setSearch(''); setSpecialty('All Specialties'); setLanguage('All'); setFormat('All Modes') }}
                className="text-sm text-terracotta hover:underline"
              >
                Clear all
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ── Grid ────────────────────────────────────────────────────────────── */}
      <div className="section-container py-10">
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-full bg-terracotta/10 flex items-center justify-center mx-auto mb-5" aria-hidden="true">
              <svg className="w-7 h-7 text-terracotta" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-charcoal mb-2">No professionals found</h2>
            <p className="text-warm-gray mb-6">Try adjusting your filters or search terms.</p>
            <button
              type="button"
              onClick={() => { setSearch(''); setSpecialty('All Specialties'); setLanguage('All'); setFormat('All Modes') }}
              className="btn-primary"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <ul
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-6"
            role="list"
            aria-label="Professionals list"
          >
            {filtered.map((pro) => (
              <li key={pro.id}>
                <ProfessionalCard pro={pro} />
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ── Professional CTA Banner ─────────────────────────────────────────── */}
      <section className="bg-cream border-t border-border py-16" aria-labelledby="pro-cta-heading">
        <div className="section-container flex flex-col sm:flex-row items-center justify-between gap-8">
          <div className="max-w-lg">
            <p className="text-xs font-semibold text-terracotta uppercase tracking-widest mb-3">
              Clinical Professional Directory
            </p>
            <h2 id="pro-cta-heading" className="text-2xl sm:text-3xl font-bold text-charcoal leading-tight">
              Are you a licensed child development professional?
            </h2>
            <p className="mt-3 text-warm-gray text-sm leading-relaxed">
              Join Sidra's trusted clinical network. Expanding your practice, connect with intentional
              parents, and provide culturally grounded tele-consultations across Ethiopia and the diaspora.
            </p>
          </div>
          <div className="flex flex-col gap-3 flex-shrink-0">
            <button type="button" className="btn-primary whitespace-nowrap">
              Apply to Practice with Sidra
            </button>
            <button type="button" className="text-sm text-terracotta font-medium hover:underline text-center">
              Learn about qualifications to become a Sidra professional →
            </button>
          </div>
        </div>
      </section>

    </main>
  )
}
