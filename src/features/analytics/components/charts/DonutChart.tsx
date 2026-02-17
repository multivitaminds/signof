import { useState, useCallback } from 'react'
import './DonutChart.css'

interface DonutSegment {
  label: string
  value: number
  color: string
}

interface DonutChartProps {
  segments: DonutSegment[]
  size?: number
}

export default function DonutChart({ segments, size = 200 }: DonutChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const handleMouseEnter = useCallback((index: number) => {
    setHoveredIndex(index)
  }, [])

  const handleMouseLeave = useCallback(() => {
    setHoveredIndex(null)
  }, [])

  const total = segments.reduce((sum, s) => sum + s.value, 0)

  if (total === 0) {
    return (
      <div className="donut-chart donut-chart--empty">
        <svg width={size} height={size} viewBox="0 0 200 200" role="img" aria-label="Donut chart">
          <circle cx={100} cy={100} r={70} fill="none" stroke="var(--border-color)" strokeWidth={24} />
          <text x={100} y={105} textAnchor="middle" className="donut-chart__center-text">0</text>
        </svg>
      </div>
    )
  }

  const cx = 100
  const cy = 100
  const radius = 70
  const strokeWidth = 24

  let cumulativeAngle = -90 // Start from top

  const paths = segments.map((seg, i) => {
    const angle = (seg.value / total) * 360
    const startAngle = cumulativeAngle
    const endAngle = cumulativeAngle + angle
    cumulativeAngle = endAngle

    const startRad = (startAngle * Math.PI) / 180
    const endRad = (endAngle * Math.PI) / 180

    const x1 = cx + radius * Math.cos(startRad)
    const y1 = cy + radius * Math.sin(startRad)
    const x2 = cx + radius * Math.cos(endRad)
    const y2 = cy + radius * Math.sin(endRad)

    const largeArc = angle > 180 ? 1 : 0

    const d = `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`

    return (
      <path
        key={seg.label}
        d={d}
        fill="none"
        stroke={seg.color}
        strokeWidth={hoveredIndex === i ? strokeWidth + 4 : strokeWidth}
        strokeLinecap="butt"
        className={`donut-chart__segment ${hoveredIndex === i ? 'donut-chart__segment--hovered' : ''}`}
        onMouseEnter={() => handleMouseEnter(i)}
        onMouseLeave={handleMouseLeave}
      />
    )
  })

  return (
    <div className="donut-chart">
      <svg
        width={size}
        height={size}
        viewBox="0 0 200 200"
        role="img"
        aria-label="Donut chart"
      >
        {paths}
        <text x={cx} y={cy + 6} textAnchor="middle" className="donut-chart__center-text">
          {total}
        </text>
      </svg>
      <div className="donut-chart__legend">
        {segments.map((seg) => (
          <div key={seg.label} className="donut-chart__legend-item">
            <span
              className="donut-chart__legend-dot"
              style={{ backgroundColor: seg.color }}
            />
            <span className="donut-chart__legend-label">{seg.label}</span>
            <span className="donut-chart__legend-value">{seg.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
