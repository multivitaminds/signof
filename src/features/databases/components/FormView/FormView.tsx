import { useState, useCallback } from 'react'
import { CheckCircle2, FileInput, ExternalLink } from 'lucide-react'
import type { DbField, CellValue } from '../../types'
import { DbFieldType } from '../../types'
import './FormView.css'

interface FormViewProps {
  fields: DbField[]
  tableName?: string
  formDescription?: string
  onSubmit: (cells: Record<string, CellValue>) => void
}

export default function FormView({
  fields,
  tableName,
  formDescription,
  onSubmit,
}: FormViewProps) {
  const [values, setValues] = useState<Record<string, string>>({})
  const [multiSelectValues, setMultiSelectValues] = useState<Record<string, string[]>>({})
  const [submitted, setSubmitted] = useState(false)
  const [submissionCount, setSubmissionCount] = useState(0)

  const handleChange = useCallback((fieldId: string, val: string) => {
    setValues((prev) => ({ ...prev, [fieldId]: val }))
  }, [])

  const handleMultiSelectToggle = useCallback((fieldId: string, choiceName: string) => {
    setMultiSelectValues((prev) => {
      const current = prev[fieldId] ?? []
      const next = current.includes(choiceName)
        ? current.filter((c) => c !== choiceName)
        : [...current, choiceName]
      return { ...prev, [fieldId]: next }
    })
  }, [])

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      const cells: Record<string, CellValue> = {}
      for (const field of fields) {
        if (field.type === DbFieldType.MultiSelect) {
          cells[field.id] = multiSelectValues[field.id] ?? []
        } else if (field.type === DbFieldType.Number) {
          const raw = values[field.id] ?? ''
          cells[field.id] = raw ? Number(raw) : null
        } else if (field.type === DbFieldType.Checkbox) {
          cells[field.id] = values[field.id] === 'true'
        } else {
          cells[field.id] = values[field.id] || null
        }
      }
      onSubmit(cells)
      setValues({})
      setMultiSelectValues({})
      setSubmitted(true)
      setSubmissionCount((c) => c + 1)
    },
    [fields, values, multiSelectValues, onSubmit]
  )

  const handleSubmitAnother = useCallback(() => {
    setSubmitted(false)
  }, [])

  if (submitted) {
    return (
      <div className="form-view form-view--success" role="status">
        <CheckCircle2 size={48} />
        <h2>Response submitted</h2>
        <p>Your response has been recorded.</p>
        <span className="form-view__submission-count">
          {submissionCount} response{submissionCount !== 1 ? 's' : ''} submitted
        </span>
        <button className="btn-primary" onClick={handleSubmitAnother}>
          Submit another
        </button>
      </div>
    )
  }

  return (
    <form className="form-view" onSubmit={handleSubmit}>
      <div className="form-view__header">
        <FileInput size={20} className="form-view__header-icon" />
        <h2 className="form-view__title">
          {tableName ? `${tableName} Form` : 'Submit a response'}
        </h2>
        {formDescription && (
          <p className="form-view__description">{formDescription}</p>
        )}
      </div>

      <div className="form-view__shareable-hint">
        <ExternalLink size={12} />
        <span>This form can be shared publicly for data collection.</span>
      </div>

      {fields.map((field) => (
        <div key={field.id} className="form-view__field">
          <label className="form-view__label" htmlFor={`form-field-${field.id}`}>
            {field.name}
            {field.required && <span className="form-view__required">*</span>}
          </label>

          {field.type === DbFieldType.Select && field.options ? (
            <select
              id={`form-field-${field.id}`}
              className="form-view__select"
              value={values[field.id] ?? ''}
              onChange={(e) => handleChange(field.id, e.target.value)}
              required={field.required}
            >
              <option value="">Select...</option>
              {field.options.choices.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          ) : field.type === DbFieldType.MultiSelect && field.options ? (
            <div className="form-view__multi-select" role="group" aria-label={`${field.name} options`}>
              {field.options.choices.map((c) => {
                const isSelected = (multiSelectValues[field.id] ?? []).includes(c.name)
                return (
                  <button
                    key={c.id}
                    type="button"
                    className={`form-view__multi-option ${isSelected ? 'form-view__multi-option--selected' : ''}`}
                    style={
                      isSelected
                        ? { backgroundColor: `${c.color}20`, color: c.color, borderColor: c.color }
                        : undefined
                    }
                    onClick={() => handleMultiSelectToggle(field.id, c.name)}
                    aria-pressed={isSelected}
                  >
                    {c.name}
                  </button>
                )
              })}
            </div>
          ) : field.type === DbFieldType.Checkbox ? (
            <label className="form-view__checkbox-label">
              <input
                type="checkbox"
                checked={values[field.id] === 'true'}
                onChange={(e) => handleChange(field.id, String(e.target.checked))}
              />
              <span>{field.name}</span>
            </label>
          ) : field.type === DbFieldType.Number ? (
            <input
              id={`form-field-${field.id}`}
              className="form-view__input"
              type="number"
              value={values[field.id] ?? ''}
              onChange={(e) => handleChange(field.id, e.target.value)}
              required={field.required}
              placeholder={`Enter ${field.name.toLowerCase()}...`}
            />
          ) : field.type === DbFieldType.Date ? (
            <input
              id={`form-field-${field.id}`}
              className="form-view__input"
              type="date"
              value={values[field.id] ?? ''}
              onChange={(e) => handleChange(field.id, e.target.value)}
              required={field.required}
            />
          ) : field.type === DbFieldType.Url ? (
            <input
              id={`form-field-${field.id}`}
              className="form-view__input"
              type="url"
              value={values[field.id] ?? ''}
              onChange={(e) => handleChange(field.id, e.target.value)}
              required={field.required}
              placeholder="https://..."
            />
          ) : field.type === DbFieldType.Email ? (
            <input
              id={`form-field-${field.id}`}
              className="form-view__input"
              type="email"
              value={values[field.id] ?? ''}
              onChange={(e) => handleChange(field.id, e.target.value)}
              required={field.required}
              placeholder="name@example.com"
            />
          ) : field.type === DbFieldType.Phone ? (
            <input
              id={`form-field-${field.id}`}
              className="form-view__input"
              type="tel"
              value={values[field.id] ?? ''}
              onChange={(e) => handleChange(field.id, e.target.value)}
              required={field.required}
              placeholder="+1 (555) 000-0000"
            />
          ) : (
            <input
              id={`form-field-${field.id}`}
              className="form-view__input"
              type="text"
              value={values[field.id] ?? ''}
              onChange={(e) => handleChange(field.id, e.target.value)}
              required={field.required}
              placeholder={`Enter ${field.name.toLowerCase()}...`}
            />
          )}
        </div>
      ))}

      <button type="submit" className="btn-primary form-view__submit">
        Submit
      </button>
    </form>
  )
}
