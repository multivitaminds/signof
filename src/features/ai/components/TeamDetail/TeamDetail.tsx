import { useState, useCallback } from 'react'
import { TeamStatus, AgentStatus } from '../../types'
import type { AgentTeam } from '../../types'
import { Badge } from '../../../../components/ui'
import { getDefinition } from '../../lib/agentDefinitions'
import AgentCard from '../AgentCard/AgentCard'
import ProgressPanel from '../ProgressPanel/ProgressPanel'
import AgentChat from '../AgentChat/AgentChat'
import { ArrowLeft, Play, Pause, Square, RotateCcw } from 'lucide-react'
import './TeamDetail.css'

const STATUS_BADGE_VARIANT: Record<TeamStatus, 'draft' | 'primary' | 'warning' | 'success'> = {
  [TeamStatus.Draft]: 'draft',
  [TeamStatus.Running]: 'primary',
  [TeamStatus.Paused]: 'warning',
  [TeamStatus.Completed]: 'success',
}

interface TeamDetailProps {
  team: AgentTeam
  onBack: () => void
  onStart: () => void
  onPause: () => void
  onResume: () => void
  onCancel: () => void
  onPauseAgent: (agentId: string) => void
  onResumeAgent: (agentId: string) => void
  onSendMessage: (agentId: string, content: string) => void
}

export default function TeamDetail({
  team,
  onBack,
  onStart,
  onPause,
  onResume,
  onCancel,
  onPauseAgent,
  onResumeAgent,
  onSendMessage,
}: TeamDetailProps) {
  const [selectedAgentId, setSelectedAgentId] = useState<string>(
    team.agents[0]?.id ?? ''
  )
  const [showChat, setShowChat] = useState(false)

  const selectedAgent = team.agents.find(a => a.id === selectedAgentId)

  const handleSelectAgent = useCallback((agentId: string) => {
    setSelectedAgentId(agentId)
  }, [])

  const handleOpenChat = useCallback((agentId: string) => {
    setSelectedAgentId(agentId)
    setShowChat(true)
  }, [])

  const handleCloseChat = useCallback(() => {
    setShowChat(false)
  }, [])

  const handleSendMessage = useCallback((content: string) => {
    if (selectedAgentId) {
      onSendMessage(selectedAgentId, content)
    }
  }, [selectedAgentId, onSendMessage])

  return (
    <div className="team-detail">
      <div className="team-detail__header">
        <div className="team-detail__header-left">
          <button
            className="team-detail__back-btn"
            onClick={onBack}
            aria-label="Go back"
          >
            <ArrowLeft size={20} />
          </button>
          <h2 className="team-detail__name">{team.name}</h2>
          <Badge variant={STATUS_BADGE_VARIANT[team.status]} size="sm">
            {team.status}
          </Badge>
        </div>

        <div className="team-detail__controls">
          {team.status === TeamStatus.Draft && (
            <button className="btn-primary" onClick={onStart} aria-label="Start team">
              <Play size={16} /> Start
            </button>
          )}
          {team.status === TeamStatus.Running && (
            <>
              <button className="btn-secondary" onClick={onPause} aria-label="Pause team">
                <Pause size={16} /> Pause
              </button>
              <button className="btn-danger" onClick={onCancel} aria-label="Cancel team">
                <Square size={16} /> Stop
              </button>
            </>
          )}
          {team.status === TeamStatus.Paused && (
            <>
              <button className="btn-primary" onClick={onResume} aria-label="Resume team">
                <RotateCcw size={16} /> Resume
              </button>
              <button className="btn-danger" onClick={onCancel} aria-label="Cancel team">
                <Square size={16} /> Stop
              </button>
            </>
          )}
        </div>
      </div>

      <div className="team-detail__body">
        <div className="team-detail__agents">
          {team.agents.map(agent => {
            const def = getDefinition(agent.type)
            return (
              <AgentCard
                key={agent.id}
                agent={agent}
                color={def?.color ?? '#6B7280'}
                icon={def?.icon ?? 'Users'}
                selected={agent.id === selectedAgentId}
                onSelect={handleSelectAgent}
                onChat={handleOpenChat}
                onPause={
                  agent.status === AgentStatus.Running ? onPauseAgent : undefined
                }
                onResume={
                  agent.status === AgentStatus.Paused ? onResumeAgent : undefined
                }
              />
            )
          })}
        </div>

        <div className="team-detail__sidebar">
          {selectedAgent && (
            <>
              <div className="team-detail__progress">
                <h3 className="team-detail__section-title">
                  {selectedAgent.name} Progress
                </h3>
                <ProgressPanel steps={selectedAgent.steps} />
              </div>

              {showChat && (
                <div className="team-detail__chat">
                  <AgentChat
                    teamId={team.id}
                    agentId={selectedAgent.id}
                    agentName={selectedAgent.name}
                    messages={team.messages}
                    onSendMessage={handleSendMessage}
                    onClose={handleCloseChat}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
