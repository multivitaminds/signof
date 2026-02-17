import { useState, useMemo, useCallback } from 'react'
import ModuleHeader from '../../../components/ui/ModuleHeader'
import { useActivityStore } from '../stores/useActivityStore'
import {
  ActivityFilterTab,
  ACTIVITY_FILTER_LABELS,
} from '../types'
import ActivityTimeline from '../components/ActivityTimeline/ActivityTimeline'
import './ActivityPage.css'

const DATE_RANGES = {
  today: 'Today',
  week: 'This Week',
  month: 'This Month',
  all: 'All Time',
} as const

type DateRange = keyof typeof DATE_RANGES

function isWithinRange(timestamp: string, range: DateRange): boolean {
  if (range === 'all') return true
  const now = new Date()
  const date = new Date(timestamp)
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  if (range === 'today') return date >= startOfDay
  if (range === 'week') {
    const startOfWeek = new Date(startOfDay)
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())
    return date >= startOfWeek
  }
  // month
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  return date >= startOfMonth
}

const ITEMS_PER_PAGE = 20

export default function ActivityPage() {
  const activities = useActivityStore((s) => s.activities)
  const [activeFilter, setActiveFilter] = useState<ActivityFilterTab>(ActivityFilterTab.All)
  const [dateRange, setDateRange] = useState<DateRange>('all')
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE)

  const filteredActivities = useMemo(() => {
    let filtered = [...activities].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )

    if (activeFilter !== ActivityFilterTab.All) {
      filtered = filtered.filter((a) => a.type === activeFilter)
    }

    filtered = filtered.filter((a) => isWithinRange(a.timestamp, dateRange))

    return filtered
  }, [activities, activeFilter, dateRange])

  const visibleActivities = useMemo(
    () => filteredActivities.slice(0, visibleCount),
    [filteredActivities, visibleCount]
  )

  const hasMore = visibleCount < filteredActivities.length

  const handleFilterChange = useCallback((tab: ActivityFilterTab) => {
    setActiveFilter(tab)
    setVisibleCount(ITEMS_PER_PAGE)
  }, [])

  const handleDateRangeChange = useCallback((range: DateRange) => {
    setDateRange(range)
    setVisibleCount(ITEMS_PER_PAGE)
  }, [])

  const handleLoadMore = useCallback(() => {
    setVisibleCount((prev) => prev + ITEMS_PER_PAGE)
  }, [])

  const filterTabs = Object.values(ActivityFilterTab) as ActivityFilterTab[]
  const dateRangeKeys = Object.keys(DATE_RANGES) as DateRange[]

  return (
    <div className="activity-page">
      <ModuleHeader
        title="Activity"
        subtitle="Track all changes across your workspace"
      />

      <div className="activity-page__controls">
        <div className="activity-page__filters">
          {filterTabs.map((tab) => (
            <button
              key={tab}
              className={`activity-page__filter-tab${
                activeFilter === tab ? ' activity-page__filter-tab--active' : ''
              }`}
              onClick={() => handleFilterChange(tab)}
              type="button"
            >
              {ACTIVITY_FILTER_LABELS[tab]}
            </button>
          ))}
        </div>

        <div className="activity-page__date-range">
          {dateRangeKeys.map((range) => (
            <button
              key={range}
              className={`activity-page__date-btn${
                dateRange === range ? ' activity-page__date-btn--active' : ''
              }`}
              onClick={() => handleDateRangeChange(range)}
              type="button"
            >
              {DATE_RANGES[range]}
            </button>
          ))}
        </div>
      </div>

      <div className="activity-page__count">
        {filteredActivities.length} {filteredActivities.length === 1 ? 'activity' : 'activities'}
      </div>

      <ActivityTimeline activities={visibleActivities} />

      {hasMore && (
        <div className="activity-page__load-more-wrapper">
          <button
            className="activity-page__load-more"
            onClick={handleLoadMore}
            type="button"
          >
            Load more ({filteredActivities.length - visibleCount} remaining)
          </button>
        </div>
      )}
    </div>
  )
}
