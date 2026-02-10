import {
  UserPlus,
  UserMinus,
  UserX,
  UserCheck,
  Send,
  XCircle,
  RefreshCw,
  ArrowRightLeft,
  Activity,
} from 'lucide-react'
import { useTeamStore } from '../../stores/useTeamStore'
import { ActivityAction } from '../../types/team'
import type { ActivityAction as ActivityActionType, TeamActivity } from '../../types/team'
import './TeamActivityLog.css'

function getActivityIcon(action: ActivityActionType) {
  switch (action) {
    case ActivityAction.MemberJoined:
      return <UserPlus size={14} className="team-activity-log__icon team-activity-log__icon--success" />
    case ActivityAction.MemberRemoved:
      return <UserMinus size={14} className="team-activity-log__icon team-activity-log__icon--danger" />
    case ActivityAction.MemberDeactivated:
      return <UserX size={14} className="team-activity-log__icon team-activity-log__icon--warning" />
    case ActivityAction.MemberReactivated:
      return <UserCheck size={14} className="team-activity-log__icon team-activity-log__icon--success" />
    case ActivityAction.RoleChanged:
      return <ArrowRightLeft size={14} className="team-activity-log__icon team-activity-log__icon--info" />
    case ActivityAction.InviteSent:
      return <Send size={14} className="team-activity-log__icon team-activity-log__icon--primary" />
    case ActivityAction.InviteCancelled:
      return <XCircle size={14} className="team-activity-log__icon team-activity-log__icon--danger" />
    case ActivityAction.InviteResent:
      return <RefreshCw size={14} className="team-activity-log__icon team-activity-log__icon--primary" />
    default:
      return <Activity size={14} className="team-activity-log__icon" />
  }
}

function formatTimestamp(isoString: string): string {
  const date = new Date(isoString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)

  if (diffMin < 1) return 'Just now'
  if (diffMin < 60) return `${diffMin}m ago`
  const diffHr = Math.floor(diffMin / 60)
  if (diffHr < 24) return `${diffHr}h ago`
  const diffDays = Math.floor(diffHr / 24)
  if (diffDays < 7) return `${diffDays}d ago`

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  })
}

function renderEntry(entry: TeamActivity) {
  return (
    <div key={entry.id} className="team-activity-log__entry">
      <div className="team-activity-log__icon-wrapper">
        {getActivityIcon(entry.action)}
      </div>
      <div className="team-activity-log__content">
        <p className="team-activity-log__description">{entry.description}</p>
        <span className="team-activity-log__timestamp">
          {formatTimestamp(entry.timestamp)}
        </span>
      </div>
    </div>
  )
}

export default function TeamActivityLog() {
  const activities = useTeamStore((s) => s.team.activities)

  return (
    <div className="team-activity-log">
      <h2 className="team-activity-log__title">
        <Activity size={18} /> Activity Log
      </h2>

      <div className="team-activity-log__list">
        {activities.length === 0 ? (
          <div className="team-activity-log__empty">
            No team activity yet.
          </div>
        ) : (
          activities.map((entry) => renderEntry(entry))
        )}
      </div>
    </div>
  )
}
