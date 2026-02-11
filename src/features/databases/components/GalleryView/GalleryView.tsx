import { useMemo, useCallback } from 'react'
import { FileText, Plus, Image } from 'lucide-react'
import type { DbTable, DbField, CellValue } from '../../types'
import { DbFieldType } from '../../types'
import './GalleryView.css'

interface GalleryViewProps {
  table: DbTable
  tables: Record<string, DbTable>
  onUpdateCell: (rowId: string, fieldId: string, value: CellValue) => void
}

/** Color palette for placeholder covers when no image URL is present */
const COVER_COLORS = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
  'linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)',
  'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)',
]

function isImageUrl(url: string): boolean {
  const lower = url.toLowerCase()
  return (
    lower.endsWith('.png') ||
    lower.endsWith('.jpg') ||
    lower.endsWith('.jpeg') ||
    lower.endsWith('.gif') ||
    lower.endsWith('.webp') ||
    lower.endsWith('.svg') ||
    lower.includes('unsplash.com') ||
    lower.includes('images.')
  )
}

export default function GalleryView({
  table,
  tables: _tables,
  onUpdateCell: _onUpdateCell,
}: GalleryViewProps) {
  // Suppress unused variables
  void _tables
  void _onUpdateCell

  const primaryField = useMemo(
    () => table.fields.find((f) => f.type === DbFieldType.Text),
    [table.fields]
  )

  const imageField = useMemo(
    () =>
      table.fields.find(
        (f) => f.type === DbFieldType.Url || f.type === DbFieldType.Attachment
      ),
    [table.fields]
  )

  const previewFields = useMemo(
    () =>
      table.fields
        .filter(
          (f) =>
            f.id !== primaryField?.id &&
            f.id !== imageField?.id &&
            f.type !== DbFieldType.CreatedTime &&
            f.type !== DbFieldType.LastEditedTime
        )
        .slice(0, 4),
    [table.fields, primaryField?.id, imageField?.id]
  )

  const getCoverColor = useCallback((rowId: string): string => {
    let hash = 0
    for (let i = 0; i < rowId.length; i++) {
      hash = (hash * 31 + rowId.charCodeAt(i)) | 0
    }
    return COVER_COLORS[Math.abs(hash) % COVER_COLORS.length]!
  }, [])

  const renderFieldValue = useCallback(
    (field: DbField, value: CellValue) => {
      if (value === null || value === undefined || value === '') return null

      if (field.type === DbFieldType.Select && field.options) {
        const choice = field.options.choices.find((c) => c.name === value)
        return (
          <span
            className="gallery-view__card-tag"
            style={{
              backgroundColor: choice?.color ? `${choice.color}20` : undefined,
              color: choice?.color,
            }}
          >
            {String(value)}
          </span>
        )
      }

      if (field.type === DbFieldType.Checkbox) {
        return (
          <span className="gallery-view__card-check">
            {value ? 'Yes' : 'No'}
          </span>
        )
      }

      return <span className="gallery-view__card-value">{String(value)}</span>
    },
    []
  )

  if (table.rows.length === 0) {
    return (
      <div className="gallery-view gallery-view--empty">
        <div className="gallery-view__empty-state">
          <Image size={48} />
          <p>No records yet</p>
          <p className="gallery-view__empty-hint">
            Add records to see them displayed as gallery cards.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="gallery-view" role="region" aria-label="Gallery view">
      {table.rows.map((row) => {
        const title = primaryField
          ? (row.cells[primaryField.id]
              ? String(row.cells[primaryField.id])
              : 'Untitled')
          : 'Untitled'

        const imageUrl = imageField
          ? row.cells[imageField.id]
          : null
        const hasImage =
          imageUrl &&
          typeof imageUrl === 'string' &&
          imageUrl.trim() !== '' &&
          isImageUrl(imageUrl)

        return (
          <div
            key={row.id}
            className="gallery-view__card"
            tabIndex={0}
            role="article"
            aria-label={title}
          >
            <div
              className="gallery-view__card-cover"
              style={
                hasImage
                  ? { backgroundImage: `url(${imageUrl})` }
                  : { background: getCoverColor(row.id) }
              }
            >
              {!hasImage && <FileText size={24} />}
            </div>
            <div className="gallery-view__card-body">
              <h3 className="gallery-view__card-title">{title}</h3>
              {previewFields.map((field) => {
                const val = row.cells[field.id]
                if (val === null || val === undefined || val === '') return null
                const rendered = renderFieldValue(field, val)
                if (!rendered) return null
                return (
                  <div key={field.id} className="gallery-view__card-field">
                    <span className="gallery-view__card-label">{field.name}</span>
                    {rendered}
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
      <button className="gallery-view__add-card" aria-label="Add new record">
        <Plus size={20} />
        <span>New</span>
      </button>
    </div>
  )
}
