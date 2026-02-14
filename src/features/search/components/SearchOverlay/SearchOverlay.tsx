import { useEffect, useRef, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search,
  FileText,
  Layout,
  Calendar,
  Database,
  X,
  FileSignature,
  Receipt,
  Bot,
} from 'lucide-react'
import { useGlobalSearch } from '../../hooks/useGlobalSearch'
import { SearchResultType, type SearchResult } from '../../types'
import { getIconComponent, isEmojiIcon } from '../../../../lib/iconMap'
import VoiceInputButton from '../../../ai/components/VoiceInputButton/VoiceInputButton'
import './SearchOverlay.css'

interface SearchOverlayProps {
  isOpen: boolean
  onClose: () => void
}

const TYPE_LABELS: Record<SearchResultType, string> = {
  [SearchResultType.Page]: 'Pages',
  [SearchResultType.Issue]: 'Issues',
  [SearchResultType.Document]: 'Documents',
  [SearchResultType.Booking]: 'Bookings',
  [SearchResultType.Database]: 'Databases',
  [SearchResultType.TaxDocument]: 'Tax Documents',
  [SearchResultType.Invoice]: 'Invoices',
  [SearchResultType.AgentRun]: 'Agent Runs',
}

const TYPE_ICONS: Record<SearchResultType, React.ComponentType<{ size?: number; className?: string }>> = {
  [SearchResultType.Page]: FileText,
  [SearchResultType.Issue]: Layout,
  [SearchResultType.Document]: FileSignature,
  [SearchResultType.Booking]: Calendar,
  [SearchResultType.Database]: Database,
  [SearchResultType.TaxDocument]: Receipt,
  [SearchResultType.Invoice]: Receipt,
  [SearchResultType.AgentRun]: Bot,
}


