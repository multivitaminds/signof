import { useId } from 'react'
import './SparklineChart.css'

interface SparklineChartProps {
  data: number[]
  color?: string
  width?: number
  height?: number
}

export default function SparklineChart({
  data,
  color = 'var(--color-primary)',
  width = 120,
  height = 32,
}: SparklineChartProps) {
  const gradientId = `sparkline-grad-${useId().replace(/:/g, '')}`

  if (data.length < 2) {
    return <svg className="sparkline" width={width} height={height} aria-label="Sparkline chart" role="img" />
  }

  const max = Math.max(...data, 1)
  const min = Math.min(...data, 0)
  const range = max - min || 1
  const padding = 2

  const points = data.map((val, i) => {
    const x = padding + (i / (data.length - 1)) * (width - padding * 2)
    const y = padding + (1 - (val - min) / range) * (height - padding * 2)
    return `${x},${y}`
  })

  const polyline = points.join(' ')

  // Fill area below line
  const firstX = padding
  const lastX = padding + ((data.length - 1) / (data.length - 1)) * (width - padding * 2)
  const fillPoints = `${firstX},${height} ${polyline} ${lastX},${height}`

  return (
    <svg
      className="sparkline"
      width={width}
      height={height}
      aria-label="Sparkline chart"
      role="img"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.25} />
          <stop offset="100%" stopColor={color} stopOpacity={0.02} />
        </linearGradient>
      </defs>
      <polygon
        points={fillPoints}
        fill={`url(#${gradientId})`}
        className="sparkline__fill"
      />
      <polyline
        points={polyline}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="sparkline__line"
      />
    </svg>
  )
}
