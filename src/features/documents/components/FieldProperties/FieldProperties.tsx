import { useCallback } from 'react'
import type { DocumentField } from '../../../../types'
import { FieldType } from '../../../../types'
import { getFieldTypeLabel } from '../../lib/fieldTypes'
import './FieldProperties.css'

interface FieldPropertiesProps {
  field: DocumentField | null
  onUpdate: (updates: Partial<DocumentField>) => void
  onDelete: () => void
}

export default function FieldProperties({ field, onUpdate, onDelete }: FieldPropertiesProps) {
  const handleLabelChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onUpdate({ label: e.target.value })
    },
    [onUpdate]
  )

  const handlePlaceholderChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onUpdate({ placeholder: e.target.value })
    },
    [onUpdate]
  )

  const handleRequiredChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onUpdate({ required: e.target.checked })
    },
    [onUpdate]
  )

  const handleAddOption = useCallback(() => {
    if (!field) return
    const options = [...(field.options || []), `Option ${(field.options?.length || 0) + 1}`]
    onUpdate({ options })
  }, [field, onUpdate])

  const handleRemoveOption = useCallback(
    (index: number) => {
      if (!field?.options) return
      const options = field.options.filter((_, i) => i !== index)
      onUpdate({ options })
    },
    [field, onUpdate]
  )

  const handleOptionChange = useCallback(
    (index: number, value: string) => {
      if (!field?.options) return
      const options = field.options.map((opt, i) => (i === index ? value : opt))
      onUpdate({ options })
    },
    [field, onUpdate]
  )

  if (!field) {
    return (
      <div className="field-properties">
        <div className="field-properties__empty">Select a field to edit properties</div>
      </div>
    )
  }

  return (
    <div className="field-properties">
      <h3 className="field-properties__title">Field Properties</h3>

      <div className="field-properties__field">
        <label className="field-properties__label">Type</label>
        <div className="field-properties__value">{getFieldTypeLabel(field.type)}</div>
      </div>

      <div className="field-properties__field">
        <label className="field-properties__label" htmlFor="field-label">
          Label
        </label>
        <input
          id="field-label"
          className="field-properties__input"
          type="text"
          value={field.label || ''}
          onChange={handleLabelChange}
          placeholder="Field label"
        />
      </div>

      <div className="field-properties__field">
        <label className="field-properties__label" htmlFor="field-placeholder">
          Placeholder
        </label>
        <input
          id="field-placeholder"
          className="field-properties__input"
          type="text"
          value={field.placeholder || ''}
          onChange={handlePlaceholderChange}
          placeholder="Placeholder text"
        />
      </div>

      <div className="field-properties__field">
        <label className="field-properties__checkbox">
          <input
            type="checkbox"
            checked={field.required}
            onChange={handleRequiredChange}
          />
          <span>Required</span>
        </label>
      </div>

      {field.type === FieldType.Dropdown && (
        <div className="field-properties__field">
          <label className="field-properties__label">Options</label>
          <div className="field-properties__options">
            {(field.options || []).map((option, index) => (
              <div key={index} className="field-properties__option">
                <input
                  type="text"
                  className="field-properties__input"
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  aria-label={`Option ${index + 1}`}
                />
                <button
                  className="field-properties__option-remove"
                  onClick={() => handleRemoveOption(index)}
                  aria-label={`Remove option ${index + 1}`}
                >
                  x
                </button>
              </div>
            ))}
            <button className="btn-secondary field-properties__add-option" onClick={handleAddOption}>
              Add Option
            </button>
          </div>
        </div>
      )}

      <button className="btn-danger field-properties__delete" onClick={onDelete}>
        Delete Field
      </button>
    </div>
  )
}
