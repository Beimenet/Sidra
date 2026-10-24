import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'

// ── Data ─────────────────────────────────────────────────────────────────────

const FILTER_CHIPS = [
  'All Resources',
  'Printable Routine Cards',
  'De-escalation Scripts',
  'Developmental Checklists',
  'Bilingual Family Handbooks',
  'Nutrition & Weaning',
]

const AGE_TABS = ['All Ages', 'Infancy (0–12 Mos)', 'Toddlers (1–3 Yrs)', 'Early Years (4–7 Yrs)', 'Tweens & Teens (8–16 Yrs)']

const RESOURCES = [
  {
    id: 1,
    title: 'The 3-Step Tantrum De-escalation Script',
    desc: 'A pocket de-escalation guide for navigating meltdowns without losing calm or dignity — without yelling, ultimatums, or giving into demands.',
    category: 'De-escalation Scripts',
    ageGroup: 'Toddlers (1–3 Yrs)',
    format: 'PDF · 1.1 MB',
    reviews: 1422,
    downloads: '5,422',
    languages: ['Amharic', 'English'],
    free: true,
    badge: 'Most Popular',
    badgeColor: 'terracotta',
  },
  {
    id: 2,
    title: 'Morning Routine Visual Schedule (የጥዋት መርሃ-ግብር)',
    desc: 'Step-by-step illustrated morning sequence covering getting up, washing, breakfast, and daily tasks packing to reduce arguments before school.',
    category: 'Printable Routine Cards',
    ageGroup: 'Early Years (4–7 Yrs)',
    format: 'PDF · 4.2 MB',
    reviews: 3181,
    downloads: '6,181',
    languages: ['Amharic', 'English'],
    free: true,
    badge: 'Bilingual (Amharic & English)',
    badgeColor: 'sage',
  },
  {
    id: 3,
    title: 'Screen Time Contract & Healthy Digital Habits',
    desc: 'Collaborative family agreement template establishing screen-free zones, evening digital time windows, and expected behavior online for children.',
    category: 'Developmental Checklists',
    ageGroup: 'Tweens & Teens (8–16 Yrs)',
    format: 'PDF · 2.4 MB',
    reviews: 4533,
    downloads: '14,533',
    languages: ['English'],
    free: false,
    badge: null,
    badgeColor: null,
  },
  {
    id: 4,
    title: 'First Foods & Healthy Traditional Weaning',
    desc: 'Nutritional milestones combining international pediatric studies from first-fed families, culturally familiar Ethiopian weaning recipes and modern solid food introduction protocols.',
    category: 'Nutrition & Weaning',
    ageGroup: 'Infancy (0–12 Mos)',
    format: 'PDF · 3.1 MB',
    reviews: 10891,
    downloads: '10,891',
    languages: ['Amharic', 'English'],
    free: true,
    badge: 'Recommended',
    badgeColor: 'sage',
  },
  {
    id: 5,
    title: 'Sibling Rivalry Peacemaker Guide',
    desc: 'Mediation techniques to transform family battles into a cooperative problem-solving process or diffuse a recent incident.',
    category: 'De-escalation Scripts',
    ageGroup: 'Early Years (4–7 Yrs)',
    format: 'PDF · 2.2 MB',
    reviews: 6412,
    downloads: '6,412',
    languages: ['Amharic'],
    free: true,
    badge: null,
    badgeColor: null,
  },
  {
    id: 6,
    title: 'School Readiness & Separation Anxiety Checklist',
    desc: 'Emotion regulation toolkit, self-advocacy checklists, and preparation guidelines tools designed to build busy parents on drop off hours.',
    category: 'Developmental Checklists',
    ageGroup: 'Toddlers (1–3 Yrs)',
    format: 'PDF · 1.7 MB',
    reviews: 9753,
    downloads: '9,753',
    languages: ['Amharic', 'English'],
    free: false,
    badge: null,
    badgeColor: null,
  },
]

