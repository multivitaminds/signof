import { Link, useNavigate } from 'react-router-dom'
import { useCallback } from 'react'
import './NotFoundPage.css'

export default function NotFoundPage() {
  const navigate = useNavigate()

  const handleGoBack = useCallback(() => {
    navigate(-1)
  }, [navigate])

  return (
    <div className="not-found">
      <div className="not-found__code">404</div>
      <h1 className="not-found__title">Page not found</h1>
      <p className="not-found__description">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <div className="not-found__actions">
        <Link to="/" className="not-found__link not-found__link--primary">
          Go home
        </Link>
        <button
          onClick={handleGoBack}
          className="not-found__link not-found__link--secondary"
        >
          Go back
        </button>
      </div>
    </div>
  )
}
