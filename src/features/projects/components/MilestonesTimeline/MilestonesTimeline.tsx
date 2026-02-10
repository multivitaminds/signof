import { useState, useCallback, useMemo } from 'react'
import { Plus, ChevronDown, ChevronRight, Trash2, Flag, Check, X } from 'lucide-react'
import { useProjectStore } from '../../stores/useProjectStore'
import type { Milestone } from '../../types'
import './MilestonesTimeline.css'

interface MilestonesTimelineProps {
  projectId: string
}

export default function MilestonesTimeline({ projectId }: MilestonesTimelineProps) {
  const milestones = useProjectStore((s) => s.milestones)
  const issues = useProjectStore((s) => s.issues)
  const createMilestone = useProjectStore((s) => s.createMilestone)
  const updateMilestone = useProjectStore((s) => s.updateMilestone)
  const deleteMilestone = useProjectStore((s) => s.deleteMilestone)

  const [collapsed, setCollapsed] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const [title, setTitle] = useState('')
  const [dueDate, setDueDate] = useState('')

  const projectMilestones = useMemo(
    () =>
      milestones
        .filter((m) => m.projectId === projectId)
        .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()),
    [milestones, projectId]
  )

  const getMilestoneState = useCallback(
    (milestone: Milestone): 'completed' | 'overdue' | 'upcoming' => {
      if (milestone.completed) return 'completed'
      const now = new Date()
      const due = new Date(milestone.dueDate)
      if (due < now) return 'overdue'
      return 'upcoming'
    },
    []
  )

  const handleCreate = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      if (!title.trim() || !dueDate) return
      createMilestone({
        projectId,
        title: title.trim(),
        dueDate,
      })
      setTitle('')
      setDueDate('')
      setShowForm(false)
    },
    [projectId, title, dueDate, createMilestone]
  )

  const handleToggleComplete = useCallback(
    (milestone: Milestone) => {
      updateMilestone(milestone.id, { completed: !milestone.completed })
    },
    [updateMilestone]
  )

  const handleDelete = useCallback(
    (milestoneId: string) => {
      deleteMilestone(milestoneId)
    },
    [deleteMilestone]
  )

  return (
    <div className="milestones-timeline">
      <button
        className="milestones-timeline__header"
        onClick={() => setCollapsed((c) => !c)}
        aria-expanded={!collapsed}
        aria-label="Toggle milestones"
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
        <Flag size={14} />
        <span className="milestones-timeline__title">Milestones</span>
        <span className="milestones-timeline__count">{projectMilestones.length}</span>
      </button>

      {!collapsed && (
        <div className="milestones-timeline__body">
          {projectMilestones.length === 0 && !showForm && (
            <p className="milestones-timeline__empty">No milestones set. Add key dates for your project.</p>
          )}

          {projectMilestones.length > 0 && (
            <div className="milestones-timeline__track">
              {projectMilestones.map((milestone, idx) => {
                const state = getMilestoneState(milestone)
                const isExpanded = expandedId === milestone.id
                const isLast = idx === projectMilestones.length - 1

                return (
                  <div
                    key={milestone.id}
                    className={`milestones-timeline__item milestones-timeline__item--${state}`}
                  >
                    <div className="milestones-timeline__marker-col">
                      <button
                        className={`milestones-timeline__marker milestones-timeline__marker--${state}`}
                        onClick={() => handleToggleComplete(milestone)}
                        aria-label={milestone.completed ? 'Mark incomplete' : 'Mark complete'}
                      >
                        {state === 'completed' && <Check size={10} />}
                      </button>
                      {!isLast && <div className="milestones-timeline__line" />}
                    </div>

                    <div className="milestones-timeline__content">
                      <div className="milestones-timeline__row">
                        <button
                          className="milestones-timeline__expand"
                          onClick={() => setExpandedId((prev) => (prev === milestone.id ? null : milestone.id))}
                          aria-label={isExpanded ? 'Collapse' : 'Expand'}
                        >
                          {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                        </button>
                        <span className="milestones-timeline__name">{milestone.title}</span>
                        <span className="milestones-timeline__date">
                          {new Date(milestone.dueDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                        <button
                          className="milestones-timeline__delete"
                          onClick={() => handleDelete(milestone.id)}
                          aria-label="Delete milestone"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>

                      {isExpanded && (
                        <div className="milestones-timeline__detail">
                          <span className="milestones-timeline__linked-count">
                            {milestone.issueIds.length} linked issue{milestone.issueIds.length !== 1 ? 's' : ''}
                          </span>
                          {milestone.issueIds.map((issueId) => {
                            const issue = issues[issueId]
                            if (!issue) return null
                            return (
                              <span key={issueId} className="milestones-timeline__linked-issue">
                                <span className="milestones-timeline__linked-id">{issue.identifier}</span>
                                {issue.title}
                              </span>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {showForm ? (
            <form className="milestones-timeline__form" onSubmit={handleCreate}>
              <input
                className="milestones-timeline__input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Milestone title"
                required
                autoFocus
              />
              <input
                className="milestones-timeline__input"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
                aria-label="Due date"
              />
              <div className="milestones-timeline__form-actions">
                <button type="submit" className="btn-primary milestones-timeline__small-btn">
                  Create
                </button>
                <button
                  type="button"
                  className="btn-secondary milestones-timeline__small-btn"
                  onClick={() => setShowForm(false)}
                >
                  <X size={12} />
                </button>
              </div>
            </form>
          ) : (
            <button
              className="milestones-timeline__add-btn"
              onClick={() => setShowForm(true)}
              aria-label="Add milestone"
            >
              <Plus size={14} />
              <span>Add Milestone</span>
            </button>
          )}
        </div>
      )}
    </div>
  )
}
