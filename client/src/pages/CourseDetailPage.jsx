import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom'
import { getCourseById, formatPrice } from '../data/courses.js'
import PaymentModal from '../components/courses/PaymentModal.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { coursesApi } from '../services/api.js'

// ── Icon helpers ──────────────────────────────────────────────────────────────
function CheckIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-terracotta flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
    </svg>
  )
}

function ChevronIcon({ open }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={`w-4 h-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
    </svg>
  )
}

function lessonTypeIcon(type) {
  if (type === 'video') return '▶'
  if (type === 'reading') return '📄'
  if (type === 'downloadable') return '⬇'
  return '📌'
}

function lessonTypeBadge(type) {
  const map = {
    video: 'bg-terracotta/10 text-terracotta',
    reading: 'bg-sage/20 text-charcoal',
    downloadable: 'bg-charcoal/8 text-charcoal',
  }
  return map[type] ?? 'bg-cream text-charcoal'
}

function resourceTypeLabel(type) {
  const map = { article: 'Article', guide: 'Guide', tool: 'Tool', video: 'Video' }
  return map[type] ?? 'Resource'
}

// ── Accordion module ──────────────────────────────────────────────────────────
function ModuleAccordion({ module, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <button
        type="button"
        className="w-full flex items-center justify-between px-5 py-4 bg-white hover:bg-cream transition-colors text-left"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={`module-${module.id}`}
      >
        <span className="font-semibold text-charcoal text-sm">{module.title}</span>
        <div className="flex items-center gap-3 flex-shrink-0 ml-2">
          <span className="text-xs text-warm-gray">{module.lessons.length} lessons</span>
          <ChevronIcon open={open} />
        </div>
      </button>

      {open && (
        <ul id={`module-${module.id}`} className="divide-y divide-border">
          {module.lessons.map((lesson) => (
            <li key={lesson.id} className="flex items-center gap-3 px-5 py-3 bg-white hover:bg-cream/50 transition-colors">
              <span className="text-xs w-5 text-center" aria-hidden="true">
                {lessonTypeIcon(lesson.type)}
              </span>
              <span className="flex-1 text-sm text-charcoal">{lesson.title}</span>
              <div className="flex items-center gap-2 flex-shrink-0">
                {lesson.preview && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 bg-sage/25 text-charcoal rounded-full">
                    Preview
                  </span>
                )}
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${lessonTypeBadge(lesson.type)}`}>
                  {lesson.type}
                </span>
                <span className="text-xs text-warm-gray w-14 text-right">{lesson.duration}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// ── Video placeholder ─────────────────────────────────────────────────────────
function VideoPlaceholder({ lesson }) {
  return (
    <div className="relative bg-charcoal rounded-xl overflow-hidden aspect-video flex flex-col items-center justify-center gap-3 border border-border">
      <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
        </svg>
      </div>
      <p className="text-white/60 text-sm text-center px-4">
        {lesson ? `Preview: "${lesson.title}"` : 'Video placeholder'}
      </p>
      <p className="text-white/40 text-xs">
        Demo content — actual video will appear here
      </p>
    </div>
  )
}

// ── Resource item ─────────────────────────────────────────────────────────────
function ResourceItem({ resource }) {
  return (
    <li className="flex items-start gap-3 p-4 bg-cream rounded-xl border border-border hover:border-terracotta/30 transition-colors">
      <span className="text-terracotta text-xs font-bold px-2 py-0.5 bg-terracotta/10 rounded-md flex-shrink-0 mt-0.5">
        {resourceTypeLabel(resource.type)}
      </span>
      <div className="flex-1 min-w-0">
        <a
          href={resource.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-semibold text-charcoal hover:text-terracotta transition-colors underline-offset-2 hover:underline"
          aria-label={`${resource.title} — opens in a new tab (external resource)`}
        >
          {resource.title}
          <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 inline-block ml-1 text-warm-gray" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
          </svg>
        </a>
        {resource.publisher && (
          <p className="text-xs text-warm-gray mt-0.5">{resource.publisher}</p>
        )}
      </div>
    </li>
  )
}

// ── Enrol button — handles auth state and API availability ───────────────────
/**
 * Behaviour:
 *  - Not logged in  → redirect to /login, preserving course URL as `from`
 *  - Logged in, free course → call POST /api/courses/:id/enroll
 *  - Logged in, paid course → show payment modal (payment not yet integrated)
 *  - Already enrolled → show "Go to course" link
 */
function EnrolButton({ user, course, navigate, location }) {
  const [enrolling, setEnrolling] = useState(false)
  const [enrolled, setEnrolled] = useState(false)
  const [enrollError, setEnrollError] = useState('')

  // Note: course.id here is the static demo ID (number 1–8).
  // When courses are served from the real API, this will be a UUID.
  // The enroll API requires a valid UUID course ID from the database.
  // Until the frontend Courses page is connected to the real API, this
  // button redirects authenticated users to check enrollments instead.

  async function handleEnrol() {
    if (!user) {
      navigate('/login', { state: { from: location.pathname } })
      return
    }
    setEnrolling(true)
    setEnrollError('')
    try {
      await coursesApi.enroll(course.id)
      setEnrolled(true)
    } catch (err) {
      if (err.status === 409) {
        // Already enrolled — treat as success
        setEnrolled(true)
      } else if (err.status === 404) {
        setEnrollError('This course is not yet available for enrollment in the database.')
      } else {
        setEnrollError(err.message ?? 'Enrollment failed. Please try again.')
      }
    } finally {
      setEnrolling(false)
    }
  }

  // Not logged in
  if (!user) {
    return (
      <>
        <button
          type="button"
          className="btn-primary w-full mb-3"
          onClick={handleEnrol}
        >
          Log in to Enrol
        </button>
        <p className="text-xs text-center text-warm-gray">
          You need an account to enrol. Login is free.
        </p>
      </>
    )
  }

  // Already enrolled
  if (enrolled) {
    return (
      <>
        <div className="w-full mb-3 px-4 py-3 bg-sage/20 border border-sage/40 rounded-xl text-sm text-charcoal font-medium text-center flex items-center justify-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-sage" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
          </svg>
          Enrolled successfully!
        </div>
        <Link to="/profile" className="btn-secondary w-full text-center text-sm">
          Go to My Profile
        </Link>
      </>
    )
  }

  // Logged in — ready to enrol
  return (
    <>
      {enrollError && (
        <div role="alert" className="mb-3 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
          {enrollError}
        </div>
      )}
      <button
        type="button"
        onClick={handleEnrol}
        disabled={enrolling}
        className="btn-primary w-full mb-3 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {enrolling ? 'Enrolling…' : 'Enrol for Free'}
      </button>
      <p className="text-xs text-center text-warm-gray">
        {enrollError
          ? 'Course data will be available once connected to the database.'
          : 'Free enrolment — no payment required.'}
      </p>
    </>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function CourseDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const [paymentOpen, setPaymentOpen] = useState(false)

  // Try to fetch the real course from the API first; fall back to static data
  const staticCourse = getCourseById(id)
  const [apiCourse, setApiCourse] = useState(null)
  const [apiLoading, setApiLoading] = useState(true)

  useEffect(() => {
    // Only attempt API lookup for UUID-shaped IDs (real courses)
    const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!UUID_RE.test(id)) { setApiLoading(false); return }

    coursesApi.get(id)
      .then((data) => setApiCourse(data.course ?? null))
      .catch(() => setApiCourse(null))
      .finally(() => setApiLoading(false))
  }, [id])

  // Loading state for real-API courses
  if (apiLoading && !staticCourse) {
    return (
      <main id="main-content" tabIndex={-1} className="bg-cream min-h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-terracotta/30 border-t-terracotta animate-spin" role="status" aria-label="Loading course" />
      </main>
    )
  }

  // Use API course if available, otherwise fall back to static data
  const course = apiCourse ?? staticCourse

  if (!course) {
    return (
      <main id="main-content" tabIndex={-1} className="bg-cream min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <p className="text-6xl font-bold text-terracotta/20 select-none mb-4" aria-hidden="true">404</p>
          <h1 className="text-2xl font-bold text-charcoal mb-3">Course not found</h1>
          <p className="text-warm-gray mb-6">This course doesn't exist or may have been removed.</p>
          <Link to="/courses" className="btn-primary">Back to Courses</Link>
        </div>
      </main>
    )
  }

  // Normalise price field — API uses price_etb, static data uses price
  const priceValue = course.price_etb !== undefined ? parseFloat(course.price_etb) : (course.price ?? 0)
  const isFree = priceValue === 0

  // Normalise lessons for display
  const modules = course.modules ?? []
  const totalLessons = modules.length > 0
    ? modules.reduce((sum, m) => sum + m.lessons.length, 0)
    : (course.lesson_count ?? 0)

  // First preview lesson for the video placeholder
  const previewLesson = modules
    .flatMap((m) => m.lessons ?? [])
    .find((l) => l.preview && l.type === 'video')

  return (
    <main id="main-content" tabIndex={-1}>

      {/* ── Breadcrumb ──────────────────────────────────────────────────────── */}
      <nav aria-label="Breadcrumb" className="bg-white border-b border-border">
        <ol className="section-container flex items-center gap-2 py-3 text-sm text-warm-gray">
          <li><Link to="/" className="hover:text-terracotta transition-colors">Home</Link></li>
          <li aria-hidden="true" className="text-border">/</li>
          <li><Link to="/courses" className="hover:text-terracotta transition-colors">Courses</Link></li>
          <li aria-hidden="true" className="text-border">/</li>
          <li className="text-charcoal font-medium truncate max-w-[200px]" aria-current="page">
            {course.title}
          </li>
        </ol>
      </nav>

      {/* ── Course header ────────────────────────────────────────────────────── */}
      <section className="bg-cream py-10 sm:py-14 border-b border-border" aria-labelledby="course-title">
        <div className="section-container">
          <div className="flex flex-col lg:flex-row lg:items-start lg:gap-12">

            {/* Left: info */}
            <div className="flex-1">
              {/* Demo notice — only show for static demo courses */}
              {course.demoNotice && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-charcoal/8 rounded-full text-xs font-medium text-charcoal mb-4">
                  <span aria-hidden="true">⚠️</span>
                  {course.demoNotice}
                </div>
              )}

              {/* Badges */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="tag">{course.category}</span>
                <span className="text-xs font-medium px-3 py-1 rounded-full bg-sage/25 text-charcoal">{course.level}</span>
                <span className="text-xs font-medium px-3 py-1 rounded-full bg-terracotta/10 text-terracotta">{course.format}</span>
              </div>

              <h1 id="course-title" className="text-2xl sm:text-3xl lg:text-4xl font-bold text-charcoal leading-tight">
                {course.title}
              </h1>

              <p className="mt-4 text-warm-gray leading-relaxed text-base sm:text-lg max-w-2xl">
                {course.fullDescription}
              </p>

              {/* Meta strip */}
              <div className="mt-6 flex flex-wrap gap-5 text-sm text-warm-gray">
                <span className="flex items-center gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0118 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                  </svg>
                  {totalLessons} lessons across {course.modules.length} modules
                </span>
                <span className="flex items-center gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {course.duration} total
                </span>
                <span className="flex items-center gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                  {course.instructor}
                </span>
              </div>
            </div>

            {/* Right: enrolment card */}
            <div className="mt-8 lg:mt-0 lg:w-80 flex-shrink-0">
              <div className="card p-6 sticky top-20">
                {/* Price */}
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-3xl font-bold text-charcoal">
                    {formatPrice(priceValue)}
                  </span>
                  {isFree && (
                    <span className="text-sm text-sage font-semibold">Always free</span>
                  )}
                </div>
                {!isFree && (
                  <p className="text-xs text-warm-gray mb-1">
                    Demo price — illustrative only, subject to change
                  </p>
                )}

                {/* Affordability note */}
                <p className="text-xs text-warm-gray/80 italic mb-5 leading-relaxed">
                  Sidra is committed to making parenting education affordable for every Ethiopian family.
                </p>

                {/* ── Enrol / Purchase button ────────────────────────────── */}
                {isFree ? (
                  <EnrolButton user={user} course={course} navigate={navigate} location={location} />
                ) : (
                  <>
                    <button
                      type="button"
                      className="btn-primary w-full mb-3"
                      onClick={() => setPaymentOpen(true)}
                    >
                      Purchase Course — {formatPrice(priceValue)}
                    </button>
                    <p className="text-xs text-center text-warm-gray">
                      Online payments are coming soon. No charge will be made now.
                    </p>
                  </>
                )}

                <hr className="my-5 border-border" />

                {/* Course highlights */}
                <ul className="flex flex-col gap-2.5 text-sm text-charcoal">
                  <li className="flex items-start gap-2"><CheckIcon /><span>{totalLessons} lessons</span></li>
                  <li className="flex items-start gap-2"><CheckIcon /><span>{course.duration} of content</span></li>
                  <li className="flex items-start gap-2"><CheckIcon /><span>{course.format} format</span></li>
                  <li className="flex items-start gap-2"><CheckIcon /><span>{course.level} level</span></li>
                  {course.resources.length > 0 && (
                    <li className="flex items-start gap-2"><CheckIcon /><span>{course.resources.length} external resources</span></li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Page body ────────────────────────────────────────────────────────── */}
      <div className="section-container py-10 sm:py-14">
        <div className="max-w-3xl flex flex-col gap-12">

          {/* Video preview */}
          <section aria-labelledby="preview-heading">
            <h2 id="preview-heading" className="text-xl font-bold text-charcoal mb-4">
              Course Preview
            </h2>
            <VideoPlaceholder lesson={previewLesson} />
            {previewLesson && (
              <p className="mt-2 text-xs text-warm-gray">
                Preview lesson: "{previewLesson.title}" · {previewLesson.duration}
              </p>
            )}
          </section>

          {/* What you'll learn */}
          <section aria-labelledby="objectives-heading">
            <h2 id="objectives-heading" className="text-xl font-bold text-charcoal mb-4">
              What You Will Learn
            </h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {course.objectives.map((obj, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-charcoal leading-snug">
                  <CheckIcon />
                  <span>{obj}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Who this is for */}
          <section aria-labelledby="audience-heading">
            <h2 id="audience-heading" className="text-xl font-bold text-charcoal mb-3">
              Who This Course Is For
            </h2>
            <p className="text-warm-gray leading-relaxed text-sm">{course.audience}</p>
          </section>

          {/* Curriculum */}
          <section aria-labelledby="curriculum-heading">
            <div className="flex items-center justify-between mb-4">
              <h2 id="curriculum-heading" className="text-xl font-bold text-charcoal">
                Course Curriculum
              </h2>
              <span className="text-xs text-warm-gray">
                {course.modules.length} modules · {totalLessons} lessons · {course.duration}
              </span>
            </div>
            <div className="flex flex-col gap-3">
              {course.modules.map((module, i) => (
                <ModuleAccordion key={module.id} module={module} defaultOpen={i === 0} />
              ))}
            </div>
          </section>

          {/* External resources */}
          {course.resources.length > 0 && (
            <section aria-labelledby="resources-heading">
              <h2 id="resources-heading" className="text-xl font-bold text-charcoal mb-2">
                Additional Learning Resources
              </h2>
              <p className="text-sm text-warm-gray mb-4">
                These are external resources from reputable organisations. They open in a new tab.
                Sidra does not control external content.
              </p>
              <ul className="flex flex-col gap-3">
                {course.resources.map((res) => (
                  <ResourceItem key={res.id} resource={res} />
                ))}
              </ul>
            </section>
          )}

          {/* Back link */}
          <div className="pt-4 border-t border-border">
            <Link
              to="/courses"
              className="inline-flex items-center gap-2 text-sm font-semibold text-terracotta hover:text-terracotta-hover transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
              </svg>
              Back to all courses
            </Link>
          </div>

        </div>
      </div>

      {/* Payment modal */}
      {paymentOpen && (
        <PaymentModal course={course} onClose={() => setPaymentOpen(false)} />
      )}

    </main>
  )
}
