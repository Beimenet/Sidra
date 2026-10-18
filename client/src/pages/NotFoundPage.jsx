import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <main id="main-content" tabIndex={-1} className="bg-cream min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <p className="text-8xl font-bold text-terracotta/20 select-none" aria-hidden="true">
          404
        </p>
        <h1 className="text-3xl font-bold text-charcoal mt-4 mb-3">
          Page not found
        </h1>
        <p className="text-warm-gray leading-relaxed mb-8">
          The page you're looking for doesn't exist or may have moved.
        </p>
        <Link to="/" className="btn-primary">
          Go back home
        </Link>
      </div>
    </main>
  )
}
