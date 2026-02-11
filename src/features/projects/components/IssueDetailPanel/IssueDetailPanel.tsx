import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import { X, Plus, Trash2, Clock, Link as LinkIcon, AlertTriangle } from 'lucide-react'
import type { IssueStatus, IssuePriority, RelationType } from '../../types'
import {
  STATUS_CONFIG, PRIORITY_CONFIG, RELATION_LABELS,
  RelationType as RT, ActivityAction,
} from '../../types'
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

function formatMinutes(mins: number): string {
  if (mins === 0) return '0m'
  const hours = Math.floor(mins / 60)
  const remaining = mins % 60
  if (hours === 0) return `${remaining}m`
  if (remaining === 0) return `${hours}h`
  return `${hours}h ${remaining}m`
}

function formatRelativeTime(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  return new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function isOverdue(dueDate: string | null): boolean {
  if (!dueDate) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(dueDate + 'T00:00:00')
  return due < today
}

function IssueDetailContent({ issueId, onClose }: { issueId: string; onClose: () => void }) {
  const issue = useProjectStore((s) => s.issues[issueId])
  const project = useProjectStore((s) =>
    issue ? s.projects[issue.projectId] : undefined
  )
  const members = useProjectStore((s) => s.members)
  const allIssues = useProjectStore((s) => s.issues)
  const updateIssueWithActivity = useProjectStore((s) => s.updateIssueWithActivity)
  const updateIssue = useProjectStore((s) => s.updateIssue)

  // Activity
  const activities = useProjectStore((s) => s.activities)
  const issueActivities = useMemo(
    () => activities.filter((a) => a.issueId === issueId).sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    ),
    [activities, issueId]
  )

  // Relations
  const relations = useProjectStore((s) => s.relations)
  const addRelation = useProjectStore((s) => s.addRelation)
  const removeRelation = useProjectStore((s) => s.removeRelation)
  const issueRelations = useMemo(
    () => relations.filter((r) => r.issueId === issueId || r.targetIssueId === issueId),
    [relations, issueId]
  )

  // Sub-tasks
  const subTasks = useProjectStore((s) => s.subTasks)
  const addSubTask = useProjectStore((s) => s.addSubTask)
  const toggleSubTask = useProjectStore((s) => s.toggleSubTask)
  const removeSubTask = useProjectStore((s) => s.removeSubTask)
  const issueSubTasks = useMemo(
    () => subTasks.filter((st) => st.issueId === issueId),
    [subTasks, issueId]
  )

  // Time tracking
  const timeTrackingData = useProjectStore((s) => s.timeTracking)
  const setTimeEstimate = useProjectStore((s) => s.setTimeEstimate)
  const logTime = useProjectStore((s) => s.logTime)
  const timeInfo = timeTrackingData[issueId] ?? { estimateMinutes: null, loggedMinutes: 0 }

  const [editingTitle, setEditingTitle] = useState(false)
  const [titleDraft, setTitleDraft] = useState(issue?.title ?? '')
  const [descriptionDraft, setDescriptionDraft] = useState(issue?.description ?? '')
  const titleInputRef = useRef<HTMLInputElement>(null)

  // Sub-task form
  const [subTaskInput, setSubTaskInput] = useState('')
  const [showSubTaskInput, setShowSubTaskInput] = useState(false)

  // Relation form
  const [showRelationForm, setShowRelationForm] = useState(false)
  const [relationTypeValue, setRelationTypeValue] = useState<RelationType>(RT.Related)
  const [relationTargetId, setRelationTargetId] = useState('')

  // Time tracking form
  const [estimateInput, setEstimateInput] = useState('')
  const [logTimeInput, setLogTimeInput] = useState('')

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
      if (issue) updateIssueWithActivity(issue.id, { status })
    },
    [issue, updateIssueWithActivity]
  )

  const handlePriorityChange = useCallback(
    (priority: IssuePriority) => {
      if (issue) updateIssueWithActivity(issue.id, { priority })
    },
    [issue, updateIssueWithActivity]
  )

  const handleAssigneeChange = useCallback(
    (assigneeId: string | null) => {
      if (issue) updateIssueWithActivity(issue.id, { assigneeId })
    },
    [issue, updateIssueWithActivity]
  )

  const handleLabelsChange = useCallback(
    (labelIds: string[]) => {
      if (issue) updateIssueWithActivity(issue.id, { labelIds })
    },
    [issue, updateIssueWithActivity]
  )

  const handleDueDateChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (issue) {
        updateIssueWithActivity(issue.id, { dueDate: e.target.value || null })
      }
    },
    [issue, updateIssueWithActivity]
  )

  // Sub-task handlers
  const handleAddSubTask = useCallback(() => {
    if (subTaskInput.trim()) {
      addSubTask(issueId, subTaskInput.trim())
      setSubTaskInput('')
    }
  }, [subTaskInput, issueId, addSubTask])

  const handleSubTaskKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleAddSubTask()
      } else if (e.key === 'Escape') {
        setSubTaskInput('')
        setShowSubTaskInput(false)
      }
    },
    [handleAddSubTask]
  )

  // Relation handlers
  const handleAddRelation = useCallback(() => {
    if (relationTargetId && relationTargetId !== issueId) {
      addRelation({ issueId, type: relationTypeValue, targetIssueId: relationTargetId })
      setRelationTargetId('')
      setShowRelationForm(false)
    }
  }, [relationTargetId, issueId, relationTypeValue, addRelation])

  // Time tracking handlers
  const handleSetEstimate = useCallback(() => {
    const mins = parseInt(estimateInput, 10)
    if (!isNaN(mins) && mins >= 0) {
      setTimeEstimate(issueId, mins)
      setEstimateInput('')
    }
  }, [estimateInput, issueId, setTimeEstimate])

  const handleLogTime = useCallback(() => {
    const mins = parseInt(logTimeInput, 10)
    if (!isNaN(mins) && mins > 0) {
      logTime(issueId, mins)
      setLogTimeInput('')
    }
  }, [logTimeInput, issueId, logTime])

  // Handle Escape to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  if (!issue || !project) return null

  // Get sub-issues (legacy pattern)
  const subIssues = Object.values(allIssues).filter((i) => i.parentIssueId === issue.id)

  // Other project issues for relation picker (excluding self)
  const otherIssues = Object.values(allIssues).filter(
    (i) => i.projectId === issue.projectId && i.id !== issueId
  )

  const overdue = isOverdue(issue.dueDate)

  function getActivityDescription(activity: typeof issueActivities[number]): string {
    switch (activity.action) {
      case ActivityAction.Created:
        return 'created this issue'
      case ActivityAction.StatusChanged: {
        const oldLabel = STATUS_CONFIG[activity.oldValue as keyof typeof STATUS_CONFIG]?.label ?? activity.oldValue
        const newLabel = STATUS_CONFIG[activity.newValue as keyof typeof STATUS_CONFIG]?.label ?? activity.newValue
        return `changed status from ${oldLabel} to ${newLabel}`
      }
      case ActivityAction.PriorityChanged: {
        const oldLabel = PRIORITY_CONFIG[activity.oldValue as keyof typeof PRIORITY_CONFIG]?.label ?? activity.oldValue
        const newLabel = PRIORITY_CONFIG[activity.newValue as keyof typeof PRIORITY_CONFIG]?.label ?? activity.newValue
        return `changed priority from ${oldLabel} to ${newLabel}`
      }
      case ActivityAction.AssigneeChanged: {
        const oldName = activity.oldValue === 'unassigned' ? 'Unassigned' : members.find((m) => m.id === activity.oldValue)?.name ?? activity.oldValue
        const newName = activity.newValue === 'unassigned' ? 'Unassigned' : members.find((m) => m.id === activity.newValue)?.name ?? activity.newValue
        return `changed assignee from ${oldName} to ${newName}`
      }
      case ActivityAction.LabelsChanged:
        return 'updated labels'
      case ActivityAction.DueDateChanged:
        return `changed due date to ${activity.newValue === 'none' ? 'none' : activity.newValue}`
      case ActivityAction.SubTaskAdded:
        return `added sub-task "${activity.newValue}"`
      case ActivityAction.SubTaskToggled:
        return `marked sub-task "${activity.field}" as ${activity.newValue}`
      case ActivityAction.SubTaskRemoved:
        return `removed sub-task "${activity.oldValue}"`
      case ActivityAction.RelationAdded:
        return `added relation: ${activity.newValue}`
      case ActivityAction.RelationRemoved:
        return `removed relation: ${activity.oldValue}`
      case ActivityAction.TimeLogged:
        return `logged ${formatMinutes(parseInt(activity.newValue ?? '0', 10))}`
      case ActivityAction.EstimateChanged:
        return `set estimate to ${activity.newValue === 'none' ? 'none' : formatMinutes(parseInt(activity.newValue ?? '0', 10))}`
      default:
        return activity.action
    }
  }

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
            <div className="issue-detail__due-date-wrapper">
              <input
                type="date"
                className={`issue-detail__date-input${overdue ? ' issue-detail__date-input--overdue' : ''}`}
                value={issue.dueDate ?? ''}
                onChange={handleDueDateChange}
              />
              {overdue && (
                <span className="issue-detail__overdue-badge" title="Overdue">
                  <AlertTriangle size={14} />
                  Overdue
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Time Tracking */}
        <div className="issue-detail__section">
          <div className="issue-detail__section-header">
            <Clock size={14} />
            <span className="issue-detail__section-label">Time Tracking</span>
          </div>
          <div className="issue-detail__time-tracking">
            <div className="issue-detail__time-row">
              <span className="issue-detail__time-label">Estimated:</span>
              <span className="issue-detail__time-value">
                {timeInfo.estimateMinutes !== null ? formatMinutes(timeInfo.estimateMinutes) : 'Not set'}
              </span>
              <div className="issue-detail__time-input-group">
                <input
                  type="number"
                  className="issue-detail__time-input"
                  value={estimateInput}
                  onChange={(e) => setEstimateInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSetEstimate() }}
                  placeholder="min"
                  min="0"
                  aria-label="Estimate minutes"
                />
                <button
                  className="issue-detail__time-btn"
                  onClick={handleSetEstimate}
                  disabled={!estimateInput}
                >
                  Set
                </button>
              </div>
            </div>
            <div className="issue-detail__time-row">
              <span className="issue-detail__time-label">Logged:</span>
              <span className="issue-detail__time-value">
                {formatMinutes(timeInfo.loggedMinutes)}
              </span>
              <div className="issue-detail__time-input-group">
                <input
                  type="number"
                  className="issue-detail__time-input"
                  value={logTimeInput}
                  onChange={(e) => setLogTimeInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleLogTime() }}
                  placeholder="min"
                  min="1"
                  aria-label="Log time minutes"
                />
                <button
                  className="issue-detail__time-btn"
                  onClick={handleLogTime}
                  disabled={!logTimeInput}
                >
                  Log
                </button>
              </div>
            </div>
            {timeInfo.estimateMinutes !== null && timeInfo.estimateMinutes > 0 && (
              <div className="issue-detail__time-progress">
                <div className="issue-detail__time-progress-bar">
                  <div
                    className={`issue-detail__time-progress-fill${
                      timeInfo.loggedMinutes > timeInfo.estimateMinutes ? ' issue-detail__time-progress-fill--over' : ''
                    }`}
                    style={{ width: `${Math.min((timeInfo.loggedMinutes / timeInfo.estimateMinutes) * 100, 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sub-tasks (checklist) */}
        <div className="issue-detail__section">
          <div className="issue-detail__section-header">
            <span className="issue-detail__section-label">
              Sub-tasks ({issueSubTasks.filter((st) => st.completed).length}/{issueSubTasks.length})
            </span>
            <button
              className="issue-detail__add-btn"
              onClick={() => setShowSubTaskInput(true)}
              aria-label="Add sub-task"
            >
              <Plus size={14} />
            </button>
          </div>
          {issueSubTasks.length > 0 && (
            <ul className="issue-detail__subtask-list" role="list">
              {issueSubTasks.map((st) => (
                <li key={st.id} className="issue-detail__subtask-item">
                  <input
                    type="checkbox"
                    checked={st.completed}
                    onChange={() => toggleSubTask(st.id)}
                    className="issue-detail__subtask-checkbox"
                    aria-label={`Toggle ${st.title}`}
                  />
                  <span className={`issue-detail__subtask-title${st.completed ? ' issue-detail__subtask-title--done' : ''}`}>
                    {st.title}
                  </span>
                  <button
                    className="issue-detail__subtask-remove"
                    onClick={() => removeSubTask(st.id)}
                    aria-label={`Remove ${st.title}`}
                  >
                    <Trash2 size={12} />
                  </button>
                </li>
              ))}
            </ul>
          )}
          {showSubTaskInput && (
            <div className="issue-detail__subtask-input-row">
              <input
                className="issue-detail__subtask-input"
                value={subTaskInput}
                onChange={(e) => setSubTaskInput(e.target.value)}
                onKeyDown={handleSubTaskKeyDown}
                placeholder="Sub-task title..."
                autoFocus
              />
              <button
                className="issue-detail__time-btn"
                onClick={handleAddSubTask}
                disabled={!subTaskInput.trim()}
              >
                Add
              </button>
            </div>
          )}
        </div>

        {/* Relationships */}
        <div className="issue-detail__section">
          <div className="issue-detail__section-header">
            <LinkIcon size={14} />
            <span className="issue-detail__section-label">Relationships</span>
            <button
              className="issue-detail__add-btn"
              onClick={() => setShowRelationForm(!showRelationForm)}
              aria-label="Add relation"
            >
              <Plus size={14} />
            </button>
          </div>
          {issueRelations.length > 0 && (
            <div className="issue-detail__relations-list">
              {issueRelations.map((rel) => {
                const isSource = rel.issueId === issueId
                const targetId = isSource ? rel.targetIssueId : rel.issueId
                const target = allIssues[targetId]
                if (!target) return null
                const label = isSource ? RELATION_LABELS[rel.type] : RELATION_LABELS[rel.type]
                return (
                  <div key={rel.id} className="issue-detail__relation-chip">
                    <span className="issue-detail__relation-type">{label}</span>
                    <span className="issue-detail__relation-target">{target.identifier}: {target.title}</span>
                    <button
                      className="issue-detail__relation-remove"
                      onClick={() => removeRelation(rel.id)}
                      aria-label={`Remove relation to ${target.identifier}`}
                    >
                      <X size={12} />
                    </button>
                  </div>
                )
              })}
            </div>
          )}
          {showRelationForm && (
            <div className="issue-detail__relation-form">
              <select
                className="issue-detail__relation-select"
                value={relationTypeValue}
                onChange={(e) => setRelationTypeValue(e.target.value as RelationType)}
                aria-label="Relation type"
              >
                {Object.entries(RELATION_LABELS).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
              <select
                className="issue-detail__relation-select"
                value={relationTargetId}
                onChange={(e) => setRelationTargetId(e.target.value)}
                aria-label="Target issue"
              >
                <option value="">Select issue...</option>
                {otherIssues.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.identifier}: {i.title}
                  </option>
                ))}
              </select>
              <button
                className="issue-detail__time-btn"
                onClick={handleAddRelation}
                disabled={!relationTargetId}
              >
                Add
              </button>
            </div>
          )}
        </div>

        {/* Sub-issues (legacy) */}
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

        {/* Activity Log */}
        <div className="issue-detail__section">
          <span className="issue-detail__section-label">
            Activity ({issueActivities.length})
          </span>
          <div className="issue-detail__activity-list" role="log" aria-label="Issue activity log">
            {issueActivities.length === 0 ? (
              <p className="issue-detail__activity-empty">No activity yet</p>
            ) : (
              issueActivities.slice(0, 20).map((activity) => (
                <div key={activity.id} className="issue-detail__activity-item">
                  <span className="issue-detail__activity-text">
                    {getActivityDescription(activity)}
                  </span>
                  <span className="issue-detail__activity-time">
                    {formatRelativeTime(activity.timestamp)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

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
