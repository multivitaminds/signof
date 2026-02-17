import { useCallback, useMemo } from 'react'
import { useFleetStore } from '../../stores/useFleetStore'
import useAgentRuntimeStore from '../../../ai/stores/useAgentRuntimeStore'
import './FleetAgentDetail.css'

interface FleetAgentDetailProps {
  instanceId: string | null
  onClose: () => void
  onRetire: (instanceId: string) => void
}

function formatCost(usd: number): string {
  return `$${usd.toFixed(4)}`
}

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}

export default function FleetAgentDetail({
  instanceId,
  onClose,
  onRetire,
}: FleetAgentDetailProps) {
  const activeInstances = useFleetStore((s) => s.activeInstances)
  const deployedAgents = useAgentRuntimeStore((s) => s.deployedAgents)

  const instance = instanceId ? activeInstances[instanceId] ?? null : null

  const runtimeAgent = useMemo(() => {
    if (!instance) return null
    return deployedAgents.get(instance.runtimeAgentId) ?? null
  }, [instance, deployedAgents])

  const handleRetire = useCallback(() => {
    if (instanceId) {
      onRetire(instanceId)
    }
  }, [instanceId, onRetire])

  if (!instanceId || !instance) {
    return null
  }

  return (
    <div className="fleet-agent-detail" role="complementary" aria-label="Agent details">
      <div className="fleet-agent-detail__header">
        <div className="fleet-agent-detail__header-info">
          <h2 className="fleet-agent-detail__name">{instance.registryId}</h2>
          <div className="fleet-agent-detail__meta-row">
            <span className="fleet-agent-detail__domain">{instance.domain}</span>
            <span
              className={`fleet-agent-detail__status-badge fleet-agent-detail__status-badge--${instance.status}`}
            >
              {instance.status}
            </span>
          </div>
        </div>
        <button
          className="fleet-agent-detail__close-btn"
          onClick={onClose}
          aria-label="Close details"
        >
          X
        </button>
      </div>

      <div className="fleet-agent-detail__body">
        <div>
          <h3 className="fleet-agent-detail__section-title">Cost Breakdown</h3>
          <div className="fleet-agent-detail__stats">
            <div className="fleet-agent-detail__stat">
              <span className="fleet-agent-detail__stat-label">Tokens</span>
              <span className="fleet-agent-detail__stat-value">
                {formatTokens(instance.tokensConsumed)}
              </span>
            </div>
            <div className="fleet-agent-detail__stat">
              <span className="fleet-agent-detail__stat-label">Cost</span>
              <span className="fleet-agent-detail__stat-value">
                {formatCost(instance.costUsd)}
              </span>
            </div>
            <div className="fleet-agent-detail__stat">
              <span className="fleet-agent-detail__stat-label">Cycles</span>
              <span className="fleet-agent-detail__stat-value">{instance.cycleCount}</span>
            </div>
            <div className="fleet-agent-detail__stat">
              <span className="fleet-agent-detail__stat-label">Errors</span>
              <span className="fleet-agent-detail__stat-value">{instance.errorCount}</span>
            </div>
          </div>
        </div>

        {instance.currentTask && (
          <div>
            <h3 className="fleet-agent-detail__section-title">Current Task</h3>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)', margin: 0 }}>
              {instance.currentTask}
            </p>
          </div>
        )}

        {runtimeAgent && runtimeAgent.goalStack.length > 0 && (
          <div>
            <h3 className="fleet-agent-detail__section-title">Goal Stack</h3>
            <div className="fleet-agent-detail__goals">
              {runtimeAgent.goalStack.map((goal) => (
                <div key={goal.id} className="fleet-agent-detail__goal">
                  <span
                    className={`fleet-agent-detail__goal-status fleet-agent-detail__goal-status--${goal.status}`}
                  >
                    [{goal.status}]
                  </span>
                  <span>{goal.description}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {runtimeAgent && runtimeAgent.thinkingLog.length > 0 && (
          <div>
            <h3 className="fleet-agent-detail__section-title">Thinking Log</h3>
            <div className="fleet-agent-detail__thinking-log">
              {runtimeAgent.thinkingLog.slice(-20).map((step) => (
                <div key={step.id} className="fleet-agent-detail__thinking-step">
                  <span className="fleet-agent-detail__step-type">{step.type}</span>
                  <span className="fleet-agent-detail__step-content">{step.content}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="fleet-agent-detail__footer">
        <button
          className="fleet-agent-detail__retire-btn btn--danger"
          onClick={handleRetire}
        >
          Retire Agent
        </button>
      </div>
    </div>
  )
}
