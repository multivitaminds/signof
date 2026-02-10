import { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import { X, Search, ChevronDown } from 'lucide-react'
import type { DbField, DbTable, CellValue } from '../../types'
import './RelationFieldEditor.css'

interface RelationFieldEditorProps {
  field: DbField
  value: CellValue
  tables: Record<string, DbTable>
  onChange: (value: CellValue) => void
}

export default function RelationFieldEditor({
  field,
  value,
  tables,
  onChange,
}: RelationFieldEditorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const config = field.relationConfig
  const targetTable = config ? tables[config.targetTableId] : undefined
  const displayFieldId = config?.targetFieldId ?? ''

  // Current linked IDs
  const linkedIds = useMemo<string[]>(() =>
    Array.isArray(value)
      ? value.map(String)
      : value
        ? [String(value)]
        : [],
    [value]
  )

  // Get display text for a row ID
  const getDisplayText = useCallback(
    (rowId: string): string => {
      if (!targetTable) return rowId
      const row = targetTable.rows.find((r) => r.id === rowId)
      if (!row) return rowId
      const cell = row.cells[displayFieldId]
      return cell !== null && cell !== undefined ? String(cell) : rowId
    },
    [targetTable, displayFieldId]
  )

  // Filter target rows by search
  const filteredRows = targetTable
    ? targetTable.rows.filter((row) => {
        if (!searchQuery.trim()) return true
        const q = searchQuery.toLowerCase()
        const cell = row.cells[displayFieldId]
        const text = cell !== null && cell !== undefined ? String(cell) : ''
        return text.toLowerCase().includes(q)
      })
    : []

  const handleToggle = useCallback(() => {
    setIsOpen((prev) => {
      if (!prev) {
        setSearchQuery('')
      }
      return !prev
    })
  }, [])

  const handleSelect = useCallback(
    (rowId: string) => {
      const allowMultiple = config?.allowMultiple ?? false
      if (allowMultiple) {
        if (linkedIds.includes(rowId)) {
          // Remove
          const updated = linkedIds.filter((id) => id !== rowId)
          onChange(updated.length > 0 ? updated : null)
        } else {
          onChange([...linkedIds, rowId])
        }
      } else {
        // Single select: toggle
        if (linkedIds.includes(rowId)) {
          onChange(null)
        } else {
          onChange([rowId])
        }
        setIsOpen(false)
      }
    },
    [config, linkedIds, onChange]
  )

  const handleRemove = useCallback(
    (rowId: string) => {
      const updated = linkedIds.filter((id) => id !== rowId)
      onChange(updated.length > 0 ? updated : null)
    },
    [linkedIds, onChange]
  )

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  // Focus search when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  if (!config || !targetTable) {
    return (
      <span className="relation-field-editor__empty">
        Configure relation
      </span>
    )
  }

  return (
    <div className="relation-field-editor" ref={dropdownRef}>
      <div
        className="relation-field-editor__display"
        onClick={handleToggle}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleToggle() }}
        aria-label={`Edit ${field.name} relation`}
        aria-expanded={isOpen}
      >
        {linkedIds.length > 0 ? (
          <div className="relation-field-editor__pills">
            {linkedIds.map((id) => (
              <span key={id} className="relation-field-editor__pill">
                <span className="relation-field-editor__pill-text">
                  {getDisplayText(id)}
                </span>
                <button
                  className="relation-field-editor__pill-remove"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleRemove(id)
                  }}
                  aria-label={`Remove ${getDisplayText(id)}`}
                >
                  <X size={10} />
                </button>
              </span>
            ))}
          </div>
        ) : (
          <span className="relation-field-editor__placeholder">
            Link record...
          </span>
        )}
        <ChevronDown size={14} className="relation-field-editor__chevron" />
      </div>

      {isOpen && (
        <div className="relation-field-editor__dropdown">
          <div className="relation-field-editor__search">
            <Search size={14} className="relation-field-editor__search-icon" />
            <input
              ref={inputRef}
              className="relation-field-editor__search-input"
              type="text"
              placeholder="Search records..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="relation-field-editor__options">
            {filteredRows.length === 0 ? (
              <div className="relation-field-editor__no-results">
                No records found
              </div>
            ) : (
              filteredRows.map((row) => {
                const isSelected = linkedIds.includes(row.id)
                const cellVal = row.cells[displayFieldId]
                const text = cellVal !== null && cellVal !== undefined ? String(cellVal) : ''
                return (
                  <button
                    key={row.id}
                    className={`relation-field-editor__option ${isSelected ? 'relation-field-editor__option--selected' : ''}`}
                    onClick={() => handleSelect(row.id)}
                    aria-label={text}
                  >
                    <span className="relation-field-editor__option-check">
                      {isSelected ? '\u2713' : ''}
                    </span>
                    <span className="relation-field-editor__option-text">{text || '\u2014'}</span>
                  </button>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
