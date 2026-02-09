import { useCallback } from 'react'
import { TeamStatus } from '../../types'
import type { AgentTeam } from '../../types'
import { Badge } from '../../../../components/ui'
import { Plus, Users } from 'lucide-react'
import './TeamGrid.css'

const STATUS_BADGE_VARIANT: Record<TeamStatus, 'draft' | 'primary' | 'warning' | 'success'> = {
  [TeamStatus.Draft]: 'draft',
  [TeamStatus.Running]: 'primary',
  [TeamStatus.Paused]: 'warning',
  [TeamStatus.Completed]: 'success',
}

interface TeamGridProps {
  teams: AgentTeam[]
  onSelectTeam: (teamId: string) => void
  onNewTeam: () => void
}

export default function TeamGrid({ teams, onSelectTeam, onNewTeam }: TeamGridProps) {
  const handleNewTeam = useCallback(() => {
    onNewTeam()
  }, [onNewTeam])

  if (teams.length === 0) {
    return (
      <div className="team-grid__empty">
        <Users size={48} className="team-grid__empty-icon" />
        <h3 className="team-grid__empty-title">No agent teams yet</h3>
        <p className="team-grid__empty-text">
          Create your first team of AI agents to get started.
        </p>
        <button className="btn-primary" onClick={handleNewTeam}>
          Create Your First Team
        </button>
      </div>
    )
  }

  return (
    <div className="team-grid">
      {teams.map(team => (
        <button
          key={team.id}
          className="team-grid__card"
          onClick={() => onSelectTeam(team.id)}
          aria-label={`Team: ${team.name}`}
        >
          <div className="team-grid__card-header">
            <span className="team-grid__card-name">{team.name}</span>
            <Badge variant={STATUS_BADGE_VARIANT[team.status]} size="sm">
              {team.status}
            </Badge>
          </div>
          <div className="team-grid__card-meta">
            <span className="team-grid__card-agents">
              <Users size={14} />
              {team.agents.length} agent{team.agents.length !== 1 ? 's' : ''}
            </span>
            <span className="team-grid__card-date">
              {new Date(team.createdAt).toLocaleDateString()}
            </span>
          </div>
        </button>
      ))}

      <button
        className="team-grid__card team-grid__card--new"
        onClick={handleNewTeam}
        aria-label="Create new team"
      >
        <Plus size={32} className="team-grid__new-icon" />
        <span className="team-grid__new-text">Create New Team</span>
      </button>
    </div>
  )
}
