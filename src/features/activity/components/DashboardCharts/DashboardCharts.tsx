import { useMemo, useState } from 'react'
import { useActivityStore } from '../../stores/useActivityStore'
import type { ActivityType } from '../../types'
import './DashboardCharts.css'

// ─── Activity Sparkline (7-day bar chart) ──────────────────────────

function ActivitySparkline() {
  const activities = useActivityStore((s) => s.activities)
  const [currentTime] = useState(() => Date.now())

  const dailyCounts = useMemo(() => {
    const days: number[] = []
    const labels: string[] = []

    for (let i = 6; i >= 0; i--) {
      const dayStart = currentTime - i * 86400000
      const dayEnd = dayStart + 86400000
      const count = activities.filter((a) => {
        const ts = new Date(a.timestamp).getTime()
        return ts >= dayStart && ts < dayEnd
      }).length
      days.push(count)

      const date = new Date(dayStart)
      labels.push(
        date.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 3)
      )
    }

    return { counts: days, labels }
  }, [activities, currentTime])

  const maxCount = Math.max(...dailyCounts.counts, 1)
  const barWidth = 28
  const gap = 8
  const chartHeight = 80
  const chartWidth = dailyCounts.counts.length * (barWidth + gap) - gap
  const labelHeight = 20

  return (
    <div className="dashboard-charts__card">
      <h3 className="dashboard-charts__card-title">Activity (7 days)</h3>
      <svg
        className="dashboard-charts__sparkline"
        viewBox={`0 0 ${chartWidth} ${chartHeight + labelHeight}`}
        width="100%"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="7-day activity bar chart"
      >
        {dailyCounts.counts.map((count, i) => {
          const barHeight = Math.max((count / maxCount) * chartHeight, 2)
          const x = i * (barWidth + gap)
          const y = chartHeight - barHeight
          const isToday = i === dailyCounts.counts.length - 1

          return (
            <g key={i}>
              {/* Background bar */}
              <rect
                x={x}
                y={0}
                width={barWidth}
                height={chartHeight}
                rx={4}
                className="dashboard-charts__bar-bg"
              />
              {/* Value bar */}
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                rx={4}
                className={`dashboard-charts__bar${isToday ? ' dashboard-charts__bar--today' : ''}`}
              />
              {/* Count label */}
              {count > 0 && (
                <text
                  x={x + barWidth / 2}
                  y={y - 4}
                  textAnchor="middle"
                  className="dashboard-charts__bar-label"
                >
                  {count}
                </text>
              )}
              {/* Day label */}
              <text
                x={x + barWidth / 2}
                y={chartHeight + 14}
                textAnchor="middle"
                className="dashboard-charts__day-label"
              >
                {dailyCounts.labels[i]}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

// ─── Module Usage Donut Chart ──────────────────────────────────────

const MODULE_COLORS: Record<string, string> = {
  document: '#4F46E5',
  page: '#0EA5E9',
  issue: '#F59E0B',
  booking: '#10B981',
  database: '#8B5CF6',
  team: '#EC4899',
}

const MODULE_LABELS: Record<string, string> = {
  document: 'Documents',
  page: 'Pages',
  issue: 'Issues',
  booking: 'Bookings',
  database: 'Databases',
  team: 'Teams',
}

interface DonutSegment {
  type: ActivityType
  count: number
  dashLength: number
  dashOffset: number
}

function ModuleUsageDonut() {
  const activities = useActivityStore((s) => s.activities)

  const moduleCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const a of activities) {
      counts[a.type] = (counts[a.type] || 0) + 1
    }
    return Object.entries(counts)
      .map(([type, count]) => ({ type: type as ActivityType, count }))
      .sort((a, b) => b.count - a.count)
  }, [activities])

  const total = moduleCounts.reduce((sum, m) => sum + m.count, 0)

  // SVG donut chart
  const size = 120
  const strokeWidth = 20
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const cx = size / 2
  const cy = size / 2

  // Pre-compute segments in useMemo to avoid reassignment during render
  const segments = useMemo(() => {
    let offset = 0
    const result: DonutSegment[] = []
    for (const module of moduleCounts) {
      const pct = total > 0 ? module.count / total : 0
      const dashLength = pct * circumference
      result.push({
        type: module.type,
        count: module.count,
        dashLength,
        dashOffset: -offset,
      })
      offset += dashLength
    }
    return result
  }, [moduleCounts, total, circumference])

  return (
    <div className="dashboard-charts__card">
      <h3 className="dashboard-charts__card-title">Module Usage</h3>
      <div className="dashboard-charts__donut-container">
        <svg
          className="dashboard-charts__donut"
          viewBox={`0 0 ${size} ${size}`}
          width={size}
          height={size}
          role="img"
          aria-label="Module usage donut chart"
        >
          {/* Background circle */}
          <circle
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            strokeWidth={strokeWidth}
            className="dashboard-charts__donut-bg"
          />
          {segments.map((segment) => (
            <circle
              key={segment.type}
              cx={cx}
              cy={cy}
              r={radius}
              fill="none"
              strokeWidth={strokeWidth}
              stroke={MODULE_COLORS[segment.type] || '#6B7280'}
              strokeDasharray={`${segment.dashLength} ${circumference - segment.dashLength}`}
              strokeDashoffset={segment.dashOffset}
              strokeLinecap="round"
              transform={`rotate(-90 ${cx} ${cy})`}
              className="dashboard-charts__donut-segment"
            />
          ))}
          {/* Center text */}
          <text
            x={cx}
            y={cy - 4}
            textAnchor="middle"
            className="dashboard-charts__donut-total"
          >
            {total}
          </text>
          <text
            x={cx}
            y={cy + 12}
            textAnchor="middle"
            className="dashboard-charts__donut-total-label"
          >
            total
          </text>
        </svg>
        <div className="dashboard-charts__legend">
          {moduleCounts.map((module) => (
            <div key={module.type} className="dashboard-charts__legend-item">
              <span
                className="dashboard-charts__legend-dot"
                style={{ backgroundColor: MODULE_COLORS[module.type] || '#6B7280' }}
              />
              <span className="dashboard-charts__legend-label">
                {MODULE_LABELS[module.type] || module.type}
              </span>
              <span className="dashboard-charts__legend-count">{module.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Weekly Trend (SVG polyline) ───────────────────────────────────

function WeeklyTrend() {
  const activities = useActivityStore((s) => s.activities)
  const [currentTime] = useState(() => Date.now())

  const weeklyData = useMemo(() => {
    const points: number[] = []

    for (let i = 6; i >= 0; i--) {
      const dayStart = currentTime - i * 86400000
      const dayEnd = dayStart + 86400000
      const count = activities.filter((a) => {
        const ts = new Date(a.timestamp).getTime()
        return ts >= dayStart && ts < dayEnd
      }).length
      points.push(count)
    }

    return points
  }, [activities, currentTime])

  const maxVal = Math.max(...weeklyData, 1)
  const chartWidth = 260
  const chartHeight = 60
  const padding = 4

  const points = weeklyData.map((val, i) => {
    const x = padding + (i / (weeklyData.length - 1)) * (chartWidth - 2 * padding)
    const y = padding + (1 - val / maxVal) * (chartHeight - 2 * padding)
    return `${x},${y}`
  })

  const areaPoints = [
    `${padding},${chartHeight - padding}`,
    ...points,
    `${chartWidth - padding},${chartHeight - padding}`,
  ]

  return (
    <div className="dashboard-charts__card dashboard-charts__card--trend">
      <h3 className="dashboard-charts__card-title">Weekly Trend</h3>
      <svg
        className="dashboard-charts__trend"
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        width="100%"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="Weekly activity trend line"
      >
        {/* Gradient area fill */}
        <defs>
          <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" className="dashboard-charts__gradient-start" />
            <stop offset="100%" className="dashboard-charts__gradient-end" />
          </linearGradient>
        </defs>
        <polygon
          points={areaPoints.join(' ')}
          fill="url(#trendGradient)"
          className="dashboard-charts__trend-area"
        />
        <polyline
          points={points.join(' ')}
          fill="none"
          strokeWidth={2}
          strokeLinejoin="round"
          strokeLinecap="round"
          className="dashboard-charts__trend-line"
        />
        {/* Data points */}
        {weeklyData.map((val, i) => {
          const x = padding + (i / (weeklyData.length - 1)) * (chartWidth - 2 * padding)
          const y = padding + (1 - val / maxVal) * (chartHeight - 2 * padding)
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={3}
              className="dashboard-charts__trend-point"
            />
          )
        })}
      </svg>
    </div>
  )
}

// ─── Main Component ────────────────────────────────────────────────

export default function DashboardCharts() {
  return (
    <div className="dashboard-charts">
      <ActivitySparkline />
      <ModuleUsageDonut />
      <WeeklyTrend />
    </div>
  )
}
