import { useMemo } from 'react'
import { useFleetStore } from '../../stores/useFleetStore'
import './BudgetDashboard.css'

function formatCost(usd: number): string {
  return `$${usd.toFixed(2)}`
}

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}

export default function BudgetDashboard() {
  const fleetMetrics = useFleetStore((s) => s.fleetMetrics)
  const activeInstances = useFleetStore((s) => s.activeInstances)

  const domainCosts = useMemo(() => {
    const map = new Map<string, number>()
    for (const inst of Object.values(activeInstances)) {
      map.set(inst.domain, (map.get(inst.domain) ?? 0) + inst.costUsd)
    }
    return Array.from(map.entries())
      .map(([domain, cost]) => ({ domain, cost }))
      .sort((a, b) => b.cost - a.cost)
  }, [activeInstances])

  const maxDomainCost = useMemo(
    () => Math.max(...domainCosts.map((d) => d.cost), 0.01),
    [domainCosts],
  )

  const topAgents = useMemo(() => {
    return Object.values(activeInstances)
      .sort((a, b) => b.costUsd - a.costUsd)
      .slice(0, 5)
  }, [activeInstances])

  return (
    <div className="budget-dashboard" role="region" aria-label="Budget dashboard">
      <div className="budget-dashboard__summary">
        <div className="budget-dashboard__stat">
          <span className="budget-dashboard__stat-label">Cost Today</span>
          <span className="budget-dashboard__stat-value">
            {formatCost(fleetMetrics.totalCostToday)}
          </span>
        </div>
        <div className="budget-dashboard__stat">
          <span className="budget-dashboard__stat-label">Tokens Today</span>
          <span className="budget-dashboard__stat-value">
            {formatTokens(fleetMetrics.totalTokensToday)}
          </span>
        </div>
      </div>

      <div>
        <h3 className="budget-dashboard__section-title">Cost by Domain</h3>
        {domainCosts.length === 0 ? (
          <div className="budget-dashboard__empty">No cost data available</div>
        ) : (
          <div className="budget-dashboard__chart">
            {domainCosts.map(({ domain, cost }) => (
              <div key={domain} className="budget-dashboard__bar-row">
                <span className="budget-dashboard__bar-label" title={domain}>
                  {domain}
                </span>
                <div className="budget-dashboard__bar-track">
                  <div
                    className="budget-dashboard__bar-fill"
                    style={{ width: `${(cost / maxDomainCost) * 100}%` }}
                  />
                </div>
                <span className="budget-dashboard__bar-value">{formatCost(cost)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h3 className="budget-dashboard__section-title">Top 5 Costliest Instances</h3>
        {topAgents.length === 0 ? (
          <div className="budget-dashboard__empty">No active instances</div>
        ) : (
          <div className="budget-dashboard__top-agents">
            {topAgents.map((agent) => (
              <div key={agent.instanceId} className="budget-dashboard__agent-row">
                <span className="budget-dashboard__agent-name">{agent.registryId}</span>
                <span className="budget-dashboard__agent-cost">
                  {formatCost(agent.costUsd)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
