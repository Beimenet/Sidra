import { Link } from 'react-router-dom'

/**
 * Generic placeholder used for pages that are planned but not yet built.
 * Replace with the real page component as each feature is implemented.
 */
export default function PlaceholderPage({ title, description }) {
  return (
    <main id="main-content" tabIndex={-1} className="bg-cream min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        {/* Icon */}
        <div className="w-16 h-16 rounded-full bg-terracotta/10 flex items-center justify-center mx-auto mb-6" aria-hidden="true">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-terracotta" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-charcoal mb-3">
          {title}
        </h1>
        <p className="text-warm-gray leading-relaxed mb-2">
          {description}
        </p>
        <p className="text-sm text-warm-gray/70 mb-8">
          This page is part of the planned feature set and will be built in a future development phase.
        </p>

        <Link to="/" className="btn-primary">
          Back to Home
        </Link>
      </div>
    </main>
  )
}
