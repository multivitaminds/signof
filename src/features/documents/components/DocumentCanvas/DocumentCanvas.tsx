import { useCallback } from 'react'
import type { DocumentField, FieldType } from '../../../../types'
import { getFieldTypeLabel } from '../../lib/fieldTypes'
import './DocumentCanvas.css'

interface DocumentCanvasProps {
  fields: DocumentField[]
  selectedFieldId: string | null
  onFieldSelect: (id: string | null) => void
  onFieldMove: (id: string, x: number, y: number) => void
  onFieldDrop: (type: FieldType, recipientId: string, x: number, y: number) => void
  onFieldHover?: (id: string | null) => void
  recipientColors: Record<string, string>
  readOnly?: boolean
  width?: number
  height?: number
}

export default function DocumentCanvas({
  fields,
  selectedFieldId,
  onFieldSelect,
  onFieldMove,
  onFieldDrop,
  onFieldHover,
  recipientColors,
  readOnly = false,
  width = 612,
  height = 792,
}: DocumentCanvasProps) {
  const handleCanvasClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if ((e.target as HTMLElement).classList.contains('document-canvas__page')) {
        onFieldSelect(null)
      }
    },
    [onFieldSelect]
  )

  const handleDragOver = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      if (readOnly) return
      e.preventDefault()
      e.dataTransfer.dropEffect = 'copy'
    },
    [readOnly]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      if (readOnly) return
      e.preventDefault()
      const fieldType = e.dataTransfer.getData('application/field-type') as FieldType
      const recipientId = e.dataTransfer.getData('application/recipient-id') || 'default'
      if (!fieldType) return

      const rect = e.currentTarget.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * width
      const y = ((e.clientY - rect.top) / rect.height) * height

      onFieldDrop(fieldType, recipientId, x, y)
    },
    [readOnly, onFieldDrop, width, height]
  )

  const handleFieldDragStart = useCallback(
    (e: React.DragEvent<HTMLDivElement>, field: DocumentField) => {
      if (readOnly) return
      e.dataTransfer.setData('application/field-id', field.id)
      const rect = e.currentTarget.getBoundingClientRect()
      e.dataTransfer.setData(
        'application/drag-offset',
        JSON.stringify({
          offsetX: e.clientX - rect.left,
          offsetY: e.clientY - rect.top,
        })
      )
    },
    [readOnly]
  )

  const handleFieldDrop2 = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      const fieldId = e.dataTransfer.getData('application/field-id')
      if (!fieldId) return
      e.preventDefault()

      const rect = e.currentTarget.getBoundingClientRect()
      const offsetData = e.dataTransfer.getData('application/drag-offset')
      let offsetX = 0
      let offsetY = 0
      if (offsetData) {
        const parsed = JSON.parse(offsetData) as { offsetX: number; offsetY: number }
        offsetX = parsed.offsetX
        offsetY = parsed.offsetY
      }

      const x = ((e.clientX - rect.left - offsetX) / rect.width) * width
      const y = ((e.clientY - rect.top - offsetY) / rect.height) * height
      onFieldMove(fieldId, Math.max(0, x), Math.max(0, y))
    },
    [onFieldMove, width, height]
  )

  const handleCombinedDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      const fieldId = e.dataTransfer.getData('application/field-id')
      if (fieldId) {
        handleFieldDrop2(e)
      } else {
        handleDrop(e)
      }
    },
    [handleDrop, handleFieldDrop2]
  )

  return (
    <div className="document-canvas" role="region" aria-label="Document canvas">
      <div
        className="document-canvas__page"
        style={{ aspectRatio: `${width} / ${height}` }}
        onClick={handleCanvasClick}
        onDragOver={handleDragOver}
        onDrop={handleCombinedDrop}
      >
        {fields.map((field) => {
          const isSelected = field.id === selectedFieldId
          const color = recipientColors[field.recipientId] || '#6B7280'
          const leftPct = (field.x / width) * 100
          const topPct = (field.y / height) * 100
          const widthPct = (field.width / width) * 100
          const heightPct = (field.height / height) * 100

          return (
            <div
              key={field.id}
              className={`document-canvas__field${isSelected ? ' document-canvas__field--selected' : ''}`}
              style={{
                left: `${leftPct}%`,
                top: `${topPct}%`,
                width: `${widthPct}%`,
                height: `${heightPct}%`,
                borderColor: color,
                backgroundColor: `${color}1A`,
              }}
              onClick={(e) => {
                e.stopPropagation()
                onFieldSelect(field.id)
              }}
              onMouseEnter={() => onFieldHover?.(field.id)}
              onMouseLeave={() => onFieldHover?.(null)}
              draggable={!readOnly}
              onDragStart={(e) => handleFieldDragStart(e, field)}
              tabIndex={0}
              role="button"
              aria-label={`${getFieldTypeLabel(field.type)} field${field.label ? `: ${field.label}` : ''}`}
              aria-pressed={isSelected}
            >
              <span className="document-canvas__field-label" style={{ color }}>
                {field.label || getFieldTypeLabel(field.type)}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
