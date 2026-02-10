import { useState, useEffect, useRef, useCallback } from 'react'
import { Bold, Italic, Underline, Strikethrough, Code, Link, Highlighter, Palette } from 'lucide-react'
import type { MarkType } from '../../types'
import { MarkType as MT } from '../../types'
import './InlineToolbar.css'

interface InlineToolbarProps {
  position: { x: number; y: number }
  activeMarks: MarkType[]
  onToggleMark: (type: MarkType, attrs?: Record<string, string>) => void
  onClose: () => void
}

const TOOLBAR_BUTTONS: Array<{
  type: MarkType
  icon: React.ComponentType<{ size?: number }>
  label: string
  shortcut: string
}> = [
  { type: MT.Bold, icon: Bold, label: 'Bold', shortcut: '⌘B' },
  { type: MT.Italic, icon: Italic, label: 'Italic', shortcut: '⌘I' },
  { type: MT.Underline, icon: Underline, label: 'Underline', shortcut: '⌘U' },
  { type: MT.Strikethrough, icon: Strikethrough, label: 'Strikethrough', shortcut: '⌘⇧S' },
  { type: MT.Code, icon: Code, label: 'Code', shortcut: '⌘E' },
  { type: MT.Link, icon: Link, label: 'Link', shortcut: '⌘K' },
]

const TEXT_COLORS = [
  { label: 'Default', color: 'inherit' },
  { label: 'Red', color: '#DC2626' },
  { label: 'Orange', color: '#EA580C' },
  { label: 'Yellow', color: '#CA8A04' },
  { label: 'Green', color: '#16A34A' },
  { label: 'Blue', color: '#2563EB' },
  { label: 'Purple', color: '#9333EA' },
  { label: 'Pink', color: '#DB2777' },
  { label: 'Gray', color: '#6B7280' },
]

const HIGHLIGHT_COLORS = [
  { label: 'Default', color: '#FEF08A' },
  { label: 'Red', color: '#FECACA' },
  { label: 'Orange', color: '#FED7AA' },
  { label: 'Yellow', color: '#FEF08A' },
  { label: 'Green', color: '#BBF7D0' },
  { label: 'Blue', color: '#BFDBFE' },
  { label: 'Purple', color: '#E9D5FF' },
  { label: 'Pink', color: '#FBCFE8' },
  { label: 'Gray', color: '#E5E7EB' },
]

export default function InlineToolbar({ position, activeMarks, onToggleMark, onClose }: InlineToolbarProps) {
  const toolbarRef = useRef<HTMLDivElement>(null)
  const [showColorPicker, setShowColorPicker] = useState<'text' | 'highlight' | null>(null)

  // Close on click outside
  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (toolbarRef.current && !toolbarRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleMouseDown)
    return () => document.removeEventListener('mousedown', handleMouseDown)
  }, [onClose])

  const handleClick = useCallback(
    (type: MarkType, e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      onToggleMark(type)
    },
    [onToggleMark]
  )

  const handleColorSelect = useCallback(
    (type: 'text' | 'highlight', color: string, e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      if (type === 'text') {
        onToggleMark(MT.TextColor, { color })
      } else {
        onToggleMark(MT.Highlight, { color })
      }
      setShowColorPicker(null)
    },
    [onToggleMark]
  )

  const handleToggleColorPicker = useCallback(
    (type: 'text' | 'highlight', e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setShowColorPicker((prev) => (prev === type ? null : type))
    },
    []
  )

  return (
    <div
      ref={toolbarRef}
      className="inline-toolbar"
      style={{
        left: `${position.x}px`,
        top: `${position.y - 40}px`,
      }}
      role="toolbar"
      aria-label="Text formatting"
    >
      {TOOLBAR_BUTTONS.map((btn, i) => {
        const Icon = btn.icon
        const isActive = activeMarks.includes(btn.type)
        return (
          <span key={btn.type}>
            {i === 4 && <span className="inline-toolbar__separator" />}
            <button
              className={`inline-toolbar__btn ${isActive ? 'inline-toolbar__btn--active' : ''}`}
              onMouseDown={(e) => handleClick(btn.type, e)}
              title={`${btn.label} (${btn.shortcut})`}
              aria-label={btn.label}
              aria-pressed={isActive}
            >
              <Icon size={14} />
            </button>
          </span>
        )
      })}

      <span className="inline-toolbar__separator" />

      {/* Text Color */}
      <span className="inline-toolbar__color-wrapper">
        <button
          className={`inline-toolbar__btn ${activeMarks.includes(MT.TextColor) ? 'inline-toolbar__btn--active' : ''}`}
          onMouseDown={(e) => handleToggleColorPicker('text', e)}
          title="Text color"
          aria-label="Text color"
        >
          <Palette size={14} />
        </button>
        {showColorPicker === 'text' && (
          <div className="inline-toolbar__color-dropdown" role="menu" aria-label="Text colors">
            <div className="inline-toolbar__color-label">Text color</div>
            <div className="inline-toolbar__color-grid">
              {TEXT_COLORS.map((c) => (
                <button
                  key={c.label}
                  className="inline-toolbar__color-swatch"
                  style={{ color: c.color === 'inherit' ? 'var(--text-primary)' : c.color }}
                  onMouseDown={(e) => handleColorSelect('text', c.color, e)}
                  title={c.label}
                  aria-label={`${c.label} text`}
                >
                  A
                </button>
              ))}
            </div>
          </div>
        )}
      </span>

      {/* Highlight Color */}
      <span className="inline-toolbar__color-wrapper">
        <button
          className={`inline-toolbar__btn ${activeMarks.includes(MT.Highlight) ? 'inline-toolbar__btn--active' : ''}`}
          onMouseDown={(e) => handleToggleColorPicker('highlight', e)}
          title="Highlight (⌘⇧H)"
          aria-label="Highlight"
        >
          <Highlighter size={14} />
        </button>
        {showColorPicker === 'highlight' && (
          <div className="inline-toolbar__color-dropdown" role="menu" aria-label="Highlight colors">
            <div className="inline-toolbar__color-label">Background</div>
            <div className="inline-toolbar__color-grid">
              {HIGHLIGHT_COLORS.map((c) => (
                <button
                  key={c.label}
                  className="inline-toolbar__color-swatch inline-toolbar__color-swatch--bg"
                  style={{ backgroundColor: c.color }}
                  onMouseDown={(e) => handleColorSelect('highlight', c.color, e)}
                  title={c.label}
                  aria-label={`${c.label} highlight`}
                >
                  A
                </button>
              ))}
            </div>
          </div>
        )}
      </span>
    </div>
  )
}
