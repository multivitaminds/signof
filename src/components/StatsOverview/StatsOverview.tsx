import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  FileSignature,
  FileText,
  FolderKanban,
  Calendar,
  Users,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react'
import { useDocumentStore } from '../../stores/useDocumentStore'
import { useWorkspaceStore } from '../../features/workspace/stores/useWorkspaceStore'
import { useProjectStore } from '../../features/projects/stores/useProjectStore'
import { useSchedulingStore } from '../../features/scheduling/stores/useSchedulingStore'
import { ACTIVE_STATUSES, DocumentStatus } from '../../types'
import './StatsOverview.css'

interface StatCardData {
  label: string
  value: number
  detail?: string
  icon: React.ComponentType<{ size?: number }>
  color: string
  path: string
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string
}

export default function StatsOverview() {
  const documents = useDocumentStore((s) => s.documents)
  const pagesMap = useWorkspaceStore((s) => s.pages)
  const issuesMap = useProjectStore((s) => s.issues)
  const members = useProjectStore((s) => s.members)
  const bookings = useSchedulingStore((s) => s.bookings)

  const stats: StatCardData[] = useMemo(() => {
    const pendingDocs = documents.filter((d) =>
      (ACTIVE_STATUSES as string[]).includes(d.status)
    ).length
    const completedDocs = documents.filter(
      (d) => d.status === DocumentStatus.Completed
    ).length

    const totalPages = Object.values(pagesMap).filter((p) => !p.trashedAt).length

    const openIssues = Object.values(issuesMap).filter(
      (i) => i.status !== 'done' && i.status !== 'cancelled'
    ).length
    const closedIssues = Object.values(issuesMap).filter(
      (i) => i.status === 'done'
    ).length

    const today = new Date().toISOString().split('T')[0] ?? ''
    const upcomingBookings = bookings.filter(
      (b) => b.status === 'confirmed' && b.date >= today
    ).length

    return [
      {
        label: 'Documents',
        value: documents.length,
        detail: `${pendingDocs} pending / ${completedDocs} completed`,
        icon: FileSignature,
        color: '#4F46E5',
        path: '/documents',
        trend: completedDocs > pendingDocs ? 'up' : pendingDocs > 0 ? 'down' : 'neutral',
        trendValue: pendingDocs > 0 ? `${pendingDocs} active` : 'All clear',
      },
      {
        label: 'Pages',
        value: totalPages,
        icon: FileText,
        color: '#0EA5E9',
        path: '/pages',
        trend: totalPages > 0 ? 'up' : 'neutral',
        trendValue: `${totalPages} total`,
      },
      {
        label: 'Issues',
        value: openIssues,
        detail: `${closedIssues} closed`,
        icon: FolderKanban,
        color: '#D97706',
        path: '/projects',
        trend: openIssues > 0 ? 'up' : 'neutral',
        trendValue: `${closedIssues} resolved`,
      },
      {
        label: 'Bookings',
        value: upcomingBookings,
        icon: Calendar,
        color: '#059669',
        path: '/calendar/bookings',
        trend: upcomingBookings > 0 ? 'up' : 'neutral',
        trendValue: upcomingBookings > 0 ? 'upcoming' : 'None scheduled',
      },
      {
        label: 'Team',
        value: members.length,
        icon: Users,
        color: '#8B5CF6',
        path: '/settings/members',
        trend: 'neutral',
        trendValue: `${members.length} member${members.length !== 1 ? 's' : ''}`,
      },
    ]
  }, [documents, pagesMap, issuesMap, bookings, members])

  return (
    <section className="stats-overview" aria-label="Statistics overview">
      <div className="stats-overview__grid">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Link
              key={stat.label}
              to={stat.path}
              className="stats-overview__card"
              style={{ '--stat-color': stat.color } as React.CSSProperties}
            >
              <div className="stats-overview__icon">
                <Icon size={22} />
              </div>
              <div className="stats-overview__info">
                <span className="stats-overview__value">{stat.value}</span>
                <span className="stats-overview__label">{stat.label}</span>
              </div>
              {stat.trend && stat.trendValue && (
                <div className={`stats-overview__trend stats-overview__trend--${stat.trend}`}>
                  {stat.trend === 'up' && <TrendingUp size={14} />}
                  {stat.trend === 'down' && <TrendingDown size={14} />}
                  {stat.trend === 'neutral' && <Minus size={14} />}
                  <span>{stat.trendValue}</span>
                </div>
              )}
            </Link>
          )
        })}
      </div>
    </section>
  )
}
