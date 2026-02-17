import { useMemo } from 'react'
import type { Activity } from '../../types'
import ActivityCard from '../ActivityCard/ActivityCard'
import './ActivityTimeline.css'

function getDateLabel(iso: string): string {
  const date = new Date(iso)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const diffDays = Math.floor((today.getTime() - target.getTime()) / 86400000)

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

const TYPE_NODE_COLORS: Record<string, string> = {
  document: 'var(--color-primary, #4F46E5)',
  page: '#7C3AED',
  issue: '#059669',
  booking: '#D97706',
  database: '#0891B2',
  team: '#DB2777',
}

interface ActivityTimelineProps {
  activities: Activity[]
}

export default function ActivityTimeline({ activities }: ActivityTimelineProps) {
  const grouped = useMemo(() => {
    const groups: { label: string; items: Activity[] }[] = []
    let currentLabel = ''

    for (const activity of activities) {
      const label = getDateLabel(activity.timestamp)
      if (label !== currentLabel) {
        currentLabel = label
        groups.push({ label, items: [] })
      }
      const lastGroup = groups[groups.length - 1]
      if (lastGroup) {
        lastGroup.items.push(activity)
      }
    }

    return groups
  }, [activities])

  if (activities.length === 0) {
    return (
      <div className="activity-timeline__empty">
        <p className="activity-timeline__empty-text">No activities to show for this filter.</p>
      </div>
    )
  }

  return (
    <div className="activity-timeline">
      {grouped.map((group) => (
        <div key={group.label} className="activity-timeline__group">
          <div className="activity-timeline__date-separator">
            <span className="activity-timeline__date-label">{group.label}</span>
            <div className="activity-timeline__date-line" />
          </div>
          <div className="activity-timeline__items">
            {group.items.map((activity) => (
              <div key={activity.id} className="activity-timeline__item">
                <div className="activity-timeline__connector">
                  <div
                    className="activity-timeline__node"
                    style={{ backgroundColor: TYPE_NODE_COLORS[activity.type] ?? 'var(--text-muted)' }}
                  />
                  <div className="activity-timeline__line" />
                </div>
                <div className="activity-timeline__card-wrapper">
                  <ActivityCard activity={activity} />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