const FEATURED_TOOLKIT = {
  title: 'The Calm Bedtime Routine Toolkit (የሌሊቱ ሰዓታዊ)',
  amharic: 'ሰዓታዊ ስርዓቱ መርጃ ሪሶርስ',
  desc: 'Step-by-step visual cue cards designed to end evening bedtime struggles and resistance for children aged 2 to 7. Includes Amharic audio-soothing cues, ritual chart, and printable reward tracks.',
  downloads: '14,250',
  ageRange: 'Ages 2–7',
  rating: 4.9,
  reviews: '3 Min Setup Guide · Guide',
  free: true,
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function Badge({ label, color }) {
  if (!label) return null
  return (
    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${color === 'terracotta' ? 'bg-terracotta/10 text-terracotta' : 'bg-sage/20 text-charcoal'}`}>
      {label}
    </span>
  )
}

function ResourceCard({ res }) {
  return (
    <article className="card p-5 flex flex-col gap-3">
      {/* Top row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-wrap gap-1.5 items-center">
          {res.badge && <Badge label={res.badge} color={res.badgeColor} />}
          <span className="text-[11px] text-warm-gray font-medium">{res.ageGroup}</span>
        </div>
        {res.free ? (
          <span className="text-[11px] font-bold text-sage bg-sage/10 px-2 py-0.5 rounded-full flex-shrink-0">Free</span>
        ) : (
          <span className="text-[11px] font-bold text-terracotta bg-terracotta/10 px-2 py-0.5 rounded-full flex-shrink-0">Premium</span>
        )}
      </div>

      {/* Thumbnail placeholder */}
      <div className="w-full aspect-video bg-cream border border-border rounded-xl flex items-center justify-center" aria-hidden="true">
        <svg className="w-10 h-10 text-border" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
        </svg>
      </div>

      <h2 className="text-sm font-bold text-charcoal leading-snug">{res.title}</h2>
      <p className="text-xs text-warm-gray leading-relaxed line-clamp-3">{res.desc}</p>

      {/* Language tags */}
      <div className="flex flex-wrap gap-1.5">
        {res.languages.map((l) => (
          <span key={l} className="tag text-xs py-0.5 px-2">{l}</span>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-border mt-auto">
        <div className="text-xs text-warm-gray">
          <span className="font-medium text-charcoal">{res.format}</span>
          {' · '}
          <span>{res.downloads} downloads</span>
        </div>
        <button
          type="button"
          className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
            res.free
              ? 'bg-terracotta text-white hover:bg-terracotta-hover'
              : 'border border-terracotta text-terracotta hover:bg-terracotta/5'
          }`}
        >
          {res.free ? '↓ Download' : 'Get Guide'}
        </button>
      </div>
    </article>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function ResourcesPage() {
  const [search, setSearch] = useState('')
  const [activeChip, setActiveChip] = useState('All Resources')
  const [activeAge, setActiveAge] = useState('All Ages')

  const filtered = useMemo(() => {
    let result = [...RESOURCES]
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (r) => r.title.toLowerCase().includes(q) || r.desc.toLowerCase().includes(q) || r.category.toLowerCase().includes(q)
      )
    }
    if (activeChip !== 'All Resources') {
      result = result.filter((r) => r.category === activeChip)
    }
    if (activeAge !== 'All Ages') {
      result = result.filter((r) => r.ageGroup === activeAge)
    }
    return result
  }, [search, activeChip, activeAge])

  return (
    <main id="main-content" tabIndex={-1}>

      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <section className="bg-cream border-b border-border py-14" aria-labelledby="resources-heading">
        <div className="section-container">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-warm-gray mb-5">
            <Link to="/" className="hover:text-terracotta transition-colors">Home</Link>
            <svg className="w-3.5 h-3.5 text-warm-gray/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
            <span className="text-charcoal font-medium">Resources &amp; Guides</span>
          </nav>

          <div className="max-w-2xl">
            <p className="text-terracotta text-sm font-semibold uppercase tracking-widest mb-3">Practical Tools</p>
            <h1 id="resources-heading" className="text-3xl sm:text-4xl lg:text-5xl font-bold text-charcoal leading-tight">
              Practical Tools, Actionable Guides.
            </h1>
            <p className="mt-4 text-base text-warm-gray leading-relaxed">
              Downloadable toolkit printables, de-escalation pocket scripts, developmental
              milestone road maps, and bilingual Amharic bedtime visuals developed by our child specialists.
            </p>
          </div>

          {/* Search */}
          <div className="mt-7 relative max-w-xl">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-gray/50 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tools, printables, age groups, or keywords (e.g. bedtime routine, sen…"
              className="w-full pl-11 pr-28 py-3 bg-white border border-border rounded-xl text-sm text-charcoal placeholder:text-warm-gray/60 focus:outline-none focus:ring-2 focus:ring-terracotta transition"
              aria-label="Search resources"
            />
            <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 bg-terracotta text-white text-sm font-semibold px-4 py-1.5 rounded-lg hover:bg-terracotta-hover transition-colors">
              Search
            </button>
          </div>

          {/* Filter chips */}
          <div className="mt-5 flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Filter by resource type">
            {FILTER_CHIPS.map((chip) => {
              const count = chip === 'All Resources' ? RESOURCES.length : RESOURCES.filter((r) => r.category === chip).length
              return (
                <button
                  key={chip}
                  type="button"
                  onClick={() => setActiveChip(chip)}
                  className={`text-sm font-medium px-4 py-1.5 rounded-full border whitespace-nowrap transition-colors ${
                    activeChip === chip
                      ? 'bg-charcoal text-white border-charcoal'
                      : 'bg-white text-charcoal border-border hover:border-charcoal/40'
                  }`}
                >
                  {chip}{count > 0 ? ` (${count})` : ''}
                </button>
              )
            })}
          </div>
        </div>
      </section>

      <div className="section-container py-10 space-y-12">

        {/* ── Featured Toolkit ──────────────────────────────────────────────── */}
        <section aria-labelledby="featured-heading">
          <div className="card overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              {/* Image side */}
              <div className="bg-charcoal/80 aspect-video lg:aspect-auto min-h-48 flex items-center justify-center relative">
                <div className="absolute inset-0 bg-gradient-to-br from-terracotta/20 to-transparent" aria-hidden="true" />
                <div className="relative text-center px-6">
                  <div className="flex justify-center gap-3 mb-3 flex-wrap">
                    <span className="text-xs font-semibold bg-white/20 text-white px-3 py-1 rounded-full">🖨 Visual Guide - Guide</span>
                    <span className="text-xs font-semibold bg-white/20 text-white px-3 py-1 rounded-full">Bilingual (Amharic & English)</span>
                    <span className="text-xs font-semibold bg-terracotta/80 text-white px-3 py-1 rounded-full">FREE 2 FREE</span>
                  </div>
                  <svg className="w-16 h-16 text-white/30 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={0.8} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                  </svg>
                </div>
              </div>

              {/* Content side */}
              <div className="p-7 flex flex-col gap-4">
                <p className="text-xs font-semibold text-terracotta uppercase tracking-wider">Most Popular · Featured Toolkit</p>
                <h2 id="featured-heading" className="text-xl sm:text-2xl font-bold text-charcoal leading-tight">
                  {FEATURED_TOOLKIT.title}
                </h2>
                <p className="text-sm text-warm-gray leading-relaxed">{FEATURED_TOOLKIT.desc}</p>

                <div className="flex flex-wrap gap-5 text-sm">
                  <div><p className="font-bold text-charcoal">{FEATURED_TOOLKIT.downloads}</p><p className="text-xs text-warm-gray">families downloaded</p></div>
                  <div><p className="font-bold text-charcoal">{FEATURED_TOOLKIT.ageRange}</p><p className="text-xs text-warm-gray">per age group</p></div>
                  <div>
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <p className="font-bold text-charcoal">{FEATURED_TOOLKIT.rating}</p>
                    </div>
                    <p className="text-xs text-warm-gray">3 Min Setup Guide</p>
                  </div>
                </div>

                <div className="flex gap-3 mt-2">
                  <button type="button" className="btn-primary flex items-center gap-2 py-2.5">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                    </svg>
                    Download PDF Toolkit Free
                  </button>
                  <button type="button" className="btn-secondary py-2.5">
                    Preview Sample Cards
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Age tabs + grid ───────────────────────────────────────────────── */}
        <section aria-labelledby="resources-grid-heading">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h2 id="resources-grid-heading" className="text-lg font-bold text-charcoal">Explore by Age Stage</h2>
            <div className="flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Filter by age stage">
              {AGE_TABS.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveAge(tab)}
                  className={`text-xs font-medium px-3 py-1.5 rounded-full border whitespace-nowrap transition-colors ${
                    activeAge === tab
                      ? 'bg-terracotta text-white border-terracotta'
                      : 'bg-white text-charcoal border-border hover:border-terracotta/40'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-warm-gray mb-4">No resources match your filters.</p>
              <button type="button" onClick={() => { setSearch(''); setActiveChip('All Resources'); setActiveAge('All Ages') }} className="btn-primary">
                Clear filters
              </button>
            </div>
          ) : (
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5" role="list">
              {filtered.map((res) => (
                <li key={res.id}><ResourceCard res={res} /></li>
              ))}
            </ul>
          )}
        </section>

        {/* ── Medically Vetted badge ─────────────────────────────────────────── */}
        <div className="card p-5 flex flex-col sm:flex-row items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-sage/20 flex items-center justify-center flex-shrink-0" aria-hidden="true">
            <svg className="w-5 h-5 text-sage" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
            </svg>
          </div>
          <div className="flex-1 text-center sm:text-left">
            <p className="text-sm font-semibold text-charcoal">Every Printable is Medically &amp; Culturally Vetted</p>
            <div className="flex flex-wrap justify-center sm:justify-start gap-4 mt-2">
              {['Certified by licensed Ethiopian Pediatricians, pediatric nutritionists, and maternal health doctors across Addis Ababa and the global diaspora.', 'Clinic-High Fidelity', 'Mobile Offline Viewable'].map((t, i) => (
                <span key={i} className="flex items-center gap-1 text-xs text-warm-gray">
                  <svg className="w-3.5 h-3.5 text-sage" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ── Community Request CTA ─────────────────────────────────────────── */}
        <div className="card p-6 flex flex-col sm:flex-row items-center gap-5">
          <div className="w-10 h-10 rounded-full bg-terracotta/10 flex items-center justify-center flex-shrink-0" aria-hidden="true">
            <svg className="w-5 h-5 text-terracotta" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
            </svg>
          </div>
          <div className="flex-1 text-center sm:text-left">
            <p className="text-sm font-semibold text-charcoal">Looking for a specific guide or routine tool?</p>
            <p className="text-xs text-warm-gray mt-1">
              Tell us about a challenge you're going through and our clinical team will design or source a bilingual
              resource tailored to the Sidra community.
            </p>
          </div>
          <button type="button" className="flex-shrink-0 flex items-center gap-2 border border-terracotta text-terracotta text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-terracotta/5 transition-colors whitespace-nowrap">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            Suggest a Guide
          </button>
        </div>

      </div>
    </main>
  )
}
