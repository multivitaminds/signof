import { useMemo } from 'react'
import { FileText, FolderKanban, Calendar, BookOpen } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useDocumentStore } from '../../stores/useDocumentStore'
import './DashboardWidgets.css'

interface StatItem {
  id: string
  label: string
  value: number
  icon: LucideIcon
  color: string
}

export default function QuickStats() {
  const documents = useDocumentStore((s) => s.documents)

  const stats = useMemo<StatItem[]>(() => {
    const pendingDocs = documents.filter(
      (d) => d.status === 'pending' || d.status === 'sent' || d.status === 'delivered' || d.status === 'viewed'
    ).length

    return [
      {
        id: 'docs-pending',
        label: 'Docs pending signature',
        value: pendingDocs,
        icon: FileText,
        color: 'var(--color-warning, #D97706)',
      },
      {
        id: 'open-issues',
        label: 'Open issues',
        value: 12,
        icon: FolderKanban,
        color: 'var(--color-primary, #4F46E5)',
      },
      {
        id: 'bookings-week',
        label: 'Bookings this week',
        value: 5,
        icon: Calendar,
        color: 'var(--color-success, #059669)',
      },
      {
        id: 'pages-today',
        label: 'Pages edited today',
        value: 3,
        icon: BookOpen,
        color: '#7C3AED',
      },
    ]
  }, [documents])

  return (
    <div className="dashboard-widget" aria-label="Quick stats">
      <div className="dashboard-widget__header">
        <h3 className="dashboard-widget__title">Quick Stats</h3>
      </div>
      <div className="dashboard-widget__stats-grid">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.id} className="dashboard-widget__stat-card">
              <Icon size={20} style={{ color: stat.color }} />
              <span className="dashboard-widget__stat-value">{stat.value}</span>
              <span className="dashboard-widget__stat-label">{stat.label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
