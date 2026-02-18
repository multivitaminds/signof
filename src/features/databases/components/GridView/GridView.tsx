import { useState, useCallback, useMemo, useRef } from 'react'
import { Plus } from 'lucide-react'
import type { DbField, DbRow, DbTable, CellValue, RelationConfig, LookupConfig, RollupConfig, FormulaConfig } from '../../types'
import { DbFieldType } from '../../types'
import { resolveRelation } from '../../lib/relationResolver'
import { evaluateFormula } from '../../lib/formulaEngine'
import RelationFieldEditor from '../RelationFieldEditor/RelationFieldEditor'
import FieldConfigPopover from '../FieldConfigPopover/FieldConfigPopover'
import './GridView.css'

type DbFieldTypeValue = (typeof DbFieldType)[keyof typeof DbFieldType]

interface FieldConfig {
  relationConfig?: RelationConfig
  lookupConfig?: LookupConfig
  rollupConfig?: RollupConfig
  formulaConfig?: FormulaConfig
}

interface GridViewProps {
  fields: DbField[]
  rows: DbRow[]
  hiddenFields: string[]
  fieldOrder: string[]
  onCellChange: (rowId: string, fieldId: string, value: CellValue) => void
  onAddRow: () => void
  onAddField: (name: string, type: DbFieldTypeValue, config?: FieldConfig) => void
  onDeleteRow: (rowId: string) => void
  tables?: Record<string, DbTable>
  currentTableId?: string
  rowColors?: Record<string, string>
  onRowClick?: (rowId: string) => void
}

// Field types that are computed and read-only in cells
const COMPUTED_FIELD_TYPES: ReadonlySet<string> = new Set([
  DbFieldType.Lookup,
  DbFieldType.Rollup,
  DbFieldType.Formula,
])

