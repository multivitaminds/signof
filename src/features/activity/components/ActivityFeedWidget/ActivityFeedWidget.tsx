import { useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useActivityStore } from '../../stores/useActivityStore'
import './ActivityFeedWidget.css'

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

interface ActivityFeedWidgetProps {
  maxItems?: number
}

export default function ActivityFeedWidget({ maxItems = 8 }: ActivityFeedWidgetProps) {
  const activities = useActivityStore((s) => s.activities)
  const navigate = useNavigate()

  const recentActivities = useMemo(() => {
    return [...activities]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, maxItems)
  }, [activities, maxItems])

  const handleViewAll = useCallback(() => {
    navigate('/activity')
  }, [navigate])

  const handleActivityClick = useCallback(
    (entityPath: string) => {
      navigate(entityPath)
    },
    [navigate]
  )

  return (
    <div className="activity-feed-widget">
      <div className="activity-feed-widget__header">
        <h3 className="activity-feed-widget__title">Recent Activity</h3>
        <span className="activity-feed-widget__badge">{activities.length}</span>
      </div>
      <div className="activity-feed-widget__list">
        {recentActivities.length === 0 ? (
          <p className="activity-feed-widget__empty">No recent activity</p>
        ) : (
          recentActivities.map((activity) => (
            <button
              key={activity.id}
              className="activity-feed-widget__item"
              onClick={() => handleActivityClick(activity.entityPath)}
              type="button"
            >
              <span className="activity-feed-widget__icon">{activity.icon}</span>
              <span className="activity-feed-widget__text">
                <span className="activity-feed-widget__user">{activity.userName}</span>
                {' '}
                {activity.action}
                {' '}
                <span className="activity-feed-widget__target">{activity.title}</span>
              </span>
              <span className="activity-feed-widget__time">
                {formatRelativeTime(activity.timestamp)}
              </span>
            </button>
          ))
        )}
      </div>
      {activities.length > maxItems && (
        <button
          className="activity-feed-widget__view-all"
          onClick={handleViewAll}
          type="button"
        >
          View all activity
        </button>
      )}
    </div>
  )
}
