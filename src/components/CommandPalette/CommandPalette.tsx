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
  Bot,
} from 'lucide-react'
import { useAppStore } from '../../stores/useAppStore'
import { useTheme } from '../../hooks/useTheme'
import { useDocumentStore } from '../../stores/useDocumentStore'
import { useWorkspaceStore } from '../../features/workspace/stores/useWorkspaceStore'
import { useProjectStore } from '../../features/projects/stores/useProjectStore'
import { useSchedulingStore } from '../../features/scheduling/stores/useSchedulingStore'
import { useDatabaseStore } from '../../features/databases/stores/useDatabaseStore'
import { useTaxDocumentStore } from '../../features/tax/stores/useTaxDocumentStore'
import { useTaxFilingStore } from '../../features/tax/stores/useTaxFilingStore'
import { useInvoiceStore } from '../../features/accounting/stores/useInvoiceStore'
import useAIAgentStore from '../../features/ai/stores/useAIAgentStore'
import { fuzzyMatch, highlightMatches } from '../../lib/fuzzyMatch'
import VoiceInputButton from '../../features/ai/components/VoiceInputButton/VoiceInputButton'
import './CommandPalette.css'

interface CommandItem {
  id: string
  label: string
  description?: string
  icon: React.ComponentType<{ size?: number; className?: string }>
  action: () => void
  category: 'navigation' | 'action' | 'recent' | 'document' | 'page' | 'project' | 'event' | 'database' | 'tax_document' | 'invoice' | 'agent_run'
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
  const taxDocuments = useTaxDocumentStore((s) => s.documents)
  const taxFilings = useTaxFilingStore((s) => s.filings)
  const invoices = useInvoiceStore((s) => s.invoices)
  const agentRuns = useAIAgentStore((s) => s.runs)
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<number | null>(null)

  const handleVoiceTranscript = useCallback((text: string) => {
    setQuery(text)
  }, [])

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