export default function GridView({
  fields, rows, hiddenFields, fieldOrder, onCellChange, onAddRow, onAddField, onDeleteRow, tables, currentTableId,
  rowColors, onRowClick,
}: GridViewProps) {
  const [editingCell, setEditingCell] = useState<{ rowId: string; fieldId: string } | null>(null)
  const [editValue, setEditValue] = useState('')
  const [showFieldPopover, setShowFieldPopover] = useState(false)
  const [focusedRow, setFocusedRow] = useState<number>(-1)
  const [focusedCol, setFocusedCol] = useState<number>(-1)
  const tableRef = useRef<HTMLTableElement>(null)

  const visibleFields = useMemo(
    () => fieldOrder
      .map((id) => fields.find((f) => f.id === id))
      .filter((f): f is DbField => f !== undefined && !hiddenFields.includes(f.id)),
    [fieldOrder, fields, hiddenFields]
  )

  const tablesMap = useMemo(() => tables ?? {}, [tables])

  const startEdit = useCallback((rowId: string, fieldId: string, value: CellValue) => {
    setEditingCell({ rowId, fieldId })
    setEditValue(value !== null && value !== undefined ? String(value) : '')
  }, [])

  const commitEdit = useCallback(() => {
    if (!editingCell) return
    const field = fields.find((f) => f.id === editingCell.fieldId)
    let val: CellValue = editValue
    if (field?.type === DbFieldType.Number) val = editValue ? Number(editValue) : null
    if (field?.type === DbFieldType.Checkbox) val = editValue === 'true'
    onCellChange(editingCell.rowId, editingCell.fieldId, val)
    setEditingCell(null)
  }, [editingCell, editValue, fields, onCellChange])

  const handleCellInputKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') { e.preventDefault(); commitEdit() }
    if (e.key === 'Escape') setEditingCell(null)
  }, [commitEdit])

  const computeCellValue = useCallback((row: DbRow, field: DbField): CellValue => {
    if (field.type === DbFieldType.Lookup || field.type === DbFieldType.Rollup) {
      return resolveRelation(row, field, tablesMap, fields)
    }
    if (field.type === DbFieldType.Formula && field.formulaConfig) {
      return evaluateFormula(field.formulaConfig.expression, row, fields)
    }
    return row.cells[field.id] ?? null
  }, [tablesMap, fields])

  // Focus a specific cell in the table
  const focusCell = useCallback((row: number, col: number) => {
    if (!tableRef.current) return
    const clampedRow = Math.max(0, Math.min(row, rows.length - 1))
    const clampedCol = Math.max(0, Math.min(col, visibleFields.length - 1))
    if (rows.length === 0 || visibleFields.length === 0) return

    setFocusedRow(clampedRow)
    setFocusedCol(clampedCol)

    // Focus the DOM element
    const cell = tableRef.current.querySelector<HTMLElement>(
      `[data-row="${clampedRow}"][data-col="${clampedCol}"]`
    )
    if (cell) {
      cell.focus()
    }
  }, [rows.length, visibleFields.length])

  // Keyboard navigation handler for the table
  const handleTableKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Only handle navigation when not editing
    if (editingCell) return
    if (focusedRow < 0 || focusedCol < 0) return

    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault()
        focusCell(focusedRow - 1, focusedCol)
        break
      case 'ArrowDown':
        e.preventDefault()
        focusCell(focusedRow + 1, focusedCol)
        break
      case 'ArrowLeft':
        e.preventDefault()
        focusCell(focusedRow, focusedCol - 1)
        break
      case 'ArrowRight':
        e.preventDefault()
        focusCell(focusedRow, focusedCol + 1)
        break
      case 'Home':
        e.preventDefault()
        focusCell(focusedRow, 0)
        break
      case 'End':
        e.preventDefault()
        focusCell(focusedRow, visibleFields.length - 1)
        break
      case 'Tab':
        e.preventDefault()
        if (e.shiftKey) {
          // Move to previous cell
          if (focusedCol > 0) {
            focusCell(focusedRow, focusedCol - 1)
          } else if (focusedRow > 0) {
            focusCell(focusedRow - 1, visibleFields.length - 1)
          }
        } else {
          // Move to next cell
          if (focusedCol < visibleFields.length - 1) {
            focusCell(focusedRow, focusedCol + 1)
          } else if (focusedRow < rows.length - 1) {
            focusCell(focusedRow + 1, 0)
          }
        }
        break
      case 'Enter': {
        e.preventDefault()
        const field = visibleFields[focusedCol]
        const row = rows[focusedRow]
        if (field && row && !COMPUTED_FIELD_TYPES.has(field.type) && field.type !== DbFieldType.Relation) {
          startEdit(row.id, field.id, row.cells[field.id] ?? null)
        }
        break
      }
      case 'Escape':
        e.preventDefault()
        setFocusedRow(-1)
        setFocusedCol(-1)
        break
    }
  }, [editingCell, focusedRow, focusedCol, focusCell, visibleFields, rows, startEdit])

  const handleCellFocus = useCallback((rowIdx: number, colIdx: number) => {
    setFocusedRow(rowIdx)
    setFocusedCol(colIdx)
  }, [])

  const renderCell = (row: DbRow, field: DbField) => {
    const val = row.cells[field.id]
    const isEditing = editingCell?.rowId === row.id && editingCell?.fieldId === field.id

    // Relation field: use RelationFieldEditor
    if (field.type === DbFieldType.Relation) {
      return (
        <RelationFieldEditor
          field={field}
          value={val ?? null}
          tables={tablesMap}
          onChange={(newVal) => onCellChange(row.id, field.id, newVal)}
        />
      )
    }

    // Computed fields: read-only display
    if (COMPUTED_FIELD_TYPES.has(field.type)) {
      const computed = computeCellValue(row, field)
      const display = computed !== null && computed !== undefined ? String(computed) : ''
      const isError = typeof computed === 'string' && computed.startsWith('#ERROR')
      return (
        <span className={`grid-view__cell-text grid-view__cell-text--computed ${isError ? 'grid-view__cell-text--error' : ''}`}>
          {display || <span className="grid-view__cell-placeholder">&mdash;</span>}
        </span>
      )
    }

    if (isEditing) {
      if (field.type === DbFieldType.Select && field.options) {
        return (
          <select
            className="grid-view__cell-select"
            value={editValue}
            onChange={(e) => { setEditValue(e.target.value); onCellChange(row.id, field.id, e.target.value); setEditingCell(null) }}
            onBlur={() => setEditingCell(null)}
            autoFocus
          >
            <option value="">&mdash;</option>
            {field.options.choices.map((c) => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>
        )
      }
      return (
        <input
          className="grid-view__cell-input"
          type={field.type === DbFieldType.Number ? 'number' : field.type === DbFieldType.Date ? 'date' : 'text'}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={commitEdit}
          onKeyDown={handleCellInputKeyDown}
          autoFocus
        />
      )
    }

    if (field.type === DbFieldType.Checkbox) {
      return (
        <input
          type="checkbox"
          className="grid-view__checkbox"
          checked={val === true}
          onChange={(e) => onCellChange(row.id, field.id, e.target.checked)}
        />
      )
    }

    if (field.type === DbFieldType.Select && val) {
      const choice = field.options?.choices.find((c) => c.name === val)
      return (
        <span
          className="grid-view__tag"
          style={{ backgroundColor: choice?.color ? `${choice.color}20` : undefined, color: choice?.color }}
          onClick={() => startEdit(row.id, field.id, val)}
        >
          {String(val)}
        </span>
      )
    }

    if (field.type === DbFieldType.Url && val) {
      return <a className="grid-view__link" href={String(val)} target="_blank" rel="noopener noreferrer">{String(val)}</a>
    }

    const display = val !== null && val !== undefined ? String(val) : ''
    return (
      <span className="grid-view__cell-text" onClick={() => startEdit(row.id, field.id, val ?? null)}>
        {display || <span className="grid-view__cell-placeholder">&mdash;</span>}
      </span>
    )
  }

  return (
    <div className="grid-view" role="grid" aria-label="Data table">
      <div className="grid-view__table-wrapper">
        <table
          className="grid-view__table"
          ref={tableRef}
          onKeyDown={handleTableKeyDown}
        >
          <thead>
            <tr role="row">
              <th className="grid-view__row-num" role="columnheader">#</th>
              {visibleFields.map((field) => (
                <th key={field.id} className="grid-view__header" style={{ width: field.width ?? 160 }} role="columnheader">
                  <span className="grid-view__header-name">{field.name}</span>
                </th>
              ))}
              <th className="grid-view__add-field" style={{ position: 'relative' }}>
                <button className="grid-view__add-field-btn" onClick={() => setShowFieldPopover((p) => !p)} title="Add field">
                  <Plus size={14} />
                </button>
                {showFieldPopover && (
                  <FieldConfigPopover
                    tables={tablesMap}
                    currentTableId={currentTableId ?? ''}
                    currentFields={fields}
                    onCreateField={(name, type, config) => {
                      onAddField(name, type, config)
                      setShowFieldPopover(false)
                    }}
                    onClose={() => setShowFieldPopover(false)}
                  />
                )}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIdx) => {
              const bgColor = rowColors?.[row.id]
              return (
              <tr
                key={row.id}
                className="grid-view__row"
                role="row"
                style={bgColor ? { backgroundColor: bgColor } : undefined}
                onContextMenu={(e) => { e.preventDefault(); onDeleteRow(row.id) }}
                onDoubleClick={() => onRowClick?.(row.id)}
              >
                <td className="grid-view__row-num">{rowIdx + 1}</td>
                {visibleFields.map((field, colIdx) => {
                  const isFocused = focusedRow === rowIdx && focusedCol === colIdx
                  return (
                    <td
                      key={field.id}
                      className={`grid-view__cell ${isFocused ? 'grid-view__cell--focused' : ''}`}
                      style={{ width: field.width ?? 160 }}
                      role="gridcell"
                      tabIndex={isFocused ? 0 : -1}
                      data-row={rowIdx}
                      data-col={colIdx}
                      onFocus={() => handleCellFocus(rowIdx, colIdx)}
                      onClick={() => focusCell(rowIdx, colIdx)}
                      aria-label={`${field.name}: ${row.cells[field.id] ?? 'empty'}`}
                    >
                      {renderCell(row, field)}
                    </td>
                  )
                })}
                <td />
              </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <button className="grid-view__add-row" onClick={onAddRow}>
        <Plus size={14} /> New row
      </button>
    </div>
  )
}
