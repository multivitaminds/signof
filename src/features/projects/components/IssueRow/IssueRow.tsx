import { useCallback } from 'react'
import type { Issue, Member, Label, IssueStatus, IssuePriority } from '../../types'
import StatusSelect from '../StatusSelect/StatusSelect'
import PrioritySelect from '../PrioritySelect/PrioritySelect'
import AssigneePicker from '../AssigneePicker/AssigneePicker'
import './IssueRow.css'

interface IssueRowProps {
  issue: Issue
  members: Member[]
  labels: Label[]
  onUpdate: (id: string, updates: Partial<Issue>) => void
  onClick: () => void
  selected?: boolean
  focused?: boolean
  checked?: boolean
  onCheckChange?: (issueId: string) => void
}

export default function IssueRow({
  issue,
  members,
  labels,
  onUpdate,
  onClick,
  selected = false,
  focused = false,
  checked,
  onCheckChange,
}: IssueRowProps) {
  const issueLabels = labels.filter((l) => issue.labelIds.includes(l.id))

  const handleStatusChange = useCallback(
    (status: IssueStatus) => {
      onUpdate(issue.id, { status })
    },
    [issue.id, onUpdate]
  )

  const handlePriorityChange = useCallback(
    (priority: IssuePriority) => {
      onUpdate(issue.id, { priority })
    },
    [issue.id, onUpdate]
  )

  const handleAssigneeChange = useCallback(
    (assigneeId: string | null) => {
      onUpdate(issue.id, { assigneeId })
    },
    [issue.id, onUpdate]
  )

  const formattedDate = new Date(issue.updatedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })

  const classNames = [
    'issue-row',
    selected ? 'issue-row--selected' : '',
    focused ? 'issue-row--focused' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div
      className={classNames}
      role="row"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter') onClick()
      }}
    >
      {onCheckChange && (
        <div
          className="issue-row__cell issue-row__check"
          onClick={(e) => e.stopPropagation()}
        >
          <input
            type="checkbox"
            checked={checked ?? false}
            onChange={() => onCheckChange(issue.id)}
            className="issue-row__checkbox"
            aria-label={`Select ${issue.identifier}`}
          />
        </div>
      )}
      <div className="issue-row__cell issue-row__identifier">
        {issue.identifier}
      </div>
      <div className="issue-row__cell issue-row__title" title={issue.title}>
        {issue.title}
      </div>
      <div
        className="issue-row__cell issue-row__status"
        onClick={(e) => e.stopPropagation()}
      >
        <StatusSelect
          value={issue.status}
          onChange={handleStatusChange}
          compact
        />
      </div>
      <div
        className="issue-row__cell issue-row__priority"
        onClick={(e) => e.stopPropagation()}
      >
        <PrioritySelect
          value={issue.priority}
          onChange={handlePriorityChange}
          compact
        />
      </div>
      <div
        className="issue-row__cell issue-row__assignee"
        onClick={(e) => e.stopPropagation()}
      >
        <AssigneePicker
          members={members}
          value={issue.assigneeId}
          onChange={handleAssigneeChange}
        />
      </div>
      <div
        className="issue-row__cell issue-row__labels"
        onClick={(e) => e.stopPropagation()}
      >
        {issueLabels.length > 0 ? (
          <div className="issue-row__label-dots">
            {issueLabels.slice(0, 3).map((label) => (
              <span
                key={label.id}
                className="issue-row__label-dot"
                style={{ backgroundColor: label.color }}
                title={label.name}
              />
            ))}
            {issueLabels.length > 3 && (
              <span className="issue-row__label-more">
                +{issueLabels.length - 3}
              </span>
            )}
          </div>
        ) : (
          <span className="issue-row__no-labels" aria-hidden="true">—</span>
        )}
      </div>
      <div className="issue-row__cell issue-row__date">
        {formattedDate}
      </div>
    </div>
  )
}