  // Debounce content search (150ms) while keeping command matches instant
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = window.setTimeout(() => {
      setDebouncedQuery(query)
    }, 150)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query])

  // Detect ">" prefix for commands-only mode
  const commandsOnly = query.startsWith('>')
  const effectiveQuery = commandsOnly ? query.slice(1).trim() : query.trim()
  const effectiveDebouncedQuery = commandsOnly ? debouncedQuery.slice(1).trim() : debouncedQuery.trim()

  // Build filtered + scored results
  const filteredItems = useMemo(() => {
    // Empty query: show recent items (if any) + all commands
    if (!effectiveQuery) {
      if (commandsOnly) return commands
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
      const labelMatch = fuzzyMatch(effectiveQuery, cmd.label)
      const descMatch = cmd.description ? fuzzyMatch(effectiveQuery, cmd.description) : null
      const bestScore = Math.max(labelMatch?.score ?? -1, descMatch?.score ?? -1)
      if (bestScore >= 0) {
        scored.push({
          ...cmd,
          score: bestScore,
        })
      }
    }

    // Skip content search in commands-only mode
    if (commandsOnly) {
      scored.sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
      return scored
    }

    // Content search uses debounced query to avoid re-computing on every keystroke
    const contentQuery = effectiveDebouncedQuery
    const MAX_PER_CATEGORY = 5

    // Search documents (when query length >= 2)
    if (contentQuery.length >= 2) {
      let docCount = 0
      for (const doc of documents) {
        if (docCount >= MAX_PER_CATEGORY) break
        const match = fuzzyMatch(contentQuery, doc.name)
        if (match) {
          docCount++
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
    if (contentQuery.length >= 2) {
      let pageCount = 0
      for (const page of workspacePages) {
        if (pageCount >= MAX_PER_CATEGORY) break
        const match = fuzzyMatch(contentQuery, page.title || 'Untitled')
        if (match) {
          pageCount++
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
    if (contentQuery.length >= 2) {
      let projCount = 0
      for (const project of projects) {
        if (projCount >= MAX_PER_CATEGORY) break
        const match = fuzzyMatch(contentQuery, project.name)
        if (match) {
          projCount++
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
        if (projCount >= MAX_PER_CATEGORY) break
        const titleMatch = fuzzyMatch(contentQuery, issue.title)
        const idMatch = fuzzyMatch(contentQuery, issue.identifier)
        const bestScore = Math.max(titleMatch?.score ?? -1, idMatch?.score ?? -1)
        if (bestScore >= 0) {
          projCount++
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
    if (contentQuery.length >= 2) {
      let eventCount = 0
      for (const et of eventTypes) {
        if (eventCount >= MAX_PER_CATEGORY) break
        const match = fuzzyMatch(contentQuery, et.name)
        if (match) {
          eventCount++
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
    if (contentQuery.length >= 2) {
      let dbCount = 0
      for (const db of databases) {
        if (dbCount >= MAX_PER_CATEGORY) break
        const match = fuzzyMatch(contentQuery, db.name)
        if (match) {
          dbCount++
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

    // Search tax documents (when query length >= 2)
    if (contentQuery.length >= 2) {
      let taxCount = 0
      for (const td of taxDocuments) {
        if (taxCount >= MAX_PER_CATEGORY) break
        const nameMatch = fuzzyMatch(contentQuery, td.fileName)
        const employerMatch = fuzzyMatch(contentQuery, td.employerName)
        const bestScore = Math.max(nameMatch?.score ?? -1, employerMatch?.score ?? -1)
        if (bestScore >= 0) {
          taxCount++
          scored.push({
            id: `taxdoc-${td.id}`,
            label: td.fileName,
            description: `${td.formType} · ${td.employerName} · ${td.taxYear}`,
            icon: Receipt,
            action: () => navigateAndTrack('/tax', td.fileName),
            category: 'tax_document',
            score: bestScore,
          })
        }
      }

      for (const filing of taxFilings) {
        if (taxCount >= MAX_PER_CATEGORY) break
        const nameMatch = fuzzyMatch(contentQuery, `${filing.firstName} ${filing.lastName}`)
        const yearMatch = fuzzyMatch(contentQuery, filing.taxYear)
        const bestScore = Math.max(nameMatch?.score ?? -1, yearMatch?.score ?? -1)
        if (bestScore >= 0) {
          taxCount++
          scored.push({
            id: `taxfiling-${filing.id}`,
            label: `${filing.firstName} ${filing.lastName} — ${filing.taxYear}`,
            description: `Tax filing · ${filing.state} · ${filing.filingStatus}`,
            icon: Receipt,
            action: () => navigateAndTrack('/tax', `${filing.firstName} ${filing.lastName}`),
            category: 'tax_document',
            score: bestScore,
          })
        }
      }
    }

    // Search invoices (when query length >= 2)
    if (contentQuery.length >= 2) {
      let invCount = 0
      for (const inv of invoices) {
        if (invCount >= MAX_PER_CATEGORY) break
        const numMatch = fuzzyMatch(contentQuery, inv.invoiceNumber)
        const custMatch = fuzzyMatch(contentQuery, inv.customerName)
        const bestScore = Math.max(numMatch?.score ?? -1, custMatch?.score ?? -1)
        if (bestScore >= 0) {
          invCount++
          scored.push({
            id: `inv-${inv.id}`,
            label: `${inv.invoiceNumber} — ${inv.customerName}`,
            description: `Invoice · ${inv.status} · $${inv.total.toLocaleString()}`,
            icon: Receipt,
            action: () => navigateAndTrack('/accounting', inv.invoiceNumber),
            category: 'invoice',
            score: bestScore,
          })
        }
      }
    }

    // Search agent runs (when query length >= 2)
    if (contentQuery.length >= 2) {
      let agentCount = 0
      for (const run of agentRuns) {
        if (agentCount >= MAX_PER_CATEGORY) break
        const taskMatch = fuzzyMatch(contentQuery, run.task)
        const typeMatch = fuzzyMatch(contentQuery, run.agentType)
        const bestScore = Math.max(taskMatch?.score ?? -1, typeMatch?.score ?? -1)
        if (bestScore >= 0) {
          agentCount++
          scored.push({
            id: `agent-${run.id}`,
            label: run.task,
            description: `${run.agentType} agent · ${run.status}`,
            icon: Bot,
            action: () => navigateAndTrack('/copilot', run.task),
            category: 'agent_run',
            score: bestScore,
          })
        }
      }
    }

    // Sort by score descending
    scored.sort((a, b) => (b.score ?? 0) - (a.score ?? 0))

    return scored
  }, [effectiveQuery, effectiveDebouncedQuery, commandsOnly, commands, documents, workspacePages, projects, projectIssues, eventTypes, databases, taxDocuments, taxFilings, invoices, agentRuns, recentItems, navigateAndTrack])

  // Get matched indices per item for highlighting
  const getMatchIndices = useCallback(
    (label: string): number[] => {
      if (!effectiveQuery) return []
      const result = fuzzyMatch(effectiveQuery, label)
      return result?.matchedIndices ?? []
    },
    [effectiveQuery]
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
      tax_document: [] as CommandItem[],
      invoice: [] as CommandItem[],
      agent_run: [] as CommandItem[],
    }
    filteredItems.forEach((cmd) => {
      groups[cmd.category].push(cmd)
    })
    return groups
  }, [filteredItems])

  // Keyboard shortcut: Cmd+Shift+P opens command palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'p') {
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

  // Content categories that get type badges (not actions/navigation/recent)
  const BADGE_LABELS: Partial<Record<CommandItem['category'], string>> = {
    document: 'Document',
    page: 'Page',
    project: 'Project',
    event: 'Event',
    database: 'Database',
    tax_document: 'Tax',
    invoice: 'Invoice',
    agent_run: 'Agent',
  }

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
          const badgeLabel = BADGE_LABELS[cmd.category]
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
                  {badgeLabel && (
                    <span className={`command-palette__badge command-palette__badge--${cmd.category}`}>
                      {badgeLabel}
                    </span>
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
            placeholder="Type a command or search... (> for commands)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            autoComplete="off"
            autoCorrect="off"
            spellCheck="false"
          />
          <VoiceInputButton onTranscript={handleVoiceTranscript} />
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
              {renderGroup('Tax', groupedCommands.tax_document)}
              {renderGroup('Invoices', groupedCommands.invoice)}
              {renderGroup('Agent Runs', groupedCommands.agent_run)}
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
          <span className="command-palette__hint">
            <kbd>&gt;</kbd> commands only
          </span>
        </div>
      </div>
    </div>
  )
}
