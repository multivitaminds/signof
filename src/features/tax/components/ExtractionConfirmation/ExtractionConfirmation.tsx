import { useState, useCallback } from 'react'
import {
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  Check,
  ShieldCheck,
} from 'lucide-react'
import type { ExtractionResult, ExtractionField } from '../../types'
import { ExtractionConfidence, TAX_FORM_LABELS } from '../../types'
import './ExtractionConfirmation.css'

interface ExtractionConfirmationProps {
  result: ExtractionResult
  onConfirm: (fields: ExtractionField[]) => void
  onEdit: (fieldIndex: number, value: string) => void
  onReject: () => void
  onToggleField?: (fieldIndex: number, confirmed: boolean) => void
}

const CONFIDENCE_CONFIG: Record<string, { label: string; className: string }> = {
  [ExtractionConfidence.High]: { label: 'High', className: 'extraction-confirmation__confidence--high' },
  [ExtractionConfidence.Medium]: { label: 'Medium', className: 'extraction-confirmation__confidence--medium' },
  [ExtractionConfidence.Low]: { label: 'Low', className: 'extraction-confirmation__confidence--low' },
}

function ExtractionConfirmation({ result, onConfirm, onEdit, onReject, onToggleField }: ExtractionConfirmationProps) {
  const [fields, setFields] = useState<ExtractionField[]>(result.fields)

  const handleValueChange = useCallback(
    (index: number, value: string) => {
      setFields((prev) =>
        prev.map((f, i) => (i === index ? { ...f, value } : f))
      )
      onEdit(index, value)
    },
    [onEdit]
  )

  const handleToggleConfirm = useCallback((index: number) => {
    setFields((prev) => {
      const newConfirmed = !prev[index]!.confirmed
      onToggleField?.(index, newConfirmed)
      return prev.map((f, i) =>
        i === index ? { ...f, confirmed: newConfirmed } : f
      )
    })
  }, [onToggleField])

  const handleConfirmAll = useCallback(() => {
    const confirmedFields = fields.map((f) => ({ ...f, confirmed: true }))
    setFields(confirmedFields)
    onConfirm(confirmedFields)
  }, [fields, onConfirm])

  const handleReject = useCallback(() => {
    onReject()
  }, [onReject])

  const confidencePercent = Math.round(result.overallConfidence * 100)

  return (
    <div className="extraction-confirmation">
      {/* Header */}
      <div className="extraction-confirmation__header">
        <div className="extraction-confirmation__header-info">
          <h3 className="extraction-confirmation__title">Review Extracted Data</h3>
          <span className="extraction-confirmation__form-badge">
            {TAX_FORM_LABELS[result.formType]}
          </span>
        </div>
        <div className="extraction-confirmation__confidence-score">
          <ShieldCheck size={16} />
          <span>{confidencePercent}% confidence</span>
        </div>
      </div>

      {/* Warnings */}
      {result.warnings.length > 0 && (
        <div className="extraction-confirmation__warnings">
          {result.warnings.map((warning, i) => (
            <div key={i} className="extraction-confirmation__warning">
              <AlertTriangle size={14} />
              <span>{warning}</span>
            </div>
          ))}
        </div>
      )}

      {/* Fields Table */}
      <div className="extraction-confirmation__fields">
        <table className="extraction-confirmation__table" role="grid">
          <thead>
            <tr>
              <th>Field</th>
              <th>Value</th>
              <th>Confidence</th>
              <th>Confirm</th>
            </tr>
          </thead>
          <tbody>
            {fields.map((field, index) => {
              const conf = CONFIDENCE_CONFIG[field.confidence] ?? { label: 'Unknown', className: '' }
              return (
                <tr key={field.key}>
                  <td className="extraction-confirmation__field-name">{field.key}</td>
                  <td>
                    <input
                      type="text"
                      className="extraction-confirmation__input"
                      value={field.value}
                      onChange={(e) => handleValueChange(index, e.target.value)}
                      aria-label={`Value for ${field.key}`}
                    />
                  </td>
                  <td>
                    <span className={`extraction-confirmation__confidence ${conf.className}`}>
                      {conf.label}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className={`extraction-confirmation__check${field.confirmed ? ' extraction-confirmation__check--active' : ''}`}
                      onClick={() => handleToggleConfirm(index)}
                      aria-label={`${field.confirmed ? 'Unconfirm' : 'Confirm'} ${field.key}`}
                    >
                      <Check size={14} />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Actions */}
      <div className="extraction-confirmation__actions">
        <button
          type="button"
          className="btn-ghost extraction-confirmation__reject"
          onClick={handleReject}
        >
          <RotateCcw size={14} />
          <span>Re-extract</span>
        </button>
        <button
          type="button"
          className="btn-primary extraction-confirmation__confirm"
          onClick={handleConfirmAll}
        >
          <CheckCircle size={16} />
          <span>Confirm All</span>
        </button>
      </div>
    </div>
  )
}

export default ExtractionConfirmation
