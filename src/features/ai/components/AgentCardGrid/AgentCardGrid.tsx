import { Play, Star, Clock } from 'lucide-react'
import { getIcon, formatRelativeDate } from '../../lib/agentIcons'
import type { AgentType, AgentTypeDefinition } from '../../types'
import './AgentCardGrid.css'

interface AgentCardGridProps {
  agents: AgentTypeDefinition[]
  favorites: AgentType[]
  lastRunByAgent: Record<string, string>
  runTaskInputs: Record<string, string>
  onTaskInputChange: (type: AgentType, value: string) => void
  onRun: (type: AgentType) => void
  onToggleFavorite: (type: AgentType) => void
}

export default function AgentCardGrid({
  agents,
  favorites,
  lastRunByAgent,
  runTaskInputs,
  onTaskInputChange,
  onRun,
  onToggleFavorite,
}: AgentCardGridProps) {
  return (
    <div className="copilot-agents__grid">
      {agents.map((agent) => {
        const IconComp = getIcon(agent.icon)
        const lastRun = lastRunByAgent[agent.type]
        const isFavorite = favorites.includes(agent.type)
        return (
          <div
            key={agent.type}
            className="copilot-agents__card"
            style={{ '--agent-color': agent.color } as React.CSSProperties}
          >
            <div className="copilot-agents__card-header">
              <div className="copilot-agents__card-icon">
                <IconComp size={24} />
              </div>
              <div className="copilot-agents__card-info">
                <div className="copilot-agents__card-name-row">
                  <h3 className="copilot-agents__card-name">{agent.label} Agent</h3>
                  <button
                    className={`copilot-agents__card-favorite${isFavorite ? ' copilot-agents__card-favorite--active' : ''}`}
                    onClick={() => onToggleFavorite(agent.type)}
                    aria-label={isFavorite ? `Unfavorite ${agent.label}` : `Favorite ${agent.label}`}
                  >
                    <Star size={14} fill={isFavorite ? 'currentColor' : 'none'} />
                  </button>
                </div>
                <p className="copilot-agents__card-desc">{agent.description}</p>
              </div>
            </div>
            <span className="copilot-agents__card-category-badge">
              {agent.category}
            </span>
            <div className="copilot-agents__card-input-row">
              <input
                className="copilot-agents__card-task-input"
                type="text"
                placeholder="Describe the task..."
                value={runTaskInputs[agent.type] ?? ''}
                onChange={(e) => onTaskInputChange(agent.type, e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') onRun(agent.type)
                }}
                aria-label={`Task for ${agent.label} Agent`}
              />
              <button
                className="copilot-agents__run-btn"
                onClick={() => onRun(agent.type)}
                aria-label={`Run ${agent.label} Agent`}
              >
                <Play size={14} />
                Run
              </button>
            </div>
            {lastRun && (
              <span className="copilot-agents__card-last-run">
                <Clock size={12} />
                Last run: {formatRelativeDate(lastRun)}
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}
