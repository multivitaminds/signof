import { Plus } from 'lucide-react'
import type { DbField, DbRow, CellValue } from '../../types'
import './KanbanView.css'

interface KanbanViewProps {
  groupField: DbField | undefined
  groups: Record<string, DbRow[]>
  titleFieldId: string
  onAddRow: (cells?: Record<string, CellValue>) => void
  onRowClick: (rowId: string) => void
}

export default function KanbanView({ groupField, groups, titleFieldId, onAddRow, onRowClick }: KanbanViewProps) {
  const columns = groupField?.options?.choices.map((c) => c.name) ?? Object.keys(groups)
  const uncategorized = groups['Uncategorized'] ?? []

  return (
    <div className="kanban-view">
      {columns.map((colName) => {
        const rows = groups[colName] ?? []
        const choice = groupField?.options?.choices.find((c) => c.name === colName)
        const color = choice?.color ?? '#94A3B8'

        return (
          <div key={colName} className="kanban-view__column">
            <div className="kanban-view__column-header">
              <span className="kanban-view__column-dot" style={{ backgroundColor: color }} />
              <span className="kanban-view__column-name">{colName}</span>
              <span className="kanban-view__column-count">{rows.length}</span>
            </div>
            <div className="kanban-view__cards">
              {rows.map((row) => (
                <button
                  key={row.id}
                  className="kanban-view__card"
                  onClick={() => onRowClick(row.id)}
                >
                  <span className="kanban-view__card-title">
                    {row.cells[titleFieldId] ? String(row.cells[titleFieldId]) : 'Untitled'}
                  </span>
                </button>
              ))}
              <button
                className="kanban-view__add-card"
                onClick={() => onAddRow(groupField ? { [groupField.id]: colName } : {})}
              >
                <Plus size={14} /> Add
              </button>
            </div>
          </div>
        )
      })}
      {uncategorized.length > 0 && (
        <div className="kanban-view__column">
          <div className="kanban-view__column-header">
            <span className="kanban-view__column-dot" style={{ backgroundColor: '#94A3B8' }} />
            <span className="kanban-view__column-name">Uncategorized</span>
            <span className="kanban-view__column-count">{uncategorized.length}</span>
          </div>
          <div className="kanban-view__cards">
            {uncategorized.map((row) => (
              <button key={row.id} className="kanban-view__card" onClick={() => onRowClick(row.id)}>
                <span className="kanban-view__card-title">
                  {row.cells[titleFieldId] ? String(row.cells[titleFieldId]) : 'Untitled'}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
