import type { ReactNode } from 'react'
import './EmptyState.css'

interface EmptyStateAction {
  label: string
  onClick: () => void
}

interface EmptyStateProps {
  icon: ReactNode
  title: string
  description: string
  action?: EmptyStateAction
  secondaryAction?: EmptyStateAction
}

export default function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
}: EmptyStateProps) {
  return (
    <div className="empty-state">
      <div className="empty-state__icon-wrapper">
        {icon}
      </div>
      <h2 className="empty-state__title">{title}</h2>
      <p className="empty-state__description">{description}</p>
      {(action || secondaryAction) && (
        <div className="empty-state__actions">
          {action && (
            <button
              type="button"
              className="btn-primary empty-state__action"
              onClick={action.onClick}
            >
              {action.label}
            </button>
          )}
          {secondaryAction && (
            <button
              type="button"
              className="empty-state__secondary-action"
              onClick={secondaryAction.onClick}
            >
              {secondaryAction.label}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
