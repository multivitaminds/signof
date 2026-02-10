import { useState, useCallback, useRef } from 'react'
import { useWorkspaceStore } from '../../stores/useWorkspaceStore'
import type { Block } from '../../types'
import './SimpleTableBlock.css'

interface SimpleTableBlockProps {
  block: Block
  onContentChange: (content: string) => void
}

const DEFAULT_ROWS: string[][] = [
  ['', ''],
  ['', ''],
]

export default function SimpleTableBlock({
  block,
}: SimpleTableBlockProps) {
  const rows = block.properties.rows ?? DEFAULT_ROWS
  const [editingCell, setEditingCell] = useState<{ row: number; col: number } | null>(null)
  const [editValue, setEditValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const updateRows = useCallback(
    (newRows: string[][]) => {
      useWorkspaceStore.setState((state) => {
        const existing = state.blocks[block.id]
        if (!existing) return state
        return {
          blocks: {
            ...state.blocks,
            [block.id]: {
              ...existing,
              properties: { ...existing.properties, rows: newRows },
            },
          },
        }
      })
    },
    [block.id]
  )

  const handleCellClick = useCallback(
    (row: number, col: number) => {
      setEditingCell({ row, col })
      setEditValue(rows[row]?.[col] ?? '')
      setTimeout(() => inputRef.current?.focus(), 0)
    },
    [rows]
  )

  const handleCellBlur = useCallback(() => {
    if (!editingCell) return
    const newRows = rows.map((r) => [...r])
    if (newRows[editingCell.row]) {
      newRows[editingCell.row]![editingCell.col] = editValue
    }
    updateRows(newRows)
    setEditingCell(null)
  }, [editingCell, editValue, rows, updateRows])

  const handleCellKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!editingCell) return

      if (e.key === 'Tab') {
        e.preventDefault()
        handleCellBlur()

        const totalCols = rows[0]?.length ?? 2
        const totalRows = rows.length

        let nextCol = editingCell.col + (e.shiftKey ? -1 : 1)
        let nextRow = editingCell.row

        if (nextCol >= totalCols) {
          nextCol = 0
          nextRow++
        } else if (nextCol < 0) {
          nextCol = totalCols - 1
          nextRow--
        }

        if (nextRow >= 0 && nextRow < totalRows) {
          setTimeout(() => handleCellClick(nextRow, nextCol), 0)
        }
      } else if (e.key === 'Enter') {
        e.preventDefault()
        handleCellBlur()
      } else if (e.key === 'Escape') {
        setEditingCell(null)
      }
    },
    [editingCell, rows, handleCellBlur, handleCellClick]
  )

  const handleAddRow = useCallback(() => {
    const colCount = rows[0]?.length ?? 2
    const newRow = Array(colCount).fill('') as string[]
    updateRows([...rows, newRow])
  }, [rows, updateRows])

  const handleAddColumn = useCallback(() => {
    const newRows = rows.map((row) => [...row, ''])
    updateRows(newRows)
  }, [rows, updateRows])

  return (
    <div className="block-table">
      <div className="block-table__grid" role="table" aria-label="Table">
        {rows.map((row, rowIdx) => (
          <div key={rowIdx} className="block-table__row" role="row">
            {row.map((cell, colIdx) => (
              <div
                key={colIdx}
                className={`block-table__cell ${
                  editingCell?.row === rowIdx && editingCell?.col === colIdx
                    ? 'block-table__cell--editing'
                    : ''
                }`}
                role="cell"
                onClick={() => handleCellClick(rowIdx, colIdx)}
              >
                {editingCell?.row === rowIdx && editingCell?.col === colIdx ? (
                  <input
                    ref={inputRef}
                    className="block-table__cell-input"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={handleCellBlur}
                    onKeyDown={handleCellKeyDown}
                  />
                ) : (
                  <span className="block-table__cell-text">
                    {cell || '\u00A0'}
                  </span>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="block-table__actions">
        <button
          className="block-table__action-btn"
          onClick={handleAddRow}
          aria-label="Add row"
        >
          + Add row
        </button>
        <button
          className="block-table__action-btn"
          onClick={handleAddColumn}
          aria-label="Add column"
        >
          + Add column
        </button>
      </div>
    </div>
  )
}
