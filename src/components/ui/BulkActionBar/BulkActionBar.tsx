import type { ReactNode } from 'react'
import { X } from 'lucide-react'
import './BulkActionBar.css'

export interface BulkActionItem {
  label: string
  icon?: ReactNode
  onClick: () => void
  variant?: 'default' | 'danger'
}

interface BulkActionBarProps {
  selectedCount: number
  onDeselectAll: () => void
  actions: BulkActionItem[]
}

function BulkActionBar({ selectedCount, onDeselectAll, actions }: BulkActionBarProps) {
  if (selectedCount === 0) return null

  return (
    <div
      className="bulk-action-bar"
      role="toolbar"
      aria-label="Bulk actions"
    >
      <div className="bulk-action-bar__inner">
        <span className="bulk-action-bar__count">
          {selectedCount} item{selectedCount !== 1 ? 's' : ''} selected
        </span>

        <div className="bulk-action-bar__divider" />

        <div className="bulk-action-bar__actions">
          {actions.map(action => (
            <button
              key={action.label}
              type="button"
              className={`bulk-action-bar__btn${action.variant === 'danger' ? ' bulk-action-bar__btn--danger' : ''}`}
              onClick={action.onClick}
              aria-label={action.label}
            >
              {action.icon && <span className="bulk-action-bar__btn-icon">{action.icon}</span>}
              <span>{action.label}</span>
            </button>
          ))}
        </div>

        <button
          type="button"
          className="bulk-action-bar__deselect"
          onClick={onDeselectAll}
          aria-label="Deselect all"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  )
}

export default BulkActionBar
