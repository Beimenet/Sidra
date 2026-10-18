import { Link } from 'react-router-dom'
import { formatPrice } from '../../data/courses.js'

// Icons
function ClockIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}
function BookIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
    </svg>
  )
}
function VideoIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
    </svg>
  )
}

// Level badge colour
function levelColor(level) {
  if (level === 'Beginner') return 'bg-sage/25 text-charcoal'
  if (level === 'Intermediate') return 'bg-terracotta/10 text-terracotta-hover'
  return 'bg-charcoal/10 text-charcoal'
}

// Thumbnail placeholder — coloured gradient using category
const CATEGORY_GRADIENTS = {
  'Parenting Fundamentals':               'from-terracotta/30 to-sage/30',
  'Child Development':                    'from-sage/30 to-terracotta/20',
  'Positive Parenting':                   'from-terracotta/20 to-cream',
  'Child Behavior & Emotional Development':'from-sage/20 to-terracotta/30',
  'Special & Inclusive Needs':            'from-terracotta/15 to-sage/40',
  'Family Wellbeing':                     'from-sage/35 to-terracotta/15',
  'Early Childhood Development':          'from-terracotta/25 to-sage/25',
}

export default function CourseCard({ course }) {
  const gradient = CATEGORY_GRADIENTS[course.category] ?? 'from-cream to-border'
  const isFree = course.price === 0

  return (
    <article
      className="card flex flex-col hover:shadow-md transition-shadow duration-200 overflow-hidden"
      aria-label={`Course: ${course.title}`}
    >
      {/* Thumbnail */}
      <div className={`relative h-36 bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0`}>
        {course.thumbnail ? (
          <img
            src={course.thumbnail}
            alt={`Thumbnail for ${course.title}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <VideoIcon />
        )}

        {/* Price badge — top right */}
        <span
          className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-bold shadow-sm
            ${isFree ? 'bg-sage text-white' : 'bg-white text-terracotta border border-border'}`}
          aria-label={isFree ? 'Free course' : `Price: ${formatPrice(course.price)}`}
        >
          {formatPrice(course.price)}
        </span>

        {/* Demo badge — top left */}
        <span className="absolute top-3 left-3 px-2 py-0.5 bg-charcoal/70 text-white text-[10px] font-medium rounded">
          Demo
        </span>
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-5 gap-3">
        {/* Category + Level */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="tag text-xs py-0.5 px-2.5">{course.category}</span>
          <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${levelColor(course.level)}`}>
            {course.level}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-base font-semibold text-charcoal leading-snug line-clamp-2">
          {course.title}
        </h3>

        {/* Description */}
        <p className="text-warm-gray text-sm leading-relaxed line-clamp-3 flex-1">
          {course.shortDescription}
        </p>

        {/* Instructor */}
        <p className="text-xs text-warm-gray/80">
          <span className="font-medium text-charcoal">Instructor:</span>{' '}
          {course.instructor}
        </p>

        {/* Meta row */}
        <div className="flex items-center gap-4 text-xs text-warm-gray pt-2 border-t border-border">
          <span className="flex items-center gap-1">
            <BookIcon />
            {course.lessonCount} lessons
          </span>
          <span className="flex items-center gap-1">
            <ClockIcon />
            {course.duration}
          </span>
          <span className="flex items-center gap-1">
            <VideoIcon />
            {course.format}
          </span>
        </div>

        {/* CTA */}
        <Link
          to={`/courses/${course.id}`}
          className="btn-primary text-sm py-2.5 mt-1 w-full"
          aria-label={`View course: ${course.title}`}
        >
          View Course
        </Link>
      </div>
    </article>
  )
}
