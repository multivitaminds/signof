import { useEffect, useRef, useCallback } from 'react'
import { Bold, Italic, Underline, Strikethrough, Code, Link } from 'lucide-react'
import type { MarkType } from '../../types'
import { MarkType as MT } from '../../types'
import './InlineToolbar.css'

interface InlineToolbarProps {
  position: { x: number; y: number }
  activeMarks: MarkType[]
  onToggleMark: (type: MarkType) => void
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

export default function InlineToolbar({ position, activeMarks, onToggleMark, onClose }: InlineToolbarProps) {
  const toolbarRef = useRef<HTMLDivElement>(null)

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
    </div>
  )
}
