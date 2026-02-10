import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { Search, ChevronDown, ChevronRight, X } from 'lucide-react'
import { useAppStore } from '../../stores/useAppStore'
import './KeyboardShortcutHelp.css'

// ─── Types ─────────────────────────────────────────────────────────────

type ShortcutSection = 'navigation' | 'editor' | 'actions' | 'global'

interface ShortcutItem {
  keys: string[]
  label: string
  section: ShortcutSection
}

interface SectionConfig {
  id: ShortcutSection
  title: string
}

// ─── Data ──────────────────────────────────────────────────────────────

const SECTIONS: SectionConfig[] = [
  { id: 'navigation', title: 'Navigation' },
  { id: 'editor', title: 'Editor' },
  { id: 'actions', title: 'Actions' },
  { id: 'global', title: 'Global' },
]

const SHORTCUTS: ShortcutItem[] = [
  // Navigation
  { keys: ['\u2318', 'K'], label: 'Search', section: 'navigation' },
  { keys: ['\u2318', '/'], label: 'Shortcuts', section: 'navigation' },
  { keys: ['G', 'H'], label: 'Home', section: 'navigation' },
  { keys: ['G', 'P'], label: 'Projects', section: 'navigation' },
  { keys: ['G', 'D'], label: 'Documents', section: 'navigation' },
  { keys: ['G', 'W'], label: 'Workspace', section: 'navigation' },
  { keys: ['G', 'S'], label: 'Scheduling', section: 'navigation' },

  // Editor
  { keys: ['\u2318', 'B'], label: 'Bold', section: 'editor' },
  { keys: ['\u2318', 'I'], label: 'Italic', section: 'editor' },
  { keys: ['\u2318', 'U'], label: 'Underline', section: 'editor' },
  { keys: ['\u2318', 'E'], label: 'Code', section: 'editor' },
  { keys: ['\u2318', 'Shift', 'S'], label: 'Strikethrough', section: 'editor' },
  { keys: ['/'], label: 'Slash commands', section: 'editor' },

  // Actions
  { keys: ['C'], label: 'New issue', section: 'actions' },
  { keys: ['N'], label: 'New page', section: 'actions' },
  { keys: ['\u2318', 'Enter'], label: 'Submit', section: 'actions' },
  { keys: ['Delete'], label: 'Delete', section: 'actions' },
  { keys: ['\u2318', 'D'], label: 'Duplicate', section: 'actions' },

  // Global
  { keys: ['\u2318', 'Shift', 'D'], label: 'Dark mode', section: 'global' },
  { keys: ['Escape'], label: 'Close modal', section: 'global' },
  { keys: ['?'], label: 'Help', section: 'global' },
]

// ─── Component ─────────────────────────────────────────────────────────

