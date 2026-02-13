import { useState, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CheckCircle2,
  Circle,
  FileText,
  Upload,
  CalendarDays,
  Database,
  UserPlus,
  Command,
  X,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { useWorkspaceStore } from '../../features/workspace/stores/useWorkspaceStore'
import { useDocumentStore } from '../../stores/useDocumentStore'
import { useSchedulingStore } from '../../features/scheduling/stores/useSchedulingStore'
import { useDatabaseStore } from '../../features/databases/stores/useDatabaseStore'
import './FirstRunChecklist.css'

const STORAGE_KEY = 'orchestree-first-run-checklist-dismissed'
const CMD_K_USED_KEY = 'orchestree-cmd-k-used'

interface ChecklistItem {
  id: string
  label: string
  description: string
  link: string
  icon: React.ComponentType<{ size?: number }>
}

const CHECKLIST_ITEMS: ChecklistItem[] = [
  {
    id: 'create-page',
    label: 'Create your first page',
    description: 'Start writing with the block editor',
    link: '/pages/new',
    icon: FileText,
  },
  {
    id: 'upload-document',
    label: 'Upload a document',
    description: 'Send a document for signing',
    link: '/documents',
    icon: Upload,
  },
  {
    id: 'setup-event',
    label: 'Set up an event type',
    description: 'Let others book time with you',
    link: '/calendar',
    icon: CalendarDays,
  },
  {
    id: 'create-database',
    label: 'Create a database',
    description: 'Organize data with multiple views',
    link: '/data',
    icon: Database,
  },
  {
    id: 'invite-member',
    label: 'Invite a team member',
    description: 'Collaborate with your team',
    link: '/settings/members',
    icon: UserPlus,
  },
  {
    id: 'try-cmd-k',
    label: 'Try the command palette',
    description: 'Press Cmd+K to search anything',
    link: '#',
    icon: Command,
  },
]

export default function FirstRunChecklist() {
  const navigate = useNavigate()

  const [dismissed, setDismissed] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === 'true'
    } catch {
      return false
    }
  })

  const [collapsed, setCollapsed] = useState(false)

  // Check store state for auto-completion
  const pagesMap = useWorkspaceStore((s) => s.pages)
  const documents = useDocumentStore((s) => s.documents)
  const eventTypes = useSchedulingStore((s) => s.eventTypes)
  const databasesMap = useDatabaseStore((s) => s.databases)

  const completedItems = useMemo(() => {
    const completed = new Set<string>()

    // Check pages exist (excluding trashed)
    const hasPages = Object.values(pagesMap).some((p) => !p.trashedAt)
    if (hasPages) completed.add('create-page')

    // Check documents exist
    if (documents.length > 0) completed.add('upload-document')

    // Check event types exist
    if (eventTypes.length > 0) completed.add('setup-event')

    // Check databases exist
    if (Object.keys(databasesMap).length > 0) completed.add('create-database')

    // Check cmd+k usage
    try {
      if (localStorage.getItem(CMD_K_USED_KEY) === 'true') {
        completed.add('try-cmd-k')
      }
    } catch {
      // ignore
    }

    return completed
  }, [pagesMap, documents, eventTypes, databasesMap])

  const completedCount = completedItems.size
  const totalCount = CHECKLIST_ITEMS.length
  const progressPercent = (completedCount / totalCount) * 100

  const handleDismiss = useCallback(() => {
    setDismissed(true)
    try {
      localStorage.setItem(STORAGE_KEY, 'true')
    } catch {
      // ignore
    }
  }, [])

  const handleItemClick = useCallback(
    (item: ChecklistItem) => {
      if (item.id === 'try-cmd-k') {
        // Dispatch cmd+k event
        window.dispatchEvent(
          new KeyboardEvent('keydown', {
            key: 'k',
            metaKey: true,
            bubbles: true,
          })
        )
        try {
          localStorage.setItem(CMD_K_USED_KEY, 'true')
        } catch {
          // ignore
        }
        return
      }
      navigate(item.link)
    },
    [navigate]
  )

  const handleToggleCollapse = useCallback(() => {
    setCollapsed((prev) => !prev)
  }, [])

  if (dismissed) return null

  return (
    <div className="first-run-checklist" role="region" aria-label="Getting started checklist">
      <div className="first-run-checklist__header">
        <div className="first-run-checklist__header-left">
          <h3 className="first-run-checklist__title">Getting Started</h3>
          <span className="first-run-checklist__progress-text">
            {completedCount} of {totalCount} complete
          </span>
        </div>
        <div className="first-run-checklist__header-actions">
          <button
            type="button"
            className="first-run-checklist__collapse-btn"
            onClick={handleToggleCollapse}
            aria-label={collapsed ? 'Expand checklist' : 'Collapse checklist'}
          >
            {collapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          </button>
          <button
            type="button"
            className="first-run-checklist__dismiss-btn"
            onClick={handleDismiss}
            aria-label="Hide checklist"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="first-run-checklist__progress-bar">
        <div
          className="first-run-checklist__progress-fill"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {!collapsed && (
        <div className="first-run-checklist__items">
          {CHECKLIST_ITEMS.map((item) => {
            const isCompleted = completedItems.has(item.id)
            const Icon = item.icon

            return (
              <button
                key={item.id}
                type="button"
                className={`first-run-checklist__item ${isCompleted ? 'first-run-checklist__item--completed' : ''}`}
                onClick={() => handleItemClick(item)}
              >
                <div className="first-run-checklist__item-check">
                  {isCompleted ? (
                    <CheckCircle2 size={18} />
                  ) : (
                    <Circle size={18} />
                  )}
                </div>
                <div className="first-run-checklist__item-icon">
                  <Icon size={16} />
                </div>
                <div className="first-run-checklist__item-content">
                  <span className="first-run-checklist__item-label">{item.label}</span>
                  <span className="first-run-checklist__item-desc">{item.description}</span>
                </div>
              </button>
            )
          })}
        </div>
      )}

      {!collapsed && (
        <div className="first-run-checklist__footer">
          <button
            type="button"
            className="first-run-checklist__hide-link"
            onClick={handleDismiss}
          >
            Hide checklist
          </button>
        </div>
      )}
    </div>
  )
}
