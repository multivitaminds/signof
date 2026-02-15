import { useMemo } from 'react'
import { AgentLifecycle } from '../../types'
import type { AutonomousAgent } from '../../types'
import './AgentMonitorDashboard.css'

interface AgentMonitorDashboardProps {
  agents: AutonomousAgent[]
  onAgentSelect?: (agentId: string) => void
}

const LIFECYCLE_COLORS: Record<string, string> = {
  [AgentLifecycle.Idle]: '#6b7280',
  [AgentLifecycle.Deployed]: '#3b82f6',
  [AgentLifecycle.Thinking]: '#8b5cf6',
  [AgentLifecycle.Acting]: '#f59e0b',
  [AgentLifecycle.Waiting]: '#6b7280',
  [AgentLifecycle.Healing]: '#dc2626',
  [AgentLifecycle.Retired]: '#374151',
}

export default function AgentMonitorDashboard({ agents, onAgentSelect }: AgentMonitorDashboardProps) {
  const activeGoalsCount = useMemo(
    () => (agent: AutonomousAgent) => agent.goalStack.filter((g) => g.status === 'active').length,
    [],
  )

  const lastThinking = useMemo(
    () => (agent: AutonomousAgent) => {
      const steps = agent.thinkingLog
      const last = steps[steps.length - 1]
      return last ? last.content.slice(0, 60) : 'No activity yet'
    },
    [],
  )

  if (agents.length === 0) {
    return (
      <div className="agent-monitor agent-monitor--empty">
        <p className="agent-monitor__empty-text">No agents deployed. Deploy an agent to see it here.</p>
      </div>
    )
  }

  return (
    <div className="agent-monitor">
      <div className="agent-monitor__grid">
        {agents.map((agent) => {
          const color = LIFECYCLE_COLORS[agent.lifecycle] ?? '#6b7280'
          return (
            <div
              key={agent.id}
              className="agent-monitor__card"
              onClick={() => onAgentSelect?.(String(agent.id))}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onAgentSelect?.(String(agent.id))
                }
              }}
            >
              <div className="agent-monitor__card-header">
                <span className="agent-monitor__name">{agent.name}</span>
                <span className="agent-monitor__lifecycle" style={{ background: color }}>
                  {agent.lifecycle}
                </span>
              </div>
              <div className="agent-monitor__card-body">
                <div className="agent-monitor__stat">
                  <span className="agent-monitor__stat-label">Autonomy</span>
                  <span className="agent-monitor__stat-value">{agent.autonomyMode}</span>
                </div>
                <div className="agent-monitor__stat">
                  <span className="agent-monitor__stat-label">Active Goals</span>
                  <span className="agent-monitor__stat-value">{activeGoalsCount(agent)}</span>
                </div>
                <div className="agent-monitor__stat">
                  <span className="agent-monitor__stat-label">Errors</span>
                  <span className="agent-monitor__stat-value" style={{ color: agent.errorCount > 0 ? '#dc2626' : 'inherit' }}>
                    {agent.errorCount}
                  </span>
                </div>
              </div>
              <div className="agent-monitor__thinking">
                {lastThinking(agent)}
              </div>
              <div className="agent-monitor__heartbeat">
                Heartbeat: {agent.lastHeartbeat ? new Date(agent.lastHeartbeat).toLocaleTimeString() : 'N/A'}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