export default function KeyboardShortcutHelp() {
  const shortcutHelpOpen = useAppStore((s) => s.shortcutHelpOpen)
  const closeShortcutHelp = useAppStore((s) => s.closeShortcutHelp)

  const [searchQuery, setSearchQuery] = useState('')
  const [collapsedSections, setCollapsedSections] = useState<Set<ShortcutSection>>(new Set())
  const searchInputRef = useRef<HTMLInputElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)

  // Filter shortcuts based on search query
  const filteredShortcuts = useMemo(() => {
    if (!searchQuery.trim()) return SHORTCUTS
    const query = searchQuery.toLowerCase()
    return SHORTCUTS.filter(
      (shortcut) =>
        shortcut.label.toLowerCase().includes(query) ||
        shortcut.keys.some((key) => key.toLowerCase().includes(query))
    )
  }, [searchQuery])

  // Group filtered shortcuts by section
  const groupedShortcuts = useMemo(() => {
    const groups = new Map<ShortcutSection, ShortcutItem[]>()
    for (const section of SECTIONS) {
      const items = filteredShortcuts.filter((s) => s.section === section.id)
      if (items.length > 0) {
        groups.set(section.id, items)
      }
    }
    return groups
  }, [filteredShortcuts])

  // Focus search input when modal opens
  useEffect(() => {
    if (!shortcutHelpOpen) return
    // Delay reset + focus to after animation frame
    const timer = setTimeout(() => {
      setSearchQuery('')
      setCollapsedSections(new Set())
      searchInputRef.current?.focus()
    }, 100)
    return () => clearTimeout(timer)
  }, [shortcutHelpOpen])

  // Handle keyboard events
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeShortcutHelp()
      }
    },
    [closeShortcutHelp]
  )

  useEffect(() => {
    if (!shortcutHelpOpen) return
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [shortcutHelpOpen, handleKeyDown])

  // Handle overlay click
  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        closeShortcutHelp()
      }
    },
    [closeShortcutHelp]
  )

  // Toggle section collapse
  const toggleSection = useCallback((sectionId: ShortcutSection) => {
    setCollapsedSections((prev) => {
      const next = new Set(prev)
      if (next.has(sectionId)) {
        next.delete(sectionId)
      } else {
        next.add(sectionId)
      }
      return next
    })
  }, [])

  // Handle search input change
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    // Expand all sections when searching
    setCollapsedSections(new Set())
  }, [])

  // Clear search
  const handleClearSearch = useCallback(() => {
    setSearchQuery('')
    searchInputRef.current?.focus()
  }, [])

  if (!shortcutHelpOpen) return null

  return (
    <div
      className="modal-overlay"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-label="Keyboard shortcuts"
    >
      <div className="modal-content keyboard-help" ref={modalRef}>
        <div className="modal-header">
          <h2>Keyboard Shortcuts</h2>
          <button
            className="modal-close"
            onClick={closeShortcutHelp}
            aria-label="Close keyboard shortcuts"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search input */}
        <div className="keyboard-help__search">
          <Search size={16} className="keyboard-help__search-icon" aria-hidden="true" />
          <input
            ref={searchInputRef}
            type="text"
            className="keyboard-help__search-input"
            placeholder="Search shortcuts..."
            value={searchQuery}
            onChange={handleSearchChange}
            aria-label="Search keyboard shortcuts"
          />
          {searchQuery && (
            <button
              className="keyboard-help__search-clear"
              onClick={handleClearSearch}
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Shortcuts body */}
        <div className="keyboard-help__body" role="list">
          {groupedShortcuts.size === 0 && (
            <p className="keyboard-help__empty">
              No shortcuts match &ldquo;{searchQuery}&rdquo;
            </p>
          )}

          {SECTIONS.map((section) => {
            const items = groupedShortcuts.get(section.id)
            if (!items) return null

            const isCollapsed = collapsedSections.has(section.id)

            return (
              <div
                key={section.id}
                className="keyboard-help__section"
                role="listitem"
              >
                <button
                  className="keyboard-help__section-toggle"
                  onClick={() => toggleSection(section.id)}
                  aria-expanded={!isCollapsed}
                  aria-controls={`shortcut-section-${section.id}`}
                >
                  {isCollapsed ? (
                    <ChevronRight size={14} className="keyboard-help__chevron" />
                  ) : (
                    <ChevronDown size={14} className="keyboard-help__chevron" />
                  )}
                  <span className="keyboard-help__section-title">{section.title}</span>
                  <span className="keyboard-help__section-count">{items.length}</span>
                </button>

                {!isCollapsed && (
                  <ul
                    id={`shortcut-section-${section.id}`}
                    className="keyboard-help__list"
                    role="list"
                  >
                    {items.map((shortcut) => (
                      <li key={shortcut.label} className="keyboard-help__item">
                        <span className="keyboard-help__desc">{shortcut.label}</span>
                        <span className="keyboard-help__keys">
                          {shortcut.keys.map((key, i) => (
                            <span key={i} className="keyboard-help__key-group">
                              {i > 0 && (
                                <span className="keyboard-help__key-separator" aria-hidden="true">
                                  +
                                </span>
                              )}
                              <kbd className="keyboard-help__key">{key}</kbd>
                            </span>
                          ))}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
