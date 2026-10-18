import { Link } from 'react-router-dom'

/**
 * Sample professional profiles — clearly marked as placeholder content.
 * These are not real professionals. Names, specialties, and bios are
 * fictional and for layout demonstration only. They will be replaced
 * by verified, admin-approved profiles from the backend API.
 */
const SAMPLE_PROFESSIONALS = [
  {
    id: 1,
    initials: 'SA',
    name: 'Dr. Sara Alemu',
    specialty: 'Developmental Paediatrician',
    bio: 'Specialises in assessing and supporting children with developmental delays and complex neurodevelopmental conditions across all age groups.',
    color: 'bg-terracotta/15 text-terracotta',
  },
  {
    id: 2,
    initials: 'MT',
    name: 'Marcus Tesfaye',
    specialty: 'Child & Family Therapist',
    bio: 'Works with families navigating anxiety, attachment challenges, and behavioural difficulties, drawing on evidence-based therapeutic approaches.',
    color: 'bg-sage/30 text-charcoal',
  },
  {
    id: 3,
    initials: 'LG',
    name: 'Liya Girma',
    specialty: 'Speech-Language Pathologist',
    bio: 'Supports children with communication delays, language disorders, and speech sound difficulties through structured, play-based intervention.',
    color: 'bg-terracotta/10 text-terracotta-hover',
  },
]

function ProfessionalCard({ professional }) {
  return (
    <article
      className="card p-6 flex flex-col gap-4 hover:shadow-md transition-shadow duration-200"
      aria-label={`Professional profile: ${professional.name}`}
    >
      <div className="flex items-center gap-4">
        {/* Avatar with initials */}
        <div
          className={`w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0 ${professional.color}`}
          aria-hidden="true"
        >
          {professional.initials}
        </div>
        <div>
          <h3 className="text-base font-semibold text-charcoal leading-tight">
            {professional.name}
          </h3>
          <p className="text-sm text-terracotta font-medium mt-0.5">
            {professional.specialty}
          </p>
        </div>
      </div>

      <p className="text-warm-gray text-sm leading-relaxed flex-1">
        {professional.bio}
      </p>

      <Link
        to={`/professionals/${professional.id}`}
        className="text-terracotta text-sm font-semibold hover:text-terracotta-hover transition-colors duration-150 flex items-center gap-1"
        aria-label={`View profile of ${professional.name}`}
      >
        View Profile
        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
        </svg>
      </Link>
    </article>
  )
}

export default function ProfessionalPreview() {
  return (
    <section
      className="bg-cream py-16 sm:py-20"
      aria-labelledby="professionals-preview-heading"
    >
      <div className="section-container">
        {/* Section header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
          <div>
            <p className="text-terracotta text-sm font-semibold uppercase tracking-widest mb-3">
              Professional Directory
            </p>
            <h2
              id="professionals-preview-heading"
              className="text-3xl sm:text-4xl font-bold text-charcoal"
            >
              Guidance from verified experts
            </h2>
            <p className="mt-3 text-warm-gray text-lg max-w-xl">
              Sidra will connect families with verified child-development
              professionals across a range of specialties.{' '}
              <span className="text-sm font-medium text-terracotta">
                (Sample profiles — directory coming soon)
              </span>
            </p>
          </div>
          <Link
            to="/professionals"
            className="text-terracotta font-semibold hover:text-terracotta-hover transition-colors duration-150 whitespace-nowrap flex items-center gap-1.5 self-start sm:self-auto"
            aria-label="Browse all professionals"
          >
            Browse all professionals
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>

        {/* Professional cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {SAMPLE_PROFESSIONALS.map((professional) => (
            <ProfessionalCard key={professional.id} professional={professional} />
          ))}
        </div>
      </div>
    </section>
  )
}
