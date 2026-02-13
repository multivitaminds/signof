import './MetricCard.css'

interface MetricCardProps {
  value: string
  label: string
  color?: string
}

function MetricCard({ value, label, color }: MetricCardProps) {
  return (
    <div className="metric-card">
      <div className="metric-card__value" style={color ? { color } : undefined}>
        {value}
      </div>
      <div className="metric-card__label">{label}</div>
    </div>
  )
}

export default MetricCard
