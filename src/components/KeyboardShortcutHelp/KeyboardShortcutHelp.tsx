import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { Search, ChevronDown, ChevronRight, X } from 'lucide-react'
import { useAppStore } from '../../stores/useAppStore'
import {
  getAllShortcuts,
  ShortcutCategory,
} from '../../lib/shortcutRegistry'
import type { RegisteredShortcut } from '../../lib/shortcutRegistry'
import './KeyboardShortcutHelp.css'

// ─── Types ─────────────────────────────────────────────────────────────

type SectionId = ShortcutCategory

interface SectionConfig {
  id: SectionId
  title: string
}

// ─── Data ──────────────────────────────────────────────────────────────

const SECTIONS: SectionConfig[] = [
  { id: ShortcutCategory.Navigation, title: 'Navigation' },
  { id: ShortcutCategory.Creation, title: 'Creation' },
  { id: ShortcutCategory.Actions, title: 'Actions' },
  { id: ShortcutCategory.View, title: 'View' },
]

// Fallback shortcuts for when registry is empty (e.g. tests that don't
// initialize useGlobalShortcuts). These are displayed as a baseline.
interface FallbackShortcut {
  keys: string[]
  label: string
  section: SectionId
}

const FALLBACK_SHORTCUTS: FallbackShortcut[] = [
  { keys: ['\u2318', 'K'], label: 'Search', section: ShortcutCategory.Navigation },
  { keys: ['\u2318', '/'], label: 'Shortcuts', section: ShortcutCategory.View },
  { keys: ['G', 'H'], label: 'Home', section: ShortcutCategory.Navigation },
  { keys: ['G', 'P'], label: 'Projects', section: ShortcutCategory.Navigation },
  { keys: ['G', 'D'], label: 'Documents', section: ShortcutCategory.Navigation },
  { keys: ['G', 'W'], label: 'Workspace', section: ShortcutCategory.Navigation },
  { keys: ['G', 'S'], label: 'Scheduling', section: ShortcutCategory.Navigation },
  { keys: ['\u2318', 'B'], label: 'Bold', section: ShortcutCategory.Actions },
  { keys: ['\u2318', 'I'], label: 'Italic', section: ShortcutCategory.Actions },
  { keys: ['\u2318', 'U'], label: 'Underline', section: ShortcutCategory.Actions },
  { keys: ['\u2318', 'E'], label: 'Code', section: ShortcutCategory.Actions },
  { keys: ['\u2318', 'Shift', 'S'], label: 'Strikethrough', section: ShortcutCategory.Actions },
  { keys: ['/'], label: 'Slash commands', section: ShortcutCategory.Actions },
  { keys: ['C'], label: 'New issue', section: ShortcutCategory.Creation },
  { keys: ['N'], label: 'New page', section: ShortcutCategory.Creation },
  { keys: ['\u2318', 'Enter'], label: 'Submit', section: ShortcutCategory.Actions },
  { keys: ['Delete'], label: 'Delete', section: ShortcutCategory.Actions },
  { keys: ['\u2318', 'D'], label: 'Duplicate', section: ShortcutCategory.Actions },
  { keys: ['\u2318', 'Shift', 'D'], label: 'Dark mode', section: ShortcutCategory.View },
  { keys: ['Escape'], label: 'Close modal', section: ShortcutCategory.View },
  { keys: ['?'], label: 'Help', section: ShortcutCategory.View },
]

// ─── Helpers ───────────────────────────────────────────────────────────

function isMac(): boolean {
  if (typeof navigator !== 'undefined') {
    if (navigator.platform) {
      return navigator.platform.toUpperCase().includes('MAC')
    }
    return navigator.userAgent.toUpperCase().includes('MAC')
  }
  return false
}

/** Convert a 'mod+k' style key string to display keys array */
function keysToDisplay(keys: string): string[] {
  const mac = isMac()
  return keys.split('+').map((part) => {
    const lower = part.toLowerCase()
    if (lower === 'mod') return mac ? '\u2318' : 'Ctrl'
    if (lower === 'shift') return mac ? '\u21E7' : 'Shift'
    if (lower === 'alt') return mac ? '\u2325' : 'Alt'
    if (part.length === 1) return part.toUpperCase()
    return part
  })
}

interface DisplayShortcut {
  keys: string[]
  label: string
  section: SectionId
}

// ─── Component ─────────────────────────────────────────────────────────

export default function KeyboardShortcutHelp() {
  const shortcutHelpOpen = useAppStore((s) => s.shortcutHelpOpen)
  const closeShortcutHelp = useAppStore((s) => s.closeShortcutHelp)

  const [searchQuery, setSearchQuery] = useState('')
  const [collapsedSections, setCollapsedSections] = useState<Set<SectionId>>(new Set())
  const searchInputRef = useRef<HTMLInputElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)

  // Build display list from registry (with fallback)
  const allShortcuts: DisplayShortcut[] = useMemo(() => {
    const registered = getAllShortcuts()
    if (registered.length === 0) {
      return FALLBACK_SHORTCUTS
    }

    // Merge registry shortcuts and fallbacks, preferring registry
    const fromRegistry: DisplayShortcut[] = registered.map((s: RegisteredShortcut) => ({
      keys: s.chord ? keysToDisplay(s.chord) : keysToDisplay(s.keys),
      label: s.label,
      section: s.category,
    }))

    // Add fallback shortcuts whose labels aren't already covered by registry
    const registeredLabels = new Set(fromRegistry.map((s) => s.label.toLowerCase()))
    const fromFallback = FALLBACK_SHORTCUTS.filter(
      (f) => !registeredLabels.has(f.label.toLowerCase())
    )

    return [...fromRegistry, ...fromFallback]
  // eslint-disable-next-line react-hooks/exhaustive-deps -- Re-read registry when modal opens
  }, [shortcutHelpOpen])

  // Filter shortcuts based on search query
  const filteredShortcuts = useMemo(() => {
    if (!searchQuery.trim()) return allShortcuts
    const query = searchQuery.toLowerCase()
    return allShortcuts.filter(
      (shortcut) =>
        shortcut.label.toLowerCase().includes(query) ||
        shortcut.keys.some((key) => key.toLowerCase().includes(query))
    )
  }, [searchQuery, allShortcuts])

  // Group filtered shortcuts by section
  const groupedShortcuts = useMemo(() => {
    const groups = new Map<SectionId, DisplayShortcut[]>()
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
  const toggleSection = useCallback((sectionId: SectionId) => {
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
