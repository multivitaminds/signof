import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { Search, X, Clock, Trash2 } from 'lucide-react'
import { useSearchStore } from '../../stores/useSearchStore'
import { SearchResultType } from '../../types/index'
import SearchResultItem from '../SearchResult/SearchResult'
import './SearchOverlay.css'

interface Props {
  isOpen: boolean
  onClose: () => void
}

const MODULE_FILTER_OPTIONS: { value: SearchResultType; label: string }[] = [
  { value: SearchResultType.Document, label: 'Documents' },
  { value: SearchResultType.Page, label: 'Pages' },
  { value: SearchResultType.Issue, label: 'Issues' },
  { value: SearchResultType.Event, label: 'Events' },
  { value: SearchResultType.Database, label: 'Databases' },
  { value: SearchResultType.Contact, label: 'Contacts' },
  { value: SearchResultType.Invoice, label: 'Invoices' },
  { value: SearchResultType.Agent, label: 'Agents' },
  { value: SearchResultType.Tax, label: 'Tax' },
]

export default function SearchOverlay({ isOpen, onClose }: Props) {
  const [inputValue, setInputValue] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<number | null>(null)

  const {
    results,
    recentSearches,
    isSearching,
    search,
    clearResults,
    addRecentSearch,
    clearRecentSearches,
    filters,
    setFilters,
  } = useSearchStore()

  // Group results by type
  const groupedResults = useMemo(() => {
    const groups: Record<string, typeof results> = {}
    for (const r of results) {
      const key = r.type
      if (!groups[key]) groups[key] = []
      groups[key].push(r)
    }
    return groups
  }, [results])

  const flatResults = results

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setInputValue('')
      setSelectedIndex(0)
      clearResults()
      setTimeout(() => inputRef.current?.focus(), 0)
    }
  }, [isOpen, clearResults])

  // Debounced search (150ms)
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!inputValue || inputValue.length < 2) {
      clearResults()
      return
    }
    debounceRef.current = window.setTimeout(() => {
      search(inputValue)
    }, 150)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [inputValue, search, clearResults])

  // Reset selection when results change
  useEffect(() => {
    setSelectedIndex(0)
  }, [results])

  const handleClose = useCallback(() => {
    if (inputValue.length >= 2) {
      addRecentSearch(inputValue)
    }
    onClose()
  }, [inputValue, addRecentSearch, onClose])

  const handleResultSelect = useCallback(() => {
    if (inputValue.length >= 2) {
      addRecentSearch(inputValue)
    }
    onClose()
  }, [inputValue, addRecentSearch, onClose])

  const handleRecentClick = useCallback((recent: string) => {
    setInputValue(recent)
    search(recent)
  }, [search])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const total = flatResults.length

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
          // If there are results, the SearchResult component handles navigation
          // We just need to trigger the click on the selected item
          if (flatResults.length > 0) {
            const selectedEl = listRef.current?.querySelector(
              `[data-result-index="${selectedIndex}"]`
            ) as HTMLButtonElement | null
            selectedEl?.click()
          }
          break
        case 'Escape':
          handleClose()
          break
      }
    },
    [flatResults, selectedIndex, handleClose]
  )

  // Scroll selected item into view
  useEffect(() => {
    const selectedEl = listRef.current?.querySelector(
      `[data-result-index="${selectedIndex}"]`
    )
    selectedEl?.scrollIntoView({ block: 'nearest' })
  }, [selectedIndex])

  const toggleModuleFilter = useCallback((mod: SearchResultType) => {
    setFilters({
      modules: filters.modules.includes(mod)
        ? filters.modules.filter((m) => m !== mod)
        : [...filters.modules, mod],
    })
  }, [filters.modules, setFilters])

  // Re-search when filters change
  useEffect(() => {
    if (inputValue.length >= 2) {
      search(inputValue)
    }
  }, [filters.modules, inputValue, search])

  if (!isOpen) return null

  const showRecent = inputValue.length < 2 && recentSearches.length > 0
  const showEmpty = inputValue.length >= 2 && !isSearching && results.length === 0
  const showResults = results.length > 0

  const GROUP_LABELS: Record<string, string> = {
    document: 'Documents',
    page: 'Pages',
    issue: 'Issues',
    event: 'Events',
    database: 'Databases',
    contact: 'Contacts',
    invoice: 'Invoices',
    agent: 'Agents',
    tax: 'Tax',
    setting: 'Notifications',
  }

  let resultIndex = -1

  return (
    <div className="search-overlay" onClick={handleClose} role="presentation">
      <div
        className="search-overlay__dialog"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Global search"
      >
        {/* Search Input */}
        <div className="search-overlay__header">
          <Search size={20} className="search-overlay__search-icon" />
          <input
            ref={inputRef}
            type="text"
            className="search-overlay__input"
            placeholder="Search across all modules..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            autoComplete="off"
            autoCorrect="off"
            spellCheck="false"
            aria-label="Search input"
          />
          {isSearching && (
            <div className="search-overlay__spinner" aria-label="Searching" />
          )}
          <button
            className="search-overlay__close"
            onClick={handleClose}
            type="button"
            aria-label="Close search"
          >
            <X size={18} />
          </button>
        </div>

        {/* Module Filters */}
        <div className="search-overlay__filters">
          {MODULE_FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={`search-overlay__filter-chip ${
                filters.modules.includes(opt.value) ? 'search-overlay__filter-chip--active' : ''
              }`}
              onClick={() => toggleModuleFilter(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Results Area */}
        <div className="search-overlay__results" ref={listRef}>
          {/* Recent Searches */}
          {showRecent && (
            <div className="search-overlay__section">
              <div className="search-overlay__section-header">
                <span className="search-overlay__section-label">Recent Searches</span>
                <button
                  type="button"
                  className="search-overlay__clear-recent"
                  onClick={clearRecentSearches}
                  aria-label="Clear recent searches"
                >
                  <Trash2 size={14} />
                  Clear
                </button>
              </div>
              {recentSearches.map((recent) => (
                <button
                  key={recent}
                  type="button"
                  className="search-overlay__recent-item"
                  onClick={() => handleRecentClick(recent)}
                >
                  <Clock size={14} className="search-overlay__recent-icon" />
                  <span>{recent}</span>
                </button>
              ))}
            </div>
          )}

          {/* Empty State */}
          {showEmpty && (
            <div className="search-overlay__empty">
              <div className="search-overlay__empty-title">No results found</div>
              <div className="search-overlay__empty-hint">
                Try different keywords or remove filters
              </div>
            </div>
          )}

          {/* Grouped Results */}
          {showResults && Object.entries(groupedResults).map(([type, items]) => (
            <div key={type} className="search-overlay__section">
              <div className="search-overlay__section-label">
                {GROUP_LABELS[type] ?? type}
              </div>
              {items.map((r) => {
                resultIndex++
                const currentIndex = resultIndex
                return (
                  <div key={r.id} data-result-index={currentIndex}>
                    <SearchResultItem
                      result={r}
                      isSelected={selectedIndex === currentIndex}
                      onSelect={handleResultSelect}
                      onMouseEnter={() => setSelectedIndex(currentIndex)}
                    />
                  </div>
                )
              })}
            </div>
          ))}
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
          <span className="search-overlay__result-count">
            {results.length > 0 && `${results.length} result${results.length !== 1 ? 's' : ''}`}
          </span>
        </div>
      </div>
    </div>
  )
}
