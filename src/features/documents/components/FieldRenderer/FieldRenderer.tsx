import { useCallback } from 'react'
import type { DocumentField } from '../../../../types'
import { FieldType } from '../../../../types'
import './FieldRenderer.css'

interface FieldRendererProps {
  field: DocumentField
  recipientColor: string
  isCurrentSigner: boolean
  onValueChange?: (value: string) => void
  readOnly?: boolean
  focused?: boolean
}

function FieldRenderer({
  field,
  recipientColor,
  isCurrentSigner,
  onValueChange,
  readOnly = false,
  focused = false,
}: FieldRendererProps) {
  const isInteractive = isCurrentSigner && !readOnly
  const hasValue = Boolean(field.value)

  const handleChange = useCallback(
    (value: string) => {
      if (isInteractive && onValueChange) {
        onValueChange(value)
      }
    },
    [isInteractive, onValueChange]
  )

  const className = [
    'field-renderer',
    focused ? 'field-renderer--focused' : '',
    readOnly || !isCurrentSigner ? 'field-renderer--readonly' : '',
    hasValue ? 'field-renderer--completed' : '',
  ]
    .filter(Boolean)
    .join(' ')

  const borderStyle = { borderColor: recipientColor }

  const renderField = () => {
    switch (field.type) {
      case FieldType.Signature:
        return (
          <div className="field-renderer__signature" style={borderStyle}>
            {hasValue ? (
              <img
                src={field.value}
                alt="Signature"
                className="field-renderer__signature-img"
              />
            ) : (
              <span className="field-renderer__placeholder">Sign here</span>
            )}
          </div>
        )

      case FieldType.Initial:
        return (
          <div className="field-renderer__initial" style={borderStyle}>
            {hasValue ? (
              <span className="field-renderer__initial-value">{field.value}</span>
            ) : (
              <span className="field-renderer__placeholder">Initial</span>
            )}
          </div>
        )

      case FieldType.DateSigned:
        return (
          <div className="field-renderer__date" style={borderStyle}>
            <span className="field-renderer__date-value">
              {field.value || new Date().toLocaleDateString()}
            </span>
          </div>
        )

      case FieldType.Text:
        return (
          <input
            type="text"
            className="field-renderer__text"
            style={borderStyle}
            value={field.value ?? ''}
            placeholder={field.placeholder ?? 'Enter text'}
            onChange={(e) => handleChange(e.target.value)}
            readOnly={!isInteractive}
            aria-label={field.label ?? 'Text field'}
          />
        )

      case FieldType.Checkbox:
        return (
          <label className="field-renderer__checkbox" style={borderStyle}>
            <input
              type="checkbox"
              checked={field.value === 'true'}
              onChange={(e) => handleChange(String(e.target.checked))}
              disabled={!isInteractive}
              aria-label={field.label ?? 'Checkbox'}
            />
            <span className="field-renderer__checkbox-mark" />
          </label>
        )

      case FieldType.Dropdown:
        return (
          <select
            className="field-renderer__dropdown"
            style={borderStyle}
            value={field.value ?? ''}
            onChange={(e) => handleChange(e.target.value)}
            disabled={!isInteractive}
            aria-label={field.label ?? 'Dropdown'}
          >
            <option value="">Select...</option>
            {(field.options ?? []).map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        )

      case FieldType.Attachment:
        return (
          <div className="field-renderer__attachment" style={borderStyle}>
            {hasValue ? (
              <span className="field-renderer__attachment-name">{field.value}</span>
            ) : (
              <span className="field-renderer__placeholder">Attach file</span>
            )}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div
      className={className}
      data-field-id={field.id}
      data-field-type={field.type}
      role="group"
      aria-label={field.label ?? `${field.type} field`}
    >
      {renderField()}
      {field.label && (
        <span className="field-renderer__label">{field.label}</span>
      )}
    </div>
  )
}

export default FieldRenderer
