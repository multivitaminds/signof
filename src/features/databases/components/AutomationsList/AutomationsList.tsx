import { useCallback } from 'react'
import { Zap, Pencil, Trash2, Plus } from 'lucide-react'
import type { AutomationRule } from '../../types/automation'
import { TRIGGER_LABELS, ACTION_LABELS } from '../../types/automation'
import './AutomationsList.css'

interface AutomationsListProps {
  automations: AutomationRule[]
  onToggle: (id: string) => void
  onEdit: (rule: AutomationRule) => void
  onDelete: (id: string) => void
  onNew: () => void
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return 'Never'
  const d = new Date(dateStr)
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function AutomationsList({
  automations,
  onToggle,
  onEdit,
  onDelete,
  onNew,
}: AutomationsListProps) {
  const handleToggle = useCallback(
    (id: string) => {
      onToggle(id)
    },
    [onToggle]
  )

  const handleEdit = useCallback(
    (rule: AutomationRule) => {
      onEdit(rule)
    },
    [onEdit]
  )

  const handleDelete = useCallback(
    (id: string) => {
      onDelete(id)
    },
    [onDelete]
  )

  if (automations.length === 0) {
    return (
      <div className="automations-list">
        <div className="automations-list__empty">
          <Zap size={32} className="automations-list__empty-icon" />
          <h3 className="automations-list__empty-title">No automations yet</h3>
          <p className="automations-list__empty-desc">
            Automate repetitive tasks by creating rules that trigger actions.
          </p>
          <button className="btn-primary" onClick={onNew}>
            <Plus size={14} />
            New Automation
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="automations-list">
      <div className="automations-list__header">
        <h3 className="automations-list__title">
          Automations ({automations.length})
        </h3>
        <button className="btn-primary" onClick={onNew}>
          <Plus size={14} />
          New Automation
        </button>
      </div>

      <div className="automations-list__items">
        {automations.map((rule) => (
          <div
            key={rule.id}
            className={`automations-list__item ${!rule.enabled ? 'automations-list__item--disabled' : ''}`}
          >
            <div className="automations-list__item-toggle">
              <label
                className="automations-list__toggle"
                aria-label={`${rule.enabled ? 'Disable' : 'Enable'} ${rule.name}`}
              >
                <input
                  type="checkbox"
                  checked={rule.enabled}
                  onChange={() => handleToggle(rule.id)}
                  className="automations-list__toggle-input"
                />
                <span className="automations-list__toggle-slider" />
              </label>
            </div>

            <div className="automations-list__item-content">
              <div className="automations-list__item-header">
                <span className="automations-list__item-name">{rule.name}</span>
                {rule.description && (
                  <span className="automations-list__item-desc">{rule.description}</span>
                )}
              </div>

              <div className="automations-list__item-meta">
                <span className="automations-list__item-badge automations-list__item-badge--trigger">
                  {TRIGGER_LABELS[rule.trigger]}
                </span>
                <span className="automations-list__item-arrow">&rarr;</span>
                <span className="automations-list__item-badge automations-list__item-badge--action">
                  {ACTION_LABELS[rule.action]}
                </span>
                <span className="automations-list__item-stat">
                  Last run: {formatDate(rule.lastRunAt)}
                </span>
                <span className="automations-list__item-stat">
                  Runs: {rule.runCount}
                </span>
              </div>
            </div>

            <div className="automations-list__item-actions">
              <button
                className="btn-ghost"
                onClick={() => handleEdit(rule)}
                aria-label={`Edit ${rule.name}`}
                title="Edit"
              >
                <Pencil size={14} />
              </button>
              <button
                className="btn-ghost automations-list__delete-btn"
                onClick={() => handleDelete(rule.id)}
                aria-label={`Delete ${rule.name}`}
                title="Delete"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