export default function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const {
    query,
    results,
    isSearching,
    selectedIndex,
    search,
    clear,
    selectNext,
    selectPrev,
    getSelected,
  } = useGlobalSearch()

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      clear()
      // Defer focus so the overlay renders first
      const id = setTimeout(() => inputRef.current?.focus(), 0)
      return () => clearTimeout(id)
    }
  }, [isOpen, clear])

  // Scroll selected item into view
  useEffect(() => {
    if (!listRef.current) return
    const selectedEl = listRef.current.querySelector(
      `[data-search-index="${selectedIndex}"]`
    )
    selectedEl?.scrollIntoView({ block: 'nearest' })
  }, [selectedIndex])

  const handleVoiceTranscript = useCallback((text: string) => {
    search(text)
  }, [search])

  const handleSelect = useCallback(
    (result: SearchResult) => {
      navigate(result.path)
      onClose()
    },
    [navigate, onClose]
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          selectNext()
          break
        case 'ArrowUp':
          e.preventDefault()
          selectPrev()
          break
        case 'Enter': {
          e.preventDefault()
          const selected = getSelected()
          if (selected) {
            handleSelect(selected)
          }
          break
        }
        case 'Escape':
          e.preventDefault()
          onClose()
          break
      }
    },
    [selectNext, selectPrev, getSelected, handleSelect, onClose]
  )

  // Group results by type
  const groupedResults = useMemo(() => {
    const groups: Partial<Record<SearchResultType, SearchResult[]>> = {}
    for (const result of results) {
      const group = groups[result.type]
      if (group) {
        group.push(result)
      } else {
        groups[result.type] = [result]
      }
    }
    return groups
  }, [results])

  // Ordered type keys for rendering groups in consistent order
  const orderedTypes: SearchResultType[] = [
    SearchResultType.Page,
    SearchResultType.Issue,
    SearchResultType.Document,
    SearchResultType.Booking,
    SearchResultType.Database,
  ]

  if (!isOpen) return null

  const hasQuery = query.trim().length > 0
  const hasResults = results.length > 0

  // Track flat index across groups for keyboard selection
  let flatIndex = -1

  return (
    <div
      className="search-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Search"
    >
      <div
        className="search-overlay__panel"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="search-overlay__input-wrapper">
          <Search size={18} className="search-overlay__search-icon" />
          <input
            ref={inputRef}
            className="search-overlay__input"
            type="text"
            placeholder="Type to search across your workspace"
            value={query}
            onChange={(e) => search(e.target.value)}
            onKeyDown={handleKeyDown}
            autoComplete="off"
            autoCorrect="off"
            spellCheck="false"
            aria-label="Search input"
          />
          <VoiceInputButton onTranscript={handleVoiceTranscript} />
          <button
            className="search-overlay__close-btn"
            onClick={onClose}
            aria-label="Close search"
            type="button"
          >
            <X size={14} />
          </button>
        </div>

        {/* Results */}
        <div className="search-overlay__results" ref={listRef}>
          {!hasQuery && (
            <div className="search-overlay__empty">
              <div className="search-overlay__empty-title">
                Type to search across your workspace
              </div>
              <div className="search-overlay__empty-hint">
                Search pages, issues, documents, bookings, and databases
              </div>
            </div>
          )}

          {hasQuery && isSearching && (
            <div className="search-overlay__loading">
              Searching...
            </div>
          )}

          {hasQuery && !isSearching && !hasResults && (
            <div className="search-overlay__empty">
              <div className="search-overlay__empty-title">
                No results for &ldquo;{query}&rdquo;
              </div>
              <div className="search-overlay__empty-hint">
                Try a different search term
              </div>
            </div>
          )}

          {hasQuery && !isSearching && hasResults && (
            <>
              {orderedTypes.map((type) => {
                const group = groupedResults[type]
                if (!group || group.length === 0) return null

                return (
                  <div key={type} className="search-overlay__group">
                    <div className="search-overlay__group-label">
                      {TYPE_LABELS[type]}
                    </div>
                    {group.map((result) => {
                      flatIndex++
                      const currentIndex = flatIndex
                      const isSelected = currentIndex === selectedIndex
                      const TypeIcon = TYPE_ICONS[result.type]
                      const showEmoji = isEmojiIcon(result.icon)

                      return (
                        <button
                          key={result.id}
                          data-search-index={currentIndex}
                          className={`search-overlay__item${
                            isSelected ? ' search-overlay__item--selected' : ''
                          }`}
                          onClick={() => handleSelect(result)}
                          onMouseEnter={() => search(query)} // keep query, just update index via state
                          onMouseMove={() => {
                            // Update selected index on mouse move to track hover
                            // We need direct state manipulation — trigger via search won't work
                            // Instead, we use the data attribute approach
                          }}
                          type="button"
                        >
                          <div
                            className={`search-overlay__item-icon${
                              showEmoji ? ' search-overlay__item-icon--emoji' : ''
                            }`}
                          >
                            {showEmoji ? (
                              result.icon
                            ) : (() => {
                              const IC = getIconComponent(result.icon)
                              return IC ? <IC size={16} /> : <TypeIcon size={16} />
                            })()}
                          </div>
                          <div className="search-overlay__item-content">
                            <span className="search-overlay__item-title">
                              {result.title}
                            </span>
                            {result.description && (
                              <span className="search-overlay__item-desc">
                                {result.description}
                              </span>
                            )}
                          </div>
                          <span
                            className={`search-overlay__type-badge search-overlay__type-badge--${result.type}`}
                          >
                            {result.type}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                )
              })}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="search-overlay__footer">
          <span className="search-overlay__hint">
            <kbd>&#8593;</kbd><kbd>&#8595;</kbd> navigate
          </span>
          <span className="search-overlay__hint">
            <kbd>&#8629;</kbd> open
          </span>
          <span className="search-overlay__hint">
            <kbd>esc</kbd> close
          </span>
        </div>
      </div>
    </div>
  )
}
