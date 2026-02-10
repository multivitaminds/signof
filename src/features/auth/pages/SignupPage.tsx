import { useState, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../stores/useAuthStore'
import './LoginPage.css'

export default function SignupPage() {
  const navigate = useNavigate()
  const signup = useAuthStore((s) => s.signup)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('Name is required')
      return
    }
    if (!email.trim()) {
      setError('Email is required')
      return
    }
    signup(email.trim(), name.trim())
    navigate('/')
  }, [name, email, signup, navigate])

  return (
    <div className="auth-page">
      <div className="auth-page__card">
        <div className="auth-page__logo">
          <span className="auth-page__logo-text">SignOf</span>
        </div>
        <h1 className="auth-page__title">Create your account</h1>
        <p className="auth-page__subtitle">Start your free SignOf workspace</p>

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
          <button type="submit" className="btn-primary auth-page__submit">
            Create Account
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
