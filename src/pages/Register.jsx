import { useState } from 'react'
import { useAuth } from '../context/useAuth'
import '../styles/Auth.css'

export default function Register({ onNavigate }) {
  const { signUp } = useAuth()

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState(null)
  const [successInfo, setSuccessInfo] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear field-specific error as user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }))
    }
    if (apiError) setApiError(null)
  }

  const validate = () => {
    const newErrors = {}
    const trimmedName = formData.fullName.trim()
    const trimmedEmail = formData.email.trim()

    if (!trimmedName) {
      newErrors.fullName = 'Full name is required'
    } else if (trimmedName.length < 2) {
      newErrors.fullName = 'Name must be at least 2 characters'
    }

    if (!trimmedEmail) {
      newErrors.email = 'Email address is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setApiError(null)

    if (!validate()) return

    setLoading(true)

    try {
      const { data, error } = await signUp({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
      })

      if (error) {
        setApiError(error.message || 'Failed to create account. Please try again.')
        setLoading(false)
        return
      }

      // Check whether email confirmation is required or if session is already active
      if (data?.session) {
        // Immediate login!
        setSuccessInfo({
          type: 'auto_login',
          message: `Welcome to HackVerse, ${formData.fullName.trim()}! Redirecting to your dashboard...`,
        })
        setTimeout(() => {
          onNavigate('dashboard')
        }, 1200)
      } else {
        // Email confirmation is required by Supabase project settings
        setSuccessInfo({
          type: 'confirm_email',
          email: formData.email.trim(),
          message: `We've sent a verification link to ${formData.email.trim()}. Please check your email to confirm your account before logging in.`,
        })
      }
    } catch (err) {
      setApiError(err.message || 'An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const isPasswordLengthMet = formData.password.length >= 6
  const isMatchMet = formData.password && formData.password === formData.confirmPassword

  return (
    <div className="auth-page-wrapper">
      <div className="auth-ambient-glow auth-ambient-top" />
      <div className="auth-ambient-glow auth-ambient-bottom" />

      <div className="auth-card-container">
        <div className="auth-brand-header">
          <a
            href="#home"
            className="auth-brand-logo"
            onClick={(e) => {
              e.preventDefault()
              onNavigate('dashboard')
            }}
          >
            <span className="brand-icon">H</span>
            <span>
              Hack<span className="brand-accent">Verse</span>
            </span>
          </a>
        </div>

        <div className="auth-card">
          {successInfo ? (
            <div className="auth-success-screen">
              <div className="auth-success-icon-wrap">✓</div>
              <h2>
                {successInfo.type === 'auto_login'
                  ? 'Account Created!'
                  : 'Check Your Email'}
              </h2>
              <p>{successInfo.message}</p>

              {successInfo.type === 'confirm_email' && (
                <button
                  type="button"
                  className="auth-submit-btn"
                  onClick={() => onNavigate('login')}
                >
                  Proceed to Login
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="auth-card-header">
                <div className="auth-eyebrow">
                  <span>✦</span> JOIN THE INNOVATION NETWORK
                </div>
                <h1>
                  Create your <span>account.</span>
                </h1>
                <p className="auth-subtitle">
                  Build, collaborate, and compete in premier hackathons worldwide.
                </p>
              </div>

              {apiError && (
                <div className="auth-alert auth-alert-error" role="alert">
                  <span className="auth-alert-icon">⚠</span>
                  <div>{apiError}</div>
                </div>
              )}

              <form className="auth-form" onSubmit={handleSubmit} noValidate>
                {/* Full Name */}
                <div className="auth-field">
                  <label className="auth-label" htmlFor="register-fullName">
                    Full Name
                  </label>
                  <div className="auth-input-wrapper">
                    <span className="auth-input-icon">👤</span>
                    <input
                      id="register-fullName"
                      name="fullName"
                      type="text"
                      className={`auth-input ${errors.fullName ? 'input-error' : ''}`}
                      placeholder="e.g. Alex Morgan"
                      value={formData.fullName}
                      onChange={handleChange}
                      autoComplete="name"
                      disabled={loading}
                    />
                  </div>
                  {errors.fullName && (
                    <span className="auth-field-error">{errors.fullName}</span>
                  )}
                </div>

                {/* Email Address */}
                <div className="auth-field">
                  <label className="auth-label" htmlFor="register-email">
                    Email Address
                  </label>
                  <div className="auth-input-wrapper">
                    <span className="auth-input-icon">✉</span>
                    <input
                      id="register-email"
                      name="email"
                      type="email"
                      className={`auth-input ${errors.email ? 'input-error' : ''}`}
                      placeholder="alex@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      autoComplete="email"
                      disabled={loading}
                    />
                  </div>
                  {errors.email && (
                    <span className="auth-field-error">{errors.email}</span>
                  )}
                </div>

                {/* Password */}
                <div className="auth-field">
                  <label className="auth-label" htmlFor="register-password">
                    Password
                  </label>
                  <div className="auth-input-wrapper">
                    <span className="auth-input-icon">🔒</span>
                    <input
                      id="register-password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      className={`auth-input has-toggle ${errors.password ? 'input-error' : ''}`}
                      placeholder="At least 6 characters"
                      value={formData.password}
                      onChange={handleChange}
                      autoComplete="new-password"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      className="auth-toggle-password"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      tabIndex="-1"
                    >
                      {showPassword ? '👁' : '👁‍🗨'}
                    </button>
                  </div>
                  {errors.password && (
                    <span className="auth-field-error">{errors.password}</span>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="auth-field">
                  <label className="auth-label" htmlFor="register-confirmPassword">
                    Confirm Password
                  </label>
                  <div className="auth-input-wrapper">
                    <span className="auth-input-icon">🔒</span>
                    <input
                      id="register-confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      className={`auth-input has-toggle ${errors.confirmPassword ? 'input-error' : ''}`}
                      placeholder="Re-enter your password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      autoComplete="new-password"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      className="auth-toggle-password"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                      tabIndex="-1"
                    >
                      {showConfirmPassword ? '👁' : '👁‍🗨'}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <span className="auth-field-error">{errors.confirmPassword}</span>
                  )}

                  {/* Password requirement indicators */}
                  {formData.password && (
                    <div className="auth-req-list">
                      <div
                        className={`auth-req-item ${isPasswordLengthMet ? 'met' : ''}`}
                      >
                        <span className="auth-req-dot">
                          {isPasswordLengthMet ? '✓' : '○'}
                        </span>
                        <span>At least 6 characters</span>
                      </div>
                      {formData.confirmPassword && (
                        <div className={`auth-req-item ${isMatchMet ? 'met' : ''}`}>
                          <span className="auth-req-dot">
                            {isMatchMet ? '✓' : '○'}
                          </span>
                          <span>Passwords match</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  className="auth-submit-btn"
                  disabled={loading}
                  id="create-account-submit"
                >
                  {loading ? (
                    <>
                      <span className="auth-spinner" />
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <span>Create Account ↗</span>
                  )}
                </button>
              </form>

              <div className="auth-card-footer">
                Already have a HackVerse account?
                <a
                  href="#login"
                  className="auth-switch-link"
                  onClick={(e) => {
                    e.preventDefault()
                    onNavigate('login')
                  }}
                >
                  Sign in
                </a>
              </div>
            </>
          )}
        </div>

        <div style={{ textAlign: 'center' }}>
          <a
            href="#home"
            className="auth-back-link"
            onClick={(e) => {
              e.preventDefault()
              onNavigate('dashboard')
            }}
          >
            ← Return to HackVerse Workspace
          </a>
        </div>
      </div>
    </div>
  )
}
