import { useCallback, useEffect, useRef, useState } from 'react'
import type { IssueStatus } from '../../types'
import { STATUS_CONFIG, STATUS_ORDER } from '../../types'
import './StatusSelect.css'

interface StatusSelectProps {
  value: IssueStatus
  onChange: (status: IssueStatus) => void
  compact?: boolean
}

export default function StatusSelect({ value, onChange, compact = false }: StatusSelectProps) {
  const [open, setOpen] = useState(false)
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)
  const config = STATUS_CONFIG[value]

  const toggle = useCallback(() => {
    setOpen(prev => {
      if (!prev) {
        setFocusedIndex(STATUS_ORDER.indexOf(value))
      }
      return !prev
    })
  }, [value])

  const select = useCallback((status: IssueStatus) => {
    onChange(status)
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
        setFocusedIndex(i => (i + 1) % STATUS_ORDER.length)
        break
      case 'ArrowUp':
        e.preventDefault()
        setFocusedIndex(i => (i - 1 + STATUS_ORDER.length) % STATUS_ORDER.length)
        break
      case 'Enter':
        e.preventDefault()
        if (focusedIndex >= 0) {
          const status = STATUS_ORDER[focusedIndex]
          if (status) select(status)
        }
        break
      case 'Escape':
        e.preventDefault()
        setOpen(false)
        break
    }
  }, [open, focusedIndex, toggle, select])

  return (
    <div className="status-select" ref={containerRef} onKeyDown={handleKeyDown}>
      <button
        type="button"
        className={`status-select__trigger${compact ? ' status-select__trigger--compact' : ''}`}
        onClick={toggle}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span className="status-select__dot" style={{ backgroundColor: config.color }} />
        {!compact && <span className="status-select__label">{config.label}</span>}
      </button>

      {open && (
        <ul className="status-select__dropdown" role="listbox">
          {STATUS_ORDER.map((status, index) => {
            const cfg = STATUS_CONFIG[status]
            return (
              <li
                key={status}
                role="option"
                aria-selected={status === value}
                className={`status-select__option${status === value ? ' status-select__option--selected' : ''}${index === focusedIndex ? ' status-select__option--focused' : ''}`}
                onClick={() => select(status)}
              >
                <span className="status-select__dot" style={{ backgroundColor: cfg.color }} />
                <span>{cfg.label}</span>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
