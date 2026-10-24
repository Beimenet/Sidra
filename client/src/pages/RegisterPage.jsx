import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import logo from '../assets/logo.jpg'
import { useAuth, FAMILY_ROLES } from '../context/AuthContext.jsx'

// ── Reusable field wrapper ────────────────────────────────────────────────────
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

// ── Input ─────────────────────────────────────────────────────────────────────
function Input({ id, type = 'text', value, onChange, placeholder, 'aria-describedby': ariaDescribedby, autoComplete }) {
  return (
    <input
      id={id}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      autoComplete={autoComplete}
      aria-describedby={ariaDescribedby}
      className="w-full px-4 py-3 bg-white border border-border rounded-xl text-charcoal placeholder:text-warm-gray/60
                 focus:outline-none focus:ring-2 focus:ring-terracotta focus:border-transparent text-sm"
    />
  )
}

// ── Role card ─────────────────────────────────────────────────────────────────
function RoleCard({ role, selected, onChange }) {
  const isSelected = selected === role.value
  return (
    <label
      className={`relative flex flex-col items-center text-center gap-3 p-5 rounded-2xl border-2 cursor-pointer
                  transition-all duration-150 select-none
                  ${isSelected
          ? 'border-terracotta bg-terracotta/5 shadow-md'
          : 'border-border bg-white hover:border-terracotta/50 hover:bg-cream'
        }`}
    >
      <input
        type="radio"
        name="familyRole"
        value={role.value}
        checked={isSelected}
        onChange={() => onChange(role.value)}
        className="sr-only"
        aria-label={role.label}
      />

      {/* Selected tick */}
      {isSelected && (
        <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-terracotta flex items-center justify-center" aria-hidden="true">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 text-white" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
          </svg>
        </span>
      )}

      {/* Icon */}
      <span className={`${isSelected ? 'text-terracotta' : 'text-warm-gray'} transition-colors`}>
        {role.icon}
      </span>

      {/* Label */}
      <span className={`text-sm font-semibold ${isSelected ? 'text-terracotta' : 'text-charcoal'}`}>
        {role.label}
      </span>

      {/* Description */}
      <span className="text-xs text-warm-gray leading-snug">
        {role.description}
      </span>
    </label>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [familyRole, setFamilyRole] = useState('')
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  function setField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }))
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: '' }))
  }

  function validate() {
    const e = {}
    if (!form.name.trim()) e.name = 'Full name is required.'
    if (!form.email.trim()) e.email = 'Email address is required.'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Please enter a valid email address.'
    if (!form.password) e.password = 'Password is required.'
    else if (form.password.length < 8) e.password = 'Password must be at least 8 characters.'
    else if (!/[A-Za-z]/.test(form.password) || !/[0-9]/.test(form.password))
      e.password = 'Password must include at least one letter and one number.'
    if (form.confirmPassword !== form.password) e.confirmPassword = 'Passwords do not match.'
    if (!familyRole) e.familyRole = 'Please select your role in the family.'
    return e
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitError('')
    const e2 = validate()
    if (Object.keys(e2).length) { setErrors(e2); return }

    setSubmitting(true)
    try {
      await register({ name: form.name, email: form.email, password: form.password, familyRole })
      navigate('/profile')
    } catch (err) {
      // Surface field-level errors returned by the backend (e.g. duplicate email)
      if (err.fields) {
        // Map backend field names back to frontend names
        const mapped = {}
        if (err.fields.full_name) mapped.name = err.fields.full_name
        if (err.fields.email) mapped.email = err.fields.email
        if (err.fields.password) mapped.password = err.fields.password
        setErrors(mapped)
      }
      setSubmitError(err.message ?? 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main id="main-content" tabIndex={-1} className="bg-cream min-h-screen py-10 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link to="/" aria-label="Go to Sidra home">
            <img src={logo} alt="Sidra (ሰድራ) — Guidance for Every Family" className="h-16 w-auto" />
          </Link>
        </div>

        <div className="card p-8 sm:p-10">
          <h1 className="text-2xl font-bold text-charcoal mb-1">Create your account</h1>
          <p className="text-warm-gray text-sm mb-8">
            Already have an account?{' '}
            <Link to="/login" className="text-terracotta font-semibold hover:text-terracotta-hover underline-offset-2 hover:underline">
              Log in here
            </Link>
          </p>

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">

            {/* Name */}
            <Field id="name" label="Full name" error={errors.name}>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setField('name', e.target.value)}
                placeholder="e.g. Meron Tadesse"
                autoComplete="name"
                aria-describedby={errors.name ? 'name-error' : undefined}
              />
            </Field>

            {/* Email */}
            <Field id="email" label="Email address" error={errors.email}>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setField('email', e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                aria-describedby={errors.email ? 'email-error' : undefined}
              />
            </Field>

            {/* Password */}
            <Field id="password" label="Password" error={errors.password}>
              <Input
                id="password"
                type="password"
                value={form.password}
                onChange={(e) => setField('password', e.target.value)}
                placeholder="At least 8 characters"
                autoComplete="new-password"
                aria-describedby={errors.password ? 'password-error' : undefined}
              />
            </Field>

            {/* Confirm password */}
            <Field id="confirmPassword" label="Confirm password" error={errors.confirmPassword}>
              <Input
                id="confirmPassword"
                type="password"
                value={form.confirmPassword}
                onChange={(e) => setField('confirmPassword', e.target.value)}
                placeholder="Repeat your password"
                autoComplete="new-password"
                aria-describedby={errors.confirmPassword ? 'confirmPassword-error' : undefined}
              />
            </Field>

            {/* ── Family role ─────────────────────────────────────────────── */}
            <fieldset>
              <legend className="mb-1">
                <span className="text-sm font-semibold text-charcoal">Your role in the family</span>
              </legend>
              <p className="text-sm text-warm-gray mb-4">
                Every family is different. Tell us how you care for or support your child.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3" role="radiogroup" aria-required="true">
                {FAMILY_ROLES.map((role) => (
                  <RoleCard
                    key={role.value}
                    role={role}
                    selected={familyRole}
                    onChange={(v) => {
                      setFamilyRole(v)
                      if (errors.familyRole) setErrors((prev) => ({ ...prev, familyRole: '' }))
                    }}
                  />
                ))}
              </div>

              {errors.familyRole && (
                <p role="alert" className="mt-3 text-xs text-red-600 flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
                  </svg>
                  {errors.familyRole}
                </p>
              )}
            </fieldset>

            {/* Submit error */}
            {submitError && (
              <div role="alert" className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                {submitError}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full mt-1 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? 'Creating account…' : 'Create account'}
            </button>

            <p className="text-xs text-center text-warm-gray leading-relaxed">
              By creating an account you agree to our{' '}
              <Link to="/terms" className="text-terracotta hover:underline underline-offset-2">Terms of Use</Link>{' '}
              and{' '}
              <Link to="/privacy" className="text-terracotta hover:underline underline-offset-2">Privacy Policy</Link>.
            </p>
          </form>
        </div>
      </div>
    </main>
  )
}
