import { useState, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Filter } from 'lucide-react'
import { useActivityStore } from '../../stores/useActivityStore'
import {
  ActivityFilterTab,
  ACTIVITY_FILTER_LABELS,
} from '../../types'
import type { Activity } from '../../types'
import './ActivityFeed.css'

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const secs = Math.floor(diff / 1000)
  if (secs < 60) return 'just now'
  const mins = Math.floor(secs / 60)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d ago`
  const weeks = Math.floor(days / 7)
  return `${weeks}w ago`
}

interface ActivityFeedProps {
  maxItems?: number
  filter?: ActivityFilterTab
  showFilters?: boolean
}

export default function ActivityFeed({
  maxItems = 10,
  filter: externalFilter,
  showFilters = true,
}: ActivityFeedProps) {
  const activities = useActivityStore((s) => s.activities)
  const [activeFilter, setActiveFilter] = useState<ActivityFilterTab>(
    externalFilter ?? ActivityFilterTab.All
  )
  const [visibleCount, setVisibleCount] = useState(maxItems)
  const navigate = useNavigate()

  const filteredActivities = useMemo(() => {
    const sorted = [...activities].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
    if (activeFilter === ActivityFilterTab.All) return sorted
    return sorted.filter((a) => a.type === activeFilter)
  }, [activities, activeFilter])

  const visibleActivities = useMemo(
    () => filteredActivities.slice(0, visibleCount),
    [filteredActivities, visibleCount]
  )

  const hasMore = visibleCount < filteredActivities.length

  const handleFilterChange = useCallback((tab: ActivityFilterTab) => {
    setActiveFilter(tab)
    setVisibleCount(maxItems)
  }, [maxItems])

  const handleLoadMore = useCallback(() => {
    setVisibleCount((prev) => prev + maxItems)
  }, [maxItems])

  const handleActivityClick = useCallback(
    (activity: Activity) => {
      navigate(activity.entityPath)
    },
    [navigate]
  )

  const filterTabs = Object.values(ActivityFilterTab) as ActivityFilterTab[]

  if (activities.length === 0) {
    return (
      <div className="activity-feed">
        <div className="activity-feed__empty">
          <div className="activity-feed__empty-icon">
            <Filter size={32} />
          </div>
          <p className="activity-feed__empty-title">No activity yet</p>
          <p className="activity-feed__empty-description">
            Activity from documents, pages, issues, and bookings will appear here.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="activity-feed">
      {showFilters && (
        <div className="activity-feed__filters">
          {filterTabs.map((tab) => (
            <button
              key={tab}
              className={`activity-feed__filter-tab${
                activeFilter === tab ? ' activity-feed__filter-tab--active' : ''
              }`}
              onClick={() => handleFilterChange(tab)}
              type="button"
            >
              {ACTIVITY_FILTER_LABELS[tab]}
            </button>
          ))}
        </div>
      )}

      <div className="activity-feed__timeline">
        {visibleActivities.map((activity, index) => (
          <button
            key={activity.id}
            className="activity-feed__item"
            onClick={() => handleActivityClick(activity)}
            type="button"
            style={{
              animationDelay: `${Math.min(index * 50, 500)}ms`,
            }}
          >
            <div className="activity-feed__connector">
              <span className="activity-feed__icon">{activity.icon}</span>
              {index < visibleActivities.length - 1 && (
                <div className="activity-feed__line" />
              )}
            </div>
            <div className="activity-feed__content">
              <span className="activity-feed__title">{activity.title}</span>
              <span className="activity-feed__description">
                {activity.description}
              </span>
              <div className="activity-feed__meta">
                <span className="activity-feed__user">{activity.userName}</span>
                <span className="activity-feed__dot">&middot;</span>
                <span className="activity-feed__time">
                  {timeAgo(activity.timestamp)}
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>

      {hasMore && (
        <button
          className="activity-feed__load-more"
          onClick={handleLoadMore}
          type="button"
        >
          Load more
        </button>
      )}
    </div>
  )
}
