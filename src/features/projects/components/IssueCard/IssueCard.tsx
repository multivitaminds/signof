import { useCallback } from 'react'
import type { Issue, Member, Label } from '../../types'
import { IssuePriority, PRIORITY_CONFIG } from '../../types'
import './IssueCard.css'

interface IssueCardProps {
  issue: Issue
  members: Member[]
  labels: Label[]
  onClick: () => void
  selected?: boolean
  focused?: boolean
}

const PRIORITY_SYMBOLS: Record<string, string> = {
  [IssuePriority.Urgent]: '!!!',
  [IssuePriority.High]: '\u2191\u2191',
  [IssuePriority.Medium]: '\u2191',
  [IssuePriority.Low]: '\u2193',
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  const first = parts[0]?.[0] ?? ''
  const last = parts.length > 1 ? parts[parts.length - 1]![0] ?? '' : ''
  return (first + last).toUpperCase()
}

function IssueCard({ issue, members, labels, onClick, selected, focused }: IssueCardProps) {
  const handleDragStart = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.dataTransfer.setData('text/plain', issue.id)
      e.dataTransfer.effectAllowed = 'move'
    },
    [issue.id],
  )

  const assignee = issue.assigneeId
    ? members.find((m) => m.id === issue.assigneeId)
    : undefined

  const issueLabels = issue.labelIds
    .map((id) => labels.find((l) => l.id === id))
    .filter((l): l is Label => l !== undefined)
    .slice(0, 3)

  const priorityConfig = PRIORITY_CONFIG[issue.priority]
  const prioritySymbol = PRIORITY_SYMBOLS[issue.priority]

  const classNames = [
    'issue-card',
    selected ? 'issue-card--selected' : '',
    focused ? 'issue-card--focused' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div
      className={classNames}
      draggable
      onClick={onClick}
      onDragStart={handleDragStart}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick()
        }
      }}
    >
      <span className="issue-card__identifier">{issue.identifier}</span>
      <p className="issue-card__title">{issue.title}</p>
      <div className="issue-card__meta">
        <div className="issue-card__meta-left">
          {prioritySymbol && (
            <span
              className="issue-card__priority"
              style={{ color: priorityConfig.color }}
              title={priorityConfig.label}
            >
              {prioritySymbol}
            </span>
          )}
          {issueLabels.length > 0 && (
            <div className="issue-card__labels">
              {issueLabels.map((label) => (
                <span
                  key={label.id}
                  className="issue-card__label-dot"
                  style={{ backgroundColor: label.color }}
                  title={label.name}
                />
              ))}
            </div>
          )}
        </div>
        {assignee && (
          <span className="issue-card__assignee" title={assignee.name}>
            {getInitials(assignee.name)}
          </span>
        )}
      </div>
    </div>
  )
}

export default IssueCard
