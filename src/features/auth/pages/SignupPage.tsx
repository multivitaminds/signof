import { useState, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../stores/useAuthStore'
import authService from '../lib/authService'
import { api } from '../../../lib/api'
import './LoginPage.css'

const isApiMode = Boolean(import.meta.env.VITE_API_URL)

export default function SignupPage() {
  const navigate = useNavigate()
  const signup = useAuthStore((s) => s.signup)
  const loginFromApi = useAuthStore((s) => s.loginFromApi)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      setError('Name is required')
      return
    }
    if (!email.trim()) {
      setError('Email is required')
      return
    }

    if (isApiMode) {
      // API mode: name + email + password + confirm
      if (!password) {
        setError('Password is required')
        return
      }
      if (password.length < 8) {
        setError('Password must be at least 8 characters')
        return
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match')
        return
      }
      setLoading(true)
      const result = await authService.signup({
        email: email.trim(),
        password,
        displayName: name.trim(),
      })
      setLoading(false)
      if (!result.ok) {
        setError(result.message)
        return
      }
      api.setToken(result.data.tokens.accessToken)
      loginFromApi(
        {
          id: result.data.user.id,
          name: result.data.user.displayName,
          email: result.data.user.email,
          avatarUrl: result.data.user.avatarUrl,
          createdAt: new Date().toISOString(),
        },
        result.data.tokens.accessToken,
        result.data.tokens.refreshToken
      )
      navigate('/signup/plan')
    } else {
      // Demo mode: name + email, no password
      signup(email.trim(), name.trim())
      navigate('/signup/plan')
    }
  }, [name, email, password, confirmPassword, signup, loginFromApi, navigate])

  return (
    <div className="auth-page">
      <div className="auth-page__card">
        <div className="auth-page__logo">
          <span className="auth-page__logo-text">Orchestree</span>
        </div>
        <h1 className="auth-page__title">Create your account</h1>
        <p className="auth-page__subtitle">Start your free Orchestree workspace</p>

        <form className="auth-page__form" onSubmit={handleSubmit}>
          {error && <div className="auth-page__error">{error}</div>}
          <div className="auth-page__field">
            <label className="auth-page__label">Full Name</label>
            <input
              className="auth-page__input"
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); setError('') }}
              placeholder="John Doe"
              autoComplete="name"
            />
          </div>
          <div className="auth-page__field">
            <label className="auth-page__label">Work Email</label>
            <input
              className="auth-page__input"
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError('') }}
              placeholder="john@company.com"
              autoComplete="email"
            />
          </div>
          {isApiMode && (
            <>
              <div className="auth-page__field">
                <label className="auth-page__label">Password</label>
                <input
                  className="auth-page__input"
                  type="password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError('') }}
                  placeholder="Min. 8 characters"
                  autoComplete="new-password"
                />
              </div>
              <div className="auth-page__field">
                <label className="auth-page__label">Confirm Password</label>
                <input
                  className="auth-page__input"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setError('') }}
                  placeholder="Confirm your password"
                  autoComplete="new-password"
                />
              </div>
            </>
          )}
          <button type="submit" className="btn-primary auth-page__submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div className="auth-page__divider">
          <span>or</span>
        </div>

        <button className="auth-page__social">
          Sign up with Google
        </button>
        <button className="auth-page__social">
          Sign up with GitHub
        </button>

        <p className="auth-page__footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
