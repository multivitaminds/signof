import { useCallback } from 'react'
import { AgentStatus } from '../../types'
import type { AgentInstance } from '../../types'
import { Badge } from '../../../../components/ui'
import {
  ClipboardList, Search, PenTool, BarChart3,
  Palette, Code2, CheckSquare, Users,
  MessageSquare, Pause, Play,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import './AgentCard.css'

const ICON_MAP: Record<string, LucideIcon> = {
  ClipboardList, Search, PenTool, BarChart3,
  Palette, Code2, CheckSquare, Users,
}

const STATUS_BADGE_VARIANT: Record<AgentStatus, 'default' | 'primary' | 'warning' | 'success' | 'danger'> = {
  [AgentStatus.Idle]: 'default',
  [AgentStatus.Running]: 'primary',
  [AgentStatus.Paused]: 'warning',
  [AgentStatus.Completed]: 'success',
  [AgentStatus.Error]: 'danger',
}

interface AgentCardProps {
  agent: AgentInstance
  color: string
  icon: string
  selected?: boolean
  onSelect?: (agentId: string) => void
  onChat: (agentId: string) => void
  onPause?: (agentId: string) => void
  onResume?: (agentId: string) => void
}

export default function AgentCard({
  agent,
  color,
  icon,
  selected = false,
  onSelect,
  onChat,
  onPause,
  onResume,
}: AgentCardProps) {
  const IconComponent = ICON_MAP[icon]
  const currentStep = agent.steps[agent.currentStepIndex]
  const completedCount = agent.steps.filter(s => s.status === 'completed').length

  const handleChat = useCallback(() => {
    onChat(agent.id)
  }, [onChat, agent.id])

  const handlePause = useCallback(() => {
    onPause?.(agent.id)
  }, [onPause, agent.id])

  const handleResume = useCallback(() => {
    onResume?.(agent.id)
  }, [onResume, agent.id])

  const handleSelect = useCallback(() => {
    onSelect?.(agent.id)
  }, [onSelect, agent.id])

  return (
    <div
      className={`agent-card${selected ? ' agent-card--selected' : ''}`}
      style={{ borderLeftColor: color }}
      onClick={handleSelect}
      role="button"
      tabIndex={0}
      aria-label={`Agent: ${agent.name}`}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleSelect() }}
    >
      <div className="agent-card__header">
        <div className="agent-card__icon" style={{ color }}>
          {IconComponent && <IconComponent size={20} />}
        </div>
        <div className="agent-card__info">
          <span className="agent-card__name">{agent.name}</span>
          <div className="agent-card__badges">
            <Badge variant="default" size="sm">{agent.type}</Badge>
            <Badge variant={STATUS_BADGE_VARIANT[agent.status]} size="sm" dot>
              {agent.status}
            </Badge>
          </div>
        </div>
      </div>

      {agent.steps.length > 0 && (
        <div className="agent-card__progress">
          <span className="agent-card__progress-text">
            Step {Math.min(agent.currentStepIndex + 1, agent.steps.length)} of {agent.steps.length}
          </span>
          {currentStep && (
            <span className="agent-card__step-label">{currentStep.label}</span>
          )}
          <div className="agent-card__progress-bar">
            <div
              className="agent-card__progress-fill"
              style={{ width: `${(completedCount / agent.steps.length) * 100}%`, backgroundColor: color }}
            />
          </div>
        </div>
      )}

      <div className="agent-card__actions">
        <button
          className="agent-card__action-btn"
          onClick={(e) => { e.stopPropagation(); handleChat() }}
          aria-label={`Chat with ${agent.name}`}
          title="Chat"
        >
          <MessageSquare size={16} />
        </button>
        {agent.status === AgentStatus.Running && onPause && (
          <button
            className="agent-card__action-btn"
            onClick={(e) => { e.stopPropagation(); handlePause() }}
            aria-label={`Pause ${agent.name}`}
            title="Pause"
          >
            <Pause size={16} />
          </button>
        )}
        {agent.status === AgentStatus.Paused && onResume && (
          <button
            className="agent-card__action-btn"
            onClick={(e) => { e.stopPropagation(); handleResume() }}
            aria-label={`Resume ${agent.name}`}
            title="Resume"
          >
            <Play size={16} />
          </button>
        )}
      </div>
    </div>
  )
}
