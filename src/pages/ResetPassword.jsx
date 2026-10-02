import { useState } from 'react'
import { useAuth } from '../context/useAuth'
import '../styles/Auth.css'

export default function ResetPassword({ onNavigate }) {
  const { updatePassword } = useAuth()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState(null)
  const [success, setSuccess] = useState(false)

  const validate = () => {
    const newErrors = {}
    if (!password) {
      newErrors.password = 'New password is required'
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Confirm your new password'
    } else if (password !== confirmPassword) {
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
      const { error } = await updatePassword(password)

      if (error) {
        setApiError(error.message || 'Failed to update password. Your recovery link may have expired.')
        setLoading(false)
        return
      }

      setSuccess(true)
      setTimeout(() => {
        onNavigate('dashboard')
      }, 1500)
    } catch (err) {
      setApiError(err.message || 'An unexpected error occurred while updating your password.')
    } finally {
      setLoading(false)
    }
  }

  const isLengthMet = password.length >= 6
  const isMatchMet = password && password === confirmPassword

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
          {success ? (
            <div className="auth-success-screen">
              <div className="auth-success-icon-wrap">✓</div>
              <h2>Password Updated!</h2>
              <p>
                Your password has been successfully updated. Redirecting you to your
                HackVerse dashboard...
              </p>
              <button
                type="button"
                className="auth-submit-btn"
                onClick={() => onNavigate('dashboard')}
              >
                Go to Dashboard Now ↗
              </button>
            </div>
          ) : (
            <>
              <div className="auth-card-header">
                <div className="auth-eyebrow">
                  <span>✦</span> ACCOUNT SECURITY
                </div>
                <h1>
                  Set new <span>password.</span>
                </h1>
                <p className="auth-subtitle">
                  Choose a new strong password to secure your HackVerse account.
                </p>
              </div>

              {apiError && (
                <div className="auth-alert auth-alert-error" role="alert">
                  <span className="auth-alert-icon">⚠</span>
                  <div>{apiError}</div>
                </div>
              )}

              <form className="auth-form" onSubmit={handleSubmit} noValidate>
                {/* New Password */}
                <div className="auth-field">
                  <label className="auth-label" htmlFor="reset-new-password">
                    New Password
                  </label>
                  <div className="auth-input-wrapper">
                    <span className="auth-input-icon">🔒</span>
                    <input
                      id="reset-new-password"
                      type={showPassword ? 'text' : 'password'}
                      className={`auth-input has-toggle ${errors.password ? 'input-error' : ''}`}
                      placeholder="At least 6 characters"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value)
                        if (errors.password) setErrors((prev) => ({ ...prev, password: null }))
                        if (apiError) setApiError(null)
                      }}
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

                {/* Confirm New Password */}
                <div className="auth-field">
                  <label className="auth-label" htmlFor="reset-confirm-password">
                    Confirm New Password
                  </label>
                  <div className="auth-input-wrapper">
                    <span className="auth-input-icon">🔒</span>
                    <input
                      id="reset-confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      className={`auth-input has-toggle ${errors.confirmPassword ? 'input-error' : ''}`}
                      placeholder="Re-enter your new password"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value)
                        if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: null }))
                        if (apiError) setApiError(null)
                      }}
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

                  {password && (
                    <div className="auth-req-list">
                      <div className={`auth-req-item ${isLengthMet ? 'met' : ''}`}>
                        <span className="auth-req-dot">{isLengthMet ? '✓' : '○'}</span>
                        <span>At least 6 characters</span>
                      </div>
                      {confirmPassword && (
                        <div className={`auth-req-item ${isMatchMet ? 'met' : ''}`}>
                          <span className="auth-req-dot">{isMatchMet ? '✓' : '○'}</span>
                          <span>Passwords match</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className="auth-submit-btn"
                  disabled={loading}
                  id="reset-update-password-btn"
                >
                  {loading ? (
                    <>
                      <span className="auth-spinner" />
                      <span>Updating Password...</span>
                    </>
                  ) : (
                    <span>Update Password ↗</span>
                  )}
                </button>
              </form>

              <div className="auth-card-footer">
                <a
                  href="#login"
                  className="auth-switch-link"
                  onClick={(e) => {
                    e.preventDefault()
                    onNavigate('login')
                  }}
                >
                  ← Return to Sign In
                </a>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
