import { useMemo } from 'react'
import type { Cycle, Issue } from '../../types'
import { IssueStatus } from '../../types'
import './BurndownChart.css'

interface BurndownChartProps {
  cycle: Cycle
  issues: Issue[]
}

/** Return array of YYYY-MM-DD strings from startDate to endDate inclusive */
function getDaysInRange(startDate: string, endDate: string): string[] {
  const days: string[] = []
  const current = new Date(startDate + 'T00:00:00')
  const end = new Date(endDate + 'T00:00:00')
  while (current <= end) {
    days.push(current.toISOString().slice(0, 10))
    current.setDate(current.getDate() + 1)
  }
  return days
}

function formatShortDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function BurndownChart({ cycle, issues }: BurndownChartProps) {
  const days = useMemo(
    () => getDaysInRange(cycle.startDate, cycle.endDate),
    [cycle.startDate, cycle.endDate]
  )
  const totalIssues = issues.length

  const remainingPerDay = useMemo(() => {
    return days.map((day) => {
      const endOfDay = day + 'T23:59:59Z'
      const remaining = issues.filter((issue) => {
        const isDone =
          issue.status === IssueStatus.Done ||
          issue.status === IssueStatus.Cancelled
        if (!isDone) return true
        // If done, only count as remaining if completed after this day
        return issue.updatedAt > endOfDay
      }).length
      return remaining
    })
  }, [days, issues])

  // Chart layout constants
  const viewWidth = 480
  const viewHeight = 240
  const padding = { top: 24, right: 24, bottom: 36, left: 40 }
  const chartWidth = viewWidth - padding.left - padding.right
  const chartHeight = viewHeight - padding.top - padding.bottom

  const maxY = Math.max(totalIssues, 1)
  const dayCount = Math.max(days.length - 1, 1)

  // Scale helpers
  const xScale = (i: number) => padding.left + (i / dayCount) * chartWidth
  const yScale = (val: number) =>
    padding.top + ((maxY - val) / maxY) * chartHeight

  // Ideal line: from (0, totalIssues) to (dayCount, 0)
  const idealStart = { x: xScale(0), y: yScale(totalIssues) }
  const idealEnd = { x: xScale(dayCount), y: yScale(0) }

  // Actual polyline points
  const actualPoints = remainingPerDay
    .map((val, i) => `${xScale(i)},${yScale(val)}`)
    .join(' ')

  // Fill area under actual line
  const areaPoints = [
    `${xScale(0)},${yScale(0)}`,
    ...remainingPerDay.map((val, i) => `${xScale(i)},${yScale(val)}`),
    `${xScale(remainingPerDay.length - 1)},${yScale(0)}`,
  ].join(' ')

  // Axis labels: first, middle, last day
  const midIndex = Math.floor(days.length / 2)
  const firstDay = days[0] ?? ''
  const midDay = days[midIndex] ?? ''
  const lastDay = days[days.length - 1] ?? ''
  const xLabels = [
    { index: 0, label: formatShortDate(firstDay) },
    ...(days.length > 2
      ? [{ index: midIndex, label: formatShortDate(midDay) }]
      : []),
    ...(days.length > 1
      ? [{ index: days.length - 1, label: formatShortDate(lastDay) }]
      : []),
  ]

  // Y-axis tick values
  const yTicks = [0, Math.round(maxY / 2), maxY]

  return (
    <div className="burndown-chart">
      <h4 className="burndown-chart__title">Sprint Burndown</h4>
      <svg
        className="burndown-chart__svg"
        viewBox={`0 0 ${viewWidth} ${viewHeight}`}
        role="img"
        aria-label={`Burndown chart for ${cycle.name}: ${totalIssues} issues total`}
      >
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((frac) => (
          <line
            key={frac}
            x1={padding.left}
            y1={yScale(frac * maxY)}
            x2={padding.left + chartWidth}
            y2={yScale(frac * maxY)}
            className="burndown-chart__grid"
          />
        ))}

        {/* Y axis labels */}
        {yTicks.map((tick) => (
          <text
            key={tick}
            x={padding.left - 8}
            y={yScale(tick)}
            className="burndown-chart__axis-label"
            textAnchor="end"
            dominantBaseline="middle"
          >
            {tick}
          </text>
        ))}

        {/* X axis labels */}
        {xLabels.map(({ index, label }) => (
          <text
            key={index}
            x={xScale(index)}
            y={viewHeight - 8}
            className="burndown-chart__axis-label"
            textAnchor="middle"
          >
            {label}
          </text>
        ))}

        {/* Area fill under actual */}
        <polygon
          points={areaPoints}
          className="burndown-chart__area"
        />

        {/* Ideal line (dashed) */}
        <line
          x1={idealStart.x}
          y1={idealStart.y}
          x2={idealEnd.x}
          y2={idealEnd.y}
          className="burndown-chart__line--ideal"
        />

        {/* Actual line */}
        <polyline
          points={actualPoints}
          className="burndown-chart__line--actual"
        />

        {/* Data points */}
        {remainingPerDay.map((val, i) => (
          <circle
            key={i}
            cx={xScale(i)}
            cy={yScale(val)}
            r="3"
            className="burndown-chart__dot"
          />
        ))}

        {/* Legend */}
        <g transform={`translate(${padding.left + chartWidth - 100}, ${padding.top + 4})`}>
          <line
            x1="0"
            y1="0"
            x2="16"
            y2="0"
            className="burndown-chart__line--ideal"
          />
          <text
            x="20"
            y="0"
            className="burndown-chart__legend-text"
            dominantBaseline="middle"
          >
            Ideal
          </text>
          <line
            x1="0"
            y1="14"
            x2="16"
            y2="14"
            className="burndown-chart__line--actual"
          />
          <text
            x="20"
            y="14"
            className="burndown-chart__legend-text"
            dominantBaseline="middle"
          >
            Actual
          </text>
        </g>
      </svg>
      <div className="burndown-chart__stats">
        <span className="burndown-chart__stat">
          Total: <strong>{totalIssues}</strong>
        </span>
        <span className="burndown-chart__stat">
          Remaining: <strong>{remainingPerDay[remainingPerDay.length - 1] ?? totalIssues}</strong>
        </span>
        <span className="burndown-chart__stat">
          Done: <strong>{totalIssues - (remainingPerDay[remainingPerDay.length - 1] ?? totalIssues)}</strong>
        </span>
      </div>
    </div>
  )
}
