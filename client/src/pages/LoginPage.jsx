import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import logo from '../assets/logo.jpg'
import { useAuth } from '../context/AuthContext.jsx'

function Field({ id, label, error, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold text-charcoal">
        {label}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} role="alert" className="text-xs text-red-600 flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  )
}

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Redirect back to the page the user came from, or /profile
  const from = location.state?.from ?? '/profile'

  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  function setField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }))
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: '' }))
  }

  function validate() {
    const e = {}
    if (!form.email.trim()) e.email = 'Email address is required.'
    if (!form.password) e.password = 'Password is required.'
    return e
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitError('')
    const e2 = validate()
    if (Object.keys(e2).length) { setErrors(e2); return }

    setSubmitting(true)
    try {
      await login({ email: form.email, password: form.password })
      navigate(from, { replace: true })
    } catch (err) {
      // Use a generic message — never reveal which field was wrong
      setSubmitError('Unable to log in. Please check your details and try again.')
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main id="main-content" tabIndex={-1} className="bg-cream min-h-screen py-10 px-4 flex flex-col items-center justify-center">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link to="/" aria-label="Go to Sidra home">
            <img src={logo} alt="Sidra (ሰድራ) — Guidance for Every Family" className="h-16 w-auto" />
          </Link>
        </div>

        <div className="card p-8">
          <h1 className="text-2xl font-bold text-charcoal mb-1">Welcome back</h1>
          <p className="text-warm-gray text-sm mb-8">
            Don't have an account?{' '}
            <Link to="/register" className="text-terracotta font-semibold hover:text-terracotta-hover underline-offset-2 hover:underline">
              Create one here
            </Link>
          </p>

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">

            <Field id="email" label="Email address" error={errors.email}>
              <input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setField('email', e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                aria-describedby={errors.email ? 'email-error' : undefined}
                className="w-full px-4 py-3 bg-white border border-border rounded-xl text-charcoal placeholder:text-warm-gray/60
                           focus:outline-none focus:ring-2 focus:ring-terracotta focus:border-transparent text-sm"
              />
            </Field>

            <Field id="password" label="Password" error={errors.password}>
              <input
                id="password"
                type="password"
                value={form.password}
                onChange={(e) => setField('password', e.target.value)}
                placeholder="Your password"
                autoComplete="current-password"
                aria-describedby={errors.password ? 'password-error' : undefined}
                className="w-full px-4 py-3 bg-white border border-border rounded-xl text-charcoal placeholder:text-warm-gray/60
                           focus:outline-none focus:ring-2 focus:ring-terracotta focus:border-transparent text-sm"
              />
            </Field>

            {/* Generic submit error — does not reveal which field failed */}
            {submitError && (
              <div role="alert" className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                {submitError}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? 'Logging in…' : 'Log in'}
            </button>

            <p className="text-xs text-center text-warm-gray">
              Forgot your password?{' '}
              <span className="text-warm-gray/60">
                Password reset will be available when authentication is implemented.
              </span>
            </p>
          </form>
        </div>

        <p className="text-center text-xs text-warm-gray mt-6">
          <Link to="/" className="hover:text-terracotta transition-colors">← Back to home</Link>
        </p>
      </div>
    </main>
  )
}
