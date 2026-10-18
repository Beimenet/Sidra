import { Link } from 'react-router-dom'

export default function CallToAction() {
  return (
    <section
      className="bg-terracotta py-16 sm:py-20"
      aria-labelledby="cta-heading"
    >
      <div className="section-container text-center">
        {/* Decorative top element */}
        <div
          className="w-12 h-1.5 bg-white/40 rounded-full mx-auto mb-8"
          aria-hidden="true"
        />

        <h2
          id="cta-heading"
          className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight max-w-3xl mx-auto"
        >
          Your parenting journey starts here
        </h2>

        <p className="mt-5 text-white/85 text-lg sm:text-xl leading-relaxed max-w-2xl mx-auto">
          Join Sidra to access trusted courses, connect with verified
          professionals, and find the inclusive resources your family deserves.
        </p>

        {/* CTAs */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/register"
            className="inline-flex items-center justify-center px-8 py-3.5 bg-white text-terracotta font-semibold rounded-lg
                       hover:bg-cream transition-colors duration-200
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-terracotta"
          >
            Create a free account
          </Link>
          <Link
            to="/courses"
            className="inline-flex items-center justify-center px-8 py-3.5 border-2 border-white/70 text-white font-semibold rounded-lg
                       hover:border-white hover:bg-white/10 transition-colors duration-200
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-terracotta"
          >
            Browse courses first
          </Link>
        </div>

        <p className="mt-6 text-white/60 text-sm">
          Registration is not yet open. Sign-up will be available when the platform launches.
        </p>
      </div>
    </section>
  )
}
