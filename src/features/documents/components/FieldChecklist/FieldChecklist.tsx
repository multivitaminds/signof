import React, { useCallback } from 'react'
import {
  Check,
  PenTool,
  Type,
  Calendar,
  CheckCircle,
  ListChecks,
  FileText,
} from 'lucide-react'
import type { DocumentField } from '../../../../types'
import { FieldType } from '../../../../types'
import './FieldChecklist.css'

// ─── Types ─────────────────────────────────────────────────────────

interface FieldChecklistProps {
  fields: DocumentField[]
  currentFieldIndex: number
  fieldValues: Record<string, string>
  onFieldSelect: (index: number) => void
}

// ─── Helpers ───────────────────────────────────────────────────────

function getFieldIcon(type: FieldType): React.ReactNode {
  switch (type) {
    case FieldType.Signature:
      return <PenTool size={16} />
    case FieldType.Initial:
      return <Type size={16} />
    case FieldType.DateSigned:
      return <Calendar size={16} />
    case FieldType.Text:
      return <Type size={16} />
    case FieldType.Checkbox:
      return <CheckCircle size={16} />
    case FieldType.Dropdown:
      return <ListChecks size={16} />
    default:
      return <FileText size={16} />
  }
}

function getFieldLabel(type: FieldType): string {
  switch (type) {
    case FieldType.Signature:
      return 'Signature'
    case FieldType.Initial:
      return 'Initials'
    case FieldType.DateSigned:
      return 'Date Signed'
    case FieldType.Text:
      return 'Text'
    case FieldType.Checkbox:
      return 'Checkbox'
    case FieldType.Dropdown:
      return 'Dropdown'
    case FieldType.Attachment:
      return 'Attachment'
    default:
      return 'Field'
  }
}

// ─── Component ─────────────────────────────────────────────────────

function FieldChecklist({
  fields,
  currentFieldIndex,
  fieldValues,
  onFieldSelect,
}: FieldChecklistProps) {
  const isFieldCompleted = useCallback(
    (field: DocumentField): boolean => {
      if (field.type === FieldType.DateSigned) return true
      return Boolean(fieldValues[field.id])
    },
    [fieldValues]
  )

  const handleItemClick = useCallback(
    (index: number) => {
      onFieldSelect(index)
    },
    [onFieldSelect]
  )

  const handleItemKeyDown = useCallback(
    (e: React.KeyboardEvent, index: number) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        onFieldSelect(index)
      }
    },
    [onFieldSelect]
  )

  return (
    <nav className="field-checklist" aria-label="Field checklist">
      <div className="field-checklist__header">
        <h3 className="field-checklist__title">Fields</h3>
        <span className="field-checklist__count">
          {fields.filter((f) => isFieldCompleted(f)).length}/{fields.length}
        </span>
      </div>
      <ul className="field-checklist__list" role="list">
        {fields.map((field, index) => {
          const completed = isFieldCompleted(field)
          const active = index === currentFieldIndex
          const label = field.label ?? getFieldLabel(field.type)

          let stateClass = ' field-checklist__item--pending'
          if (active) stateClass = ' field-checklist__item--active'
          else if (completed) stateClass = ' field-checklist__item--completed'

          return (
            <li
              key={field.id}
              className={`field-checklist__item${stateClass}`}
              onClick={() => handleItemClick(index)}
              onKeyDown={(e) => handleItemKeyDown(e, index)}
              role="button"
              tabIndex={0}
              aria-current={active ? 'step' : undefined}
              aria-label={`${label}${completed ? ', completed' : ''}${active ? ', current' : ''}`}
            >
              <span className="field-checklist__indicator">
                {completed && !active ? (
                  <span className="field-checklist__check">
                    <Check size={14} />
                  </span>
                ) : (
                  <span className="field-checklist__number">{index + 1}</span>
                )}
              </span>
              <span className="field-checklist__icon">
                {getFieldIcon(field.type)}
              </span>
              <span className="field-checklist__label">{label}</span>
              {field.required && (
                <span className="field-checklist__required">Required</span>
              )}
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

export default FieldChecklist
