import { useState } from 'react'
import { useAuth } from '../context/useAuth'
import '../styles/Auth.css'

export default function Login({ onNavigate, redirectPath = 'dashboard' }) {
  const { signIn, authNotification, setAuthNotification } = useAuth()

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState(null)
  const [successMsg, setSuccessMsg] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }))
    }
    if (apiError) setApiError(null)
    if (authNotification) setAuthNotification(null)
  }

  const validate = () => {
    const newErrors = {}
    const trimmedEmail = formData.email.trim()

    if (!trimmedEmail) {
      newErrors.email = 'Email address is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
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
      const { data, error } = await signIn({
        email: formData.email,
        password: formData.password,
      })

      if (error) {
        if (error.message?.includes('Invalid login credentials')) {
          setApiError('Incorrect email or password. Please verify your details.')
        } else if (error.message?.includes('Email not confirmed')) {
          setApiError('Your email address has not been confirmed yet. Please check your inbox.')
        } else {
          setApiError(error.message || 'Failed to sign in. Please try again.')
        }
        setLoading(false)
        return
      }

      if (data?.session) {
        setSuccessMsg('Successfully signed in! Opening dashboard...')
        setTimeout(() => {
          onNavigate(redirectPath || 'dashboard')
        }, 800)
      }
    } catch (err) {
      setApiError(err.message || 'An unexpected error occurred during login.')
    } finally {
      setLoading(false)
    }
  }

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
          <div className="auth-card-header">
            <div className="auth-eyebrow">
              <span>✦</span> WELCOME BACK
            </div>
            <h1>
              Sign in to <span>HackVerse.</span>
            </h1>
            <p className="auth-subtitle">
              Access your hackathons, team collaborations, and project roadmap.
            </p>
          </div>

          {authNotification && (
            <div className="auth-alert auth-alert-info" role="status">
              <span className="auth-alert-icon">ℹ</span>
              <div>{authNotification}</div>
            </div>
          )}

          {successMsg && (
            <div className="auth-alert auth-alert-success" role="status">
              <span className="auth-alert-icon">✓</span>
              <div>{successMsg}</div>
            </div>
          )}

          {apiError && (
            <div className="auth-alert auth-alert-error" role="alert">
              <span className="auth-alert-icon">⚠</span>
              <div>{apiError}</div>
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            {/* Email Address */}
            <div className="auth-field">
              <label className="auth-label" htmlFor="login-email">
                Email Address
              </label>
              <div className="auth-input-wrapper">
                <span className="auth-input-icon">✉</span>
                <input
                  id="login-email"
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
              <div className="auth-label-row">
                <label className="auth-label" htmlFor="login-password">
                  Password
                </label>
                <a
                  href="#forgot-password"
                  className="auth-forgot-link"
                  onClick={(e) => {
                    e.preventDefault()
                    onNavigate('forgot-password')
                  }}
                >
                  Forgot Password?
                </a>
              </div>
              <div className="auth-input-wrapper">
                <span className="auth-input-icon">🔒</span>
                <input
                  id="login-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  className={`auth-input has-toggle ${errors.password ? 'input-error' : ''}`}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="current-password"
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

            {/* Submit button */}
            <button
              type="submit"
              className="auth-submit-btn"
              disabled={loading}
              id="login-submit-button"
            >
              {loading ? (
                <>
                  <span className="auth-spinner" />
                  <span>Signing In...</span>
                </>
              ) : (
                <span>Sign In ↗</span>
              )}
            </button>
          </form>

          <div className="auth-card-footer">
            Don&apos;t have an account yet?
            <a
              href="#register"
              className="auth-switch-link"
              onClick={(e) => {
                e.preventDefault()
                onNavigate('register')
              }}
            >
              Create Account
            </a>
          </div>
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
