import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Bot } from 'lucide-react'
import { useFleetStore } from '../../../clawgpt/stores/useFleetStore'
import { FleetAgentStatus } from '../../../clawgpt/types'
import Card from '../../../../components/ui/Card'
import './AgentStatusWidget.css'

export default function AgentStatusWidget() {
  const activeInstances = useFleetStore((s) => s.activeInstances)
  const taskQueue = useFleetStore((s) => s.taskQueue)

  const summary = useMemo(() => {
    const instances = Object.values(activeInstances)
    const active = instances.length
    const idle = instances.filter((i) => i.status === FleetAgentStatus.Idle).length
    const working = instances.filter((i) => i.status === FleetAgentStatus.Working).length
    const lastCompleted = [...taskQueue]
      .filter((t) => t.status === 'completed')
      .sort((a, b) => (b.completedAt ?? '').localeCompare(a.completedAt ?? ''))
      [0]
    return { active, idle, working, lastCompleted }
  }, [activeInstances, taskQueue])

  return (
    <Card>
      <Card.Header>
        <Card.Title>Agent Status</Card.Title>
      </Card.Header>
      <Card.Body>
        <div className="agent-status__grid">
          <div className="agent-status__stat">
            <Bot size={16} className="agent-status__icon agent-status__icon--active" />
            <span className="agent-status__stat-value">{summary.active}</span>
            <span className="agent-status__stat-label">Active</span>
          </div>
          <div className="agent-status__stat">
            <span className="agent-status__dot agent-status__dot--idle" />
            <span className="agent-status__stat-value">{summary.idle}</span>
            <span className="agent-status__stat-label">Idle</span>
          </div>
          <div className="agent-status__stat">
            <span className="agent-status__dot agent-status__dot--working" />
            <span className="agent-status__stat-value">{summary.working}</span>
            <span className="agent-status__stat-label">Working</span>
          </div>
        </div>
        {summary.lastCompleted && (
          <div className="agent-status__last-task">
            <span className="agent-status__last-label">Last completed:</span>
            <span className="agent-status__last-desc">
              {summary.lastCompleted.description}
            </span>
          </div>
        )}
      </Card.Body>
      <Card.Footer>
        <Link to="/brain" className="agent-status__view-all">
          View fleet <ArrowRight size={14} />
        </Link>
      </Card.Footer>
    </Card>
  )
}
