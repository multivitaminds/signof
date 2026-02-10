import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FileSignature,
  FileText,
  FolderKanban,
  Calendar,
  Database,
  Upload,
} from 'lucide-react'
import './QuickActions.css'

interface QuickAction {
  id: string
  label: string
  shortcut: string
  icon: React.ComponentType<{ size?: number }>
  color: string
  path: string
}

const ACTIONS: QuickAction[] = [
  {
    id: 'new-document',
    label: 'New Document',
    shortcut: 'D',
    icon: FileSignature,
    color: '#DC2626',
    path: '/documents',
  },
  {
    id: 'new-page',
    label: 'New Page',
    shortcut: 'N',
    icon: FileText,
    color: '#4F46E5',
    path: '/pages/new',
  },
  {
    id: 'new-issue',
    label: 'New Issue',
    shortcut: 'C',
    icon: FolderKanban,
    color: '#0EA5E9',
    path: '/projects',
  },
  {
    id: 'new-event',
    label: 'New Event',
    shortcut: 'E',
    icon: Calendar,
    color: '#059669',
    path: '/calendar/new',
  },
  {
    id: 'new-database',
    label: 'New Database',
    shortcut: 'B',
    icon: Database,
    color: '#D97706',
    path: '/data/new',
  },
  {
    id: 'upload-file',
    label: 'Upload File',
    shortcut: 'U',
    icon: Upload,
    color: '#8B5CF6',
    path: '/documents?action=upload',
  },
]

export default function QuickActions() {
  const navigate = useNavigate()

  const handleClick = useCallback(
    (path: string) => {
      navigate(path)
    },
    [navigate]
  )

  return (
    <section className="quick-actions" aria-label="Quick actions">
      <h2 className="quick-actions__title">Quick Actions</h2>
      <div className="quick-actions__grid">
        {ACTIONS.map((action) => {
          const Icon = action.icon
          return (
            <button
              key={action.id}
              className="quick-actions__card"
              onClick={() => handleClick(action.path)}
              style={{ '--action-color': action.color } as React.CSSProperties}
              type="button"
            >
              <div className="quick-actions__icon">
                <Icon size={24} />
              </div>
              <span className="quick-actions__label">{action.label}</span>
              <kbd className="quick-actions__shortcut">{action.shortcut}</kbd>
            </button>
          )
        })}
      </div>
    </section>
  )
}
