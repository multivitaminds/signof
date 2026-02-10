import { useState, useCallback } from 'react'
import { CheckCircle2 } from 'lucide-react'
import type { DbField, CellValue } from '../../types'
import { DbFieldType } from '../../types'
import './FormView.css'

interface FormViewProps {
  fields: DbField[]
  onSubmit: (cells: Record<string, CellValue>) => void
}

export default function FormView({ fields, onSubmit }: FormViewProps) {
  const [values, setValues] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)

  const handleChange = useCallback((fieldId: string, val: string) => {
    setValues((prev) => ({ ...prev, [fieldId]: val }))
  }, [])

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    const cells: Record<string, CellValue> = {}
    for (const field of fields) {
      const raw = values[field.id] ?? ''
      if (field.type === DbFieldType.Number) cells[field.id] = raw ? Number(raw) : null
      else if (field.type === DbFieldType.Checkbox) cells[field.id] = raw === 'true'
      else cells[field.id] = raw || null
    }
    onSubmit(cells)
    setValues({})
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 3000)
  }, [fields, values, onSubmit])

  if (submitted) {
    return (
      <div className="form-view form-view--success">
        <CheckCircle2 size={48} />
        <h2>Response submitted</h2>
        <p>Your response has been recorded.</p>
        <button className="btn-primary" onClick={() => setSubmitted(false)}>Submit another</button>
      </div>
    )
  }

  return (
    <form className="form-view" onSubmit={handleSubmit}>
      <h2 className="form-view__title">Submit a response</h2>
      {fields.map((field) => (
        <div key={field.id} className="form-view__field">
          <label className="form-view__label">
            {field.name}
            {field.required && <span className="form-view__required">*</span>}
          </label>
          {field.type === DbFieldType.Select && field.options ? (
            <select
              className="form-view__select"
              value={values[field.id] ?? ''}
              onChange={(e) => handleChange(field.id, e.target.value)}
              required={field.required}
            >
              <option value="">Select...</option>
              {field.options.choices.map((c) => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          ) : field.type === DbFieldType.Checkbox ? (
            <label className="form-view__checkbox-label">
              <input
                type="checkbox"
                checked={values[field.id] === 'true'}
                onChange={(e) => handleChange(field.id, String(e.target.checked))}
              />
              <span>{field.name}</span>
            </label>
          ) : (
            <input
              className="form-view__input"
              type={field.type === DbFieldType.Number ? 'number' : field.type === DbFieldType.Date ? 'date' : field.type === DbFieldType.Email ? 'email' : field.type === DbFieldType.Url ? 'url' : 'text'}
              value={values[field.id] ?? ''}
              onChange={(e) => handleChange(field.id, e.target.value)}
              required={field.required}
              placeholder={`Enter ${field.name.toLowerCase()}...`}
            />
          )}
        </div>
      ))}
      <button type="submit" className="btn-primary form-view__submit">Submit</button>
    </form>
  )
}
