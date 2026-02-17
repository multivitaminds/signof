import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import SparklineChart from '../charts/SparklineChart'
import type { MetricSummary } from '../../types'
import { MetricType } from '../../types'
import './MetricCard.css'

interface MetricCardProps {
  metric: MetricSummary
  onClick?: () => void
}

const METRIC_LABELS: Record<string, string> = {
  [MetricType.DocumentsSigned]: 'Documents Signed',
  [MetricType.IssuesCompleted]: 'Issues Completed',
  [MetricType.BookingsCreated]: 'Bookings Created',
  [MetricType.AgentTasksDone]: 'Agent Tasks Done',
  [MetricType.PagesCreated]: 'Pages Created',
  [MetricType.RevenueTracked]: 'Revenue Tracked',
}

function formatValue(type: string, value: number): string {
  if (type === MetricType.RevenueTracked) {
    return `$${value.toLocaleString()}`
  }
  return value.toLocaleString()
}

function getTrendPercentage(current: number, previous: number): string {
  if (previous === 0) {
    return current > 0 ? '+100%' : '0%'
  }
  const pct = Math.round(((current - previous) / previous) * 100)
  return pct >= 0 ? `+${pct}%` : `${pct}%`
}

function getTrendColor(trend: 'up' | 'down' | 'flat'): string {
  switch (trend) {
    case 'up': return 'var(--color-success)'
    case 'down': return 'var(--color-danger)'
    case 'flat': return 'var(--text-muted)'
  }
}

export default function MetricCard({ metric, onClick }: MetricCardProps) {
  const { type, current, previous, trend, data } = metric
  const sparkData = data.map((d) => d.value)
  const trendColor = getTrendColor(trend)

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus

  return (
    <div
      className="metric-card"
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="metric-card__header">
        <span className="metric-card__label">{METRIC_LABELS[type] || type}</span>
        <div className="metric-card__trend" style={{ color: trendColor }}>
          <TrendIcon size={14} />
          <span className="metric-card__trend-pct">{getTrendPercentage(current, previous)}</span>
        </div>
      </div>
      <div className="metric-card__value">{formatValue(type, current)}</div>
      <div className="metric-card__sparkline">
        <SparklineChart data={sparkData} color={trendColor} width={120} height={32} />
      </div>
    </div>
  )
}
