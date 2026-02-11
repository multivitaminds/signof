import { useCallback, useRef } from 'react'
import type { DocumentField, FieldType } from '../../../../types'
import { getFieldTypeLabel, FIELD_TYPE_CONFIGS } from '../../lib/fieldTypes'
import './DocumentCanvas.css'

interface DocumentCanvasProps {
  fields: DocumentField[]
  selectedFieldId: string | null
  onFieldSelect: (id: string | null) => void
  onFieldMove: (id: string, x: number, y: number) => void
  onFieldDrop: (type: FieldType, recipientId: string, x: number, y: number) => void
  onFieldHover?: (id: string | null) => void
  onFieldResize?: (id: string, width: number, height: number) => void
  recipientColors: Record<string, string>
  readOnly?: boolean
  width?: number
  height?: number
  backgroundUrl?: string
  backgroundType?: string
}

export default function DocumentCanvas({
  fields,
  selectedFieldId,
  onFieldSelect,
  onFieldMove,
  onFieldDrop,
  onFieldHover,
  onFieldResize,
  recipientColors,
  readOnly = false,
  width = 612,
  height = 792,
  backgroundUrl,
  backgroundType,
}: DocumentCanvasProps) {
  const pageRef = useRef<HTMLDivElement>(null)

  const handleResizeStart = useCallback(
    (e: React.MouseEvent, field: DocumentField, direction: 'se' | 'e' | 's') => {
      e.stopPropagation()
      e.preventDefault()
      if (!onFieldResize || !pageRef.current) return

      const startX = e.clientX
      const startY = e.clientY
      const startWidth = field.width
      const startHeight = field.height
      const rect = pageRef.current.getBoundingClientRect()
      const scaleX = width / rect.width
      const scaleY = height / rect.height

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const deltaX = (moveEvent.clientX - startX) * scaleX
        const deltaY = (moveEvent.clientY - startY) * scaleY

        let newWidth = startWidth
        let newHeight = startHeight

        if (direction === 'se' || direction === 'e') {
          newWidth = Math.max(20, startWidth + deltaX)
        }
        if (direction === 'se' || direction === 's') {
          newHeight = Math.max(20, startHeight + deltaY)
        }

        onFieldResize(field.id, newWidth, newHeight)
      }

      const handleMouseUp = () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }

      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    },
    [onFieldResize, width, height]
  )

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

  const hasImageBg = backgroundUrl && backgroundType?.startsWith('image/')
  const hasPdfBg = backgroundUrl && backgroundType === 'application/pdf'
  const hasBg = hasImageBg || hasPdfBg

  return (
    <div className="document-canvas" role="region" aria-label="Document canvas">
      <div
        ref={pageRef}
        className={`document-canvas__page${hasBg ? ' document-canvas__page--has-bg' : ''}`}
        style={{
          aspectRatio: `${width} / ${height}`,
          ...(hasImageBg ? { backgroundImage: `url(${backgroundUrl})` } : {}),
        }}
        onClick={handleCanvasClick}
        onDragOver={handleDragOver}
        onDrop={handleCombinedDrop}
      >
        {hasPdfBg && (
          <div className="document-canvas__pdf-placeholder" aria-label="PDF document preview">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            <span>PDF Document</span>
          </div>
        )}
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
              {isSelected && !readOnly && FIELD_TYPE_CONFIGS[field.type].resizable && onFieldResize && (
                <>
                  <div
                    className="document-canvas__resize-handle document-canvas__resize-handle--se"
                    onMouseDown={(e) => handleResizeStart(e, field, 'se')}
                    aria-label="Resize from bottom-right corner"
                    role="separator"
                  />
                  <div
                    className="document-canvas__resize-handle document-canvas__resize-handle--e"
                    onMouseDown={(e) => handleResizeStart(e, field, 'e')}
                    aria-label="Resize width"
                    role="separator"
                  />
                  <div
                    className="document-canvas__resize-handle document-canvas__resize-handle--s"
                    onMouseDown={(e) => handleResizeStart(e, field, 's')}
                    aria-label="Resize height"
                    role="separator"
                  />
                </>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
