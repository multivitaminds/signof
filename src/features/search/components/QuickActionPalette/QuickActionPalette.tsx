import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { Zap, X } from 'lucide-react'
import { getAllActions, searchActions } from '../../../../lib/quickActions'
import type { QuickAction } from '../../../../lib/quickActions'
import QuickActionItem from '../QuickActionItem/QuickActionItem'
import './QuickActionPalette.css'

const RECENT_KEY = 'orchestree-recent-actions'
const MAX_RECENT = 5
const POPULAR_COUNT = 8

interface Props {
  isOpen: boolean
  onClose: () => void
}

function loadRecent(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (Array.isArray(parsed)) return parsed.filter((s): s is string => typeof s === 'string')
    return []
  } catch {
    return []
  }
}

function saveRecent(ids: string[]): void {
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(ids.slice(0, MAX_RECENT)))
  } catch {
    // localStorage may be unavailable
  }
}

function trackRecentAction(actionId: string): void {
  const recent = loadRecent().filter((id) => id !== actionId)
  saveRecent([actionId, ...recent])
}

export default function QuickActionPalette({ isOpen, onClose }: Props) {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  // Build display list
  const displayItems = useMemo((): QuickAction[] => {
    if (query.trim()) {
      return searchActions(query.trim())
    }

    // When empty: recent actions + popular actions
    const allActions = getAllActions()
    const recentIds = loadRecent()
    const recentActions: QuickAction[] = []

    for (const id of recentIds) {
      const found = allActions.find((a) => a.id === id)
      if (found) recentActions.push(found)
    }

    // Popular = first N actions not already in recent
    const recentSet = new Set(recentIds)
    const popular = allActions.filter((a) => !recentSet.has(a.id)).slice(0, POPULAR_COUNT)

    return [...recentActions, ...popular]
  }, [query])

  // Determine where the "recent" section ends for rendering
  const recentCount = useMemo(() => {
    if (query.trim()) return 0
    return loadRecent().filter((id) =>
      getAllActions().some((a) => a.id === id)
    ).length
  }, [query])

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 0)
    }
  }, [isOpen])

  // Reset selection when results change
  useEffect(() => {
    setSelectedIndex(0)
  }, [displayItems.length, query])

  const handleExecute = useCallback(
    (action: QuickAction) => {
      trackRecentAction(action.id)
      action.handler()
      onClose()
    },
    [onClose]
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const total = displayItems.length

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex((prev) => (total > 0 ? (prev + 1) % total : 0))
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex((prev) => (total > 0 ? (prev - 1 + total) % total : 0))
          break
        case 'Enter':
          e.preventDefault()
          if (displayItems[selectedIndex]) {
            handleExecute(displayItems[selectedIndex])
          }
          break
        case 'Escape':
          onClose()
          break
      }
    },
    [displayItems, selectedIndex, handleExecute, onClose]
  )

  // Scroll selected item into view
  useEffect(() => {
    const selectedEl = listRef.current?.querySelector(
      `[data-action-index="${selectedIndex}"]`
    )
    selectedEl?.scrollIntoView({ block: 'nearest' })
  }, [selectedIndex])

  if (!isOpen) return null

  const isSearching = query.trim().length > 0
  const recentItems = !isSearching ? displayItems.slice(0, recentCount) : []
  const otherItems = !isSearching ? displayItems.slice(recentCount) : displayItems

  return (
    <div className="quick-action-palette__overlay" onClick={onClose} role="presentation">
      <div
        className="quick-action-palette"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Quick actions"
      >
        {/* Header */}
        <div className="quick-action-palette__header">
          <Zap size={20} className="quick-action-palette__header-icon" />
          <input
            ref={inputRef}
            type="text"
            className="quick-action-palette__input"
            placeholder="Type a command..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            autoComplete="off"
            autoCorrect="off"
            spellCheck="false"
            aria-label="Command input"
          />
          <button
            className="quick-action-palette__close"
            onClick={onClose}
            type="button"
            aria-label="Close quick actions"
          >
            <X size={18} />
          </button>
        </div>

        {/* Results */}
        <div className="quick-action-palette__results" ref={listRef}>
          {displayItems.length === 0 && (
            <div className="quick-action-palette__empty">
              <div className="quick-action-palette__empty-title">No actions found</div>
              <div className="quick-action-palette__empty-hint">
                Try different keywords
              </div>
            </div>
          )}

          {/* Recent section */}
          {recentItems.length > 0 && (
            <div className="quick-action-palette__section">
              <div className="quick-action-palette__section-label">Recent</div>
              {recentItems.map((action, i) => (
                <div key={action.id} data-action-index={i}>
                  <QuickActionItem
                    action={action}
                    query={query}
                    isSelected={selectedIndex === i}
                    onExecute={handleExecute}
                    onMouseEnter={() => setSelectedIndex(i)}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Other / search results */}
          {otherItems.length > 0 && (
            <div className="quick-action-palette__section">
              <div className="quick-action-palette__section-label">
                {isSearching ? 'Results' : 'Popular'}
              </div>
              {otherItems.map((action, i) => {
                const globalIndex = recentCount + i
                return (
                  <div key={action.id} data-action-index={globalIndex}>
                    <QuickActionItem
                      action={action}
                      query={query}
                      isSelected={selectedIndex === globalIndex}
                      onExecute={handleExecute}
                      onMouseEnter={() => setSelectedIndex(globalIndex)}
                    />
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="quick-action-palette__footer">
          <span className="quick-action-palette__hint">
            <kbd>&#8593;</kbd><kbd>&#8595;</kbd> navigate
          </span>
          <span className="quick-action-palette__hint">
            <kbd>&#8629;</kbd> execute
          </span>
          <span className="quick-action-palette__hint">
            <kbd>esc</kbd> close
          </span>
          <span className="quick-action-palette__count">
            {displayItems.length} action{displayItems.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
    </div>
  )
}
