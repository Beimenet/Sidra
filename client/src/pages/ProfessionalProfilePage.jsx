import { useState } from 'react'
import { Link, useParams, Navigate } from 'react-router-dom'
import { PROFESSIONALS } from '../data/professionals.js'

// ── Helpers ───────────────────────────────────────────────────────────────────

function InitialAvatar({ name }) {
  const initials = name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase()
  return (
    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-terracotta/10 text-terracotta font-bold text-3xl flex items-center justify-center flex-shrink-0" aria-hidden="true">
      {initials}
    </div>
  )
}

function StarRating({ rating, size = 'sm' }) {
  const full = Math.floor(rating)
  const half = rating - full >= 0.5
  const cls = size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'
  return (
    <span className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} className={`${cls} ${i < full ? 'text-amber-400' : half && i === full ? 'text-amber-300' : 'text-border'}`} fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </span>
  )
}

const TIME_SLOTS = ['09:30 AM', '10:00 AM', '10:30 AM', '11:30 AM', '01:00 PM', '02:30 PM']

function MiniCalendar({ selectedDate, onSelect }) {
  const today = new Date()
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    return d
  })
  const DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

  return (
    <div>
      <div className="grid grid-cols-7 gap-1 text-center text-[11px] text-warm-gray mb-1">
        {DAY_LABELS.map((d) => <span key={d}>{d}</span>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: today.getDay() }).map((_, i) => <div key={`e-${i}`} />)}
        {days.map((d) => {
          const iso = d.toISOString().split('T')[0]
          const isSelected = selectedDate === iso
          const isToday = d.toDateString() === today.toDateString()
          return (
            <button
              key={iso}
              type="button"
              onClick={() => onSelect(iso)}
              className={`aspect-square rounded-lg text-xs font-medium transition-colors ${
                isSelected ? 'bg-terracotta text-white' : isToday ? 'border border-terracotta text-terracotta' : 'hover:bg-cream text-charcoal'
              }`}
              aria-label={d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              aria-pressed={isSelected}
            >
              {d.getDate()}
            </button>
          )
        })}
      </div>
    </div>
  )
}

const CLINICAL_AREAS = [
  { title: 'Attachment & Emotional Dysregulation', desc: 'Therapy for child-caregiver bonds and supporting children with cultural or one-party experiences.' },
  { title: 'Sibling Rivalry & Family Transition', desc: 'Techniques for navigating in-school bullying, sibling interaction and blended family dynamics.' },
  { title: 'ADHD & Neurodevelopmental Support', desc: 'Practical interventions for attention, hyperactivity and executive function difficulties in young children.' },
  { title: 'Anxiety & Social Anxiety Challenges', desc: 'Proven CBT-based methods to build social confidence and address school refusal or separation anxiety.' },
  { title: 'Complex Childhood Grief', desc: 'Trauma-informed frameworks for processing loss, grief and post-traumatic growth in school-aged children.' },
  { title: 'Somatic Regulation & Mindful Grounding', desc: 'Body-based regulation techniques to help children with emotional and sensory self-regulation skills.' },
]

const CREDENTIALS = [
  { degree: 'PhD, Developmental Psychology & Cognitive Neuroscience', institution: 'Addis Ababa University / International Partnership', years: '2014–2019', icon: '🎓' },
  { degree: 'Post-Doctoral Fellowship in Paediatric Behavioural Health', institution: 'Tikur Anbesa Specialised Hospital (AAU) — Over 2,400 clinical hours', years: '2019–2021', icon: '🏥' },
  { degree: 'Author: "Sidira Hagere Quoter: Foundations of Emotional Regulation"', institution: 'Available via AAU Press; 4,500 copies distributed to the ESRD to build national competency', years: '2022', icon: '📖' },
]

