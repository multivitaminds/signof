import { useState, useCallback, useMemo, useRef } from 'react'
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
  onCardOpen?: (rowId: string) => void
}

export default function KanbanView({
  table,
  tables: _tables,
  groupFieldId,
  onUpdateCell,
  onAddRow,
  onDeleteRow,
  onCardOpen,
}: KanbanViewProps) {
  const [dragRowId, setDragRowId] = useState<string | null>(null)
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null)
  // Keyboard navigation state
  const [focusedColIdx, setFocusedColIdx] = useState<number>(-1)
  const [focusedCardIdx, setFocusedCardIdx] = useState<number>(-1)
  const [kbMovingRowId, setKbMovingRowId] = useState<string | null>(null)
  const [kbMoveTargetCol, setKbMoveTargetCol] = useState<number>(-1)
  const boardRef = useRef<HTMLDivElement>(null)

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
  }, [table, groupFieldId, columnNames])

  // Build the full list of displayed columns (including uncategorized if non-empty)
  const displayedColumns = useMemo(() => {
    const cols = [...columnNames]
    if ((rowsByColumn['__uncategorized']?.length ?? 0) > 0) {
      cols.push('__uncategorized')
    }
    return cols
  }, [columnNames, rowsByColumn])

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

  // Focus a specific card in the DOM
  const focusCardElement = useCallback((colIdx: number, cardIdx: number) => {
    if (!boardRef.current) return
    const card = boardRef.current.querySelector<HTMLElement>(
      `[data-kanban-col="${colIdx}"][data-kanban-card="${cardIdx}"]`
    )
    if (card) {
      card.focus()
    }
  }, [])

  // Keyboard navigation handler
  const handleBoardKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (focusedColIdx < 0) return

    const currentCol = displayedColumns[focusedColIdx]
    if (!currentCol) return
    const currentCards = rowsByColumn[currentCol] ?? []

    // If in keyboard-move mode (Space was pressed)
    if (kbMovingRowId !== null) {
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault()
          setKbMoveTargetCol(Math.max(0, kbMoveTargetCol - 1))
          break
        case 'ArrowRight':
          e.preventDefault()
          setKbMoveTargetCol(Math.min(displayedColumns.length - 1, kbMoveTargetCol + 1))
          break
        case 'Enter': {
          e.preventDefault()
          const targetColName = displayedColumns[kbMoveTargetCol]
          if (targetColName) {
            const newValue = targetColName === '__uncategorized' ? null : targetColName
            onUpdateCell(kbMovingRowId, groupFieldId, newValue)
          }
          setKbMovingRowId(null)
          setKbMoveTargetCol(-1)
          break
        }
        case 'Escape':
          e.preventDefault()
          setKbMovingRowId(null)
          setKbMoveTargetCol(-1)
          break
      }
      return
    }

    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault()
        if (focusedColIdx > 0) {
          const newCol = focusedColIdx - 1
          setFocusedColIdx(newCol)
          setFocusedCardIdx(0)
          focusCardElement(newCol, 0)
        }
        break
      case 'ArrowRight':
        e.preventDefault()
        if (focusedColIdx < displayedColumns.length - 1) {
          const newCol = focusedColIdx + 1
          setFocusedColIdx(newCol)
          setFocusedCardIdx(0)
          focusCardElement(newCol, 0)
        }
        break
      case 'ArrowUp':
        e.preventDefault()
        if (focusedCardIdx > 0) {
          const newCard = focusedCardIdx - 1
          setFocusedCardIdx(newCard)
          focusCardElement(focusedColIdx, newCard)
        }
        break
      case 'ArrowDown':
        e.preventDefault()
        if (focusedCardIdx < currentCards.length - 1) {
          const newCard = focusedCardIdx + 1
          setFocusedCardIdx(newCard)
          focusCardElement(focusedColIdx, newCard)
        }
        break
      case 'Enter': {
        e.preventDefault()
        const row = currentCards[focusedCardIdx]
        if (row && onCardOpen) {
          onCardOpen(row.id)
        }
        break
      }
      case ' ': {
        e.preventDefault()
        const row = currentCards[focusedCardIdx]
        if (row) {
          setKbMovingRowId(row.id)
          setKbMoveTargetCol(focusedColIdx)
        }
        break
      }
      case 'Escape':
        e.preventDefault()
        setFocusedColIdx(-1)
        setFocusedCardIdx(-1)
        break
    }
  }, [
    focusedColIdx, focusedCardIdx, displayedColumns, rowsByColumn,
    kbMovingRowId, kbMoveTargetCol, focusCardElement, onUpdateCell,
    groupFieldId, onCardOpen,
  ])

  const handleCardFocus = useCallback((colIdx: number, cardIdx: number) => {
    setFocusedColIdx(colIdx)
    setFocusedCardIdx(cardIdx)
  }, [])

  const renderColumn = useCallback(
    (columnName: string, displayName: string, color: string, colIdx: number) => {
      const rows = rowsByColumn[columnName] ?? []
      const isOver = dragOverColumn === columnName
      const isKbMoveTarget = kbMovingRowId !== null && kbMoveTargetCol === colIdx

      return (
        <div
          key={columnName}
          className={`kanban-view__column ${isOver ? 'kanban-view__column--drag-over' : ''} ${isKbMoveTarget ? 'kanban-view__column--kb-move-target' : ''}`}
          onDragOver={(e) => handleDragOver(e, columnName)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, columnName)}
          role="group"
          aria-label={`Column: ${displayName}, ${rows.length} items`}
        >
          <div className="kanban-view__column-header">
            <span className="kanban-view__column-dot" style={{ backgroundColor: color }} />
            <span className="kanban-view__column-name">{displayName}</span>
            <span className="kanban-view__column-count">{rows.length}</span>
          </div>
          <div className="kanban-view__cards" role="list">
            {rows.length === 0 && (
              <div className="kanban-view__empty">No items</div>
            )}
            {rows.map((row, cardIdx) => {
              const title = primaryField
                ? (row.cells[primaryField.id] ? String(row.cells[primaryField.id]) : 'Untitled')
                : 'Untitled'
              const isDragging = dragRowId === row.id
              const isKbMoving = kbMovingRowId === row.id
              const isFocused = focusedColIdx === colIdx && focusedCardIdx === cardIdx

              return (
                <div
                  key={row.id}
                  className={`kanban-view__card ${isDragging ? 'kanban-view__card--dragging' : ''} ${isKbMoving ? 'kanban-view__card--kb-moving' : ''} ${isFocused ? 'kanban-view__card--focused' : ''}`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, row.id)}
                  onDragEnd={handleDragEnd}
                  role="listitem"
                  tabIndex={isFocused ? 0 : -1}
                  data-kanban-col={colIdx}
                  data-kanban-card={cardIdx}
                  onFocus={() => handleCardFocus(colIdx, cardIdx)}
                  aria-label={title}
                  aria-grabbed={isKbMoving}
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
      focusedColIdx, focusedCardIdx, kbMovingRowId, kbMoveTargetCol,
      handleCardFocus,
    ]
  )

  return (
    <div
      className="kanban-view"
      role="region"
      aria-label="Kanban board"
      ref={boardRef}
      onKeyDown={handleBoardKeyDown}
    >
      {displayedColumns.map((name, colIdx) => {
        const displayName = name === '__uncategorized' ? 'Uncategorized' : name
        const color = name === '__uncategorized' ? '#94A3B8' : getChoiceColor(name)
        return renderColumn(name, displayName, color, colIdx)
      })}
      {kbMovingRowId && (
        <div className="kanban-view__kb-move-hint" role="status" aria-live="assertive">
          Use arrow keys to choose column, Enter to drop, Escape to cancel
        </div>
      )}
    </div>
  )
}
