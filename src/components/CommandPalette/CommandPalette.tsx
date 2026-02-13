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
  Receipt,
  Code2,
} from 'lucide-react'
import { useAppStore } from '../../stores/useAppStore'
import { useTheme } from '../../hooks/useTheme'
import { useDocumentStore } from '../../stores/useDocumentStore'
import { useWorkspaceStore } from '../../features/workspace/stores/useWorkspaceStore'
import { useProjectStore } from '../../features/projects/stores/useProjectStore'
import { useSchedulingStore } from '../../features/scheduling/stores/useSchedulingStore'
import { useDatabaseStore } from '../../features/databases/stores/useDatabaseStore'
import { fuzzyMatch, highlightMatches } from '../../lib/fuzzyMatch'
import './CommandPalette.css'

interface CommandItem {
  id: string
  label: string
  description?: string
  icon: React.ComponentType<{ size?: number; className?: string }>
  action: () => void
  category: 'navigation' | 'action' | 'recent' | 'document' | 'page' | 'project' | 'event' | 'database'
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
  const { theme, setTheme } = useTheme()
  const { compactMode, setCompactMode } = useAppStore()
  const documents = useDocumentStore((s) => s.documents)
  const pagesMap = useWorkspaceStore((s) => s.pages)
  const projectsMap = useProjectStore((s) => s.projects)
  const issuesMap = useProjectStore((s) => s.issues)
  const workspacePages = useMemo(() => Object.values(pagesMap), [pagesMap])
  const projects = useMemo(() => Object.values(projectsMap), [projectsMap])
  const projectIssues = useMemo(() => Object.values(issuesMap), [issuesMap])
  const eventTypes = useSchedulingStore((s) => s.eventTypes)
  const databasesArr = useDatabaseStore((s) => s.databases)
  const databases = useMemo(() => Object.values(databasesArr), [databasesArr])
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
        id: 'new-event-type',
        label: 'Create new event type',
        description: 'Set up a new booking type',
        icon: Plus,
        action: () => navigateAndTrack('/calendar/events', 'New Event Type'),
        category: 'action',
      },
      {
        id: 'new-database',
        label: 'Create new database',
        description: 'Build a new relational database',
        icon: Plus,
        action: () => navigateAndTrack('/data', 'New Database'),
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
        label: 'Go to Copilot',
        icon: Brain,
        action: () => navigateAndTrack('/copilot', 'Copilot'),
        category: 'navigation',
        shortcut: 'G B',
      },
      {
        id: 'nav-tax',
        label: 'Go to Tax',
        icon: Receipt,
        action: () => navigateAndTrack('/tax', 'Tax'),
        category: 'navigation',
        shortcut: 'G T',
      },
      {
        id: 'nav-developer',
        label: 'Go to Developer',
        icon: Code2,
        action: () => navigateAndTrack('/developer', 'Developer'),
        category: 'navigation',
        shortcut: 'G X',
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

    // Search pages (when query length >= 2)
    if (trimmed.length >= 2) {
      for (const page of workspacePages) {
        const match = fuzzyMatch(trimmed, page.title || 'Untitled')
        if (match) {
          scored.push({
            id: `page-${page.id}`,
            label: page.title || 'Untitled',
            description: `Page${page.icon ? ` ${page.icon}` : ''}`,
            icon: FileText,
            action: () => navigateAndTrack(`/pages/${page.id}`, page.title || 'Untitled'),
            category: 'page',
            score: match.score,
          })
        }
      }
    }

    // Search projects (when query length >= 2)
    if (trimmed.length >= 2) {
      for (const project of projects) {
        const match = fuzzyMatch(trimmed, project.name)
        if (match) {
          const issueCount = projectIssues.filter((i) => i.projectId === project.id).length
          scored.push({
            id: `proj-${project.id}`,
            label: project.name,
            description: `Project · ${issueCount} issue${issueCount !== 1 ? 's' : ''}`,
            icon: FolderKanban,
            action: () => navigateAndTrack(`/projects/${project.id}`, project.name),
            category: 'project',
            score: match.score,
          })
        }
      }

      for (const issue of projectIssues) {
        const titleMatch = fuzzyMatch(trimmed, issue.title)
        const idMatch = fuzzyMatch(trimmed, issue.identifier)
        const bestScore = Math.max(titleMatch?.score ?? -1, idMatch?.score ?? -1)
        if (bestScore >= 0) {
          const project = projects.find((p) => p.id === issue.projectId)
          scored.push({
            id: `issue-${issue.id}`,
            label: `${issue.identifier} ${issue.title}`,
            description: `${project?.name ?? 'Project'} · ${issue.status}`,
            icon: FolderKanban,
            action: () => navigateAndTrack(`/projects/${issue.projectId}`, issue.title),
            category: 'project',
            score: bestScore,
          })
        }
      }
    }

    // Search event types (when query length >= 2)
    if (trimmed.length >= 2) {
      for (const et of eventTypes) {
        const match = fuzzyMatch(trimmed, et.name)
        if (match) {
          scored.push({
            id: `event-${et.id}`,
            label: et.name,
            description: `Event type · ${et.durationMinutes}min`,
            icon: Calendar,
            action: () => navigateAndTrack('/calendar/events', et.name),
            category: 'event',
            score: match.score,
          })
        }
      }
    }

    // Search databases (when query length >= 2)
    if (trimmed.length >= 2) {
      for (const db of databases) {
        const match = fuzzyMatch(trimmed, db.name)
        if (match) {
          scored.push({
            id: `db-${db.id}`,
            label: db.name,
            description: `Database · ${db.tables.length} tables`,
            icon: Database,
            action: () => navigateAndTrack(`/data/${db.id}`, db.name),
            category: 'database',
            score: match.score,
          })
        }
      }
    }

    // Sort by score descending
    scored.sort((a, b) => (b.score ?? 0) - (a.score ?? 0))

    return scored
  }, [query, commands, documents, workspacePages, projects, projectIssues, eventTypes, databases, recentItems, navigateAndTrack])

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
      page: [] as CommandItem[],
      project: [] as CommandItem[],
      event: [] as CommandItem[],
      database: [] as CommandItem[],
    }
    filteredItems.forEach((cmd) => {
      groups[cmd.category].push(cmd)
    })
    return groups
  }, [filteredItems])

  // Keyboard shortcuts: Cmd+K opens SearchOverlay, not CommandPalette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        const store = useAppStore.getState()
        // Close command palette if open, open search overlay
        if (store.commandPaletteOpen) {
          store.closeCommandPalette()
        }
        store.toggleSearchOverlay()
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
              {renderGroup('Pages', groupedCommands.page)}
              {renderGroup('Projects', groupedCommands.project)}
              {renderGroup('Events', groupedCommands.event)}
              {renderGroup('Databases', groupedCommands.database)}
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
