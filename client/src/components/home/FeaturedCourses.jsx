import { Link } from 'react-router-dom'

/**
 * Sample course data — clearly marked as placeholder content.
 * These are not real courses. They will be replaced by data from
 * the backend API when the server layer is implemented.
 */
const SAMPLE_COURSES = [
  {
    id: 1,
    title: 'Understanding Early Childhood Development',
    description:
      'Explore the key milestones of your child\'s first five years, from language acquisition and motor skills to social and emotional growth.',
    category: 'Early Childhood',
    lessonCount: 8,
    duration: '2 hrs 30 min',
  },
  {
    id: 2,
    title: 'Building Secure Attachment',
    description:
      'Learn how attachment patterns form in early life, why they matter for long-term wellbeing, and practical ways to nurture a secure bond with your child.',
    category: 'Child Psychology',
    lessonCount: 6,
    duration: '1 hr 50 min',
  },
  {
    id: 3,
    title: 'Supporting Children with Learning Differences',
    description:
      'A practical guide for parents of children with dyslexia, ADHD, and other learning differences — covering strategies, advocacy, and daily support.',
    category: 'Inclusive Parenting',
    lessonCount: 10,
    duration: '3 hrs 15 min',
  },
]

function CourseCard({ course }) {
  return (
    <article className="card flex flex-col hover:shadow-md transition-shadow duration-200" aria-label={`Course: ${course.title}`}>
      {/* Category tag strip */}
      <div className="h-2 rounded-t-xl bg-terracotta/20" aria-hidden="true" />

      <div className="flex flex-col flex-1 p-6 gap-4">
        {/* Category tag */}
        <span className="tag self-start">{course.category}</span>

        {/* Title */}
        <h3 className="text-lg font-semibold text-charcoal leading-snug">
          {course.title}
        </h3>

        {/* Description */}
        <p className="text-warm-gray text-sm leading-relaxed flex-1">
          {course.description}
        </p>

        {/* Meta */}
        <div className="flex items-center gap-4 text-xs text-warm-gray pt-2 border-t border-border">
          <span className="flex items-center gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
            {course.lessonCount} lessons
          </span>
          <span className="flex items-center gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {course.duration}
          </span>
        </div>

        {/* CTA */}
        <Link
          to={`/courses/${course.id}`}
          className="btn-secondary text-sm py-2.5 mt-1"
          aria-label={`View course: ${course.title}`}
        >
          View Course
        </Link>
      </div>
    </article>
  )
}

export default function FeaturedCourses() {
  return (
    <section
      className="bg-white py-16 sm:py-20"
      aria-labelledby="featured-courses-heading"
    >
      <div className="section-container">
        {/* Section header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
          <div>
            <p className="text-terracotta text-sm font-semibold uppercase tracking-widest mb-3">
              Featured Courses
            </p>
            <h2
              id="featured-courses-heading"
              className="text-3xl sm:text-4xl font-bold text-charcoal"
            >
              Start learning today
            </h2>
            <p className="mt-3 text-warm-gray text-lg max-w-xl">
              Browse a sample of the structured parenting education courses
              coming to Sidra.{' '}
              <span className="text-sm font-medium text-terracotta">
                (Sample content — not yet available for enrollment)
              </span>
            </p>
          </div>
          <Link
            to="/courses"
            className="text-terracotta font-semibold hover:text-terracotta-hover transition-colors duration-150 whitespace-nowrap flex items-center gap-1.5 self-start sm:self-auto"
            aria-label="See all courses"
          >
            See all courses
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>

        {/* Course grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {SAMPLE_COURSES.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </div>
    </section>
  )
}
