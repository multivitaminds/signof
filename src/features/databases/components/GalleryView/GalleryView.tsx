import { FileText, Plus } from 'lucide-react'
import type { DbField, DbRow } from '../../types'
import './GalleryView.css'

interface GalleryViewProps {
  fields: DbField[]
  rows: DbRow[]
  titleFieldId: string
  onRowClick: (rowId: string) => void
  onAddRow: () => void
}

export default function GalleryView({ fields, rows, titleFieldId, onRowClick, onAddRow }: GalleryViewProps) {
  const displayFields = fields.filter((f) => f.id !== titleFieldId).slice(0, 3)

  return (
    <div className="gallery-view">
      {rows.map((row) => {
        const title = row.cells[titleFieldId] ? String(row.cells[titleFieldId]) : 'Untitled'

        return (
          <button key={row.id} className="gallery-view__card" onClick={() => onRowClick(row.id)}>
            <div className="gallery-view__card-cover">
              <FileText size={24} />
            </div>
            <div className="gallery-view__card-body">
              <h3 className="gallery-view__card-title">{title}</h3>
              {displayFields.map((field) => {
                const val = row.cells[field.id]
                if (val === null || val === undefined || val === '') return null
                return (
                  <div key={field.id} className="gallery-view__card-field">
                    <span className="gallery-view__card-label">{field.name}</span>
                    <span className="gallery-view__card-value">{String(val)}</span>
                  </div>
                )
              })}
            </div>
          </button>
        )
      })}
      <button className="gallery-view__add-card" onClick={onAddRow}>
        <Plus size={20} />
        <span>New</span>
      </button>
    </div>
  )
}
