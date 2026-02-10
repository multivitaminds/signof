import { useCallback } from 'react'
import { FieldType } from '../../../../types'
import { FIELD_TYPE_CONFIGS } from '../../lib/fieldTypes'
import './FieldPalette.css'

interface FieldPaletteProps {
  onFieldDragStart: (type: FieldType) => void
  disabled?: boolean
}

const FIELD_TYPES = Object.values(FieldType) as FieldType[]

const ICON_MAP: Record<string, string> = {
  'pen-tool': '\u270D',
  'type': 'Aa',
  'calendar': '\uD83D\uDCC5',
  'text-cursor-input': 'T',
  'check-square': '\u2611',
  'chevron-down': '\u25BE',
  'paperclip': '\uD83D\uDCCE',
}

export default function FieldPalette({ onFieldDragStart, disabled = false }: FieldPaletteProps) {
  const handleDragStart = useCallback(
    (e: React.DragEvent<HTMLButtonElement>, type: FieldType) => {
      if (disabled) {
        e.preventDefault()
        return
      }
      e.dataTransfer.setData('application/field-type', type)
      e.dataTransfer.effectAllowed = 'copy'
      onFieldDragStart(type)
    },
    [onFieldDragStart, disabled]
  )

  return (
    <div className="field-palette" role="toolbar" aria-label="Field types">
      <div className="field-palette__title">Fields</div>
      {FIELD_TYPES.map((type) => {
        const config = FIELD_TYPE_CONFIGS[type]
        return (
          <button
            key={type}
            className="field-palette__item"
            draggable={!disabled}
            onDragStart={(e) => handleDragStart(e, type)}
            disabled={disabled}
            aria-label={`Drag ${config.label} field`}
          >
            <span className="field-palette__icon">{ICON_MAP[config.icon] || config.icon}</span>
            <span className="field-palette__label">{config.label}</span>
          </button>
        )
      })}
    </div>
  )
}
