import { useState, useCallback } from 'react'
import './BarChart.css'

interface BarDatum {
  label: string
  value: number
}

interface BarChartProps {
  data: BarDatum[]
  height?: number
  color?: string
}

export default function BarChart({ data, height = 260, color = 'var(--color-primary)' }: BarChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const handleMouseEnter = useCallback((index: number) => {
    setHoveredIndex(index)
  }, [])

  const handleMouseLeave = useCallback(() => {
    setHoveredIndex(null)
  }, [])

  if (data.length === 0) {
    return <div className="bar-chart bar-chart--empty">No data</div>
  }

  const maxValue = Math.max(...data.map((d) => d.value), 1)
  const paddingLeft = 48
  const paddingRight = 16
  const paddingTop = 16
  const paddingBottom = 36
  const chartHeight = height - paddingTop - paddingBottom
  const yTicks = 5
  const barGap = 4

  return (
    <div className="bar-chart">
      <svg
        className="bar-chart__svg"
        viewBox={`0 0 100% ${height}`}
        width="100%"
        height={height}
        aria-label="Bar chart"
        role="img"
      >
        {/* Y-axis labels */}
        {Array.from({ length: yTicks + 1 }, (_, i) => {
          const val = Math.round((maxValue / yTicks) * (yTicks - i))
          const y = paddingTop + (chartHeight / yTicks) * i
          return (
            <g key={`y-${i}`}>
              <text
                x={paddingLeft - 8}
                y={y + 4}
                className="bar-chart__y-label"
                textAnchor="end"
              >
                {val}
              </text>
              <line
                x1={paddingLeft}
                x2="100%"
                y1={y}
                y2={y}
                className="bar-chart__grid-line"
              />
            </g>
          )
        })}

        {/* Bars */}
        {data.map((d, i) => {
          const barWidth = Math.max(
            8,
            (800 - paddingLeft - paddingRight - barGap * (data.length - 1)) / data.length
          )
          const x = paddingLeft + i * (barWidth + barGap)
          const barHeight = (d.value / maxValue) * chartHeight
          const y = paddingTop + chartHeight - barHeight

          return (
            <g
              key={d.label}
              onMouseEnter={() => handleMouseEnter(i)}
              onMouseLeave={handleMouseLeave}
              className="bar-chart__bar-group"
            >
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                rx={4}
                fill={color}
                className={`bar-chart__bar ${hoveredIndex === i ? 'bar-chart__bar--hovered' : ''}`}
              />
              {/* X-axis label */}
              <text
                x={x + barWidth / 2}
                y={paddingTop + chartHeight + 20}
                className="bar-chart__x-label"
                textAnchor="middle"
              >
                {d.label}
              </text>
              {/* Tooltip */}
              {hoveredIndex === i && (
                <g>
                  <rect
                    x={x + barWidth / 2 - 24}
                    y={y - 28}
                    width={48}
                    height={22}
                    rx={4}
                    className="bar-chart__tooltip-bg"
                  />
                  <text
                    x={x + barWidth / 2}
                    y={y - 13}
                    className="bar-chart__tooltip-text"
                    textAnchor="middle"
                  >
                    {d.value}
                  </text>
                </g>
              )}
            </g>
          )
        })}
      </svg>
    </div>
  )
}
