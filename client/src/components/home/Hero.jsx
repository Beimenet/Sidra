import { Link } from 'react-router-dom'
import heroImage from '../../assets/Capture.PNG'

export default function Hero() {
  return (
    <section
      className="bg-cream py-16 sm:py-20 lg:py-28"
      aria-labelledby="hero-heading"
    >
      <div className="section-container">
        <div className="flex flex-col lg:flex-row lg:items-center lg:gap-12">

          {/* Text content */}
          <div className="flex-1 text-center lg:text-left">
            {/* Eyebrow label */}
            <p className="inline-block mb-4 px-4 py-1.5 bg-terracotta/10 text-terracotta text-sm font-semibold rounded-full tracking-wide uppercase">
              Parenting Education &amp; Family Support
            </p>

            <h1
              id="hero-heading"
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-charcoal leading-tight tracking-tight"
            >
              ቤተሰብ ማለት ሀገር ነው፤ {' '}
              <span className="text-terracotta">ቤተሰብን ማስተማር ሀገርን ማስተማር ነው፤</span>{' '}
              ለተሻለ ቤተሰብ፣ ለተሻለ ትውልድ፣ ለተሻለ ሀገር!
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-warm-gray leading-relaxed max-w-xl mx-auto lg:mx-0">
              Sidra brings parents and caregivers trusted courses, expert
              professional guidance, and inclusive resources — all in one warm,
              welcoming place.
            </p>

            {/* CTAs */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link to="/courses" className="btn-primary text-base px-8 py-3.5">
                Explore Courses
              </Link>
              <Link to="/professionals" className="btn-secondary text-base px-8 py-3.5">
                Browse Professionals
              </Link>
            </div>

            {/* Trust strip */}
            <p className="mt-6 text-sm text-warm-gray">
              Free to browse &nbsp;·&nbsp; No account required &nbsp;·&nbsp; Built for every family
            </p>
          </div>

          {/* Hero image */}
          <div className="flex-1 mt-12 lg:mt-0 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-md">
              {/* Decorative background shape */}
              <div className="absolute inset-0 rounded-3xl bg-terracotta/8 scale-105 -rotate-2" aria-hidden="true" />
              {/* Image */}
              <div className="relative rounded-3xl overflow-hidden shadow-lg border border-border">
                <img
                  src={heroImage}
                  alt="A family together — the heart of the Sidra parenting support platform"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
