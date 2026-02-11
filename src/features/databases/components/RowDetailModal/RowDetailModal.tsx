import { useState, useCallback, useMemo } from 'react'
import { X, ChevronLeft, ChevronRight, Trash2, Clock } from 'lucide-react'
import type { DbTable, DbField, DbRow, CellValue } from '../../types'
import { DbFieldType } from '../../types'
import { resolveRelation } from '../../lib/relationResolver'
import { evaluateFormula } from '../../lib/formulaEngine'
import RelationFieldEditor from '../RelationFieldEditor/RelationFieldEditor'
import './RowDetailModal.css'

interface RowDetailModalProps {
  table: DbTable
  tables: Record<string, DbTable>
  row: DbRow
  rowIndex: number
  totalRows: number
  onClose: () => void
  onUpdateCell: (rowId: string, fieldId: string, value: CellValue) => void
  onDeleteRow: (rowId: string) => void
  onNavigate: (direction: 'prev' | 'next') => void
}

// Field types that are computed and read-only
const COMPUTED_FIELD_TYPES: ReadonlySet<string> = new Set([
  DbFieldType.Lookup,
  DbFieldType.Rollup,
  DbFieldType.Formula,
  DbFieldType.CreatedTime,
  DbFieldType.LastEditedTime,
])

function formatDateTime(dateStr: string): string {
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function RowDetailModal({
  table,
  tables,
  row,
  rowIndex,
  totalRows,
  onClose,
  onUpdateCell,
  onDeleteRow,
  onNavigate,
}: RowDetailModalProps) {
  const [confirmDelete, setConfirmDelete] = useState(false)

  const primaryField = useMemo(
    () => table.fields.find((f) => f.type === DbFieldType.Text),
    [table.fields]
  )

  const title = useMemo(() => {
    if (!primaryField) return 'Untitled'
    const val = row.cells[primaryField.id]
    return val ? String(val) : 'Untitled'
  }, [primaryField, row.cells])

  const handleOverlayClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose()
  }, [onClose])

  const handleDelete = useCallback(() => {
    if (confirmDelete) {
      onDeleteRow(row.id)
      onClose()
    } else {
      setConfirmDelete(true)
    }
  }, [confirmDelete, onDeleteRow, row.id, onClose])

  const handleCellChange = useCallback((fieldId: string, value: CellValue) => {
    onUpdateCell(row.id, fieldId, value)
  }, [row.id, onUpdateCell])

  const computeCellValue = useCallback((field: DbField): CellValue => {
    if (field.type === DbFieldType.Lookup || field.type === DbFieldType.Rollup) {
      return resolveRelation(row, field, tables, table.fields)
    }
    if (field.type === DbFieldType.Formula && field.formulaConfig) {
      return evaluateFormula(field.formulaConfig.expression, row, table.fields)
    }
    if (field.type === DbFieldType.CreatedTime) {
      return row.createdAt
    }
    if (field.type === DbFieldType.LastEditedTime) {
      return row.updatedAt
    }
    return row.cells[field.id] ?? null
  }, [row, tables, table.fields])

  const renderFieldInput = useCallback((field: DbField) => {
    const isComputed = COMPUTED_FIELD_TYPES.has(field.type)

    // Computed / read-only fields
    if (isComputed) {
      const computed = computeCellValue(field)
      const display = computed !== null && computed !== undefined ? String(computed) : ''
      if (field.type === DbFieldType.CreatedTime || field.type === DbFieldType.LastEditedTime) {
        return (
          <span className="row-detail__field-readonly">
            {display ? formatDateTime(display) : '\u2014'}
          </span>
        )
      }
      const isError = typeof computed === 'string' && computed.startsWith('#ERROR')
      return (
        <span className={`row-detail__field-readonly ${isError ? 'row-detail__field-readonly--error' : ''}`}>
          {display || '\u2014'}
        </span>
      )
    }

    // Relation field
    if (field.type === DbFieldType.Relation) {
      return (
        <RelationFieldEditor
          field={field}
          value={row.cells[field.id] ?? null}
          tables={tables}
          onChange={(val) => handleCellChange(field.id, val)}
        />
      )
    }

    const val = row.cells[field.id]

    // Checkbox
    if (field.type === DbFieldType.Checkbox) {
      return (
        <label className="row-detail__checkbox-label">
          <input
            type="checkbox"
            className="row-detail__checkbox"
            checked={val === true}
            onChange={(e) => handleCellChange(field.id, e.target.checked)}
          />
          <span>{val ? 'Yes' : 'No'}</span>
        </label>
      )
    }

    // Select
    if (field.type === DbFieldType.Select && field.options) {
      return (
        <select
          className="row-detail__select"
          value={val !== null && val !== undefined ? String(val) : ''}
          onChange={(e) => handleCellChange(field.id, e.target.value || null)}
        >
          <option value="">-- none --</option>
          {field.options.choices.map((c) => (
            <option key={c.id} value={c.name}>{c.name}</option>
          ))}
        </select>
      )
    }

    // MultiSelect
    if (field.type === DbFieldType.MultiSelect && field.options) {
      const selected = Array.isArray(val) ? val.map(String) : []
      return (
        <div className="row-detail__multi-select">
          {field.options.choices.map((c) => {
            const isChecked = selected.includes(c.name)
            return (
              <label key={c.id} className="row-detail__multi-select-option">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => {
                    const updated = isChecked
                      ? selected.filter((s) => s !== c.name)
                      : [...selected, c.name]
                    handleCellChange(field.id, updated.length > 0 ? updated : null)
                  }}
                />
                <span
                  className="row-detail__multi-select-tag"
                  style={{ backgroundColor: `${c.color}20`, color: c.color }}
                >
                  {c.name}
                </span>
              </label>
            )
          })}
        </div>
      )
    }

    // Number
    if (field.type === DbFieldType.Number) {
      return (
        <input
          className="row-detail__input"
          type="number"
          value={val !== null && val !== undefined ? String(val) : ''}
          onChange={(e) => handleCellChange(field.id, e.target.value ? Number(e.target.value) : null)}
          placeholder="Enter number..."
        />
      )
    }

    // Date
    if (field.type === DbFieldType.Date) {
      return (
        <input
          className="row-detail__input"
          type="date"
          value={val !== null && val !== undefined ? String(val).slice(0, 10) : ''}
          onChange={(e) => handleCellChange(field.id, e.target.value || null)}
        />
      )
    }

    // Text, URL, Email, Phone
    const inputType = field.type === DbFieldType.Email ? 'email'
      : field.type === DbFieldType.Url ? 'url'
      : field.type === DbFieldType.Phone ? 'tel'
      : 'text'

    return (
      <input
        className="row-detail__input"
        type={inputType}
        value={val !== null && val !== undefined ? String(val) : ''}
        onChange={(e) => handleCellChange(field.id, e.target.value || null)}
        placeholder={`Enter ${field.name.toLowerCase()}...`}
      />
    )
  }, [row.cells, tables, computeCellValue, handleCellChange])

  // Activity log entries
  const activityEntries = useMemo(() => {
    const entries: Array<{ label: string; time: string }> = []
    entries.push({ label: 'Created', time: row.createdAt })
    if (row.updatedAt !== row.createdAt) {
      entries.push({ label: 'Last updated', time: row.updatedAt })
    }
    return entries
  }, [row.createdAt, row.updatedAt])

  return (
    <div
      className="modal-overlay"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-label={`Record: ${title}`}
    >
      <div className="modal-content row-detail">
        {/* Header */}
        <div className="modal-header row-detail__header">
          <div className="row-detail__header-left">
            <h2 className="row-detail__title">{title}</h2>
            <span className="row-detail__row-counter">
              {rowIndex + 1} of {totalRows}
            </span>
          </div>
          <div className="row-detail__header-actions">
            <button
              className="row-detail__nav-btn"
              onClick={() => onNavigate('prev')}
              disabled={rowIndex === 0}
              aria-label="Previous row"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              className="row-detail__nav-btn"
              onClick={() => onNavigate('next')}
              disabled={rowIndex >= totalRows - 1}
              aria-label="Next row"
            >
              <ChevronRight size={16} />
            </button>
            <button className="modal-close" onClick={onClose} aria-label="Close">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Fields */}
        <div className="row-detail__fields">
          {table.fields.map((field) => (
            <div key={field.id} className="row-detail__field">
              <label className="row-detail__field-label">
                {field.name}
                {field.required && <span className="row-detail__required">*</span>}
              </label>
              <div className="row-detail__field-value">
                {renderFieldInput(field)}
              </div>
            </div>
          ))}
        </div>

        {/* Activity Log */}
        <div className="row-detail__activity">
          <h3 className="row-detail__activity-title">
            <Clock size={14} />
            Activity
          </h3>
          <div className="row-detail__activity-list">
            {activityEntries.map((entry, i) => (
              <div key={i} className="row-detail__activity-entry">
                <span className="row-detail__activity-label">{entry.label}</span>
                <span className="row-detail__activity-time">{formatDateTime(entry.time)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="row-detail__footer">
          <button
            className={`btn-danger row-detail__delete-btn ${confirmDelete ? 'row-detail__delete-btn--confirm' : ''}`}
            onClick={handleDelete}
            aria-label={confirmDelete ? 'Confirm delete' : 'Delete record'}
          >
            <Trash2 size={14} />
            {confirmDelete ? 'Confirm Delete' : 'Delete Record'}
          </button>
        </div>
      </div>
    </div>
  )
}
