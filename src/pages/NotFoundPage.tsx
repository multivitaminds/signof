import { Link, useNavigate } from 'react-router-dom'
import { useCallback } from 'react'
import { FileText, FolderKanban, CalendarDays, BookOpen, ArrowLeft, Home } from 'lucide-react'
import './NotFoundPage.css'

const quickLinks = [
  { to: '/pages', label: 'Pages', description: 'Wiki & documents', icon: BookOpen },
  { to: '/projects', label: 'Projects', description: 'Track issues & tasks', icon: FolderKanban },
  { to: '/documents', label: 'Documents', description: 'Sign & manage', icon: FileText },
  { to: '/calendar', label: 'Calendar', description: 'Schedule meetings', icon: CalendarDays },
] as const

export default function NotFoundPage() {
  const navigate = useNavigate()

  const handleGoBack = useCallback(() => {
    navigate(-1)
  }, [navigate])

  return (
    <div className="not-found">
      {/* Animated floating illustration */}
      <div className="not-found__illustration" aria-hidden="true">
        <div className="not-found__doc">
          <div className="not-found__doc-line not-found__doc-line--long" />
          <div className="not-found__doc-line not-found__doc-line--medium" />
          <div className="not-found__doc-line not-found__doc-line--short" />
          <div className="not-found__doc-line not-found__doc-line--medium" />
          <div className="not-found__doc-question">?</div>
        </div>
        {/* Decorative floating shapes */}
        <div className="not-found__shape not-found__shape--circle" />
        <div className="not-found__shape not-found__shape--square" />
        <div className="not-found__shape not-found__shape--triangle" />
      </div>

      {/* Error code */}
      <div className="not-found__code">404</div>

      {/* Text content */}
      <h1 className="not-found__title">Page not found</h1>
      <p className="not-found__description">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>

      {/* Action buttons */}
      <div className="not-found__actions">
        <Link to="/" className="not-found__btn not-found__btn--primary">
          <Home size={16} />
          Go Home
        </Link>
        <button
          type="button"
          onClick={handleGoBack}
          className="not-found__btn not-found__btn--secondary"
        >
          <ArrowLeft size={16} />
          Go Back
        </button>
      </div>

      {/* Quick links */}
      <div className="not-found__links">
        <p className="not-found__links-label">Or jump to a section</p>
        <div className="not-found__links-grid">
          {quickLinks.map(({ to, label, description, icon: Icon }) => (
            <Link key={to} to={to} className="not-found__card">
              <div className="not-found__card-icon">
                <Icon size={20} />
              </div>
              <div className="not-found__card-text">
                <span className="not-found__card-label">{label}</span>
                <span className="not-found__card-desc">{description}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
