import { useState, useMemo, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  FileSignature,
  FileText,
  FolderKanban,
  Calendar,
  Clock,
} from 'lucide-react'
import { useDocumentStore } from '../../stores/useDocumentStore'
import { useWorkspaceStore } from '../../features/workspace/stores/useWorkspaceStore'
import { useProjectStore } from '../../features/projects/stores/useProjectStore'
import { useSchedulingStore } from '../../features/scheduling/stores/useSchedulingStore'
import './RecentItems.css'

const TABS = ['All', 'Documents', 'Pages', 'Issues', 'Bookings'] as const
type TabType = (typeof TABS)[number]

interface RecentEntry {
  id: string
  title: string
  type: TabType
  icon: React.ComponentType<{ size?: number; className?: string }>
  path: string
  timestamp: string
  badge?: string
  badgeColor?: string
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d ago`
  const weeks = Math.floor(days / 7)
  return `${weeks}w ago`
}

const MODULE_COLORS: Record<string, string> = {
  Documents: '#DC2626',
  Pages: '#4F46E5',
  Issues: '#0EA5E9',
  Bookings: '#059669',
}

export default function RecentItems() {
  const [activeTab, setActiveTab] = useState<TabType>('All')

  const documents = useDocumentStore((s) => s.documents)
  const pagesMap = useWorkspaceStore((s) => s.pages)
  const issuesMap = useProjectStore((s) => s.issues)
  const bookings = useSchedulingStore((s) => s.bookings)
  const eventTypes = useSchedulingStore((s) => s.eventTypes)

  const allItems = useMemo(() => {
    const entries: RecentEntry[] = []

    // Documents
    for (const doc of documents) {
      entries.push({
        id: `doc-${doc.id}`,
        title: doc.name,
        type: 'Documents',
        icon: FileSignature,
        path: `/documents/${doc.id}`,
        timestamp: doc.updatedAt,
        badge: doc.status,
      })
    }

    // Pages
    for (const page of Object.values(pagesMap)) {
      if (page.trashedAt) continue
      entries.push({
        id: `page-${page.id}`,
        title: page.title || 'Untitled',
        type: 'Pages',
        icon: FileText,
        path: `/pages/${page.id}`,
        timestamp: page.updatedAt,
      })
    }

    // Issues
    for (const issue of Object.values(issuesMap)) {
      entries.push({
        id: `issue-${issue.id}`,
        title: issue.title,
        type: 'Issues',
        icon: FolderKanban,
        path: '/projects',
        timestamp: issue.updatedAt,
        badge: issue.status,
      })
    }

    // Bookings
    for (const booking of bookings) {
      const et = eventTypes.find((e) => e.id === booking.eventTypeId)
      entries.push({
        id: `booking-${booking.id}`,
        title: et?.name ?? 'Event',
        type: 'Bookings',
        icon: Calendar,
        path: '/calendar/bookings',
        timestamp: booking.updatedAt,
        badge: booking.status,
      })
    }

    // Sort by most recent
    entries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    return entries
  }, [documents, pagesMap, issuesMap, bookings, eventTypes])

  const filtered = useMemo(() => {
    if (activeTab === 'All') return allItems.slice(0, 10)
    return allItems.filter((item) => item.type === activeTab).slice(0, 10)
  }, [allItems, activeTab])

  const handleTabChange = useCallback((tab: TabType) => {
    setActiveTab(tab)
  }, [])

  return (
    <section className="recent-items" aria-label="Recent items">
      <h2 className="recent-items__title">Recent Activity</h2>
      <div className="recent-items__tabs" role="tablist">
        {TABS.map((tab) => (
          <button
            key={tab}
            className={`recent-items__tab${activeTab === tab ? ' recent-items__tab--active' : ''}`}
            onClick={() => handleTabChange(tab)}
            role="tab"
            aria-selected={activeTab === tab}
            type="button"
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="recent-items__list" role="tabpanel">
        {filtered.length === 0 ? (
          <div className="recent-items__empty">
            <Clock size={24} />
            <p>No recent items</p>
          </div>
        ) : (
          filtered.map((item) => {
            const Icon = item.icon
            const moduleColor = MODULE_COLORS[item.type] ?? '#6B7280'
            return (
              <Link
                key={item.id}
                to={item.path}
                className="recent-items__item"
              >
                <div
                  className="recent-items__icon"
                  style={{ color: moduleColor }}
                >
                  <Icon size={18} />
                </div>
                <div className="recent-items__content">
                  <span className="recent-items__name">{item.title}</span>
                  <span className="recent-items__meta">
                    {timeAgo(item.timestamp)}
                  </span>
                </div>
                <span
                  className="recent-items__badge"
                  style={{ background: `${moduleColor}15`, color: moduleColor }}
                >
                  {item.type}
                </span>
                {item.badge && (
                  <span className="recent-items__status">
                    {item.badge}
                  </span>
                )}
              </Link>
            )
          })
        )}
      </div>
    </section>
  )
}
