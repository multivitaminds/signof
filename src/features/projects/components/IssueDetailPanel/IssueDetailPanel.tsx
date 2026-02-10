import { useState, useCallback, useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import type { IssueStatus, IssuePriority } from '../../types'
import { STATUS_CONFIG } from '../../types'
import { useProjectStore } from '../../stores/useProjectStore'
import StatusSelect from '../StatusSelect/StatusSelect'
import PrioritySelect from '../PrioritySelect/PrioritySelect'
import AssigneePicker from '../AssigneePicker/AssigneePicker'
import LabelPicker from '../LabelPicker/LabelPicker'
import './IssueDetailPanel.css'

interface IssueDetailPanelProps {
  issueId: string | null
  onClose: () => void
}

function IssueDetailContent({ issueId, onClose }: { issueId: string; onClose: () => void }) {
  const issue = useProjectStore((s) => s.issues[issueId])
  const project = useProjectStore((s) =>
    issue ? s.projects[issue.projectId] : undefined
  )
  const members = useProjectStore((s) => s.members)
  const updateIssue = useProjectStore((s) => s.updateIssue)
  const issues = useProjectStore((s) => s.issues)

  const [editingTitle, setEditingTitle] = useState(false)
  const [titleDraft, setTitleDraft] = useState(issue?.title ?? '')
  const [descriptionDraft, setDescriptionDraft] = useState(issue?.description ?? '')
  const titleInputRef = useRef<HTMLInputElement>(null)

  const handleTitleEdit = useCallback(() => {
    setEditingTitle(true)
    setTimeout(() => titleInputRef.current?.focus(), 0)
  }, [])

  const handleTitleSave = useCallback(() => {
    if (issue && titleDraft.trim()) {
      updateIssue(issue.id, { title: titleDraft.trim() })
    }
    setEditingTitle(false)
  }, [issue, titleDraft, updateIssue])

  const handleTitleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleTitleSave()
      } else if (e.key === 'Escape') {
        if (issue) setTitleDraft(issue.title)
        setEditingTitle(false)
      }
    },
    [handleTitleSave, issue]
  )

  const handleDescriptionBlur = useCallback(() => {
    if (issue && descriptionDraft !== issue.description) {
      updateIssue(issue.id, { description: descriptionDraft })
    }
  }, [issue, descriptionDraft, updateIssue])

  const handleStatusChange = useCallback(
    (status: IssueStatus) => {
      if (issue) updateIssue(issue.id, { status })
    },
    [issue, updateIssue]
  )

  const handlePriorityChange = useCallback(
    (priority: IssuePriority) => {
      if (issue) updateIssue(issue.id, { priority })
    },
    [issue, updateIssue]
  )

  const handleAssigneeChange = useCallback(
    (assigneeId: string | null) => {
      if (issue) updateIssue(issue.id, { assigneeId })
    },
    [issue, updateIssue]
  )

  const handleLabelsChange = useCallback(
    (labelIds: string[]) => {
      if (issue) updateIssue(issue.id, { labelIds })
    },
    [issue, updateIssue]
  )

  const handleDueDateChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (issue) {
        updateIssue(issue.id, { dueDate: e.target.value || null })
      }
    },
    [issue, updateIssue]
  )

  // Handle Escape to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  if (!issue || !project) return null

  // Get sub-issues
  const subIssues = Object.values(issues).filter((i) => i.parentIssueId === issue.id)

  return (
    <>
      <div className="issue-detail__header">
        <span className="issue-detail__identifier">
          {issue.identifier}
        </span>
        <button
          className="issue-detail__close"
          onClick={onClose}
          aria-label="Close issue detail"
        >
          <X size={20} />
        </button>
      </div>

      <div className="issue-detail__body">
        {/* Title */}
        <div className="issue-detail__title-section">
          {editingTitle ? (
            <input
              ref={titleInputRef}
              className="issue-detail__title-input"
              value={titleDraft}
              onChange={(e) => setTitleDraft(e.target.value)}
              onBlur={handleTitleSave}
              onKeyDown={handleTitleKeyDown}
            />
          ) : (
            <h2
              className="issue-detail__title"
              onClick={handleTitleEdit}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleTitleEdit()
              }}
            >
              {issue.title}
            </h2>
          )}
        </div>

        {/* Description */}
        <div className="issue-detail__description">
          <label
            className="issue-detail__section-label"
            htmlFor="issue-description"
          >
            Description
          </label>
          <textarea
            id="issue-description"
            className="issue-detail__description-input"
            value={descriptionDraft}
            onChange={(e) => setDescriptionDraft(e.target.value)}
            onBlur={handleDescriptionBlur}
            placeholder="Add a description..."
            rows={4}
          />
        </div>

        {/* Properties */}
        <div className="issue-detail__properties">
          <div className="issue-detail__property">
            <span className="issue-detail__property-label">Status</span>
            <StatusSelect
              value={issue.status}
              onChange={handleStatusChange}
            />
          </div>

          <div className="issue-detail__property">
            <span className="issue-detail__property-label">Priority</span>
            <PrioritySelect
              value={issue.priority}
              onChange={handlePriorityChange}
            />
          </div>

          <div className="issue-detail__property">
            <span className="issue-detail__property-label">Assignee</span>
            <AssigneePicker
              members={members}
              value={issue.assigneeId}
              onChange={handleAssigneeChange}
            />
          </div>

          <div className="issue-detail__property">
            <span className="issue-detail__property-label">Labels</span>
            <LabelPicker
              labels={project.labels}
              selectedIds={issue.labelIds}
              onChange={handleLabelsChange}
            />
          </div>

          <div className="issue-detail__property">
            <span className="issue-detail__property-label">Due date</span>
            <input
              type="date"
              className="issue-detail__date-input"
              value={issue.dueDate ?? ''}
              onChange={handleDueDateChange}
            />
          </div>
        </div>

        {/* Sub-issues */}
        {subIssues.length > 0 && (
          <div className="issue-detail__sub-issues">
            <span className="issue-detail__section-label">
              Sub-issues ({subIssues.length})
            </span>
            <ul className="issue-detail__sub-list">
              {subIssues.map((sub) => (
                <li key={sub.id} className="issue-detail__sub-item">
                  <span
                    className="issue-detail__sub-dot"
                    style={{
                      backgroundColor: STATUS_CONFIG[sub.status].color,
                    }}
                  />
                  <span className="issue-detail__sub-id">
                    {sub.identifier}
                  </span>
                  <span className="issue-detail__sub-title">
                    {sub.title}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Metadata */}
        <div className="issue-detail__metadata">
          <div className="issue-detail__meta-item">
            <span className="issue-detail__meta-label">Created</span>
            <span className="issue-detail__meta-value">
              {new Date(issue.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </div>
          <div className="issue-detail__meta-item">
            <span className="issue-detail__meta-label">Updated</span>
            <span className="issue-detail__meta-value">
              {new Date(issue.updatedAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </div>
        </div>
      </div>
    </>
  )
}

export default function IssueDetailPanel({
  issueId,
  onClose,
}: IssueDetailPanelProps) {
  const panelClass = `issue-detail ${issueId ? 'issue-detail--open' : ''}`

  return (
    <div className={panelClass} aria-hidden={!issueId}>
      {issueId && (
        <IssueDetailContent key={issueId} issueId={issueId} onClose={onClose} />
      )}
    </div>
  )
}
