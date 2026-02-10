import { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import { AlertCircle, Check, Braces } from 'lucide-react'
import type { DbField, DbRow } from '../../types'
import { evaluateFormula } from '../../lib/formulaEngine'
import './FormulaFieldEditor.css'

interface FormulaFieldEditorProps {
  field: DbField
  fields: DbField[]
  sampleRow: DbRow | null
  onSave: (expression: string) => void
  onCancel: () => void
}

const FUNCTION_HINTS = [
  { name: 'IF', syntax: 'IF(condition, then, else)', desc: 'Conditional logic' },
  { name: 'AND', syntax: 'AND(a, b)', desc: 'Logical AND' },
  { name: 'OR', syntax: 'OR(a, b)', desc: 'Logical OR' },
  { name: 'NOT', syntax: 'NOT(a)', desc: 'Logical NOT' },
  { name: 'CONCAT', syntax: 'CONCAT(a, b, ...)', desc: 'Join text values' },
  { name: 'UPPER', syntax: 'UPPER(text)', desc: 'Convert to uppercase' },
  { name: 'LOWER', syntax: 'LOWER(text)', desc: 'Convert to lowercase' },
  { name: 'LEN', syntax: 'LEN(text)', desc: 'Length of text' },
  { name: 'TRIM', syntax: 'TRIM(text)', desc: 'Remove whitespace' },
  { name: 'SUM', syntax: 'SUM(a, b, ...)', desc: 'Sum values' },
  { name: 'ABS', syntax: 'ABS(number)', desc: 'Absolute value' },
  { name: 'ROUND', syntax: 'ROUND(number, decimals)', desc: 'Round number' },
  { name: 'FLOOR', syntax: 'FLOOR(number)', desc: 'Round down' },
  { name: 'CEIL', syntax: 'CEIL(number)', desc: 'Round up' },
  { name: 'NOW', syntax: 'NOW()', desc: 'Current date & time' },
  { name: 'TODAY', syntax: 'TODAY()', desc: 'Current date' },
  { name: 'DAYS', syntax: 'DAYS(date1, date2)', desc: 'Days between dates' },
]

export default function FormulaFieldEditor({
  field,
  fields,
  sampleRow,
  onSave,
  onCancel,
}: FormulaFieldEditorProps) {
  const [expression, setExpression] = useState(field.formulaConfig?.expression ?? '')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [suggestionFilter, setSuggestionFilter] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Available fields for references (exclude the formula field itself)
  const availableFields = useMemo(
    () => fields.filter((f) => f.id !== field.id),
    [fields, field.id]
  )

  // Field name suggestions filtered by current input
  const fieldSuggestions = useMemo(
    () =>
      availableFields.filter((f) =>
        f.name.toLowerCase().includes(suggestionFilter.toLowerCase())
      ),
    [availableFields, suggestionFilter]
  )

  // Live preview: evaluate formula against sample row
  const preview = useMemo(() => {
    if (!expression.trim()) return { value: null, error: null }
    if (!sampleRow) return { value: null, error: 'No rows to preview' }
    const result = evaluateFormula(expression, sampleRow, fields)
    if (typeof result === 'string' && result.startsWith('#ERROR')) {
      return { value: null, error: result.replace('#ERROR: ', '') }
    }
    return { value: result, error: null }
  }, [expression, sampleRow, fields])

  const handleExpressionChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value
    setExpression(val)

    // Check if user is typing a field reference
    const cursorPos = e.target.selectionStart
    const textBefore = val.slice(0, cursorPos)
    const openBrace = textBefore.lastIndexOf('{')
    const closeBrace = textBefore.lastIndexOf('}')

    if (openBrace > closeBrace) {
      const partial = textBefore.slice(openBrace + 1)
      setSuggestionFilter(partial)
      setShowSuggestions(true)
    } else {
      setShowSuggestions(false)
      setSuggestionFilter('')
    }
  }, [])

  const handleInsertField = useCallback(
    (fieldName: string) => {
      const textarea = textareaRef.current
      if (!textarea) return
      const cursorPos = textarea.selectionStart
      const text = expression
      const openBrace = text.lastIndexOf('{', cursorPos - 1)

      if (openBrace >= 0) {
        // Replace from { to cursor with {fieldName}
        const before = text.slice(0, openBrace)
        const after = text.slice(cursorPos)
        setExpression(`${before}{${fieldName}}${after}`)
      } else {
        // Insert at cursor
        const before = text.slice(0, cursorPos)
        const after = text.slice(cursorPos)
        setExpression(`${before}{${fieldName}}${after}`)
      }

      setShowSuggestions(false)
      setSuggestionFilter('')
      textarea.focus()
    },
    [expression]
  )

  const handleInsertFunction = useCallback(
    (funcName: string) => {
      const textarea = textareaRef.current
      if (!textarea) return
      const cursorPos = textarea.selectionStart
      const before = expression.slice(0, cursorPos)
      const after = expression.slice(cursorPos)
      const insertion = `${funcName}()`
      setExpression(`${before}${insertion}${after}`)
      // Place cursor inside parens
      setTimeout(() => {
        const newPos = cursorPos + funcName.length + 1
        textarea.setSelectionRange(newPos, newPos)
        textarea.focus()
      }, 0)
    },
    [expression]
  )

  const handleSave = useCallback(() => {
    onSave(expression)
  }, [expression, onSave])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showSuggestions) {
          setShowSuggestions(false)
        } else {
          onCancel()
        }
      }
    },
    [showSuggestions, onCancel]
  )

  // Close suggestions on click outside
  useEffect(() => {
    if (!showSuggestions) return
    function handleClick(e: MouseEvent) {
      const target = e.target as HTMLElement
      if (!target.closest('.formula-field-editor__suggestions')) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [showSuggestions])

  return (
    <div className="formula-field-editor" onKeyDown={handleKeyDown}>
      <div className="formula-field-editor__header">
        <Braces size={16} />
        <span className="formula-field-editor__title">Formula Editor</span>
      </div>

      <div className="formula-field-editor__input-section">
        <label className="formula-field-editor__label" htmlFor="formula-expression">
          Expression
        </label>
        <div className="formula-field-editor__textarea-wrapper">
          <textarea
            ref={textareaRef}
            id="formula-expression"
            className="formula-field-editor__textarea"
            value={expression}
            onChange={handleExpressionChange}
            placeholder="e.g. {Price} * {Quantity} or IF({Status} == 'Done', 'Complete', 'Pending')"
            rows={3}
            spellCheck={false}
          />
          {showSuggestions && fieldSuggestions.length > 0 && (
            <div className="formula-field-editor__suggestions">
              {fieldSuggestions.map((f) => (
                <button
                  key={f.id}
                  className="formula-field-editor__suggestion"
                  onClick={() => handleInsertField(f.name)}
                >
                  <span className="formula-field-editor__suggestion-name">
                    {'{' + f.name + '}'}
                  </span>
                  <span className="formula-field-editor__suggestion-type">
                    {f.type}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Preview */}
      <div className="formula-field-editor__preview">
        <span className="formula-field-editor__preview-label">Preview:</span>
        {preview.error ? (
          <span className="formula-field-editor__preview-error">
            <AlertCircle size={12} />
            {preview.error}
          </span>
        ) : preview.value !== null ? (
          <span className="formula-field-editor__preview-value">
            {String(preview.value)}
          </span>
        ) : (
          <span className="formula-field-editor__preview-empty">
            {expression.trim() ? 'No preview available' : 'Enter a formula above'}
          </span>
        )}
      </div>

      {/* Field references */}
      <div className="formula-field-editor__fields-section">
        <span className="formula-field-editor__section-label">Fields</span>
        <div className="formula-field-editor__field-chips">
          {availableFields.map((f) => (
            <button
              key={f.id}
              className="formula-field-editor__field-chip"
              onClick={() => handleInsertField(f.name)}
              title={`Insert {${f.name}}`}
            >
              {'{' + f.name + '}'}
            </button>
          ))}
        </div>
      </div>

      {/* Function reference */}
      <div className="formula-field-editor__functions-section">
        <span className="formula-field-editor__section-label">Functions</span>
        <div className="formula-field-editor__function-list">
          {FUNCTION_HINTS.map((fn) => (
            <button
              key={fn.name}
              className="formula-field-editor__function-item"
              onClick={() => handleInsertFunction(fn.name)}
              title={fn.syntax}
            >
              <span className="formula-field-editor__function-name">{fn.name}</span>
              <span className="formula-field-editor__function-desc">{fn.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="formula-field-editor__actions">
        <button className="btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button
          className="btn-primary"
          onClick={handleSave}
          disabled={!expression.trim()}
        >
          <Check size={14} />
          Save Formula
        </button>
      </div>
    </div>
  )
}
