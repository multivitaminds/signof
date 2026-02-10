import { useState, useCallback, useRef, useEffect } from 'react'
import { X } from 'lucide-react'
import type { DbField, DbTable, RelationConfig, LookupConfig, RollupConfig, FormulaConfig } from '../../types'
import { DbFieldType, FIELD_TYPE_LABELS, RollupAggregation } from '../../types'
import './FieldConfigPopover.css'

type DbFieldTypeValue = (typeof DbFieldType)[keyof typeof DbFieldType]

interface FieldConfigPopoverProps {
  tables: Record<string, DbTable>
  currentTableId: string
  currentFields: DbField[]
  onCreateField: (
    name: string,
    type: DbFieldTypeValue,
    config?: {
      relationConfig?: RelationConfig
      lookupConfig?: LookupConfig
      rollupConfig?: RollupConfig
      formulaConfig?: FormulaConfig
    }
  ) => void
  onClose: () => void
}

// Field types that need additional configuration
function isConfigurableType(type: DbFieldTypeValue): boolean {
  return type === DbFieldType.Relation ||
    type === DbFieldType.Lookup ||
    type === DbFieldType.Rollup ||
    type === DbFieldType.Formula
}

const AGGREGATION_OPTIONS: Array<{ value: string; label: string }> = [
  { value: RollupAggregation.Count, label: 'Count' },
  { value: RollupAggregation.Sum, label: 'Sum' },
  { value: RollupAggregation.Avg, label: 'Average' },
  { value: RollupAggregation.Min, label: 'Min' },
  { value: RollupAggregation.Max, label: 'Max' },
  { value: RollupAggregation.PercentEmpty, label: '% Empty' },
  { value: RollupAggregation.PercentFilled, label: '% Filled' },
]

