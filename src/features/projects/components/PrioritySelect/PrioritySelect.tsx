import { useCallback, useEffect, useRef, useState } from 'react'
import type { IssuePriority } from '../../types'
import { PRIORITY_CONFIG, PRIORITY_ORDER } from '../../types'
import './PrioritySelect.css'

interface PrioritySelectProps {
  value: IssuePriority
  onChange: (priority: IssuePriority) => void
  compact?: boolean
}

const PRIORITY_ICONS: Record<IssuePriority, string> = {
  urgent: '!!!',
  high: '↑↑',
  medium: '↑',
  low: '↓',
  none: '—',
}

export default function PrioritySelect({ value, onChange, compact = false }: PrioritySelectProps) {
  const [open, setOpen] = useState(false)
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)
  const config = PRIORITY_CONFIG[value]

  const toggle = useCallback(() => {
    setOpen(prev => {
      if (!prev) {
        setFocusedIndex(PRIORITY_ORDER.indexOf(value))
      }
      return !prev
    })
  }, [value])

  const select = useCallback((priority: IssuePriority) => {
    onChange(priority)
    setOpen(false)
  }, [onChange])

  useEffect(() => {
    if (!open) return
    const handleMouseDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleMouseDown)
    return () => document.removeEventListener('mousedown', handleMouseDown)
  }, [open])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!open) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        toggle()
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setFocusedIndex(i => (i + 1) % PRIORITY_ORDER.length)
        break
      case 'ArrowUp':
        e.preventDefault()
        setFocusedIndex(i => (i - 1 + PRIORITY_ORDER.length) % PRIORITY_ORDER.length)
        break
      case 'Enter':
        e.preventDefault()
        if (focusedIndex >= 0) {
          const priority = PRIORITY_ORDER[focusedIndex]
          if (priority) select(priority)
        }
        break
      case 'Escape':
        e.preventDefault()
        setOpen(false)
        break
    }
  }, [open, focusedIndex, toggle, select])

  return (
    <div className="priority-select" ref={containerRef} onKeyDown={handleKeyDown}>
      <button
        type="button"
        className={`priority-select__trigger${compact ? ' priority-select__trigger--compact' : ''}`}
        onClick={toggle}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span className="priority-select__icon" style={{ color: config.color }}>
          {PRIORITY_ICONS[value]}
        </span>
        {!compact && <span className="priority-select__label">{config.label}</span>}
      </button>

      {open && (
        <ul className="priority-select__dropdown" role="listbox">
          {PRIORITY_ORDER.map((priority, index) => {
            const cfg = PRIORITY_CONFIG[priority]
            return (
              <li
                key={priority}
                role="option"
                aria-selected={priority === value}
                className={`priority-select__option${priority === value ? ' priority-select__option--selected' : ''}${index === focusedIndex ? ' priority-select__option--focused' : ''}`}
                onClick={() => select(priority)}
              >
                <span className="priority-select__icon" style={{ color: cfg.color }}>
                  {PRIORITY_ICONS[priority]}
                </span>
                <span>{cfg.label}</span>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
