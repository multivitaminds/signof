import { useState, useCallback, useMemo } from 'react'
import { Plus, GripVertical } from 'lucide-react'
import type { DbTable, DbField, CellValue } from '../../types'
import { DbFieldType } from '../../types'
import './KanbanView.css'

interface KanbanViewProps {
  table: DbTable
  tables: Record<string, DbTable>
  groupFieldId: string
  onUpdateCell: (rowId: string, fieldId: string, value: CellValue) => void
  onAddRow: (cells?: Record<string, CellValue>) => void
  onDeleteRow: (rowId: string) => void
}

export default function KanbanView({
  table,
  tables: _tables,
  groupFieldId,
  onUpdateCell,
  onAddRow,
  onDeleteRow,
}: KanbanViewProps) {
  const [dragRowId, setDragRowId] = useState<string | null>(null)
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null)

  // Suppress unused variable
  void _tables

  const groupField = useMemo(
    () => table.fields.find((f) => f.id === groupFieldId),
    [table.fields, groupFieldId]
  )

  const primaryField = useMemo(
    () => table.fields.find((f) => f.type === DbFieldType.Text),
    [table.fields]
  )

  const previewFields = useMemo(
    () =>
      table.fields
        .filter(
          (f) =>
            f.id !== primaryField?.id &&
            f.id !== groupFieldId &&
            f.type !== DbFieldType.CreatedTime &&
            f.type !== DbFieldType.LastEditedTime
        )
        .slice(0, 3),
    [table.fields, primaryField?.id, groupFieldId]
  )

  const columnNames = useMemo(() => {
    if (groupField?.options?.choices) {
      return groupField.options.choices.map((c) => c.name)
    }
    const unique = new Set<string>()
    for (const row of table.rows) {
      const val = row.cells[groupFieldId]
      if (val && typeof val === 'string') unique.add(val)
    }
    return Array.from(unique)
  }, [groupField, table.rows, groupFieldId])

  const rowsByColumn = useMemo(() => {
    const map: Record<string, typeof table.rows> = {}
    for (const name of columnNames) {
      map[name] = []
    }
    map['__uncategorized'] = []
    for (const row of table.rows) {
      const val = row.cells[groupFieldId]
      const key = val && typeof val === 'string' && columnNames.includes(val) ? val : '__uncategorized'
      if (!map[key]) map[key] = []
      map[key]!.push(row)
    }
    return map
  }, [table.rows, groupFieldId, columnNames])

  const getChoiceColor = useCallback(
    (name: string): string => {
      const choice = groupField?.options?.choices.find((c) => c.name === name)
      return choice?.color ?? '#94A3B8'
    },
    [groupField]
  )

  const handleDragStart = useCallback(
    (e: React.DragEvent, rowId: string) => {
      setDragRowId(rowId)
      e.dataTransfer.effectAllowed = 'move'
      e.dataTransfer.setData('text/plain', rowId)
    },
    []
  )

  const handleDragOver = useCallback(
    (e: React.DragEvent, columnName: string) => {
      e.preventDefault()
      e.dataTransfer.dropEffect = 'move'
      setDragOverColumn(columnName)
    },
    []
  )

  const handleDragLeave = useCallback(() => {
    setDragOverColumn(null)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent, columnName: string) => {
      e.preventDefault()
      setDragOverColumn(null)
      if (!dragRowId) return
      const newValue = columnName === '__uncategorized' ? null : columnName
      onUpdateCell(dragRowId, groupFieldId, newValue)
      setDragRowId(null)
    },
    [dragRowId, groupFieldId, onUpdateCell]
  )

  const handleDragEnd = useCallback(() => {
    setDragRowId(null)
    setDragOverColumn(null)
  }, [])

  const handleAddToColumn = useCallback(
    (columnName: string) => {
      const cells: Record<string, CellValue> = {}
      if (columnName !== '__uncategorized') {
        cells[groupFieldId] = columnName
      }
      onAddRow(cells)
    },
    [groupFieldId, onAddRow]
  )

  const renderPreviewValue = useCallback(
    (field: DbField, value: CellValue): string => {
      if (value === null || value === undefined) return ''
      if (field.type === DbFieldType.Checkbox) return value ? 'Yes' : 'No'
      if (field.type === DbFieldType.Select && field.options) {
        return String(value)
      }
      return String(value)
    },
    []
  )

  const renderColumn = useCallback(
    (columnName: string, displayName: string, color: string) => {
      const rows = rowsByColumn[columnName] ?? []
      const isOver = dragOverColumn === columnName

      return (
        <div
          key={columnName}
          className={`kanban-view__column ${isOver ? 'kanban-view__column--drag-over' : ''}`}
          onDragOver={(e) => handleDragOver(e, columnName)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, columnName)}
        >
          <div className="kanban-view__column-header">
            <span className="kanban-view__column-dot" style={{ backgroundColor: color }} />
            <span className="kanban-view__column-name">{displayName}</span>
            <span className="kanban-view__column-count">{rows.length}</span>
          </div>
          <div className="kanban-view__cards">
            {rows.length === 0 && (
              <div className="kanban-view__empty">No items</div>
            )}
            {rows.map((row) => {
              const title = primaryField
                ? (row.cells[primaryField.id] ? String(row.cells[primaryField.id]) : 'Untitled')
                : 'Untitled'
              const isDragging = dragRowId === row.id

              return (
                <div
                  key={row.id}
                  className={`kanban-view__card ${isDragging ? 'kanban-view__card--dragging' : ''}`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, row.id)}
                  onDragEnd={handleDragEnd}
                >
                  <div className="kanban-view__card-header">
                    <GripVertical size={12} className="kanban-view__card-grip" />
                    <span className="kanban-view__card-title">{title}</span>
                  </div>
                  {previewFields.length > 0 && (
                    <div className="kanban-view__card-fields">
                      {previewFields.map((field) => {
                        const val = row.cells[field.id]
                        if (val === null || val === undefined || val === '') return null
                        const displayVal = renderPreviewValue(field, val)
                        if (!displayVal) return null

                        if (field.type === DbFieldType.Select) {
                          const choice = field.options?.choices.find((c) => c.name === val)
                          return (
                            <span
                              key={field.id}
                              className="kanban-view__card-tag"
                              style={{
                                backgroundColor: choice?.color ? `${choice.color}20` : undefined,
                                color: choice?.color,
                              }}
                            >
                              {displayVal}
                            </span>
                          )
                        }

                        return (
                          <div key={field.id} className="kanban-view__card-prop">
                            <span className="kanban-view__card-prop-label">{field.name}</span>
                            <span className="kanban-view__card-prop-value">{displayVal}</span>
                          </div>
                        )
                      })}
                    </div>
                  )}
                  <button
                    className="kanban-view__card-delete"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDeleteRow(row.id)
                    }}
                    aria-label={`Delete ${title}`}
                  >
                    &times;
                  </button>
                </div>
              )
            })}
          </div>
          <button
            className="kanban-view__add-card"
            onClick={() => handleAddToColumn(columnName)}
          >
            <Plus size={14} /> New
          </button>
        </div>
      )
    },
    [
      rowsByColumn, dragOverColumn, dragRowId, primaryField, previewFields,
      handleDragOver, handleDragLeave, handleDrop, handleDragStart,
      handleDragEnd, handleAddToColumn, renderPreviewValue, onDeleteRow,
    ]
  )

  return (
    <div className="kanban-view" role="region" aria-label="Kanban board">
      {columnNames.map((name) => renderColumn(name, name, getChoiceColor(name)))}
      {(rowsByColumn['__uncategorized']?.length ?? 0) > 0 &&
        renderColumn('__uncategorized', 'Uncategorized', '#94A3B8')}
    </div>
  )
}