export default function FieldConfigPopover({
  tables,
  currentTableId,
  currentFields,
  onCreateField,
  onClose,
}: FieldConfigPopoverProps) {
  const [step, setStep] = useState<'type' | 'config'>('type')
  const [fieldName, setFieldName] = useState('New Field')
  const [selectedType, setSelectedType] = useState<DbFieldTypeValue>(DbFieldType.Text)

  // Relation config state
  const [targetTableId, setTargetTableId] = useState('')
  const [targetFieldId, setTargetFieldId] = useState('')
  const [allowMultiple, setAllowMultiple] = useState(true)

  // Lookup/Rollup config state
  const [relationFieldId, setRelationFieldId] = useState('')
  const [lookupTargetFieldId, setLookupTargetFieldId] = useState('')
  const [aggregation, setAggregation] = useState(RollupAggregation.Count)

  // Formula config state
  const [formulaExpression, setFormulaExpression] = useState('')

  const popoverRef = useRef<HTMLDivElement>(null)
  const nameInputRef = useRef<HTMLInputElement>(null)

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  // Focus name input on type selection
  useEffect(() => {
    if (step === 'config' && nameInputRef.current) {
      nameInputRef.current.focus()
      nameInputRef.current.select()
    }
  }, [step])

  // Available tables for relations (exclude current table)
  const otherTables = Object.values(tables).filter((t) => t.id !== currentTableId)

  // Relation fields in current table (for lookup/rollup)
  const relationFields = currentFields.filter((f) => f.type === DbFieldType.Relation)

  // Target table fields for the selected relation
  const getRelationTargetFields = useCallback(
    (relFieldId: string): DbField[] => {
      const relField = currentFields.find((f) => f.id === relFieldId)
      if (!relField?.relationConfig) return []
      const target = tables[relField.relationConfig.targetTableId]
      return target?.fields ?? []
    },
    [currentFields, tables]
  )

  const handleSelectType = useCallback(
    (type: DbFieldTypeValue) => {
      setSelectedType(type)
      // Default name based on type
      setFieldName(FIELD_TYPE_LABELS[type] ?? 'New Field')

      if (isConfigurableType(type)) {
        setStep('config')
        // Set defaults
        if (type === DbFieldType.Relation && otherTables.length > 0) {
          const firstTable = otherTables[0]!
          setTargetTableId(firstTable.id)
          setTargetFieldId(firstTable.fields[0]?.id ?? '')
        }
        if ((type === DbFieldType.Lookup || type === DbFieldType.Rollup) && relationFields.length > 0) {
          const firstRel = relationFields[0]!
          setRelationFieldId(firstRel.id)
          const targetFields = getRelationTargetFields(firstRel.id)
          setLookupTargetFieldId(targetFields[0]?.id ?? '')
        }
      } else {
        // Simple field: create immediately
        onCreateField(FIELD_TYPE_LABELS[type] ?? 'New Field', type)
      }
    },
    [otherTables, relationFields, getRelationTargetFields, onCreateField]
  )

  const handleCreate = useCallback(() => {
    const name = fieldName.trim() || 'New Field'

    switch (selectedType) {
      case DbFieldType.Relation:
        onCreateField(name, selectedType, {
          relationConfig: {
            targetTableId,
            targetFieldId,
            allowMultiple,
          },
        })
        break
      case DbFieldType.Lookup:
        onCreateField(name, selectedType, {
          lookupConfig: {
            relationFieldId,
            targetFieldId: lookupTargetFieldId,
          },
        })
        break
      case DbFieldType.Rollup:
        onCreateField(name, selectedType, {
          rollupConfig: {
            relationFieldId,
            targetFieldId: lookupTargetFieldId,
            aggregation,
          },
        })
        break
      case DbFieldType.Formula:
        onCreateField(name, selectedType, {
          formulaConfig: {
            expression: formulaExpression,
          },
        })
        break
      default:
        onCreateField(name, selectedType)
    }
  }, [
    fieldName, selectedType, targetTableId, targetFieldId,
    allowMultiple, relationFieldId, lookupTargetFieldId,
    aggregation, formulaExpression, onCreateField,
  ])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'Enter' && step === 'config') handleCreate()
    },
    [onClose, step, handleCreate]
  )

  // Step 1: Type picker
  if (step === 'type') {
    const fieldTypes = Object.entries(DbFieldType) as Array<[string, DbFieldTypeValue]>
    return (
      <div className="field-config-popover" ref={popoverRef} onKeyDown={handleKeyDown}>
        <div className="field-config-popover__header">
          <span className="field-config-popover__title">Add Field</span>
          <button className="field-config-popover__close" onClick={onClose} aria-label="Close">
            <X size={14} />
          </button>
        </div>
        <div className="field-config-popover__type-list">
          {fieldTypes.map(([key, type]) => (
            <button
              key={key}
              className="field-config-popover__type-option"
              onClick={() => handleSelectType(type)}
            >
              <span className="field-config-popover__type-icon">
                {getFieldTypeIcon(type)}
              </span>
              <span className="field-config-popover__type-label">
                {FIELD_TYPE_LABELS[type]}
              </span>
            </button>
          ))}
        </div>
      </div>
    )
  }

  // Step 2: Configure relational/formula field
  return (
    <div className="field-config-popover field-config-popover--wide" ref={popoverRef} onKeyDown={handleKeyDown}>
      <div className="field-config-popover__header">
        <span className="field-config-popover__title">
          Configure {FIELD_TYPE_LABELS[selectedType]}
        </span>
        <button className="field-config-popover__close" onClick={onClose} aria-label="Close">
          <X size={14} />
        </button>
      </div>

      <div className="field-config-popover__form">
        {/* Field name */}
        <div className="field-config-popover__field-group">
          <label className="field-config-popover__label" htmlFor="fcp-name">
            Field Name
          </label>
          <input
            ref={nameInputRef}
            id="fcp-name"
            className="field-config-popover__input"
            type="text"
            value={fieldName}
            onChange={(e) => setFieldName(e.target.value)}
          />
        </div>

        {/* Relation config */}
        {selectedType === DbFieldType.Relation && (
          <>
            <div className="field-config-popover__field-group">
              <label className="field-config-popover__label" htmlFor="fcp-target-table">
                Target Table
              </label>
              {otherTables.length === 0 ? (
                <p className="field-config-popover__hint">No other tables available. Create another table first.</p>
              ) : (
                <select
                  id="fcp-target-table"
                  className="field-config-popover__select"
                  value={targetTableId}
                  onChange={(e) => {
                    setTargetTableId(e.target.value)
                    const t = tables[e.target.value]
                    setTargetFieldId(t?.fields[0]?.id ?? '')
                  }}
                >
                  {otherTables.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.icon} {t.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <div className="field-config-popover__field-group">
              <label className="field-config-popover__label" htmlFor="fcp-display-field">
                Display Field
              </label>
              <select
                id="fcp-display-field"
                className="field-config-popover__select"
                value={targetFieldId}
                onChange={(e) => setTargetFieldId(e.target.value)}
              >
                {(tables[targetTableId]?.fields ?? []).map((f) => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            </div>
            <div className="field-config-popover__field-group field-config-popover__field-group--checkbox">
              <label className="field-config-popover__checkbox-label">
                <input
                  type="checkbox"
                  checked={allowMultiple}
                  onChange={(e) => setAllowMultiple(e.target.checked)}
                />
                Allow multiple records
              </label>
            </div>
          </>
        )}

        {/* Lookup config */}
        {selectedType === DbFieldType.Lookup && (
          <>
            {relationFields.length === 0 ? (
              <p className="field-config-popover__hint">
                No relation fields found. Add a Relation field first.
              </p>
            ) : (
              <>
                <div className="field-config-popover__field-group">
                  <label className="field-config-popover__label" htmlFor="fcp-relation-field">
                    Relation Field
                  </label>
                  <select
                    id="fcp-relation-field"
                    className="field-config-popover__select"
                    value={relationFieldId}
                    onChange={(e) => {
                      setRelationFieldId(e.target.value)
                      const tf = getRelationTargetFields(e.target.value)
                      setLookupTargetFieldId(tf[0]?.id ?? '')
                    }}
                  >
                    {relationFields.map((f) => (
                      <option key={f.id} value={f.id}>{f.name}</option>
                    ))}
                  </select>
                </div>
                <div className="field-config-popover__field-group">
                  <label className="field-config-popover__label" htmlFor="fcp-lookup-target">
                    Target Field
                  </label>
                  <select
                    id="fcp-lookup-target"
                    className="field-config-popover__select"
                    value={lookupTargetFieldId}
                    onChange={(e) => setLookupTargetFieldId(e.target.value)}
                  >
                    {getRelationTargetFields(relationFieldId).map((f) => (
                      <option key={f.id} value={f.id}>{f.name}</option>
                    ))}
                  </select>
                </div>
              </>
            )}
          </>
        )}

        {/* Rollup config */}
        {selectedType === DbFieldType.Rollup && (
          <>
            {relationFields.length === 0 ? (
              <p className="field-config-popover__hint">
                No relation fields found. Add a Relation field first.
              </p>
            ) : (
              <>
                <div className="field-config-popover__field-group">
                  <label className="field-config-popover__label" htmlFor="fcp-rollup-relation">
                    Relation Field
                  </label>
                  <select
                    id="fcp-rollup-relation"
                    className="field-config-popover__select"
                    value={relationFieldId}
                    onChange={(e) => {
                      setRelationFieldId(e.target.value)
                      const tf = getRelationTargetFields(e.target.value)
                      setLookupTargetFieldId(tf[0]?.id ?? '')
                    }}
                  >
                    {relationFields.map((f) => (
                      <option key={f.id} value={f.id}>{f.name}</option>
                    ))}
                  </select>
                </div>
                <div className="field-config-popover__field-group">
                  <label className="field-config-popover__label" htmlFor="fcp-rollup-target">
                    Target Field
                  </label>
                  <select
                    id="fcp-rollup-target"
                    className="field-config-popover__select"
                    value={lookupTargetFieldId}
                    onChange={(e) => setLookupTargetFieldId(e.target.value)}
                  >
                    {getRelationTargetFields(relationFieldId).map((f) => (
                      <option key={f.id} value={f.id}>{f.name}</option>
                    ))}
                  </select>
                </div>
                <div className="field-config-popover__field-group">
                  <label className="field-config-popover__label" htmlFor="fcp-aggregation">
                    Aggregation
                  </label>
                  <select
                    id="fcp-aggregation"
                    className="field-config-popover__select"
                    value={aggregation}
                    onChange={(e) => setAggregation(e.target.value as typeof aggregation)}
                  >
                    {AGGREGATION_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </>
            )}
          </>
        )}

        {/* Formula config */}
        {selectedType === DbFieldType.Formula && (
          <div className="field-config-popover__field-group">
            <label className="field-config-popover__label" htmlFor="fcp-formula">
              Expression
            </label>
            <textarea
              id="fcp-formula"
              className="field-config-popover__textarea"
              value={formulaExpression}
              onChange={(e) => setFormulaExpression(e.target.value)}
              placeholder="e.g. {Price} * {Quantity}"
              rows={2}
              spellCheck={false}
            />
            <p className="field-config-popover__hint">
              Use {'{'} Field Name {'}'} to reference fields. Available: IF, AND, OR, NOT, CONCAT, UPPER, LOWER, LEN, TRIM, SUM, ABS, ROUND, FLOOR, CEIL, NOW, TODAY, DAYS
            </p>
          </div>
        )}
      </div>

      <div className="field-config-popover__actions">
        <button className="field-config-popover__back-btn" onClick={() => setStep('type')}>
          Back
        </button>
        <button
          className="btn-primary"
          onClick={handleCreate}
          disabled={
            (selectedType === DbFieldType.Relation && !targetTableId) ||
            (selectedType === DbFieldType.Lookup && (!relationFieldId || !lookupTargetFieldId)) ||
            (selectedType === DbFieldType.Rollup && (!relationFieldId || !lookupTargetFieldId))
          }
        >
          Create Field
        </button>
      </div>
    </div>
  )
}

// Simple text-based icons for field types
function getFieldTypeIcon(type: string): string {
  switch (type) {
    case DbFieldType.Text: return 'Aa'
    case DbFieldType.Number: return '#'
    case DbFieldType.Select: return '\u25BC'
    case DbFieldType.MultiSelect: return '\u25A3'
    case DbFieldType.Date: return '\uD83D\uDCC5'
    case DbFieldType.Checkbox: return '\u2611'
    case DbFieldType.Url: return '\uD83D\uDD17'
    case DbFieldType.Email: return '@'
    case DbFieldType.Phone: return '\uD83D\uDCDE'
    case DbFieldType.CreatedTime: return '\u23F0'
    case DbFieldType.LastEditedTime: return '\u23F1'
    case DbFieldType.Attachment: return '\uD83D\uDCCE'
    case DbFieldType.Relation: return '\u2194'
    case DbFieldType.Lookup: return '\uD83D\uDD0D'
    case DbFieldType.Rollup: return '\u03A3'
    case DbFieldType.Formula: return 'fx'
    default: return '\u2022'
  }
}
