import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useActivityStore } from '../../../activity/stores/useActivityStore'
import Card from '../../../../components/ui/Card'
import './RecentActivityWidget.css'

function timeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export default function RecentActivityWidget() {
  const activities = useActivityStore((s) => s.activities)

  const recentActivities = useMemo(
    () =>
      [...activities]
        .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
        .slice(0, 8),
    [activities]
  )

  return (
    <Card>
      <Card.Header>
        <Card.Title>Recent Activity</Card.Title>
      </Card.Header>
      <Card.Body>
        {recentActivities.length === 0 ? (
          <p className="recent-activity__empty">No recent activity</p>
        ) : (
          <ul className="recent-activity__list">
            {recentActivities.map((activity) => (
              <li key={activity.id} className="recent-activity__item">
                <Link
                  to={activity.entityPath}
                  className="recent-activity__link"
                >
                  <span className="recent-activity__text">
                    <strong>{activity.userName}</strong> {activity.action} {activity.title}
                  </span>
                  <span className="recent-activity__time">
                    {timeAgo(activity.timestamp)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card.Body>
      <Card.Footer>
        <Link to="/activity" className="recent-activity__view-all">
          View all <ArrowRight size={14} />
        </Link>
      </Card.Footer>
    </Card>
  )
}
