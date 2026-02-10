import { useState, useCallback } from 'react'
import { Plus } from 'lucide-react'
import type { DbField, DbRow, CellValue } from '../../types'
import { DbFieldType } from '../../types'
import './GridView.css'

interface GridViewProps {
  fields: DbField[]
  rows: DbRow[]
  hiddenFields: string[]
  fieldOrder: string[]
  onCellChange: (rowId: string, fieldId: string, value: CellValue) => void
  onAddRow: () => void
  onAddField: () => void
  onDeleteRow: (rowId: string) => void
}

export default function GridView({
  fields, rows, hiddenFields, fieldOrder, onCellChange, onAddRow, onAddField, onDeleteRow,
}: GridViewProps) {
  const [editingCell, setEditingCell] = useState<{ rowId: string; fieldId: string } | null>(null)
  const [editValue, setEditValue] = useState('')

  const visibleFields = fieldOrder
    .map((id) => fields.find((f) => f.id === id))
    .filter((f): f is DbField => f !== undefined && !hiddenFields.includes(f.id))

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

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') { e.preventDefault(); commitEdit() }
    if (e.key === 'Escape') setEditingCell(null)
  }, [commitEdit])

  const renderCell = (row: DbRow, field: DbField) => {
    const val = row.cells[field.id]
    const isEditing = editingCell?.rowId === row.id && editingCell?.fieldId === field.id

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
            <option value="">—</option>
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
          onKeyDown={handleKeyDown}
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
        {display || <span className="grid-view__cell-placeholder">—</span>}
      </span>
    )
  }

  return (
    <div className="grid-view">
      <div className="grid-view__table-wrapper">
        <table className="grid-view__table">
          <thead>
            <tr>
              <th className="grid-view__row-num">#</th>
              {visibleFields.map((field) => (
                <th key={field.id} className="grid-view__header" style={{ width: field.width ?? 160 }}>
                  <span className="grid-view__header-name">{field.name}</span>
                </th>
              ))}
              <th className="grid-view__add-field">
                <button className="grid-view__add-field-btn" onClick={onAddField} title="Add field">
                  <Plus size={14} />
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr key={row.id} className="grid-view__row" onContextMenu={(e) => { e.preventDefault(); onDeleteRow(row.id) }}>
                <td className="grid-view__row-num">{idx + 1}</td>
                {visibleFields.map((field) => (
                  <td key={field.id} className="grid-view__cell" style={{ width: field.width ?? 160 }}>
                    {renderCell(row, field)}
                  </td>
                ))}
                <td />
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button className="grid-view__add-row" onClick={onAddRow}>
        <Plus size={14} /> New row
      </button>
    </div>
  )
}
