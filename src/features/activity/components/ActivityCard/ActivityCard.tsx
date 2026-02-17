import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Activity } from '../../types'
import './ActivityCard.css'

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const secs = Math.floor(diff / 1000)
  if (secs < 60) return 'just now'
  const mins = Math.floor(secs / 60)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days}d ago`
  const weeks = Math.floor(days / 7)
  return `${weeks}w ago`
}

const TYPE_COLORS: Record<string, string> = {
  document: 'var(--color-primary, #4F46E5)',
  page: '#7C3AED',
  issue: '#059669',
  booking: '#D97706',
  database: '#0891B2',
  team: '#DB2777',
}

interface ActivityCardProps {
  activity: Activity
}

export default function ActivityCard({ activity }: ActivityCardProps) {
  const navigate = useNavigate()

  const handleClick = useCallback(() => {
    navigate(activity.entityPath)
  }, [navigate, activity.entityPath])

  const borderColor = TYPE_COLORS[activity.type] ?? 'var(--border-color, #E2E8F0)'

  return (
    <button
      className="activity-card"
      onClick={handleClick}
      type="button"
      style={{ '--activity-card-accent': borderColor } as React.CSSProperties}
    >
      <div
        className="activity-card__icon"
        style={{ borderColor }}
      >
        <span className="activity-card__emoji">{activity.icon}</span>
      </div>
      <div className="activity-card__body">
        <p className="activity-card__action">
          <span className="activity-card__user">{activity.userName}</span>
          {' '}
          <span className="activity-card__verb">{activity.action}</span>
          {' '}
          <span className="activity-card__target">{activity.title}</span>
        </p>
        {activity.description && (
          <p className="activity-card__description">{activity.description}</p>
        )}
      </div>
      <span className="activity-card__time">{formatRelativeTime(activity.timestamp)}</span>
    </button>
  )
}
