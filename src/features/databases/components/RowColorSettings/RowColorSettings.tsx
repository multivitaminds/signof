import { useState, useCallback } from 'react'
import { Plus, Trash2, Palette, X } from 'lucide-react'
import type { DbField, RowColorRule } from '../../types'
import { RowColorOperator, ROW_COLOR_OPERATOR_LABELS, ROW_COLOR_PALETTE } from '../../types'
import './RowColorSettings.css'

function rid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

interface RowColorSettingsProps {
  fields: DbField[]
  rules: RowColorRule[]
  onRulesChange: (rules: RowColorRule[]) => void
  onClose: () => void
}

const ALL_OPERATORS = Object.values(RowColorOperator) as RowColorOperator[]

export default function RowColorSettings({
  fields,
  rules,
  onRulesChange,
  onClose,
}: RowColorSettingsProps) {
  const [editingColorId, setEditingColorId] = useState<string | null>(null)

  const handleAdd = useCallback(() => {
    const first = fields[0]
    if (!first) return
    const newRule: RowColorRule = {
      id: rid(),
      fieldId: first.id,
      operator: RowColorOperator.Equals,
      value: '',
      color: ROW_COLOR_PALETTE[rules.length % ROW_COLOR_PALETTE.length]!,
    }
    onRulesChange([...rules, newRule])
  }, [fields, rules, onRulesChange])

  const handleUpdate = useCallback((id: string, updates: Partial<RowColorRule>) => {
    onRulesChange(rules.map((r) => r.id === id ? { ...r, ...updates } : r))
  }, [rules, onRulesChange])

  const handleDelete = useCallback((id: string) => {
    onRulesChange(rules.filter((r) => r.id !== id))
  }, [rules, onRulesChange])

  const handleOverlayClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose()
  }, [onClose])

  const needsValue = useCallback((operator: RowColorOperator): boolean => {
    return operator !== RowColorOperator.IsEmpty && operator !== RowColorOperator.IsNotEmpty
  }, [])

  return (
    <div className="modal-overlay" onClick={handleOverlayClick} role="dialog" aria-modal="true" aria-label="Row Color Settings">
      <div className="modal-content row-color-settings">
        <div className="modal-header">
          <h2 className="row-color-settings__title">
            <Palette size={18} />
            Row Color Rules
          </h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div className="row-color-settings__body">
          {rules.length === 0 ? (
            <div className="row-color-settings__empty">
              <p>No color rules yet.</p>
              <p className="row-color-settings__empty-hint">
                Add rules to highlight rows that match specific conditions.
              </p>
            </div>
          ) : (
            <div className="row-color-settings__rules">
              {rules.map((rule) => (
                <div key={rule.id} className="row-color-settings__rule">
                  <div className="row-color-settings__rule-row">
                    <span className="row-color-settings__rule-label">When</span>
                    <select
                      className="row-color-settings__select"
                      value={rule.fieldId}
                      onChange={(e) => handleUpdate(rule.id, { fieldId: e.target.value })}
                      aria-label="Field"
                    >
                      {fields.map((f) => (
                        <option key={f.id} value={f.id}>{f.name}</option>
                      ))}
                    </select>

                    <select
                      className="row-color-settings__select"
                      value={rule.operator}
                      onChange={(e) => handleUpdate(rule.id, { operator: e.target.value as RowColorOperator })}
                      aria-label="Operator"
                    >
                      {ALL_OPERATORS.map((op) => (
                        <option key={op} value={op}>{ROW_COLOR_OPERATOR_LABELS[op]}</option>
                      ))}
                    </select>

                    {needsValue(rule.operator) && (
                      <input
                        className="row-color-settings__input"
                        type="text"
                        value={rule.value}
                        onChange={(e) => handleUpdate(rule.id, { value: e.target.value })}
                        placeholder="Value..."
                        aria-label="Value"
                      />
                    )}
                  </div>

                  <div className="row-color-settings__rule-row">
                    <span className="row-color-settings__rule-label">Color</span>
                    <div className="row-color-settings__color-picker">
                      <button
                        className="row-color-settings__color-preview"
                        style={{ backgroundColor: rule.color }}
                        onClick={() => setEditingColorId(editingColorId === rule.id ? null : rule.id)}
                        aria-label="Pick color"
                      />
                      {editingColorId === rule.id && (
                        <div className="row-color-settings__color-palette">
                          {ROW_COLOR_PALETTE.map((color) => (
                            <button
                              key={color}
                              className={`row-color-settings__color-swatch ${color === rule.color ? 'row-color-settings__color-swatch--active' : ''}`}
                              style={{ backgroundColor: color }}
                              onClick={() => {
                                handleUpdate(rule.id, { color })
                                setEditingColorId(null)
                              }}
                              aria-label={`Color ${color}`}
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    <button
                      className="row-color-settings__delete-btn"
                      onClick={() => handleDelete(rule.id)}
                      aria-label="Delete rule"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <button className="btn-secondary row-color-settings__add-btn" onClick={handleAdd}>
            <Plus size={14} />
            Add Rule
          </button>
        </div>
      </div>
    </div>
  )
}
