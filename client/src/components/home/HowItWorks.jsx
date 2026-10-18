const FEATURES = [
  {
    id: 1,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
      </svg>
    ),
    title: 'Trusted Courses',
    description:
      'Access structured, topic-based courses covering key areas of child development, each organised into clear lessons you can follow at your own pace.',
  },
  {
    id: 2,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    ),
    title: 'Expert Professionals',
    description:
      'Browse a directory of verified child-development professionals — including therapists, paediatricians, and specialists — and find the right guidance for your family.',
  },
  {
    id: 3,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
      </svg>
    ),
    title: 'Inclusive Resources',
    description:
      'Find educational content designed for families supporting children with diverse developmental needs, including learning differences, developmental delays, and disabilities.',
  },
  {
    id: 4,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
    title: 'Track Your Progress',
    description:
      'Stay motivated by tracking your learning progress across enrolled courses. Your personal dashboard keeps everything in one place.',
  },
]

export default function HowItWorks() {
  return (
    <section
      className="bg-cream py-16 sm:py-20"
      aria-labelledby="how-it-works-heading"
    >
      <div className="section-container">
        {/* Section header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-terracotta text-sm font-semibold uppercase tracking-widest mb-3">
            How Sidra Helps
          </p>
          <h2
            id="how-it-works-heading"
            className="text-3xl sm:text-4xl font-bold text-charcoal"
          >
            Everything a family needs, in one place
          </h2>
          <p className="mt-4 text-warm-gray text-lg leading-relaxed">
            Sidra brings together structured learning, verified professionals, and
            inclusive resources so you always have reliable support close by.
          </p>
        </div>

        {/* Feature grid */}
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" role="list">
          {FEATURES.map((feature) => (
            <li key={feature.id} className="card p-6 flex flex-col gap-4 hover:shadow-md transition-shadow duration-200">
              {/* Icon container */}
              <div className="w-12 h-12 rounded-xl bg-terracotta/10 flex items-center justify-center text-terracotta flex-shrink-0">
                {feature.icon}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-charcoal mb-2">
                  {feature.title}
                </h3>
                <p className="text-warm-gray text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
