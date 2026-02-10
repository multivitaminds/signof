import { useCallback } from 'react'
import type { Template } from '../../../../types'
import './TemplateCard.css'

interface TemplateCardProps {
  template: Template
  onClick: () => void
  onDuplicate?: () => void
  onDelete?: () => void
}

export default function TemplateCard({
  template,
  onClick,
  onDuplicate,
  onDelete,
}: TemplateCardProps) {
  const handleDuplicate = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      onDuplicate?.()
    },
    [onDuplicate]
  )

  const handleDelete = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      onDelete?.()
    },
    [onDelete]
  )

  const dateStr = new Date(template.updatedAt).toLocaleDateString()

  return (
    <div
      className="template-card"
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={`Template: ${template.name}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick()
        }
      }}
    >
      <h3 className="template-card__name">{template.name}</h3>
      {template.description && (
        <p className="template-card__description">{template.description}</p>
      )}
      <div className="template-card__meta">
        <span>{template.fields.length} field{template.fields.length !== 1 ? 's' : ''}</span>
        <span>{template.recipientRoles.length} role{template.recipientRoles.length !== 1 ? 's' : ''}</span>
        <span>{dateStr}</span>
      </div>
      {(onDuplicate || onDelete) && (
        <div className="template-card__actions">
          {onDuplicate && (
            <button
              className="btn-ghost template-card__action"
              onClick={handleDuplicate}
              aria-label={`Duplicate ${template.name}`}
            >
              Duplicate
            </button>
          )}
          {onDelete && (
            <button
              className="btn-ghost template-card__action template-card__action--danger"
              onClick={handleDelete}
              aria-label={`Delete ${template.name}`}
            >
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  )
}
