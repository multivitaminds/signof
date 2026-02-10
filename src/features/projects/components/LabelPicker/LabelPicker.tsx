import { useCallback, useEffect, useRef, useState } from 'react'
import type { Label } from '../../types'
import './LabelPicker.css'

interface LabelPickerProps {
  labels: Label[]
  selectedIds: string[]
  onChange: (ids: string[]) => void
}

export default function LabelPicker({ labels, selectedIds, onChange }: LabelPickerProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const toggle = useCallback(() => {
    setOpen(prev => !prev)
  }, [])

  const toggleLabel = useCallback((id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter(sid => sid !== id))
    } else {
      onChange([...selectedIds, id])
    }
  }, [selectedIds, onChange])

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
    if (e.key === 'Escape') {
      setOpen(false)
    }
  }, [])

  const selectedLabels = labels.filter(l => selectedIds.includes(l.id))

  return (
    <div className="label-picker" ref={containerRef} onKeyDown={handleKeyDown}>
      <button
        type="button"
        className="label-picker__trigger"
        onClick={toggle}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        {selectedLabels.length > 0 ? (
          <span className="label-picker__tags">
            {selectedLabels.map(label => (
              <span
                key={label.id}
                className="label-picker__tag"
                style={{ backgroundColor: label.color + '20', color: label.color }}
              >
                {label.name}
              </span>
            ))}
          </span>
        ) : (
          <span className="label-picker__placeholder">Add labels</span>
        )}
      </button>

      {open && (
        <ul className="label-picker__dropdown" role="listbox">
          {labels.map(label => {
            const checked = selectedIds.includes(label.id)
            return (
              <li
                key={label.id}
                role="option"
                aria-selected={checked}
                className={`label-picker__option${checked ? ' label-picker__option--selected' : ''}`}
                onClick={() => toggleLabel(label.id)}
              >
                <span className={`label-picker__checkbox${checked ? ' label-picker__checkbox--checked' : ''}`}>
                  {checked && '✓'}
                </span>
                <span className="label-picker__dot" style={{ backgroundColor: label.color }} />
                <span>{label.name}</span>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
