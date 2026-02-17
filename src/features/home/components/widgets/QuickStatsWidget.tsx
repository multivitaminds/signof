import { useMemo } from 'react'
import { FileText, GitBranch, Calendar, Bot, TrendingUp, TrendingDown } from 'lucide-react'
import { useDocumentStore } from '../../../../stores/useDocumentStore'
import { useProjectStore } from '../../../projects/stores/useProjectStore'
import { useSchedulingStore } from '../../../scheduling/stores/useSchedulingStore'
import { useFleetStore } from '../../../clawgpt/stores/useFleetStore'
import { ACTIVE_STATUSES } from '../../../../types'
import { FleetAgentStatus } from '../../../clawgpt/types'
import Card from '../../../../components/ui/Card'
import './QuickStatsWidget.css'

interface StatCard {
  label: string
  value: number
  icon: typeof FileText
  trend: 'up' | 'down' | 'neutral'
  color: string
}

export default function QuickStatsWidget() {
  const documents = useDocumentStore((s) => s.documents)
  const issues = useProjectStore((s) => s.issues)
  const bookings = useSchedulingStore((s) => s.bookings)
  const fleetInstances = useFleetStore((s) => s.activeInstances)

  const stats = useMemo((): StatCard[] => {
    const pendingDocs = documents.filter((d) =>
      (ACTIVE_STATUSES as string[]).includes(d.status)
    ).length

    const openIssues = Object.values(issues).filter(
      (i) => i.status !== 'done' && i.status !== 'cancelled'
    ).length

    const today = new Date().toISOString().split('T')[0] ?? ''
    const upcomingBookings = bookings.filter(
      (b) => b.status === 'confirmed' && b.date >= today
    ).length

    const instances = Object.values(fleetInstances)
    const activeAgents = instances.filter(
      (i) => i.status === FleetAgentStatus.Working || i.status === FleetAgentStatus.Idle
    ).length

    return [
      {
        label: 'Documents Pending',
        value: pendingDocs,
        icon: FileText,
        trend: pendingDocs > 3 ? 'up' : 'neutral',
        color: 'var(--color-warning)',
      },
      {
        label: 'Open Issues',
        value: openIssues,
        icon: GitBranch,
        trend: openIssues > 10 ? 'up' : 'neutral',
        color: 'var(--color-primary)',
      },
      {
        label: 'Upcoming Meetings',
        value: upcomingBookings,
        icon: Calendar,
        trend: upcomingBookings > 0 ? 'up' : 'neutral',
        color: 'var(--color-success)',
      },
      {
        label: 'Active Agents',
        value: activeAgents,
        icon: Bot,
        trend: activeAgents > 0 ? 'up' : 'neutral',
        color: 'var(--color-info, #2563EB)',
      },
    ]
  }, [documents, issues, bookings, fleetInstances])

  return (
    <div className="quick-stats-widget" role="region" aria-label="Quick stats">
      {stats.map((stat) => (
        <Card key={stat.label} variant="flat">
          <Card.Body>
            <div className="quick-stats-widget__card">
              <div className="quick-stats-widget__icon" style={{ color: stat.color }}>
                <stat.icon size={20} />
              </div>
              <div className="quick-stats-widget__info">
                <span className="quick-stats-widget__value">{stat.value}</span>
                <span className="quick-stats-widget__label">{stat.label}</span>
              </div>
              {stat.trend !== 'neutral' && (
                <div className={`quick-stats-widget__trend quick-stats-widget__trend--${stat.trend}`}>
                  {stat.trend === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                </div>
              )}
            </div>
          </Card.Body>
        </Card>
      ))}
    </div>
  )
}
