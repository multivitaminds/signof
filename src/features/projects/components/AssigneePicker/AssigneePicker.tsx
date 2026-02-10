import { useCallback, useEffect, useRef, useState } from 'react'
import type { Member } from '../../types'
import './AssigneePicker.css'

interface AssigneePickerProps {
  members: Member[]
  value: string | null
  onChange: (memberId: string | null) => void
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) {
    return ((parts[0]?.[0] ?? '') + (parts[parts.length - 1]?.[0] ?? '')).toUpperCase()
  }
  return (parts[0]?.[0] ?? '?').toUpperCase()
}

export default function AssigneePicker({ members, value, onChange }: AssigneePickerProps) {
  const [open, setOpen] = useState(false)
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)

  const selectedMember = value ? members.find(m => m.id === value) : null

  const toggle = useCallback(() => {
    setOpen(prev => {
      if (!prev) {
        const idx = value ? members.findIndex(m => m.id === value) : -1
        setFocusedIndex(idx + 1) // +1 because "Unassigned" is index 0
      }
      return !prev
    })
  }, [value, members])

  const select = useCallback((memberId: string | null) => {
    onChange(memberId)
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

  const optionCount = members.length + 1 // +1 for Unassigned

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
        setFocusedIndex(i => (i + 1) % optionCount)
        break
      case 'ArrowUp':
        e.preventDefault()
        setFocusedIndex(i => (i - 1 + optionCount) % optionCount)
        break
      case 'Enter':
        e.preventDefault()
        if (focusedIndex === 0) {
          select(null)
        } else if (focusedIndex > 0) {
          const member = members[focusedIndex - 1]
          if (member) select(member.id)
        }
        break
      case 'Escape':
        e.preventDefault()
        setOpen(false)
        break
    }
  }, [open, focusedIndex, optionCount, toggle, select, members])

  return (
    <div className="assignee-picker" ref={containerRef} onKeyDown={handleKeyDown}>
      <button
        type="button"
        className="assignee-picker__trigger"
        onClick={toggle}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        {selectedMember ? (
          <>
            <span className="assignee-picker__avatar">
              {getInitials(selectedMember.name)}
            </span>
            <span className="assignee-picker__name">{selectedMember.name}</span>
          </>
        ) : (
          <span className="assignee-picker__placeholder">Unassigned</span>
        )}
      </button>

      {open && (
        <ul className="assignee-picker__dropdown" role="listbox">
          <li
            role="option"
            aria-selected={value === null}
            className={`assignee-picker__option${value === null ? ' assignee-picker__option--selected' : ''}${focusedIndex === 0 ? ' assignee-picker__option--focused' : ''}`}
            onClick={() => select(null)}
          >
            <span className="assignee-picker__avatar assignee-picker__avatar--empty">—</span>
            <span>Unassigned</span>
          </li>
          {members.map((member, index) => (
            <li
              key={member.id}
              role="option"
              aria-selected={member.id === value}
              className={`assignee-picker__option${member.id === value ? ' assignee-picker__option--selected' : ''}${index + 1 === focusedIndex ? ' assignee-picker__option--focused' : ''}`}
              onClick={() => select(member.id)}
            >
              <span className="assignee-picker__avatar">
                {getInitials(member.name)}
              </span>
              <span>{member.name}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
