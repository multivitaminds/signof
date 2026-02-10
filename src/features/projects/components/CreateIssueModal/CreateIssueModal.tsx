import { useState, useCallback, useRef } from 'react'
import type { Issue, IssueStatus, IssuePriority } from '../../types'
import { IssueStatus as IS, IssuePriority as IP } from '../../types'
import { useProjectStore } from '../../stores/useProjectStore'
import StatusSelect from '../StatusSelect/StatusSelect'
import PrioritySelect from '../PrioritySelect/PrioritySelect'
import AssigneePicker from '../AssigneePicker/AssigneePicker'
import LabelPicker from '../LabelPicker/LabelPicker'
import './CreateIssueModal.css'

interface CreateIssueModalProps {
  projectId: string
  open: boolean
  onClose: () => void
  onCreated?: (issue: Issue) => void
}

function CreateIssueForm({
  projectId,
  onClose,
  onCreated,
}: Omit<CreateIssueModalProps, 'open'>) {
  const createIssue = useProjectStore((s) => s.createIssue)
  const project = useProjectStore((s) => s.projects[projectId])
  const members = useProjectStore((s) => s.members)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<IssueStatus>(IS.Todo)
  const [priority, setPriority] = useState<IssuePriority>(IP.None)
  const [assigneeId, setAssigneeId] = useState<string | null>(null)
  const [labelIds, setLabelIds] = useState<string[]>([])

  const titleRef = useRef<HTMLInputElement>(null)

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      if (!title.trim()) return

      const issue = createIssue({
        projectId,
        title: title.trim(),
        description: description.trim(),
        status,
        priority,
        assigneeId,
        labelIds,
      })

      onCreated?.(issue)
      onClose()
    },
    [title, description, status, priority, assigneeId, labelIds, projectId, createIssue, onCreated, onClose]
  )

  if (!project) return null

  return (
    <form onSubmit={handleSubmit} className="create-issue__form">
      <div className="create-issue__field">
        <label className="create-issue__label" htmlFor="issue-title">
          Title
        </label>
        <input
          ref={titleRef}
          id="issue-title"
          className="create-issue__input"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Issue title"
          required
          autoFocus
        />
      </div>

      <div className="create-issue__field">
        <label className="create-issue__label" htmlFor="issue-description">
          Description
        </label>
        <textarea
          id="issue-description"
          className="create-issue__textarea"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add a description..."
          rows={3}
        />
      </div>

      <div className="create-issue__properties">
        <div className="create-issue__property">
          <span className="create-issue__property-label">Status</span>
          <StatusSelect value={status} onChange={setStatus} />
        </div>

        <div className="create-issue__property">
          <span className="create-issue__property-label">Priority</span>
          <PrioritySelect value={priority} onChange={setPriority} />
        </div>

        <div className="create-issue__property">
          <span className="create-issue__property-label">Assignee</span>
          <AssigneePicker
            members={members}
            value={assigneeId}
            onChange={setAssigneeId}
          />
        </div>

        <div className="create-issue__property">
          <span className="create-issue__property-label">Labels</span>
          <LabelPicker
            labels={project.labels}
            selectedIds={labelIds}
            onChange={setLabelIds}
          />
        </div>
      </div>

      <div className="create-issue__actions">
        <button
          type="button"
          className="btn-secondary"
          onClick={onClose}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn-primary"
          disabled={!title.trim()}
        >
          Create Issue
        </button>
      </div>
    </form>
  )
}

// Counter to force remount of form when modal opens
let openCount = 0

export default function CreateIssueModal({
  projectId,
  open,
  onClose,
  onCreated,
}: CreateIssueModalProps) {
  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) onClose()
    },
    [onClose]
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    },
    [onClose]
  )

  if (!open) return null

  // Increment to get a fresh key each time modal opens, remounting the form
  openCount++

  return (
    <div
      className="modal-overlay"
      onClick={handleOverlayClick}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-label="Create issue"
    >
      <div className="modal-content create-issue">
        <div className="modal-header">
          <h2>New Issue</h2>
          <button
            className="modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        <CreateIssueForm
          key={openCount}
          projectId={projectId}
          onClose={onClose}
          onCreated={onCreated}
        />
      </div>
    </div>
  )
}
