import './AgentStatsBar.css'

interface AgentStatsBarProps {
  totalAgents: number
  totalRuns: number
  activePipelines: number
  successRate: number
}

export default function AgentStatsBar({ totalAgents, totalRuns, activePipelines, successRate }: AgentStatsBarProps) {
  return (
    <div className="copilot-agents__stats-bar" aria-label="Agent statistics">
      <div className="copilot-agents__stat-card">
        <span className="copilot-agents__stat-value">{totalAgents}</span>
        <span className="copilot-agents__stat-label">Total Agents</span>
      </div>
      <div className="copilot-agents__stat-card">
        <span className="copilot-agents__stat-value">{totalRuns}</span>
        <span className="copilot-agents__stat-label">Total Runs</span>
      </div>
      <div className="copilot-agents__stat-card">
        <span className="copilot-agents__stat-value">{activePipelines}</span>
        <span className="copilot-agents__stat-label">Active Pipelines</span>
      </div>
      <div className="copilot-agents__stat-card">
        <span className="copilot-agents__stat-value">{successRate}%</span>
        <span className="copilot-agents__stat-label">Success Rate</span>
      </div>
    </div>
  )
}
