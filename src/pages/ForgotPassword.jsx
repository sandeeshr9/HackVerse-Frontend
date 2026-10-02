import { useState } from 'react'
import { useAuth } from '../context/useAuth'
import '../styles/Auth.css'

export default function ForgotPassword({ onNavigate }) {
  const { resetPasswordForEmail } = useAuth()
  const [email, setEmail] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    const trimmed = email.trim()
    if (!trimmed) {
      setError('Please enter your email address')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError('Please enter a valid email address')
      return
    }

    setLoading(true)

    try {
      const { error: resetError } = await resetPasswordForEmail(trimmed)

      if (resetError) {
        setError(resetError.message || 'Failed to send password reset email.')
        setLoading(false)
        return
      }

      setSubmitted(true)
    } catch (err) {
      setError(err.message || 'An unexpected error occurred.')
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
          {submitted ? (
            <div className="auth-success-screen">
              <div className="auth-success-icon-wrap">✉</div>
              <h2>Check Your Inbox</h2>
              <p>
                We have sent password reset instructions to <strong>{email}</strong>.
                Please check your email and click the recovery link to set a new password.
              </p>
              <button
                type="button"
                className="auth-submit-btn"
                onClick={() => onNavigate('login')}
              >
                Back to Sign In
              </button>
            </div>
          ) : (
            <>
              <div className="auth-card-header">
                <div className="auth-eyebrow">
                  <span>✦</span> ACCOUNT RECOVERY
                </div>
                <h1>
                  Reset your <span>password.</span>
                </h1>
                <p className="auth-subtitle">
                  Enter your registered email address and we&apos;ll send you a secure link to reset your password.
                </p>
              </div>

              {error && (
                <div className="auth-alert auth-alert-error" role="alert">
                  <span className="auth-alert-icon">⚠</span>
                  <div>{error}</div>
                </div>
              )}

              <form className="auth-form" onSubmit={handleSubmit} noValidate>
                <div className="auth-field">
                  <label className="auth-label" htmlFor="forgot-email">
                    Account Email Address
                  </label>
                  <div className="auth-input-wrapper">
                    <span className="auth-input-icon">✉</span>
                    <input
                      id="forgot-email"
                      type="email"
                      className="auth-input"
                      placeholder="alex@example.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value)
                        if (error) setError(null)
                      }}
                      autoComplete="email"
                      disabled={loading}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="auth-submit-btn"
                  disabled={loading}
                  id="reset-password-request-button"
                >
                  {loading ? (
                    <>
                      <span className="auth-spinner" />
                      <span>Sending Link...</span>
                    </>
                  ) : (
                    <span>Send Reset Link ↗</span>
                  )}
                </button>
              </form>

              <div className="auth-card-footer">
                Remember your password?
                <a
                  href="#login"
                  className="auth-switch-link"
                  onClick={(e) => {
                    e.preventDefault()
                    onNavigate('login')
                  }}
                >
                  Return to sign in
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
