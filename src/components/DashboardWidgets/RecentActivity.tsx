import { useMemo } from 'react'
import { Activity, FileText, FolderKanban, Calendar, BookOpen } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import './DashboardWidgets.css'

interface ActivityItem {
  id: string
  action: string
  module: 'documents' | 'projects' | 'scheduling' | 'workspace'
  timestamp: string
}

const MODULE_ICON: Record<string, LucideIcon> = {
  documents: FileText,
  projects: FolderKanban,
  scheduling: Calendar,
  workspace: BookOpen,
}

const MODULE_COLOR: Record<string, string> = {
  documents: 'var(--color-warning, #D97706)',
  projects: 'var(--color-primary, #4F46E5)',
  scheduling: 'var(--color-success, #059669)',
  workspace: '#7C3AED',
}

function generateSampleActivity(): ActivityItem[] {
  const now = Date.now()
  return [
    { id: 'a1', action: 'Signed Employment Agreement', module: 'documents', timestamp: new Date(now - 300000).toISOString() },
    { id: 'a2', action: 'Created issue: Fix login bug', module: 'projects', timestamp: new Date(now - 1200000).toISOString() },
    { id: 'a3', action: 'Scheduled Team Sync', module: 'scheduling', timestamp: new Date(now - 2400000).toISOString() },
    { id: 'a4', action: 'Edited Meeting Notes page', module: 'workspace', timestamp: new Date(now - 3600000).toISOString() },
    { id: 'a5', action: 'Completed NDA review', module: 'documents', timestamp: new Date(now - 5400000).toISOString() },
    { id: 'a6', action: 'Moved "API Design" to Done', module: 'projects', timestamp: new Date(now - 7200000).toISOString() },
    { id: 'a7', action: 'Uploaded Contractor Invoice', module: 'documents', timestamp: new Date(now - 10800000).toISOString() },
    { id: 'a8', action: 'Created Sprint Planning page', module: 'workspace', timestamp: new Date(now - 14400000).toISOString() },
    { id: 'a9', action: 'Rescheduled client call', module: 'scheduling', timestamp: new Date(now - 18000000).toISOString() },
    { id: 'a10', action: 'Closed 3 completed issues', module: 'projects', timestamp: new Date(now - 21600000).toISOString() },
  ]
}

function formatRelativeTime(dateStr: string): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diffMs = now - then
  const minutes = Math.floor(diffMs / 60000)
  const hours = Math.floor(minutes / 60)
  if (hours > 0) return `${hours}h ago`
  if (minutes > 0) return `${minutes}m ago`
  return 'just now'
}

export default function RecentActivity() {
  const activities = useMemo(() => generateSampleActivity(), [])

  return (
    <div className="dashboard-widget" aria-label="Recent activity">
      <div className="dashboard-widget__header">
        <Activity size={16} className="dashboard-widget__header-icon" />
        <h3 className="dashboard-widget__title">Recent Activity</h3>
      </div>
      <ul className="dashboard-widget__list">
        {activities.map((item) => {
          const Icon = MODULE_ICON[item.module] ?? Activity
          return (
            <li key={item.id} className="dashboard-widget__list-item">
              <Icon size={14} style={{ color: MODULE_COLOR[item.module], flexShrink: 0 }} />
              <span className="dashboard-widget__item-label">{item.action}</span>
              <span className="dashboard-widget__item-date">{formatRelativeTime(item.timestamp)}</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
