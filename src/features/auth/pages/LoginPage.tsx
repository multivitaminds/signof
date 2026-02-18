import { useState, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../stores/useAuthStore'
import authService from '../lib/authService'
import { api } from '../../../lib/api'
import './LoginPage.css'

const isApiMode = Boolean(import.meta.env.VITE_API_URL)

export default function LoginPage() {
  const navigate = useNavigate()
  const login = useAuthStore((s) => s.login)
  const loginFromApi = useAuthStore((s) => s.loginFromApi)
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()

    if (isApiMode) {
      // API mode: email + password
      if (!email.trim()) {
        setError('Email is required')
        return
      }
      if (!password) {
        setError('Password is required')
        return
      }
      setLoading(true)
      const result = await authService.login({ email: email.trim(), password })
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
      navigate('/')
    } else {
      // Demo mode: name + email, no password
      if (!email.trim()) {
        setError('Email is required')
        return
      }
      if (!name.trim()) {
        setError('Name is required')
        return
      }
      login(email.trim(), name.trim())
      navigate('/')
    }
  }, [email, name, password, login, loginFromApi, navigate])

  return (
    <div className="auth-page">
      <div className="auth-page__card">
        <div className="auth-page__logo">
          <span className="auth-page__logo-text">Orchestree</span>
        </div>
        <h1 className="auth-page__title">Welcome back</h1>
        <p className="auth-page__subtitle">Sign in to your workspace</p>

        <form className="auth-page__form" onSubmit={handleSubmit}>
          {error && <div className="auth-page__error">{error}</div>}
          {!isApiMode && (
            <div className="auth-page__field">
              <label className="auth-page__label">Name</label>
              <input
                className="auth-page__input"
                type="text"
                value={name}
                onChange={(e) => { setName(e.target.value); setError('') }}
                placeholder="Your name"
                autoComplete="name"
              />
            </div>
          )}
          <div className="auth-page__field">
            <label className="auth-page__label">Email</label>
            <input
              className="auth-page__input"
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError('') }}
              placeholder="you@company.com"
              autoComplete="email"
            />
          </div>
          {isApiMode && (
            <div className="auth-page__field">
              <label className="auth-page__label">Password</label>
              <input
                className="auth-page__input"
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError('') }}
                placeholder="Enter your password"
                autoComplete="current-password"
              />
            </div>
          )}
          <button type="submit" className="btn-primary auth-page__submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-page__divider">
          <span>or</span>
        </div>

        <button className="auth-page__social">
          Continue with Google
        </button>
        <button className="auth-page__social">
          Continue with GitHub
        </button>

        <p className="auth-page__footer">
          Don&apos;t have an account? <Link to="/signup">Sign up</Link>
        </p>
      </div>
    </div>
  )
}
