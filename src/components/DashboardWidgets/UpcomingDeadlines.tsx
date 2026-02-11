import { useMemo } from 'react'
import { Clock, FileText, FolderKanban, Calendar } from 'lucide-react'
import { useDocumentStore } from '../../stores/useDocumentStore'
import './DashboardWidgets.css'

interface DeadlineItem {
  id: string
  label: string
  date: string
  type: 'document' | 'project' | 'booking'
}

export default function UpcomingDeadlines() {
  const documents = useDocumentStore((s) => s.documents)

  const deadlines = useMemo<DeadlineItem[]>(() => {
    const items: DeadlineItem[] = []
    const now = new Date().toISOString()

    // Document expiry dates
    for (const doc of documents) {
      if (doc.expiresAt && doc.expiresAt > now && doc.status !== 'completed' && doc.status !== 'voided') {
        items.push({
          id: `doc-${doc.id}`,
          label: doc.name,
          date: doc.expiresAt,
          type: 'document',
        })
      }
    }

    // Simulated project due dates
    items.push({
      id: 'proj-1',
      label: 'Q1 Review sprint ends',
      date: new Date(Date.now() + 2 * 86400000).toISOString(),
      type: 'project',
    })
    items.push({
      id: 'proj-2',
      label: 'Design system milestone',
      date: new Date(Date.now() + 5 * 86400000).toISOString(),
      type: 'project',
    })

    // Simulated booking
    items.push({
      id: 'book-1',
      label: 'Team standup',
      date: new Date(Date.now() + 1 * 86400000).toISOString(),
      type: 'booking',
    })

    return items
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 6)
  }, [documents])

  const ICON_MAP = {
    document: FileText,
    project: FolderKanban,
    booking: Calendar,
  }

  const TYPE_COLOR = {
    document: 'var(--color-warning, #D97706)',
    project: 'var(--color-primary, #4F46E5)',
    booking: 'var(--color-success, #059669)',
  }

  function formatDeadlineDate(dateStr: string): string {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = date.getTime() - now.getTime()
    const diffDays = Math.ceil(diffMs / 86400000)
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Tomorrow'
    if (diffDays < 7) return `In ${diffDays} days`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <div className="dashboard-widget" aria-label="Upcoming deadlines">
      <div className="dashboard-widget__header">
        <Clock size={16} className="dashboard-widget__header-icon" />
        <h3 className="dashboard-widget__title">Upcoming Deadlines</h3>
      </div>
      {deadlines.length === 0 ? (
        <p className="dashboard-widget__empty">No upcoming deadlines</p>
      ) : (
        <ul className="dashboard-widget__list">
          {deadlines.map((item) => {
            const Icon = ICON_MAP[item.type]
            return (
              <li key={item.id} className="dashboard-widget__list-item">
                <Icon size={14} style={{ color: TYPE_COLOR[item.type], flexShrink: 0 }} />
                <span className="dashboard-widget__item-label">{item.label}</span>
                <span className="dashboard-widget__item-date">{formatDeadlineDate(item.date)}</span>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
