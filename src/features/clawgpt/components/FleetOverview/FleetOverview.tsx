import { useFleetStore } from '../../stores/useFleetStore'
import './FleetOverview.css'

function formatCost(usd: number): string {
  return `$${usd.toFixed(2)}`
}

export default function FleetOverview() {
  const fleetMetrics = useFleetStore((s) => s.fleetMetrics)

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
    </div>
  )
}
