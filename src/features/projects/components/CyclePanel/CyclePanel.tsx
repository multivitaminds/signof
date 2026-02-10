import { useState, useCallback, useMemo } from 'react'
import { useProjectStore } from '../../stores/useProjectStore'
import type { Cycle } from '../../types'
import { IssueStatus } from '../../types'
import './CyclePanel.css'

interface CyclePanelProps {
  projectId: string
  activeCycleId?: string | null
  onCycleSelect?: (cycleId: string | null) => void
}

function formatDateRange(startDate: string, endDate: string): string {
  const start = new Date(startDate + 'T00:00:00')
  const end = new Date(endDate + 'T00:00:00')
  const startMonth = start.toLocaleDateString('en-US', { month: 'short' })
  const endMonth = end.toLocaleDateString('en-US', { month: 'short' })
  const startDay = start.getDate()
  const endDay = end.getDate()

  if (startMonth === endMonth) {
    return `${startMonth} ${startDay} \u2013 ${endDay}`
  }
  return `${startMonth} ${startDay} \u2013 ${endMonth} ${endDay}`
}

function statusLabel(status: Cycle['status']): string {
  switch (status) {
    case 'upcoming': return 'Upcoming'
    case 'active': return 'Active'
    case 'completed': return 'Completed'
  }
}

function statusModifier(status: Cycle['status']): string {
  switch (status) {
    case 'upcoming': return 'cycle-panel__status--upcoming'
    case 'active': return 'cycle-panel__status--active'
    case 'completed': return 'cycle-panel__status--completed'
  }
}

function CyclePanel({ projectId, activeCycleId, onCycleSelect }: CyclePanelProps) {
  const cycles = useProjectStore((s) => s.cycles)
  const issues = useProjectStore((s) => s.issues)
  const createCycle = useProjectStore((s) => s.createCycle)

  const [showForm, setShowForm] = useState(false)
  const [formName, setFormName] = useState('')
  const [formStartDate, setFormStartDate] = useState('')
  const [formEndDate, setFormEndDate] = useState('')

  const projectCycles = useMemo(
    () => Object.values(cycles).filter((c) => c.projectId === projectId),
    [cycles, projectId],
  )

  const issueCountsForCycle = useCallback(
    (cycleId: string) => {
      const cycleIssues = Object.values(issues).filter((i) => i.cycleId === cycleId)
      const done = cycleIssues.filter(
        (i) => i.status === IssueStatus.Done || i.status === IssueStatus.Cancelled,
      ).length
      return { total: cycleIssues.length, done }
    },
    [issues],
  )

  const handleCycleClick = useCallback(
    (cycleId: string) => {
      if (!onCycleSelect) return
      onCycleSelect(activeCycleId === cycleId ? null : cycleId)
    },
    [onCycleSelect, activeCycleId],
  )

  const handleCreateCycle = useCallback(() => {
    if (!formName.trim() || !formStartDate || !formEndDate) return
    createCycle({
      projectId,
      name: formName.trim(),
      startDate: formStartDate,
      endDate: formEndDate,
    })
    setFormName('')
    setFormStartDate('')
    setFormEndDate('')
    setShowForm(false)
  }, [formName, formStartDate, formEndDate, createCycle, projectId])

  const handleCancelForm = useCallback(() => {
    setFormName('')
    setFormStartDate('')
    setFormEndDate('')
    setShowForm(false)
  }, [])

  return (
    <div className="cycle-panel">
      <div className="cycle-panel__header">
        <h3 className="cycle-panel__title">Cycles</h3>
      </div>

      {projectCycles.length === 0 && !showForm ? (
        <p className="cycle-panel__empty">No cycles yet</p>
      ) : (
        <ul className="cycle-panel__list" role="list">
          {projectCycles.map((cycle) => {
            const { total, done } = issueCountsForCycle(cycle.id)
            const isActive = activeCycleId === cycle.id
            const progressPct = total > 0 ? (done / total) * 100 : 0

            return (
              <li
                key={cycle.id}
                className={`cycle-panel__item${isActive ? ' cycle-panel__item--active' : ''}`}
                role="button"
                tabIndex={0}
                onClick={() => handleCycleClick(cycle.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    handleCycleClick(cycle.id)
                  }
                }}
              >
                <div className="cycle-panel__item-header">
                  <span className="cycle-panel__name">{cycle.name}</span>
                  <span className={`cycle-panel__status ${statusModifier(cycle.status)}`}>
                    {statusLabel(cycle.status)}
                  </span>
                </div>
                <span className="cycle-panel__dates">
                  {formatDateRange(cycle.startDate, cycle.endDate)}
                </span>
                <div className="cycle-panel__progress">
                  <div className="cycle-panel__progress-bar">
                    <div
                      className="cycle-panel__progress-fill"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                  <span className="cycle-panel__progress-text">{done}/{total} done</span>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      {showForm ? (
        <div className="cycle-panel__form" role="form" aria-label="Create cycle">
          <div className="cycle-panel__form-field">
            <label htmlFor="cycle-name">Name</label>
            <input
              id="cycle-name"
              type="text"
              placeholder="Sprint name"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
            />
          </div>
          <div className="cycle-panel__form-field">
            <label htmlFor="cycle-start">Start date</label>
            <input
              id="cycle-start"
              type="date"
              value={formStartDate}
              onChange={(e) => setFormStartDate(e.target.value)}
            />
          </div>
          <div className="cycle-panel__form-field">
            <label htmlFor="cycle-end">End date</label>
            <input
              id="cycle-end"
              type="date"
              value={formEndDate}
              onChange={(e) => setFormEndDate(e.target.value)}
            />
          </div>
          <div className="cycle-panel__form-actions">
            <button
              className="btn-primary cycle-panel__form-btn"
              onClick={handleCreateCycle}
              disabled={!formName.trim() || !formStartDate || !formEndDate}
            >
              Create
            </button>
            <button className="btn-ghost cycle-panel__form-btn" onClick={handleCancelForm}>
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          className="btn-ghost cycle-panel__new-btn"
          onClick={() => setShowForm(true)}
        >
          + New Cycle
        </button>
      )}
    </div>
  )
}

export default CyclePanel
