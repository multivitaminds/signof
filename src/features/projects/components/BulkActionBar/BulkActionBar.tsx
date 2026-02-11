import { useState, useCallback } from 'react'
import { X, Trash2 } from 'lucide-react'
import type { IssueStatus, IssuePriority, Member } from '../../types'
import { STATUS_CONFIG, PRIORITY_CONFIG, BOARD_STATUSES, PRIORITY_ORDER } from '../../types'
import { useProjectStore } from '../../stores/useProjectStore'
import './BulkActionBar.css'

interface BulkActionBarProps {
  members: Member[]
}

export default function BulkActionBar({ members }: BulkActionBarProps) {
  const selectedIssueIds = useProjectStore((s) => s.selectedIssueIds)
  const clearSelection = useProjectStore((s) => s.clearSelection)
  const bulkUpdateIssues = useProjectStore((s) => s.bulkUpdateIssues)
  const bulkDeleteIssues = useProjectStore((s) => s.bulkDeleteIssues)

  const [showStatusMenu, setShowStatusMenu] = useState(false)
  const [showPriorityMenu, setShowPriorityMenu] = useState(false)
  const [showAssigneeMenu, setShowAssigneeMenu] = useState(false)

  const count = selectedIssueIds.size

  const handleStatusChange = useCallback(
    (status: IssueStatus) => {
      bulkUpdateIssues({ status })
      setShowStatusMenu(false)
    },
    [bulkUpdateIssues]
  )

  const handlePriorityChange = useCallback(
    (priority: IssuePriority) => {
      bulkUpdateIssues({ priority })
      setShowPriorityMenu(false)
    },
    [bulkUpdateIssues]
  )

  const handleAssigneeChange = useCallback(
    (assigneeId: string | null) => {
      bulkUpdateIssues({ assigneeId })
      setShowAssigneeMenu(false)
    },
    [bulkUpdateIssues]
  )

  const handleDelete = useCallback(() => {
    bulkDeleteIssues()
  }, [bulkDeleteIssues])

  if (count === 0) return null

  return (
    <div className="bulk-action-bar" role="toolbar" aria-label="Bulk actions">
      <div className="bulk-action-bar__left">
        <button
          className="bulk-action-bar__close"
          onClick={clearSelection}
          aria-label="Clear selection"
        >
          <X size={14} />
        </button>
        <span className="bulk-action-bar__count">
          {count} selected
        </span>
      </div>

      <div className="bulk-action-bar__actions">
        {/* Status */}
        <div className="bulk-action-bar__action-wrapper">
          <button
            className="bulk-action-bar__action"
            onClick={() => { setShowStatusMenu(!showStatusMenu); setShowPriorityMenu(false); setShowAssigneeMenu(false) }}
            aria-expanded={showStatusMenu}
          >
            Status
          </button>
          {showStatusMenu && (
            <div className="bulk-action-bar__menu">
              {BOARD_STATUSES.map((s) => (
                <button
                  key={s}
                  className="bulk-action-bar__menu-item"
                  onClick={() => handleStatusChange(s)}
                >
                  <span
                    className="bulk-action-bar__menu-dot"
                    style={{ backgroundColor: STATUS_CONFIG[s].color }}
                  />
                  {STATUS_CONFIG[s].label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Priority */}
        <div className="bulk-action-bar__action-wrapper">
          <button
            className="bulk-action-bar__action"
            onClick={() => { setShowPriorityMenu(!showPriorityMenu); setShowStatusMenu(false); setShowAssigneeMenu(false) }}
            aria-expanded={showPriorityMenu}
          >
            Priority
          </button>
          {showPriorityMenu && (
            <div className="bulk-action-bar__menu">
              {PRIORITY_ORDER.map((p) => (
                <button
                  key={p}
                  className="bulk-action-bar__menu-item"
                  onClick={() => handlePriorityChange(p)}
                >
                  <span
                    className="bulk-action-bar__menu-dot"
                    style={{ backgroundColor: PRIORITY_CONFIG[p].color }}
                  />
                  {PRIORITY_CONFIG[p].label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Assignee */}
        <div className="bulk-action-bar__action-wrapper">
          <button
            className="bulk-action-bar__action"
            onClick={() => { setShowAssigneeMenu(!showAssigneeMenu); setShowStatusMenu(false); setShowPriorityMenu(false) }}
            aria-expanded={showAssigneeMenu}
          >
            Assignee
          </button>
          {showAssigneeMenu && (
            <div className="bulk-action-bar__menu">
              <button
                className="bulk-action-bar__menu-item"
                onClick={() => handleAssigneeChange(null)}
              >
                Unassigned
              </button>
              {members.map((m) => (
                <button
                  key={m.id}
                  className="bulk-action-bar__menu-item"
                  onClick={() => handleAssigneeChange(m.id)}
                >
                  {m.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Delete */}
        <button
          className="bulk-action-bar__action bulk-action-bar__action--danger"
          onClick={handleDelete}
          aria-label="Delete selected issues"
        >
          <Trash2 size={14} />
          Delete
        </button>
      </div>
    </div>
  )
}
