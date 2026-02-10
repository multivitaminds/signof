import { useMemo } from 'react'
import type { Cycle, Issue } from '../../types'
import { IssueStatus } from '../../types'
import './CycleBurndown.css'

interface CycleBurndownProps {
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

function CycleBurndown({ cycle, issues }: CycleBurndownProps) {
  const days = useMemo(() => getDaysInRange(cycle.startDate, cycle.endDate), [cycle.startDate, cycle.endDate])
  const totalIssues = issues.length

  const remainingPerDay = useMemo(() => {
    return days.map((day) => {
      const endOfDay = day + 'T23:59:59Z'
      const remaining = issues.filter((issue) => {
        const isDone = issue.status === IssueStatus.Done || issue.status === IssueStatus.Cancelled
        if (!isDone) return true
        // If done, only count as remaining if it was completed after this day
        return issue.updatedAt > endOfDay
      }).length
      return remaining
    })
  }, [days, issues])

  // Chart layout constants
  const viewWidth = 400
  const viewHeight = 200
  const padding = { top: 20, right: 20, bottom: 30, left: 35 }
  const chartWidth = viewWidth - padding.left - padding.right
  const chartHeight = viewHeight - padding.top - padding.bottom

  const maxY = Math.max(totalIssues, 1)
  const dayCount = Math.max(days.length - 1, 1)

  // Scale helpers
  const xScale = (i: number) => padding.left + (i / dayCount) * chartWidth
  const yScale = (val: number) => padding.top + ((maxY - val) / maxY) * chartHeight

  // Ideal line: from (0, totalIssues) to (dayCount, 0)
  const idealStart = { x: xScale(0), y: yScale(totalIssues) }
  const idealEnd = { x: xScale(dayCount), y: yScale(0) }

  // Actual polyline points
  const actualPoints = remainingPerDay
    .map((val, i) => `${xScale(i)},${yScale(val)}`)
    .join(' ')

  // Axis labels: first, middle, last day
  const midIndex = Math.floor(days.length / 2)
  const firstDay = days[0] ?? ''
  const midDay = days[midIndex] ?? ''
  const lastDay = days[days.length - 1] ?? ''
  const xLabels = [
    { index: 0, label: formatShortDate(firstDay) },
    ...(days.length > 2 ? [{ index: midIndex, label: formatShortDate(midDay) }] : []),
    ...(days.length > 1 ? [{ index: days.length - 1, label: formatShortDate(lastDay) }] : []),
  ]

  return (
    <div className="cycle-burndown">
      <svg
        className="cycle-burndown__chart"
        viewBox={`0 0 ${viewWidth} ${viewHeight}`}
        role="img"
        aria-label={`Burndown chart for ${cycle.name}`}
      >
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((frac) => (
          <line
            key={frac}
            x1={padding.left}
            y1={yScale(frac * maxY)}
            x2={padding.left + chartWidth}
            y2={yScale(frac * maxY)}
            className="cycle-burndown__grid"
          />
        ))}

        {/* Y axis labels */}
        <text
          x={padding.left - 8}
          y={yScale(maxY)}
          className="cycle-burndown__axis-label"
          textAnchor="end"
          dominantBaseline="middle"
        >
          {maxY}
        </text>
        <text
          x={padding.left - 8}
          y={yScale(0)}
          className="cycle-burndown__axis-label"
          textAnchor="end"
          dominantBaseline="middle"
        >
          0
        </text>

        {/* X axis labels */}
        {xLabels.map(({ index, label }) => (
          <text
            key={index}
            x={xScale(index)}
            y={viewHeight - 6}
            className="cycle-burndown__axis-label"
            textAnchor="middle"
          >
            {label}
          </text>
        ))}

        {/* Ideal line (dashed) */}
        <line
          x1={idealStart.x}
          y1={idealStart.y}
          x2={idealEnd.x}
          y2={idealEnd.y}
          className="cycle-burndown__line--ideal"
        />

        {/* Actual line */}
        <polyline
          points={actualPoints}
          className="cycle-burndown__line--actual"
        />

        {/* Legend */}
        <g className="cycle-burndown__legend" transform={`translate(${padding.left + 8}, ${padding.top + 4})`}>
          <g className="cycle-burndown__legend-item">
            <line x1="0" y1="0" x2="16" y2="0" className="cycle-burndown__line--ideal" />
            <text x="20" y="0" className="cycle-burndown__legend-text" dominantBaseline="middle">Ideal</text>
          </g>
          <g className="cycle-burndown__legend-item" transform="translate(0, 14)">
            <line x1="0" y1="0" x2="16" y2="0" className="cycle-burndown__line--actual" />
            <text x="20" y="0" className="cycle-burndown__legend-text" dominantBaseline="middle">Actual</text>
          </g>
        </g>
      </svg>
    </div>
  )
}

export default CycleBurndown
