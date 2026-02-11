import { useMemo } from 'react'
import { Brain, AlertTriangle, TrendingUp, Clock, CheckCircle2 } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useDocumentStore } from '../../stores/useDocumentStore'
import './DashboardWidgets.css'

const InsightSeverity = {
  Info: 'info',
  Warning: 'warning',
  Success: 'success',
} as const

type InsightSeverity = (typeof InsightSeverity)[keyof typeof InsightSeverity]

interface Insight {
  id: string
  message: string
  severity: InsightSeverity
  icon: LucideIcon
}

const SEVERITY_COLOR: Record<InsightSeverity, string> = {
  info: 'var(--color-primary, #4F46E5)',
  warning: 'var(--color-warning, #D97706)',
  success: 'var(--color-success, #059669)',
}

export default function AIInsights() {
  const documents = useDocumentStore((s) => s.documents)

  const insights = useMemo<Insight[]>(() => {
    const results: Insight[] = []

    // Check for overdue documents
    const now = new Date().toISOString()
    const expiredDocs = documents.filter(
      (d) => d.expiresAt && d.expiresAt < now && d.status !== 'completed' && d.status !== 'voided'
    )
    if (expiredDocs.length > 0) {
      results.push({
        id: 'expired-docs',
        message: `${expiredDocs.length} document${expiredDocs.length > 1 ? 's' : ''} expiring this week`,
        severity: InsightSeverity.Warning,
        icon: AlertTriangle,
      })
    }

    // Check for pending documents
    const pendingDocs = documents.filter(
      (d) => d.status === 'pending' || d.status === 'sent' || d.status === 'delivered'
    )
    if (pendingDocs.length > 0) {
      results.push({
        id: 'pending-docs',
        message: `${pendingDocs.length} document${pendingDocs.length > 1 ? 's' : ''} awaiting signature`,
        severity: InsightSeverity.Info,
        icon: Clock,
      })
    }

    // Simulated project insights
    results.push({
      id: 'overdue-issues',
      message: 'You have 3 overdue issues in active projects',
      severity: InsightSeverity.Warning,
      icon: AlertTriangle,
    })

    results.push({
      id: 'productivity',
      message: 'Team productivity up 15% this week',
      severity: InsightSeverity.Success,
      icon: TrendingUp,
    })

    results.push({
      id: 'completed-milestone',
      message: 'Sprint milestone achieved ahead of schedule',
      severity: InsightSeverity.Success,
      icon: CheckCircle2,
    })

    return results.slice(0, 5)
  }, [documents])

  return (
    <div className="dashboard-widget dashboard-widget--ai" aria-label="AI insights">
      <div className="dashboard-widget__header">
        <Brain size={16} className="dashboard-widget__header-icon dashboard-widget__header-icon--ai" />
        <h3 className="dashboard-widget__title">AI Insights</h3>
      </div>
      {insights.length === 0 ? (
        <p className="dashboard-widget__empty">No insights at this time</p>
      ) : (
        <ul className="dashboard-widget__list">
          {insights.map((insight) => {
            const Icon = insight.icon
            return (
              <li key={insight.id} className={`dashboard-widget__insight dashboard-widget__insight--${insight.severity}`}>
                <Icon size={14} style={{ color: SEVERITY_COLOR[insight.severity], flexShrink: 0 }} />
                <span className="dashboard-widget__insight-text">{insight.message}</span>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
