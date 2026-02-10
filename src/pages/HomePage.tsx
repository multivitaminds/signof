import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  FileText,
  FolderKanban,
  FileSignature,
  Calendar,
  Database,
  ArrowRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  Brain,
  Users,
  Inbox,
  Receipt,
  Code2,
} from 'lucide-react'
import { useDocumentStore } from '../stores/useDocumentStore'
import { useWorkspaceStore } from '../features/workspace/stores/useWorkspaceStore'
import { useProjectStore } from '../features/projects/stores/useProjectStore'
import { useSchedulingStore } from '../features/scheduling/stores/useSchedulingStore'
import { useInboxStore } from '../features/inbox/stores/useInboxStore'
import { ACTIVE_STATUSES, DocumentStatus } from '../types'
import './HomePage.css'

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

export default function HomePage() {
  const documents = useDocumentStore((state) => state.documents)

  const pagesMap = useWorkspaceStore((s) => s.pages)
  const recentPages = useMemo(
    () => Object.values(pagesMap)
      .filter((p) => !p.trashedAt)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .slice(0, 3),
    [pagesMap]
  )

  const issuesMap = useProjectStore((s) => s.issues)
  const recentIssues = useMemo(
    () => Object.values(issuesMap)
      .filter((i) => i.status !== 'done' && i.status !== 'cancelled')
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .slice(0, 3),
    [issuesMap]
  )

  const eventTypes = useSchedulingStore((s) => s.eventTypes)
  const bookings = useSchedulingStore((s) => s.bookings)
  const upcomingBookings = useMemo(
    () => bookings
      .filter((b) => b.status === 'confirmed' && b.date >= (new Date().toISOString().split('T')[0] ?? ''))
      .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime))
      .slice(0, 3),
    [bookings]
  )

  const notifications = useInboxStore((s) => s.notifications)
  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  )

  const stats = {
    total: documents.length,
    inProgress: documents.filter((d) => (ACTIVE_STATUSES as string[]).includes(d.status)).length,
    completed: documents.filter((d) => d.status === DocumentStatus.Completed).length,
    pages: Object.keys(pagesMap).length,
    issues: Object.keys(issuesMap).length,
    bookings: bookings.filter((b) => b.status === 'confirmed').length,
    unread: unreadCount,
  }

  const recentDocuments = documents.slice(0, 3)

  const quickActions = [
    { label: 'New Page', icon: FileText, path: '/pages/new', color: '#635BFF' },
    { label: 'New Project', icon: FolderKanban, path: '/projects/new', color: '#0EA5E9' },
    { label: 'New Document', icon: FileSignature, path: '/documents', color: '#FF5A5A' },
    { label: 'Schedule', icon: Calendar, path: '/calendar', color: '#00D4AA' },
    { label: 'New Database', icon: Database, path: '/data', color: '#F5A623' },
    { label: 'AI Assistant', icon: Brain, path: '/ai', color: '#8B5CF6' },
    { label: 'File Taxes', icon: Receipt, path: '/tax', color: '#059669' },
    { label: 'Developer', icon: Code2, path: '/developer', color: '#0A2540' },
  ]

  return (
    <div className="home-page">
      {/* Welcome Section */}
      <section className="home-page__welcome">
        <h1 className="home-page__title">
          Welcome to SignOf<span className="home-page__title-check">✓</span>
        </h1>
        <p className="home-page__subtitle">
          Your unified workspace for documents, projects, scheduling, databases, and more.
        </p>
      </section>

      {/* Stats Overview */}
      <section className="home-page__stats">
        <div className="stat-card">
          <div className="stat-card__icon stat-card__icon--total">
            <TrendingUp size={20} />
          </div>
          <div className="stat-card__content">
            <span className="stat-card__value">{stats.total}</span>
            <span className="stat-card__label">Documents</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon stat-card__icon--pending">
            <Clock size={20} />
          </div>
          <div className="stat-card__content">
            <span className="stat-card__value">{stats.inProgress}</span>
            <span className="stat-card__label">In Progress</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon stat-card__icon--completed">
            <CheckCircle2 size={20} />
          </div>
          <div className="stat-card__content">
            <span className="stat-card__value">{stats.completed}</span>
            <span className="stat-card__label">Completed</span>
          </div>
        </div>
        <Link to="/pages" className="stat-card stat-card--link">
          <div className="stat-card__icon stat-card__icon--pages">
            <FileText size={20} />
          </div>
          <div className="stat-card__content">
            <span className="stat-card__value">{stats.pages}</span>
            <span className="stat-card__label">Pages</span>
          </div>
        </Link>
        <Link to="/projects" className="stat-card stat-card--link">
          <div className="stat-card__icon stat-card__icon--issues">
            <Users size={20} />
          </div>
          <div className="stat-card__content">
            <span className="stat-card__value">{stats.issues}</span>
            <span className="stat-card__label">Issues</span>
          </div>
        </Link>
        <Link to="/calendar/bookings" className="stat-card stat-card--link">
          <div className="stat-card__icon stat-card__icon--bookings">
            <Calendar size={20} />
          </div>
          <div className="stat-card__content">
            <span className="stat-card__value">{stats.bookings}</span>
            <span className="stat-card__label">Bookings</span>
          </div>
        </Link>
        <Link to="/inbox" className="stat-card stat-card--link">
          <div className="stat-card__icon stat-card__icon--unread">
            <Inbox size={20} />
          </div>
          <div className="stat-card__content">
            <span className="stat-card__value">{stats.unread}</span>
            <span className="stat-card__label">Unread</span>
          </div>
        </Link>
      </section>

      {/* Quick Actions */}
      <section className="home-page__section">
        <h2 className="home-page__section-title">Quick Actions</h2>
        <div className="quick-actions">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <Link
                key={action.label}
                to={action.path}
                className="quick-action"
                style={{ '--action-color': action.color } as React.CSSProperties}
              >
                <div className="quick-action__icon">
                  <Icon size={24} />
                </div>
                <span className="quick-action__label">{action.label}</span>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Activity Feed - Two column layout */}
      <div className="home-page__activity-grid">
        {/* Recent Documents */}
        {recentDocuments.length > 0 && (
          <section className="home-page__section">
            <div className="home-page__section-header">
              <h2 className="home-page__section-title">Recent Documents</h2>
              <Link to="/documents" className="home-page__see-all">
                See all <ArrowRight size={16} />
              </Link>
            </div>
            <div className="recent-list">
              {recentDocuments.map((doc) => (
                <Link
                  key={doc.id}
                  to={`/documents/${doc.id}`}
                  className="recent-item"
                >
                  <FileSignature size={20} className="recent-item__icon" />
                  <div className="recent-item__content">
                    <span className="recent-item__name">{doc.name}</span>
                    <span className="recent-item__meta">
                      {timeAgo(doc.updatedAt)}
                    </span>
                  </div>
                  <span className={`recent-item__status recent-item__status--${doc.status}`}>
                    {doc.status}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Recent Pages */}
        {recentPages.length > 0 && (
          <section className="home-page__section">
            <div className="home-page__section-header">
              <h2 className="home-page__section-title">Recent Pages</h2>
              <Link to="/pages" className="home-page__see-all">
                See all <ArrowRight size={16} />
              </Link>
            </div>
            <div className="recent-list">
              {recentPages.map((page) => (
                <Link
                  key={page.id}
                  to={`/pages/${page.id}`}
                  className="recent-item"
                >
                  <span className="recent-item__page-icon">{page.icon || '📄'}</span>
                  <div className="recent-item__content">
                    <span className="recent-item__name">{page.title}</span>
                    <span className="recent-item__meta">
                      {timeAgo(page.updatedAt)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Active Issues */}
        {recentIssues.length > 0 && (
          <section className="home-page__section">
            <div className="home-page__section-header">
              <h2 className="home-page__section-title">Active Issues</h2>
              <Link to="/projects" className="home-page__see-all">
                See all <ArrowRight size={16} />
              </Link>
            </div>
            <div className="recent-list">
              {recentIssues.map((issue) => (
                <Link
                  key={issue.id}
                  to="/projects"
                  className="recent-item"
                >
                  <FolderKanban size={20} className="recent-item__icon" />
                  <div className="recent-item__content">
                    <span className="recent-item__name">{issue.title}</span>
                    <span className="recent-item__meta">
                      {issue.status} · {timeAgo(issue.updatedAt)}
                    </span>
                  </div>
                  <span className={`recent-item__priority recent-item__priority--${issue.priority}`}>
                    {issue.priority}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Upcoming Bookings */}
        {upcomingBookings.length > 0 && (
          <section className="home-page__section">
            <div className="home-page__section-header">
              <h2 className="home-page__section-title">Upcoming Bookings</h2>
              <Link to="/calendar/bookings" className="home-page__see-all">
                See all <ArrowRight size={16} />
              </Link>
            </div>
            <div className="recent-list">
              {upcomingBookings.map((booking) => {
                const et = eventTypes.find((e) => e.id === booking.eventTypeId)
                return (
                  <Link
                    key={booking.id}
                    to="/calendar/bookings"
                    className="recent-item"
                  >
                    <div
                      className="recent-item__color-dot"
                      style={{ backgroundColor: et?.color ?? '#6B7280' }}
                    />
                    <div className="recent-item__content">
                      <span className="recent-item__name">{et?.name ?? 'Event'}</span>
                      <span className="recent-item__meta">
                        {new Date(booking.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} · {booking.startTime}
                      </span>
                    </div>
                    <span className="recent-item__status recent-item__status--confirmed">
                      {booking.status}
                    </span>
                  </Link>
                )
              })}
            </div>
          </section>
        )}

        {/* Quick Links */}
        <section className="home-page__section">
          <h2 className="home-page__section-title">Explore</h2>
          <div className="recent-list">
            <Link to="/inbox" className="recent-item">
              <Inbox size={20} className="recent-item__icon" />
              <div className="recent-item__content">
                <span className="recent-item__name">Inbox</span>
                <span className="recent-item__meta">Notifications and updates</span>
              </div>
            </Link>
            <Link to="/calendar" className="recent-item">
              <Calendar size={20} className="recent-item__icon" />
              <div className="recent-item__content">
                <span className="recent-item__name">Calendar</span>
                <span className="recent-item__meta">Schedule meetings and events</span>
              </div>
            </Link>
            <Link to="/data" className="recent-item">
              <Database size={20} className="recent-item__icon" />
              <div className="recent-item__content">
                <span className="recent-item__name">Databases</span>
                <span className="recent-item__meta">Relational data with multiple views</span>
              </div>
            </Link>
          </div>
        </section>
      </div>

      {/* Getting Started */}
      <section className="home-page__section home-page__getting-started">
        <h2 className="home-page__section-title">Getting Started</h2>
        <div className="getting-started-list">
          <div className="getting-started-item getting-started-item--done">
            <CheckCircle2 size={18} />
            <span>Create your workspace</span>
          </div>
          <div className="getting-started-item getting-started-item--done">
            <CheckCircle2 size={18} />
            <span>Upload your first document</span>
          </div>
          <div className="getting-started-item">
            <div className="getting-started-item__circle" />
            <span>Send a document for signature</span>
          </div>
          <div className="getting-started-item">
            <div className="getting-started-item__circle" />
            <span>Create your first project</span>
          </div>
          <div className="getting-started-item">
            <div className="getting-started-item__circle" />
            <span>Share your booking page</span>
          </div>
        </div>
      </section>
    </div>
  )
}
