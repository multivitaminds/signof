import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search,
  FileText,
  FolderKanban,
  FileSignature,
  Calendar,
  Database,
  Settings,
  Plus,
  Home,
  ArrowRight,
  Brain,
  Inbox,
  Sun,
  Moon,
  PanelLeft,
  LayoutGrid,
  Keyboard,
  Clock,
} from 'lucide-react'
import { useAppStore } from '../../stores/useAppStore'
import { useDocumentStore } from '../../stores/useDocumentStore'
import { fuzzyMatch, highlightMatches } from '../../lib/fuzzyMatch'
import './CommandPalette.css'

interface CommandItem {
  id: string
  label: string
  description?: string
  icon: React.ComponentType<{ size?: number; className?: string }>
  action: () => void
  category: 'navigation' | 'action' | 'recent' | 'document'
  shortcut?: string
  score?: number
}

function HighlightedText({ text, indices }: { text: string; indices: number[] }) {
  const segments = highlightMatches(text, indices)
  return (
    <>
      {segments.map((seg, i) =>
        seg.highlight ? (
          <mark key={i} className="command-palette__match">{seg.text}</mark>
        ) : (
          <span key={i}>{seg.text}</span>
        )
      )}
    </>
  )
}

export default function CommandPalette() {
  const navigate = useNavigate()
  const {
    commandPaletteOpen,
    closeCommandPalette,
    toggleSidebar,
    toggleShortcutHelp,
    addRecentItem,
    recentItems,
  } = useAppStore()
  const { theme, setTheme, compactMode, setCompactMode } = useAppStore()
  const documents = useDocumentStore((s) => s.documents)
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const navigateAndTrack = useCallback(
    (path: string, label: string) => {
      navigate(path)
      addRecentItem({ path, label })
      closeCommandPalette()
    },
    [navigate, addRecentItem, closeCommandPalette]
  )

  // Define commands
  const commands: CommandItem[] = useMemo(
    () => [
      // Quick Actions
      {
        id: 'new-page',
        label: 'Create new page',
        description: 'Add a new page to your workspace',
        icon: Plus,
        action: () => navigateAndTrack('/pages/new', 'New Page'),
        category: 'action',
        shortcut: '⌘N',
      },
      {
        id: 'new-project',
        label: 'Create new project',
        description: 'Start a new project',
        icon: Plus,
        action: () => navigateAndTrack('/projects/new', 'New Project'),
        category: 'action',
      },
      {
        id: 'new-document',
        label: 'Create new document',
        description: 'Upload and send for signature',
        icon: Plus,
        action: () => navigateAndTrack('/documents?action=upload', 'New Document'),
        category: 'action',
      },
      {
        id: 'toggle-theme',
        label: 'Toggle theme',
        description: `Switch to ${theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light'} mode`,
        icon: theme === 'dark' ? Moon : Sun,
        action: () => {
          const next = theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light'
          setTheme(next)
          closeCommandPalette()
        },
        category: 'action',
      },
      {
        id: 'toggle-sidebar',
        label: 'Toggle sidebar',
        description: 'Show or hide the sidebar',
        icon: PanelLeft,
        action: () => {
          toggleSidebar()
          closeCommandPalette()
        },
        category: 'action',
        shortcut: '[',
      },
      {
        id: 'toggle-compact',
        label: 'Toggle compact mode',
        description: compactMode ? 'Switch to normal mode' : 'Switch to compact mode',
        icon: LayoutGrid,
        action: () => {
          setCompactMode(!compactMode)
          closeCommandPalette()
        },
        category: 'action',
      },
      {
        id: 'keyboard-shortcuts',
        label: 'Keyboard shortcuts',
        description: 'View all keyboard shortcuts',
        icon: Keyboard,
        action: () => {
          closeCommandPalette()
          toggleShortcutHelp()
        },
        category: 'action',
        shortcut: '?',
      },
      // Navigation
      {
        id: 'nav-home',
        label: 'Go to Home',
        icon: Home,
        action: () => navigateAndTrack('/', 'Home'),
        category: 'navigation',
        shortcut: 'G H',
      },
      {
        id: 'nav-pages',
        label: 'Go to Pages',
        icon: FileText,
        action: () => navigateAndTrack('/pages', 'Pages'),
        category: 'navigation',
        shortcut: 'G A',
      },
      {
        id: 'nav-projects',
        label: 'Go to Projects',
        icon: FolderKanban,
        action: () => navigateAndTrack('/projects', 'Projects'),
        category: 'navigation',
        shortcut: 'G P',
      },
      {
        id: 'nav-documents',
        label: 'Go to Documents',
        icon: FileSignature,
        action: () => navigateAndTrack('/documents', 'Documents'),
        category: 'navigation',
        shortcut: 'G D',
      },
      {
        id: 'nav-calendar',
        label: 'Go to Calendar',
        icon: Calendar,
        action: () => navigateAndTrack('/calendar', 'Calendar'),
        category: 'navigation',
        shortcut: 'G S',
      },
      {
        id: 'nav-databases',
        label: 'Go to Databases',
        icon: Database,
        action: () => navigateAndTrack('/data', 'Databases'),
        category: 'navigation',
        shortcut: 'G C',
      },
      {
        id: 'nav-inbox',
        label: 'Go to Inbox',
        icon: Inbox,
        action: () => navigateAndTrack('/inbox', 'Inbox'),
        category: 'navigation',
        shortcut: 'G I',
      },
      {
        id: 'nav-ai',
        label: 'Go to AI',
        icon: Brain,
        action: () => navigateAndTrack('/ai', 'AI'),
        category: 'navigation',
        shortcut: 'G B',
      },
      {
        id: 'nav-settings',
        label: 'Go to Settings',
        icon: Settings,
        action: () => navigateAndTrack('/settings', 'Settings'),
        category: 'navigation',
      },
    ],
    [closeCommandPalette, navigateAndTrack, theme, setTheme, compactMode, setCompactMode, toggleSidebar, toggleShortcutHelp]
  )

  // Build filtered + scored results
  const filteredItems = useMemo(() => {
    const trimmed = query.trim()

    // Empty query: show recent items (if any) + all commands
    if (!trimmed) {
      const recents: CommandItem[] = recentItems.slice(0, 5).map((r) => ({
        id: `recent-${r.path}`,
        label: r.label,
        icon: Clock,
        action: () => navigateAndTrack(r.path, r.label),
        category: 'recent' as const,
      }))
      return [...recents, ...commands]
    }

    // Score commands with fuzzy match
    const scored: CommandItem[] = []

    for (const cmd of commands) {
      const labelMatch = fuzzyMatch(trimmed, cmd.label)
      const descMatch = cmd.description ? fuzzyMatch(trimmed, cmd.description) : null
      const bestScore = Math.max(labelMatch?.score ?? -1, descMatch?.score ?? -1)
      if (bestScore >= 0) {
        scored.push({
          ...cmd,
          score: bestScore,
        })
      }
    }

    // Search documents (when query length >= 2)
    if (trimmed.length >= 2) {
      for (const doc of documents) {
        const match = fuzzyMatch(trimmed, doc.name)
        if (match) {
          scored.push({
            id: `doc-${doc.id}`,
            label: doc.name,
            description: `${doc.status} · ${doc.signers.length} signer${doc.signers.length !== 1 ? 's' : ''}`,
            icon: FileSignature,
            action: () => navigateAndTrack(`/documents/${doc.id}`, doc.name),
            category: 'document',
            score: match.score,
          })
        }
      }
    }

    // Sort by score descending
    scored.sort((a, b) => (b.score ?? 0) - (a.score ?? 0))

    return scored
  }, [query, commands, documents, recentItems, navigateAndTrack])

  // Get matched indices per item for highlighting
  const getMatchIndices = useCallback(
    (label: string): number[] => {
      if (!query.trim()) return []
      const result = fuzzyMatch(query.trim(), label)
      return result?.matchedIndices ?? []
    },
    [query]
  )

  // Group by category
  const groupedCommands = useMemo(() => {
    const groups = {
      recent: [] as CommandItem[],
      action: [] as CommandItem[],
      navigation: [] as CommandItem[],
      document: [] as CommandItem[],
    }
    filteredItems.forEach((cmd) => {
      groups[cmd.category].push(cmd)
    })
    return groups
  }, [filteredItems])

  // Keyboard shortcuts to open palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        useAppStore.getState().toggleCommandPalette()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Focus input when opened
  useEffect(() => {
    if (commandPaletteOpen) {
      setQuery('')
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 0)
    }
  }, [commandPaletteOpen])

  // Keyboard navigation within palette
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const totalItems = filteredItems.length

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex((prev) => (prev + 1) % totalItems)
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex((prev) => (prev - 1 + totalItems) % totalItems)
          break
        case 'Enter':
          e.preventDefault()
          if (filteredItems[selectedIndex]) {
            filteredItems[selectedIndex].action()
          }
          break
        case 'Escape':
          closeCommandPalette()
          break
      }
    },
    [filteredItems, selectedIndex, closeCommandPalette]
  )

  // Scroll selected item into view
  useEffect(() => {
    const selectedEl = listRef.current?.querySelector(
      `[data-index="${selectedIndex}"]`
    )
    selectedEl?.scrollIntoView({ block: 'nearest' })
  }, [selectedIndex])

  // Reset selection when query changes
  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  if (!commandPaletteOpen) return null

  let itemIndex = -1

  const renderGroup = (
    label: string,
    items: CommandItem[]
  ) => {
    if (items.length === 0) return null
    return (
      <div className="command-palette__group">
        <div className="command-palette__group-label">{label}</div>
        {items.map((cmd) => {
          itemIndex++
          const currentIndex = itemIndex
          const Icon = cmd.icon
          const indices = getMatchIndices(cmd.label)
          return (
            <button
              key={cmd.id}
              data-index={currentIndex}
              className={`command-palette__item ${
                selectedIndex === currentIndex
                  ? 'command-palette__item--selected'
                  : ''
              }`}
              onClick={cmd.action}
              onMouseEnter={() => setSelectedIndex(currentIndex)}
            >
              <Icon size={18} className="command-palette__item-icon" />
              <div className="command-palette__item-content">
                <span className="command-palette__item-label">
                  {indices.length > 0 ? (
                    <HighlightedText text={cmd.label} indices={indices} />
                  ) : (
                    cmd.label
                  )}
                </span>
                {cmd.description && (
                  <span className="command-palette__item-desc">
                    {cmd.description}
                  </span>
                )}
              </div>
              {cmd.shortcut && (
                <kbd className="command-palette__item-shortcut">
                  {cmd.shortcut}
                </kbd>
              )}
              <ArrowRight
                size={14}
                className="command-palette__item-arrow"
              />
            </button>
          )
        })}
      </div>
    )
  }

  return (
    <div className="command-palette__overlay" onClick={closeCommandPalette}>
      <div
        className="command-palette"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
      >
        {/* Search Input */}
        <div className="command-palette__search">
          <Search size={20} className="command-palette__search-icon" />
          <input
            ref={inputRef}
            type="text"
            className="command-palette__input"
            placeholder="Type a command or search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            autoComplete="off"
            autoCorrect="off"
            spellCheck="false"
          />
        </div>

        {/* Results */}
        <div className="command-palette__results" ref={listRef}>
          {filteredItems.length === 0 ? (
            <div className="command-palette__empty">
              <div>No results found for &ldquo;{query}&rdquo;</div>
              <div className="command-palette__empty-hint">
                Try searching for pages, documents, or commands
              </div>
            </div>
          ) : (
            <>
              {renderGroup('Recent', groupedCommands.recent)}
              {renderGroup('Quick Actions', groupedCommands.action)}
              {renderGroup('Documents', groupedCommands.document)}
              {renderGroup('Navigation', groupedCommands.navigation)}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="command-palette__footer">
          <span className="command-palette__hint">
            <kbd>↑</kbd><kbd>↓</kbd> to navigate
          </span>
          <span className="command-palette__hint">
            <kbd>↵</kbd> to select
          </span>
          <span className="command-palette__hint">
            <kbd>esc</kbd> to close
          </span>
        </div>
      </div>
    </div>
  )
}