const REVIEWS = [
  {
    name: 'Tigist Nourifa',
    location: 'Addis Ababa · Parent of a 4-year old',
    rating: 5,
    date: 'October 17, 2024',
    verified: true,
    text: 'The first sessions were so reassuring and empowering! My concerns were characterized by shifting and she had a plan that made us feel so confident. She gave us real, realistic strategies that many other professionals had not been able to give us.',
  },
  {
    name: 'Rita and Eric',
    location: 'Nairobi, KE · Parents of 2, ages 5 & 4 years old',
    rating: 4,
    date: 'October 01, 2024',
    verified: true,
    text: 'She was so supportive throughout the process and helped us navigate topics on our curriculum. We attended sessions as a family to help my son manage his challenging behavior. Dr. Selamawit provided actionable and well-structured morning routines.',
  },
]

// ── Page ─────────────────────────────────────────────────────────────────────

export default function ProfessionalProfilePage() {
  const { id } = useParams()
  const pro = PROFESSIONALS.find((p) => p.id === Number(id))
  const [selectedFormat, setSelectedFormat] = useState('Private Video Consultation')
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedTime, setSelectedTime] = useState(null)
  const [childAge, setChildAge] = useState('')

  if (!pro) return <Navigate to="/professionals" replace />

  const formats = [
    { label: 'Private Video Consultation', sub: 'Secure, one-on-one session via Sidra Video', price: pro.price },
    { label: 'Clinic In-Person Session', sub: "Scheduled appointment at the professional's clinic", price: Math.round(pro.price * 1.15) },
  ]

  return (
    <main id="main-content" tabIndex={-1}>

      {/* ── Breadcrumb ──────────────────────────────────────────────────── */}
      <div className="bg-cream border-b border-border py-3">
        <div className="section-container">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-warm-gray">
            <Link to="/" className="hover:text-terracotta transition-colors">Home</Link>
            <svg className="w-3.5 h-3.5 text-warm-gray/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
            <Link to="/professionals" className="hover:text-terracotta transition-colors">Specialists Directory</Link>
            <svg className="w-3.5 h-3.5 text-warm-gray/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
            <span className="text-charcoal font-medium truncate">{pro.name}</span>
          </nav>
        </div>
      </div>

      <div className="section-container py-8">
        <div className="flex flex-col lg:flex-row gap-8 items-start">

          {/* ── Left column ───────────────────────────────────────────────── */}
          <div className="flex-1 min-w-0 space-y-8">

            {/* Hero card */}
            <div className="card p-6">
              <div className="flex flex-col sm:flex-row gap-5">
                <InitialAvatar name={pro.name} />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    {pro.verified && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-sage px-2.5 py-1 bg-sage/10 rounded-full">
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Ministry Certified
                      </span>
                    )}
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${pro.badgeColor === 'terracotta' ? 'bg-terracotta/10 text-terracotta' : 'bg-sage/20 text-charcoal'}`}>
                      {pro.badge}
                    </span>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-bold text-charcoal leading-tight">{pro.name}</h1>
                  <p className="text-sm text-warm-gray mt-1">{pro.title}</p>
                  <p className="text-xs text-warm-gray/70 mt-0.5">{pro.credentials} · {pro.institution}</p>
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {pro.tags.map((tag) => <span key={tag} className="tag text-xs">{tag}</span>)}
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-5 border-t border-border flex flex-wrap gap-6">
                <div className="text-center"><p className="text-lg font-bold text-charcoal">{pro.experience}+</p><p className="text-xs text-warm-gray">Yrs Experience</p></div>
                <div className="text-center"><p className="text-lg font-bold text-charcoal">{pro.rating}</p><p className="text-xs text-warm-gray">Avg Rating</p></div>
                <div className="text-center"><p className="text-lg font-bold text-charcoal">{pro.reviews.toLocaleString()}+</p><p className="text-xs text-warm-gray">Parent Sessions</p></div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-warm-gray">{pro.languages.join(' · ')}</span>
                </div>
              </div>
            </div>

            {/* Philosophy */}
            <section aria-labelledby="philosophy-heading">
              <h2 id="philosophy-heading" className="text-lg font-bold text-charcoal mb-4">Philosophy &amp; Approach</h2>
              <div className="relative rounded-2xl overflow-hidden bg-charcoal/90 aspect-video mb-5 flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-br from-charcoal/60 to-charcoal/80" aria-hidden="true" />
                <div className="relative text-center px-6">
                  <button type="button" className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center mx-auto mb-3 hover:bg-white/30 transition-colors" aria-label="Play introduction video">
                    <svg className="w-7 h-7 text-white ml-1" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>
                  </button>
                  <p className="text-white font-semibold text-sm">My Approach to Evidence Based Parenting</p>
                  <p className="text-white/60 text-xs mt-1">Dr. {pro.name.split(' ').slice(-1)[0]} shares her methodology — click to watch</p>
                </div>
              </div>
              <blockquote className="border-l-4 border-terracotta pl-5 py-1 mb-4">
                <p className="text-charcoal text-sm leading-relaxed italic">"{pro.bio} Children do not need perfect parents — they need regulated, responsive adults who feel appreciated. Building trust within every interaction is the foundation of lasting change."</p>
                <footer className="mt-2 text-xs text-warm-gray font-semibold">— {pro.name}</footer>
              </blockquote>
              <div className="text-sm text-warm-gray leading-relaxed space-y-3">
                <p>Years of working with Ministry-recognized families and the long-standing cultural environment inspired her to develop a groundbreaking, individualized approach to family therapy and emotional regulation.</p>
                <p>She specializes in working with the most supported families, addressing behavioral, emotional, and relational challenges through research-based and proven approaches, one-to-one personalized sessions.</p>
              </div>
            </section>

            {/* Areas of Clinical Focus */}
            <section aria-labelledby="clinical-focus-heading">
              <h2 id="clinical-focus-heading" className="text-lg font-bold text-charcoal mb-4">Areas of Clinical Focus</h2>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4" role="list">
                {CLINICAL_AREAS.map((area) => (
                  <li key={area.title} className="card p-4">
                    <h3 className="text-sm font-semibold text-charcoal mb-1">{area.title}</h3>
                    <p className="text-xs text-warm-gray leading-relaxed">{area.desc}</p>
                  </li>
                ))}
              </ul>
            </section>

            {/* Credentials */}
            <section aria-labelledby="credentials-heading">
              <h2 id="credentials-heading" className="text-lg font-bold text-charcoal mb-4">Credentials &amp; Formative Training</h2>
              <ul className="space-y-4" role="list">
                {CREDENTIALS.map((c) => (
                  <li key={c.degree} className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-cream border border-border flex items-center justify-center flex-shrink-0 text-lg" aria-hidden="true">{c.icon}</div>
                    <div>
                      <p className="text-sm font-semibold text-charcoal leading-snug">{c.degree}</p>
                      <p className="text-xs text-warm-gray mt-0.5 leading-relaxed">{c.institution}</p>
                      <p className="text-xs text-warm-gray/60 mt-0.5">{c.years}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            {/* Reviews */}
            <section aria-labelledby="reviews-heading">
              <div className="flex items-center justify-between mb-4">
                <h2 id="reviews-heading" className="text-lg font-bold text-charcoal">Verified Parent Experiences</h2>
                <span className="text-xs text-warm-gray">Safety Verified Reviews</span>
              </div>
              <div className="card p-5 mb-5">
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="text-center">
                    <p className="text-4xl font-bold text-charcoal">{pro.rating}</p>
                    <StarRating rating={pro.rating} size="lg" />
                    <p className="text-xs text-warm-gray mt-1">Based on {pro.reviews.toLocaleString()} reviews</p>
                  </div>
                  <div className="flex-1 space-y-1.5 min-w-48">
                    {[5, 4, 3, 2, 1].map((star) => {
                      const pct = star === 5 ? 76 : star === 4 ? 16 : star === 3 ? 5 : star === 2 ? 2 : 1
                      return (
                        <div key={star} className="flex items-center gap-2">
                          <span className="text-xs text-warm-gray w-3">{star}</span>
                          <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden">
                            <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-xs text-warm-gray w-6">{pct}%</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
              <ul className="space-y-5" role="list">
                {REVIEWS.map((r) => (
                  <li key={r.name} className="card p-5">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-9 h-9 rounded-full bg-sage/20 text-sage font-bold text-sm flex items-center justify-center flex-shrink-0" aria-hidden="true">{r.name[0]}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-charcoal">{r.name}</p>
                        <p className="text-xs text-warm-gray">{r.location}</p>
                      </div>
                      <div className="text-right">
                        <StarRating rating={r.rating} />
                        <p className="text-xs text-warm-gray mt-0.5">{r.date}</p>
                      </div>
                    </div>
                    <p className="text-sm text-warm-gray leading-relaxed">{r.text}</p>
                    {r.verified && (
                      <p className="mt-3 text-xs text-sage font-medium flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Verified Consultation on Sidra
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </section>

          </div>

          {/* ── Right: Booking widget ──────────────────────────────────────── */}
          <aside className="w-full lg:w-96 flex-shrink-0 lg:sticky lg:top-24 self-start" aria-label="Book a consultation">
            <div className="card p-5 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-2xl font-bold text-charcoal">{pro.price.toLocaleString()} {pro.currency}</span>
                  <span className="text-sm text-warm-gray"> / session</span>
                </div>
                <span className="text-xs font-medium text-sage bg-sage/10 px-2.5 py-1 rounded-full">
                  {pro.available ? 'Avail. This Week' : 'Limited Slots'}
                </span>
              </div>

              <div>
                <p className="text-xs font-semibold text-charcoal uppercase tracking-wider mb-2">Session Consultation Format</p>
                <div className="space-y-2">
                  {formats.map((f) => (
                    <label key={f.label} className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${selectedFormat === f.label ? 'border-terracotta bg-terracotta/5' : 'border-border hover:border-terracotta/40'}`}>
                      <input type="radio" name="format" value={f.label} checked={selectedFormat === f.label} onChange={() => setSelectedFormat(f.label)} className="mt-0.5 accent-terracotta" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-charcoal leading-snug">{f.label}</p>
                        <p className="text-xs text-warm-gray mt-0.5">{f.sub}</p>
                      </div>
                      <span className="text-sm font-bold text-charcoal flex-shrink-0">{f.price.toLocaleString()} ETB</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="child-age" className="text-xs font-semibold text-charcoal uppercase tracking-wider mb-2 block">
                  Child's Age &amp; Primary Challenge
                </label>
                <input
                  id="child-age"
                  type="text"
                  value={childAge}
                  onChange={(e) => setChildAge(e.target.value)}
                  placeholder="e.g. My child is 4 years old. They have challenges with…"
                  className="w-full px-3 py-2.5 text-sm border border-border rounded-xl bg-cream focus:outline-none focus:ring-2 focus:ring-terracotta placeholder:text-warm-gray/60"
                />
              </div>

              <div>
                <p className="text-xs font-semibold text-charcoal uppercase tracking-wider mb-3">Select Date</p>
                <MiniCalendar selectedDate={selectedDate} onSelect={setSelectedDate} />
              </div>

              {selectedDate && (
                <div>
                  <p className="text-xs font-semibold text-charcoal uppercase tracking-wider mb-2">
                    Available Times <span className="font-normal text-warm-gray">(local time)</span>
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {TIME_SLOTS.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setSelectedTime(t)}
                        className={`text-xs font-medium py-2 rounded-lg border transition-colors ${selectedTime === t ? 'bg-terracotta text-white border-terracotta' : 'border-border text-charcoal hover:border-terracotta/50'}`}
                        aria-pressed={selectedTime === t}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <button
                type="button"
                className="w-full btn-primary py-3 text-base disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!selectedDate || !selectedTime}
              >
                Confirm &amp; Reserve ↗
              </button>

              <p className="text-xs text-warm-gray text-center">
                Pay securely via Telebirr, CBE Birr, or international Card. 100% money-back guarantee if unsatisfied after your first session.
              </p>
            </div>
          </aside>

        </div>
      </div>
    </main>
  )
}
