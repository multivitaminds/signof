import { useState, useCallback, useMemo } from 'react'
import { X, FileSignature, Calendar } from 'lucide-react'
import { useDocumentStore } from '../../stores/useDocumentStore'
import { useSchedulingStore } from '../../features/scheduling/stores/useSchedulingStore'
import { ACTIVE_STATUSES } from '../../types'
import './WelcomeBanner.css'

const DISMISSED_KEY = 'signof-welcome-banner-dismissed'

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

function formatDate(): string {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

interface WelcomeBannerProps {
  userName?: string
}

export default function WelcomeBanner({ userName = 'Sam' }: WelcomeBannerProps) {
  const [dismissed, setDismissed] = useState(() => {
    try {
      return localStorage.getItem(DISMISSED_KEY) === 'true'
    } catch {
      return false
    }
  })

  const documents = useDocumentStore((s) => s.documents)
  const bookings = useSchedulingStore((s) => s.bookings)

  const pendingSignatures = useMemo(
    () => documents.filter((d) => (ACTIVE_STATUSES as string[]).includes(d.status)).length,
    [documents]
  )

  const upcomingMeetings = useMemo(() => {
    const today = new Date().toISOString().split('T')[0] ?? ''
    return bookings.filter((b) => b.status === 'confirmed' && b.date >= today).length
  }, [bookings])

  const handleDismiss = useCallback(() => {
    setDismissed(true)
    try {
      localStorage.setItem(DISMISSED_KEY, 'true')
    } catch {
      // localStorage unavailable
    }
  }, [])

  if (dismissed) return null

  return (
    <div className="welcome-banner" role="banner">
      <div className="welcome-banner__content">
        <h1 className="welcome-banner__greeting">
          {getGreeting()}, {userName}
        </h1>
        <p className="welcome-banner__date">{formatDate()}</p>
        <div className="welcome-banner__summary">
          {pendingSignatures > 0 && (
            <span className="welcome-banner__stat">
              <FileSignature size={16} />
              {pendingSignatures} pending signature{pendingSignatures !== 1 ? 's' : ''}
            </span>
          )}
          {upcomingMeetings > 0 && (
            <span className="welcome-banner__stat">
              <Calendar size={16} />
              {upcomingMeetings} upcoming meeting{upcomingMeetings !== 1 ? 's' : ''}
            </span>
          )}
          {pendingSignatures === 0 && upcomingMeetings === 0 && (
            <span className="welcome-banner__stat welcome-banner__stat--clear">
              You're all caught up!
            </span>
          )}
        </div>
      </div>
      <button
        className="welcome-banner__dismiss"
        onClick={handleDismiss}
        aria-label="Dismiss welcome banner"
      >
        <X size={18} />
      </button>
    </div>
  )
}
