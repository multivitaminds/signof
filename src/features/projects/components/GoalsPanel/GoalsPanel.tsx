import { useState, useCallback, useMemo } from 'react'
import { Plus, ChevronDown, ChevronRight, Trash2, Edit2, X, Check, Target } from 'lucide-react'
import { useProjectStore } from '../../stores/useProjectStore'
import { IssueStatus, GOAL_STATUS_CONFIG, GoalStatus } from '../../types'
import type { Goal, GoalStatus as GoalStatusType } from '../../types'
import './GoalsPanel.css'

interface GoalsPanelProps {
  projectId: string
}

export default function GoalsPanel({ projectId }: GoalsPanelProps) {
  const goals = useProjectStore((s) => s.goals)
  const issues = useProjectStore((s) => s.issues)
  const createGoal = useProjectStore((s) => s.createGoal)
  const updateGoal = useProjectStore((s) => s.updateGoal)
  const deleteGoal = useProjectStore((s) => s.deleteGoal)

  const [collapsed, setCollapsed] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [expandedGoalId, setExpandedGoalId] = useState<string | null>(null)

  // Form fields
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [targetDate, setTargetDate] = useState('')
  const [editTitle, setEditTitle] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editTargetDate, setEditTargetDate] = useState('')
  const [editStatus, setEditStatus] = useState<GoalStatusType>(GoalStatus.NotStarted)

  const projectGoals = useMemo(
    () => goals.filter((g) => g.projectId === projectId),
    [goals, projectId]
  )

  const getGoalProgress = useCallback(
    (goal: Goal) => {
      if (goal.issueIds.length === 0) return 0
      const doneCount = goal.issueIds.filter((id) => {
        const issue = issues[id]
        return issue && issue.status === IssueStatus.Done
      }).length
      return Math.round((doneCount / goal.issueIds.length) * 100)
    },
    [issues]
  )

  const handleCreate = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      if (!title.trim()) return
      createGoal({
        projectId,
        title: title.trim(),
        description: description.trim(),
        targetDate: targetDate || null,
      })
      setTitle('')
      setDescription('')
      setTargetDate('')
      setShowForm(false)
    },
    [projectId, title, description, targetDate, createGoal]
  )

  const handleStartEdit = useCallback((goal: Goal) => {
    setEditingId(goal.id)
    setEditTitle(goal.title)
    setEditDescription(goal.description)
    setEditTargetDate(goal.targetDate ?? '')
    setEditStatus(goal.status)
  }, [])

  const handleSaveEdit = useCallback(() => {
    if (!editingId || !editTitle.trim()) return
    updateGoal(editingId, {
      title: editTitle.trim(),
      description: editDescription.trim(),
      targetDate: editTargetDate || null,
      status: editStatus,
    })
    setEditingId(null)
  }, [editingId, editTitle, editDescription, editTargetDate, editStatus, updateGoal])

  const handleDelete = useCallback(
    (goalId: string) => {
      deleteGoal(goalId)
    },
    [deleteGoal]
  )

  const toggleGoalExpand = useCallback((goalId: string) => {
    setExpandedGoalId((prev) => (prev === goalId ? null : goalId))
  }, [])

  return (
    <div className="goals-panel">
      <button
        className="goals-panel__header"
        onClick={() => setCollapsed((c) => !c)}
        aria-expanded={!collapsed}
        aria-label="Toggle goals"
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
        <Target size={14} />
        <span className="goals-panel__title">Goals</span>
        <span className="goals-panel__count">{projectGoals.length}</span>
      </button>

      {!collapsed && (
        <div className="goals-panel__body">
          {projectGoals.length === 0 && !showForm && (
            <p className="goals-panel__empty">No goals yet. Create one to track progress.</p>
          )}

          {projectGoals.map((goal) => {
            const progress = getGoalProgress(goal)
            const statusConfig = GOAL_STATUS_CONFIG[goal.status]
            const isEditing = editingId === goal.id
            const isExpanded = expandedGoalId === goal.id

            if (isEditing) {
              return (
                <div key={goal.id} className="goals-panel__edit-form">
                  <input
                    className="goals-panel__input"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="Goal title"
                    autoFocus
                  />
                  <textarea
                    className="goals-panel__textarea"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder="Description"
                    rows={2}
                  />
                  <input
                    className="goals-panel__input"
                    type="date"
                    value={editTargetDate}
                    onChange={(e) => setEditTargetDate(e.target.value)}
                  />
                  <select
                    className="goals-panel__select"
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as GoalStatusType)}
                    aria-label="Goal status"
                  >
                    {Object.entries(GOAL_STATUS_CONFIG).map(([key, cfg]) => (
                      <option key={key} value={key}>{cfg.label}</option>
                    ))}
                  </select>
                  <div className="goals-panel__edit-actions">
                    <button className="goals-panel__icon-btn" onClick={handleSaveEdit} aria-label="Save">
                      <Check size={14} />
                    </button>
                    <button className="goals-panel__icon-btn" onClick={() => setEditingId(null)} aria-label="Cancel edit">
                      <X size={14} />
                    </button>
                  </div>
                </div>
              )
            }

            return (
              <div key={goal.id} className="goals-panel__goal">
                <div className="goals-panel__goal-header">
                  <button
                    className="goals-panel__goal-expand"
                    onClick={() => toggleGoalExpand(goal.id)}
                    aria-label={isExpanded ? 'Collapse goal' : 'Expand goal'}
                  >
                    {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                  </button>
                  <span
                    className="goals-panel__goal-status-dot"
                    style={{ backgroundColor: statusConfig.color }}
                    title={statusConfig.label}
                  />
                  <span className="goals-panel__goal-title">{goal.title}</span>
                  <div className="goals-panel__goal-actions">
                    <button
                      className="goals-panel__icon-btn"
                      onClick={() => handleStartEdit(goal)}
                      aria-label="Edit goal"
                    >
                      <Edit2 size={12} />
                    </button>
                    <button
                      className="goals-panel__icon-btn goals-panel__icon-btn--danger"
                      onClick={() => handleDelete(goal.id)}
                      aria-label="Delete goal"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>

                <div className="goals-panel__progress-bar">
                  <div
                    className="goals-panel__progress-fill"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="goals-panel__progress-text">{progress}% complete</span>

                {isExpanded && (
                  <div className="goals-panel__goal-detail">
                    {goal.description && (
                      <p className="goals-panel__goal-desc">{goal.description}</p>
                    )}
                    {goal.targetDate && (
                      <span className="goals-panel__goal-date">
                        Target: {new Date(goal.targetDate).toLocaleDateString()}
                      </span>
                    )}
                    <div className="goals-panel__linked-issues">
                      <span className="goals-panel__linked-label">
                        {goal.issueIds.length} linked issue{goal.issueIds.length !== 1 ? 's' : ''}
                      </span>
                      {goal.issueIds.map((issueId) => {
                        const issue = issues[issueId]
                        if (!issue) return null
                        return (
                          <span key={issueId} className="goals-panel__linked-issue">
                            <span className="goals-panel__linked-issue-id">{issue.identifier}</span>
                            {issue.title}
                          </span>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )
          })}

          {showForm ? (
            <form className="goals-panel__create-form" onSubmit={handleCreate}>
              <input
                className="goals-panel__input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Goal title"
                required
                autoFocus
              />
              <textarea
                className="goals-panel__textarea"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description (optional)"
                rows={2}
              />
              <input
                className="goals-panel__input"
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                aria-label="Target date"
              />
              <div className="goals-panel__form-actions">
                <button type="submit" className="btn-primary goals-panel__small-btn">
                  Create
                </button>
                <button type="button" className="btn-secondary goals-panel__small-btn" onClick={() => setShowForm(false)}>
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <button
              className="goals-panel__add-btn"
              onClick={() => setShowForm(true)}
              aria-label="Add goal"
            >
              <Plus size={14} />
              <span>Add Goal</span>
            </button>
          )}
        </div>
      )}
    </div>
  )
}
