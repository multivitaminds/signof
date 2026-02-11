import { useMemo } from 'react'
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  Clock,
  BarChart3,
  Star,
} from 'lucide-react'
import { useSchedulingStore } from '../../stores/useSchedulingStore'
import type { Booking } from '../../types'
import { BookingStatus, DAY_OF_WEEK_FULL_LABELS, DayOfWeek } from '../../types'
import './BookingAnalytics.css'

const JS_DAY_INDEX_TO_DOW: Record<number, string> = {
  0: DayOfWeek.Sunday,
  1: DayOfWeek.Monday,
  2: DayOfWeek.Tuesday,
  3: DayOfWeek.Wednesday,
  4: DayOfWeek.Thursday,
  5: DayOfWeek.Friday,
  6: DayOfWeek.Saturday,
}

const DAY_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const DONUT_COLORS = [
  '#4F46E5',
  '#059669',
  '#DC2626',
  '#F59E0B',
  '#8B5CF6',
  '#3B82F6',
  '#EC4899',
  '#14B8A6',
]

function formatTime12(time: string): string {
  const [h, m] = time.split(':').map(Number) as [number, number]
  const period = h >= 12 ? 'PM' : 'AM'
  const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`
}

interface AnalyticsData {
  totalThisMonth: number
  totalLastMonth: number
  percentChange: number
  mostPopularEventType: { name: string; count: number } | null
  mostPopularTimeSlot: string | null
  busiestDay: string | null
  conversionRate: number
  bookingsPerDay: number[]  // Mon-Sun
  eventTypeDistribution: Array<{ name: string; count: number; color: string }>
}

function computeAnalytics(
  bookings: Booking[],
  eventTypes: Array<{ id: string; name: string; color: string }>
): AnalyticsData {
  const now = new Date()
  const thisMonth = now.getMonth()
  const thisYear = now.getFullYear()
  const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1
  const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear

  const activeBookings = bookings.filter(
    (b) => b.status !== BookingStatus.Cancelled
  )

  const thisMonthBookings = activeBookings.filter((b) => {
    const d = new Date(b.date + 'T00:00:00')
    return d.getMonth() === thisMonth && d.getFullYear() === thisYear
  })

  const lastMonthBookings = activeBookings.filter((b) => {
    const d = new Date(b.date + 'T00:00:00')
    return d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear
  })

  const totalThisMonth = thisMonthBookings.length
  const totalLastMonth = lastMonthBookings.length
  const percentChange =
    totalLastMonth === 0
      ? totalThisMonth > 0
        ? 100
        : 0
      : Math.round(((totalThisMonth - totalLastMonth) / totalLastMonth) * 100)

  // Most popular event type
  const etCounts: Record<string, number> = {}
  for (const b of activeBookings) {
    etCounts[b.eventTypeId] = (etCounts[b.eventTypeId] ?? 0) + 1
  }
  let mostPopularEventType: { name: string; count: number } | null = null
  let maxET = 0
  for (const [etId, count] of Object.entries(etCounts)) {
    if (count > maxET) {
      maxET = count
      const et = eventTypes.find((e) => e.id === etId)
      mostPopularEventType = { name: et?.name ?? 'Unknown', count }
    }
  }

  // Most popular time slot
  const timeCounts: Record<string, number> = {}
  for (const b of activeBookings) {
    timeCounts[b.startTime] = (timeCounts[b.startTime] ?? 0) + 1
  }
  let mostPopularTimeSlot: string | null = null
  let maxTime = 0
  for (const [time, count] of Object.entries(timeCounts)) {
    if (count > maxTime) {
      maxTime = count
      mostPopularTimeSlot = time
    }
  }

  // Busiest day of week
  const dayCounts: Record<string, number> = {}
  for (const b of activeBookings) {
    const d = new Date(b.date + 'T00:00:00')
    const dow = JS_DAY_INDEX_TO_DOW[d.getDay()] ?? 'monday'
    dayCounts[dow] = (dayCounts[dow] ?? 0) + 1
  }
  let busiestDay: string | null = null
  let maxDay = 0
  for (const [day, count] of Object.entries(dayCounts)) {
    if (count > maxDay) {
      maxDay = count
      busiestDay = DAY_OF_WEEK_FULL_LABELS[day as keyof typeof DAY_OF_WEEK_FULL_LABELS] ?? day
    }
  }

  // Simulated conversion rate (bookings / page views)
  const simulatedPageViews = Math.max(activeBookings.length * 3, 10)
  const conversionRate = Math.round((activeBookings.length / simulatedPageViews) * 100)

  // Bookings per day of week (Mon=0 through Sun=6)
  const bookingsPerDay = [0, 0, 0, 0, 0, 0, 0]
  for (const b of activeBookings) {
    const d = new Date(b.date + 'T00:00:00')
    const jsDay = d.getDay() // 0=Sun
    // Convert to Mon=0, Tue=1 ... Sun=6
    const idx = jsDay === 0 ? 6 : jsDay - 1
    bookingsPerDay[idx]!++
  }

  // Event type distribution
  const etDistribution: Array<{ name: string; count: number; color: string }> = []
  for (const [etId, count] of Object.entries(etCounts)) {
    const et = eventTypes.find((e) => e.id === etId)
    etDistribution.push({
      name: et?.name ?? 'Unknown',
      count,
      color: et?.color ?? DONUT_COLORS[etDistribution.length % DONUT_COLORS.length]!,
    })
  }
  etDistribution.sort((a, b) => b.count - a.count)

  return {
    totalThisMonth,
    totalLastMonth,
    percentChange,
    mostPopularEventType,
    mostPopularTimeSlot,
    busiestDay,
    conversionRate,
    bookingsPerDay,
    eventTypeDistribution: etDistribution,
  }
}

function buildDonutSegments(
  data: Array<{ name: string; count: number; color: string }>
): Array<{ offset: number; length: number; color: string; name: string; percent: number }> {
  const total = data.reduce((s, d) => s + d.count, 0)
  if (total === 0) return []
  const circumference = 2 * Math.PI * 40 // r=40
  let offset = 0
  return data.map((d) => {
    const percent = (d.count / total) * 100
    const length = (d.count / total) * circumference
    const segment = { offset, length, color: d.color, name: d.name, percent: Math.round(percent) }
    offset += length
    return segment
  })
}

export default function BookingAnalytics() {
  const bookings = useSchedulingStore((s) => s.bookings)
  const eventTypes = useSchedulingStore((s) => s.eventTypes)

  const analytics = useMemo(
    () => computeAnalytics(bookings, eventTypes),
    [bookings, eventTypes]
  )

  const donutSegments = useMemo(
    () => buildDonutSegments(analytics.eventTypeDistribution),
    [analytics.eventTypeDistribution]
  )

  const maxBarValue = useMemo(
    () => Math.max(...analytics.bookingsPerDay, 1),
    [analytics.bookingsPerDay]
  )

  return (
    <div className="booking-analytics">
      <div className="booking-analytics__header">
        <h2 className="booking-analytics__title">Booking Analytics</h2>
        <p className="booking-analytics__description">
          Overview of your booking performance and trends.
        </p>
      </div>

      {/* Stat cards */}
      <div className="booking-analytics__stats">
        <div className="booking-analytics__stat-card">
          <div className="booking-analytics__stat-icon">
            <Calendar size={18} />
          </div>
          <div className="booking-analytics__stat-content">
            <span className="booking-analytics__stat-value">
              {analytics.totalThisMonth}
            </span>
            <span className="booking-analytics__stat-label">This month</span>
          </div>
          <div
            className={`booking-analytics__stat-change ${
              analytics.percentChange >= 0
                ? 'booking-analytics__stat-change--up'
                : 'booking-analytics__stat-change--down'
            }`}
          >
            {analytics.percentChange >= 0 ? (
              <TrendingUp size={12} />
            ) : (
              <TrendingDown size={12} />
            )}
            <span>{Math.abs(analytics.percentChange)}%</span>
          </div>
        </div>

        <div className="booking-analytics__stat-card">
          <div className="booking-analytics__stat-icon booking-analytics__stat-icon--star">
            <Star size={18} />
          </div>
          <div className="booking-analytics__stat-content">
            <span className="booking-analytics__stat-value">
              {analytics.mostPopularEventType?.name ?? 'N/A'}
            </span>
            <span className="booking-analytics__stat-label">
              Most popular
              {analytics.mostPopularEventType
                ? ` (${analytics.mostPopularEventType.count} bookings)`
                : ''}
            </span>
          </div>
        </div>

        <div className="booking-analytics__stat-card">
          <div className="booking-analytics__stat-icon booking-analytics__stat-icon--clock">
            <Clock size={18} />
          </div>
          <div className="booking-analytics__stat-content">
            <span className="booking-analytics__stat-value">
              {analytics.mostPopularTimeSlot
                ? formatTime12(analytics.mostPopularTimeSlot)
                : 'N/A'}
            </span>
            <span className="booking-analytics__stat-label">Popular time</span>
          </div>
        </div>

        <div className="booking-analytics__stat-card">
          <div className="booking-analytics__stat-icon booking-analytics__stat-icon--bar">
            <BarChart3 size={18} />
          </div>
          <div className="booking-analytics__stat-content">
            <span className="booking-analytics__stat-value">
              {analytics.conversionRate}%
            </span>
            <span className="booking-analytics__stat-label">Conversion rate</span>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="booking-analytics__charts">
        {/* Bar chart: bookings per day of week */}
        <div className="booking-analytics__chart-card">
          <h3 className="booking-analytics__chart-title">Bookings by Day</h3>
          {analytics.busiestDay && (
            <p className="booking-analytics__chart-subtitle">
              Busiest day: {analytics.busiestDay}
            </p>
          )}
          <div className="booking-analytics__bar-chart" role="img" aria-label="Bar chart showing bookings per day of week">
            {analytics.bookingsPerDay.map((count, idx) => (
              <div key={idx} className="booking-analytics__bar-col">
                <div className="booking-analytics__bar-wrapper">
                  <div
                    className="booking-analytics__bar"
                    style={{
                      height: `${(count / maxBarValue) * 100}%`,
                    }}
                  >
                    {count > 0 && (
                      <span className="booking-analytics__bar-value">
                        {count}
                      </span>
                    )}
                  </div>
                </div>
                <span className="booking-analytics__bar-label">
                  {DAY_SHORT[idx]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Donut chart: event type distribution */}
        <div className="booking-analytics__chart-card">
          <h3 className="booking-analytics__chart-title">
            Event Type Distribution
          </h3>
          <div className="booking-analytics__donut-container">
            <svg
              className="booking-analytics__donut-svg"
              viewBox="0 0 100 100"
              role="img"
              aria-label="Donut chart showing event type distribution"
            >
              {donutSegments.length === 0 ? (
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="var(--border-color, #E5E7EB)"
                  strokeWidth="12"
                />
              ) : (
                donutSegments.map((seg, i) => (
                  <circle
                    key={i}
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke={seg.color}
                    strokeWidth="12"
                    strokeDasharray={`${seg.length} ${2 * Math.PI * 40 - seg.length}`}
                    strokeDashoffset={-seg.offset}
                    transform="rotate(-90 50 50)"
                  />
                ))
              )}
            </svg>
            <div className="booking-analytics__donut-legend">
              {analytics.eventTypeDistribution.map((item, idx) => (
                <div key={idx} className="booking-analytics__legend-item">
                  <span
                    className="booking-analytics__legend-dot"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="booking-analytics__legend-name">
                    {item.name}
                  </span>
                  <span className="booking-analytics__legend-count">
                    {item.count}
                  </span>
                </div>
              ))}
              {analytics.eventTypeDistribution.length === 0 && (
                <p className="booking-analytics__legend-empty">
                  No booking data yet.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
