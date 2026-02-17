import { useFleetStore } from '../../stores/useFleetStore'
import './FleetOverview.css'

function formatCost(usd: number): string {
  return `$${usd.toFixed(2)}`
}

function formatTimeAgo(iso: string | null): string {
  if (!iso) return ''
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  return `${Math.floor(diff / 3600)}h ago`
}

export default function FleetOverview() {
  const fleetMetrics = useFleetStore((s) => s.fleetMetrics)
  const lastRefreshedAt = useFleetStore((s) => s.lastRefreshedAt)

  const stats = [
    { label: 'Total Registered', value: fleetMetrics.totalRegistered, variant: '' },
    { label: 'Active Now', value: fleetMetrics.totalActive, variant: 'primary' },
    { label: 'Idle', value: fleetMetrics.totalIdle, variant: '' },
    { label: 'Tasks Completed', value: fleetMetrics.tasksTodayCompleted, variant: 'success' },
    { label: 'Tasks Failed', value: fleetMetrics.tasksTodayFailed, variant: 'danger' },
    { label: 'Cost Today', value: formatCost(fleetMetrics.totalCostToday), variant: 'warning' },
  ]

  return (
    <div className="fleet-overview" role="region" aria-label="Fleet overview metrics">
      {stats.map((stat) => (
        <div key={stat.label} className="fleet-overview__stat">
          <span className="fleet-overview__stat-label">{stat.label}</span>
          <span
            className={`fleet-overview__stat-value${stat.variant ? ` fleet-overview__stat-value--${stat.variant}` : ''}`}
          >
            {stat.value}
          </span>
        </div>
      ))}
      {lastRefreshedAt && (
        <span className="fleet-overview__updated">Updated {formatTimeAgo(lastRefreshedAt)}</span>
      )}
    </div>
  )
}
