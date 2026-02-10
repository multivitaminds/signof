import { useState, useEffect, useCallback, useRef } from 'react'
import {
  Type,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  ChevronRight,
  MessageSquare,
  Code,
  Quote,
  Minus,
  ImageIcon,
} from 'lucide-react'
import type { BlockType } from '../../types'
import { SLASH_COMMANDS } from '../../lib/slashCommands'
import './SlashMenu.css'

const ICON_MAP: Record<string, React.ComponentType<{ size?: number }>> = {
  Type,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  ChevronRight,
  MessageSquare,
  Code,
  Quote,
  Minus,
  Image: ImageIcon,
}

interface SlashMenuProps {
  position: { x: number; y: number }
  onSelect: (type: BlockType) => void
  onClose: () => void
}

export default function SlashMenu({ position, onSelect, onClose }: SlashMenuProps) {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  const filtered = query
    ? SLASH_COMMANDS.filter((cmd) => {
        const q = query.toLowerCase()
        return (
          cmd.label.toLowerCase().includes(q) ||
          cmd.keywords.some((kw) => kw.includes(q))
        )
      })
    : SLASH_COMMANDS

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleQueryChange = useCallback((newQuery: string) => {
    setQuery(newQuery)
    setSelectedIndex(0)
  }, [])

  // Close on click outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [onClose])

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex((prev) => (prev + 1) % filtered.length)
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex((prev) => (prev - 1 + filtered.length) % filtered.length)
          break
        case 'Enter':
          e.preventDefault()
          if (filtered[selectedIndex]) {
            onSelect(filtered[selectedIndex].type)
          }
          break
        case 'Escape':
          e.preventDefault()
          onClose()
          break
      }
    },
    [filtered, selectedIndex, onSelect, onClose]
  )

  return (
    <div
      ref={menuRef}
      className="slash-menu"
      style={{
        left: `${position.x}px`,
        top: `${position.y + 24}px`,
      }}
      role="listbox"
      aria-label="Block type menu"
    >
      <div className="slash-menu__search">
        <input
          ref={inputRef}
          className="slash-menu__input"
          type="text"
          placeholder="Filter..."
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          onKeyDown={handleKeyDown}
          autoComplete="off"
        />
      </div>
      <div className="slash-menu__list">
        {filtered.length === 0 ? (
          <div className="slash-menu__empty">No results</div>
        ) : (
          filtered.map((cmd, i) => {
            const Icon = ICON_MAP[cmd.icon] ?? Type
            return (
              <button
                key={cmd.id}
                className={`slash-menu__item ${i === selectedIndex ? 'slash-menu__item--selected' : ''}`}
                onClick={() => onSelect(cmd.type)}
                onMouseEnter={() => setSelectedIndex(i)}
                role="option"
                aria-selected={i === selectedIndex}
              >
                <div className="slash-menu__item-icon">
                  <Icon size={18} />
                </div>
                <div className="slash-menu__item-text">
                  <span className="slash-menu__item-label">{cmd.label}</span>
                  <span className="slash-menu__item-desc">{cmd.description}</span>
                </div>
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}
