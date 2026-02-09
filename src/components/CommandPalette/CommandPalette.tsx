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
} from 'lucide-react'
import { useAppStore } from '../../stores/useAppStore'
import './CommandPalette.css'

interface CommandItem {
  id: string
  label: string
  description?: string
  icon: React.ComponentType<{ size?: number; className?: string }>
  action: () => void
  category: 'navigation' | 'action' | 'recent'
  shortcut?: string
}

export default function CommandPalette() {
  const navigate = useNavigate()
  const { commandPaletteOpen, closeCommandPalette } = useAppStore()
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  // Define commands
  const commands: CommandItem[] = useMemo(
    () => [
      // Quick Actions
      {
        id: 'new-page',
        label: 'Create new page',
        description: 'Add a new page to your workspace',
        icon: Plus,
        action: () => {
          navigate('/pages/new')
          closeCommandPalette()
        },
        category: 'action',
        shortcut: '⌘N',
      },
      {
        id: 'new-project',
        label: 'Create new project',
        description: 'Start a new project',
        icon: Plus,
        action: () => {
          navigate('/projects/new')
          closeCommandPalette()
        },
        category: 'action',
        shortcut: '⌘P',
      },
      {
        id: 'new-document',
        label: 'Create new document',
        description: 'Upload and send for signature',
        icon: Plus,
        action: () => {
          navigate('/documents?action=upload')
          closeCommandPalette()
        },
        category: 'action',
        shortcut: '⌘D',
      },
      {
        id: 'new-memory',
        label: 'Add memory entry',
        description: 'Store knowledge in AI context memory',
        icon: Brain,
        action: () => {
          navigate('/ai/memory?action=add')
          closeCommandPalette()
        },
        category: 'action',
      },
      {
        id: 'new-team',
        label: 'Create agent team',
        description: 'Build a team of AI agents',
        icon: Brain,
        action: () => {
          navigate('/ai/agents?action=new')
          closeCommandPalette()
        },
        category: 'action',
      },
      // Navigation
      {
        id: 'nav-home',
        label: 'Go to Home',
        icon: Home,
        action: () => {
          navigate('/')
          closeCommandPalette()
        },
        category: 'navigation',
      },
      {
        id: 'nav-pages',
        label: 'Go to Pages',
        icon: FileText,
        action: () => {
          navigate('/pages')
          closeCommandPalette()
        },
        category: 'navigation',
      },
      {
        id: 'nav-projects',
        label: 'Go to Projects',
        icon: FolderKanban,
        action: () => {
          navigate('/projects')
          closeCommandPalette()
        },
        category: 'navigation',
      },
      {
        id: 'nav-documents',
        label: 'Go to Documents',
        icon: FileSignature,
        action: () => {
          navigate('/documents')
          closeCommandPalette()
        },
        category: 'navigation',
      },
      {
        id: 'nav-calendar',
        label: 'Go to Calendar',
        icon: Calendar,
        action: () => {
          navigate('/calendar')
          closeCommandPalette()
        },
        category: 'navigation',
      },
      {
        id: 'nav-databases',
        label: 'Go to Databases',
        icon: Database,
        action: () => {
          navigate('/data')
          closeCommandPalette()
        },
        category: 'navigation',
      },
      {
        id: 'nav-ai-memory',
        label: 'Go to AI Memory',
        icon: Brain,
        action: () => {
          navigate('/ai/memory')
          closeCommandPalette()
        },
        category: 'navigation',
      },
      {
        id: 'nav-ai-agents',
        label: 'Go to Agent Teams',
        icon: Brain,
        action: () => {
          navigate('/ai/agents')
          closeCommandPalette()
        },
        category: 'navigation',
      },
      {
        id: 'nav-settings',
        label: 'Go to Settings',
        icon: Settings,
        action: () => {
          navigate('/settings')
          closeCommandPalette()
        },
        category: 'navigation',
      },
    ],
    [navigate, closeCommandPalette]
  )

  // Filter commands based on query (simple fuzzy match)
  const filteredCommands = useMemo(() => {
    if (!query.trim()) return commands
    const lowerQuery = query.toLowerCase()
    return commands.filter(
      (cmd) =>
        cmd.label.toLowerCase().includes(lowerQuery) ||
        cmd.description?.toLowerCase().includes(lowerQuery)
    )
  }, [commands, query])

  // Group by category
  const groupedCommands = useMemo(() => {
    const groups = {
      action: [] as CommandItem[],
      navigation: [] as CommandItem[],
      recent: [] as CommandItem[],
    }
    filteredCommands.forEach((cmd) => {
      groups[cmd.category].push(cmd)
    })
    return groups
  }, [filteredCommands])

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
      const totalItems = filteredCommands.length

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
          if (filteredCommands[selectedIndex]) {
            filteredCommands[selectedIndex].action()
          }
          break
        case 'Escape':
          closeCommandPalette()
          break
      }
    },
    [filteredCommands, selectedIndex, closeCommandPalette]
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
          {filteredCommands.length === 0 ? (
            <div className="command-palette__empty">
              No results found for "{query}"
            </div>
          ) : (
            <>
              {/* Actions */}
              {groupedCommands.action.length > 0 && (
                <div className="command-palette__group">
                  <div className="command-palette__group-label">
                    Quick Actions
                  </div>
                  {groupedCommands.action.map((cmd) => {
                    itemIndex++
                    const Icon = cmd.icon
                    return (
                      <button
                        key={cmd.id}
                        data-index={itemIndex}
                        className={`command-palette__item ${
                          selectedIndex === itemIndex
                            ? 'command-palette__item--selected'
                            : ''
                        }`}
                        onClick={cmd.action}
                        onMouseEnter={() => setSelectedIndex(itemIndex)}
                      >
                        <Icon size={18} className="command-palette__item-icon" />
                        <div className="command-palette__item-content">
                          <span className="command-palette__item-label">
                            {cmd.label}
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
              )}

              {/* Navigation */}
              {groupedCommands.navigation.length > 0 && (
                <div className="command-palette__group">
                  <div className="command-palette__group-label">Navigation</div>
                  {groupedCommands.navigation.map((cmd) => {
                    itemIndex++
                    const Icon = cmd.icon
                    return (
                      <button
                        key={cmd.id}
                        data-index={itemIndex}
                        className={`command-palette__item ${
                          selectedIndex === itemIndex
                            ? 'command-palette__item--selected'
                            : ''
                        }`}
                        onClick={cmd.action}
                        onMouseEnter={() => setSelectedIndex(itemIndex)}
                      >
                        <Icon size={18} className="command-palette__item-icon" />
                        <div className="command-palette__item-content">
                          <span className="command-palette__item-label">
                            {cmd.label}
                          </span>
                        </div>
                        <ArrowRight
                          size={14}
                          className="command-palette__item-arrow"
                        />
                      </button>
                    )
                  })}
                </div>
              )}
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
