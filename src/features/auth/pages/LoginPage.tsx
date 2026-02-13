import { useState, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../stores/useAuthStore'
import './LoginPage.css'

export default function LoginPage() {
  const navigate = useNavigate()
  const login = useAuthStore((s) => s.login)
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
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
  }, [email, name, login, navigate])

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
          <button type="submit" className="btn-primary auth-page__submit">
            Sign In
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
