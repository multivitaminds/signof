import { useState, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Bell, CheckCheck, Trash2, FileSignature, AtSign,
  MessageSquare, UserPlus, ArrowRightLeft, Clock, Sparkles,
  Search, Plus, X, ChevronDown, Check, Archive, Calendar,
  FolderOpen, Layout, Settings, ExternalLink, ChevronRight,
} from 'lucide-react'
import { useInboxStore } from '../stores/useInboxStore'
import { NotificationType, NotificationCategory, TYPE_TO_CATEGORY } from '../types'
import type { Notification, NotificationCategory as NotifCategoryType } from '../types'
import EmptyState from '../../../components/EmptyState/EmptyState'
import './InboxPage.css'

/* ------------------------------------------------------------------ */
/*  Constants                                                         */
/* ------------------------------------------------------------------ */

const ICON_MAP: Record<string, React.ComponentType<{ size?: number }>> = {
  [NotificationType.SignatureRequest]: FileSignature,
  [NotificationType.DocumentSigned]: FileSignature,
  [NotificationType.Mention]: AtSign,
  [NotificationType.Comment]: MessageSquare,
  [NotificationType.Assignment]: UserPlus,
  [NotificationType.StatusChange]: ArrowRightLeft,
  [NotificationType.Invitation]: UserPlus,
  [NotificationType.Reminder]: Clock,
  [NotificationType.System]: Sparkles,
  [NotificationType.Booking]: Calendar,
  [NotificationType.TeamJoined]: UserPlus,
}

const PRIORITY_COLOR: Record<string, string> = {
  [NotificationType.SignatureRequest]: '#EF4444',
  [NotificationType.DocumentSigned]: '#059669',
  [NotificationType.Mention]: '#4F46E5',
  [NotificationType.Comment]: '#0EA5E9',
  [NotificationType.Assignment]: '#F59E0B',
  [NotificationType.StatusChange]: '#059669',
  [NotificationType.Invitation]: '#8B5CF6',
  [NotificationType.Reminder]: '#F97316',
  [NotificationType.System]: '#94A3B8',
  [NotificationType.Booking]: '#06B6D4',
  [NotificationType.TeamJoined]: '#8B5CF6',
}

const CATEGORY_ICON: Record<string, React.ComponentType<{ size?: number }>> = {
  [NotificationCategory.All]: Bell,
  [NotificationCategory.Documents]: FileSignature,
  [NotificationCategory.Projects]: Layout,
  [NotificationCategory.Scheduling]: Calendar,
  [NotificationCategory.Workspace]: FolderOpen,
  [NotificationCategory.System]: Settings,
}

const CATEGORY_LABELS: Record<string, string> = {
  [NotificationCategory.All]: 'All',
  [NotificationCategory.Documents]: 'Documents',
  [NotificationCategory.Projects]: 'Projects',
  [NotificationCategory.Scheduling]: 'Scheduling',
  [NotificationCategory.Workspace]: 'Workspace',
  [NotificationCategory.System]: 'System',
}

const CATEGORY_ORDER: NotifCategoryType[] = [
  NotificationCategory.All,
  NotificationCategory.Documents,
  NotificationCategory.Projects,
  NotificationCategory.Scheduling,
  NotificationCategory.Workspace,
  NotificationCategory.System,
]

const NOTIFICATION_TYPE_OPTIONS: { value: NotificationType; label: string }[] = [
  { value: NotificationType.SignatureRequest, label: 'Signature Request' },
  { value: NotificationType.Mention, label: 'Mention' },
  { value: NotificationType.Comment, label: 'Comment' },
  { value: NotificationType.Assignment, label: 'Assignment' },
  { value: NotificationType.StatusChange, label: 'Status Change' },
  { value: NotificationType.Invitation, label: 'Invitation' },
  { value: NotificationType.Reminder, label: 'Reminder' },
  { value: NotificationType.System, label: 'System' },
  { value: NotificationType.Booking, label: 'Booking' },
  { value: NotificationType.DocumentSigned, label: 'Document Signed' },
  { value: NotificationType.TeamJoined, label: 'Team Joined' },
]

const EMPTY_MESSAGES: Record<string, { title: string; desc: string }> = {
  [NotificationCategory.All]: { title: 'All caught up!', desc: 'No notifications to show. We will notify you when something needs your attention.' },
  [NotificationCategory.Documents]: { title: 'No document notifications', desc: 'When documents need your signature or are completed, they will appear here.' },
  [NotificationCategory.Projects]: { title: 'No project notifications', desc: 'Task assignments and status changes will appear here.' },
  [NotificationCategory.Scheduling]: { title: 'No scheduling notifications', desc: 'New bookings and meeting reminders will appear here.' },
  [NotificationCategory.Workspace]: { title: 'No workspace notifications', desc: 'Comments and mentions will appear here.' },
  [NotificationCategory.System]: { title: 'No system notifications', desc: 'System updates and invitations will appear here.' },
}

const CATEGORY_BADGE_LABEL: Record<string, string> = {
  [NotificationCategory.Documents]: 'Documents',
  [NotificationCategory.Projects]: 'Projects',
  [NotificationCategory.Scheduling]: 'Scheduling',
  [NotificationCategory.Workspace]: 'Workspace',
  [NotificationCategory.System]: 'System',
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d ago`
  return `${Math.floor(days / 7)}w ago`
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function getDateGroup(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today.getTime() - 86400000)
  const weekAgo = new Date(today.getTime() - 6 * 86400000)

  if (date >= today) return 'Today'
  if (date >= yesterday) return 'Yesterday'
  if (date >= weekAgo) return 'This Week'
  return 'Earlier'
}

interface DateGroup {
  label: string
  items: Notification[]
  collapsed: boolean
}

function groupByDate(notifications: Notification[]): DateGroup[] {
  const order = ['Today', 'Yesterday', 'This Week', 'Earlier']
  const groups: Record<string, Notification[]> = {}
  for (const n of notifications) {
    const label = getDateGroup(n.createdAt)
    if (!groups[label]) groups[label] = []
    groups[label].push(n)
  }
  const result: DateGroup[] = []
  for (const label of order) {
    const items = groups[label]
    if (items) result.push({ label, items, collapsed: false })
  }
  return result
}

/** Group notifications by source - returns count of grouped items */
function getSourceGroupCounts(notifications: Notification[]): Map<string, number> {
  const counts = new Map<string, number>()
  for (const n of notifications) {
    if (n.sourceId) {
      counts.set(n.sourceId, (counts.get(n.sourceId) ?? 0) + 1)
    }
  }
  return counts
}

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */

export default function InboxPage() {
  const navigate = useNavigate()

  /* Store -----------------------------------------------------------*/
  const notifications = useInboxStore((s) => s.notifications)
  const addNotification = useInboxStore((s) => s.addNotification)
  const markAsRead = useInboxStore((s) => s.markAsRead)
  const toggleRead = useInboxStore((s) => s.toggleRead)
  const markSelectedAsRead = useInboxStore((s) => s.markSelectedAsRead)
  const markAllAsRead = useInboxStore((s) => s.markAllAsRead)
  const deleteNotification = useInboxStore((s) => s.deleteNotification)
  const deleteMultiple = useInboxStore((s) => s.deleteMultiple)
  const archiveNotification = useInboxStore((s) => s.archiveNotification)
  const archiveMultiple = useInboxStore((s) => s.archiveMultiple)

  /* Local UI state --------------------------------------------------*/
  const [activeCategory, setActiveCategory] = useState<NotifCategoryType>(NotificationCategory.All)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [selectedNotifId, setSelectedNotifId] = useState<string | null>(null)
  const [showCompose, setShowCompose] = useState(false)
  const [dismissingIds, setDismissingIds] = useState<Set<string>>(new Set())
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set())

  /* Compose form state */
  const [composeType, setComposeType] = useState<NotificationType>(NotificationType.System)
  const [composeTitle, setComposeTitle] = useState('')
  const [composeMessage, setComposeMessage] = useState('')

  /* Derived data ----------------------------------------------------*/
  const activeNotifications = useMemo(
    () => notifications.filter((n) => !n.archived),
    [notifications]
  )

  const unreadCount = useMemo(
    () => activeNotifications.filter((n) => !n.read).length,
    [activeNotifications]
  )

  const unreadByCategory = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const cat of CATEGORY_ORDER) {
      if (cat === NotificationCategory.All) {
        counts[cat] = activeNotifications.filter((n) => !n.read).length
      } else {
        counts[cat] = activeNotifications.filter((n) => !n.read && n.category === cat).length
      }
    }
    return counts
  }, [activeNotifications])

  const filtered = useMemo(() => {
    let result = activeNotifications
    if (activeCategory !== NotificationCategory.All) {
      result = result.filter((n) => n.category === activeCategory)
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (n) => n.title.toLowerCase().includes(q) || n.message.toLowerCase().includes(q)
      )
    }
    return result
  }, [activeNotifications, activeCategory, searchQuery])

  const groups = useMemo(() => groupByDate(filtered), [filtered])
  const sourceGroupCounts = useMemo(() => getSourceGroupCounts(filtered), [filtered])

  const allFilteredIds = useMemo(() => new Set(filtered.map((n) => n.id)), [filtered])
  const allSelected = filtered.length > 0 && filtered.every((n) => selectedIds.has(n.id))

  const selectedNotification = useMemo(
    () => notifications.find((n) => n.id === selectedNotifId) ?? null,
    [notifications, selectedNotifId]
  )

  /* Handlers --------------------------------------------------------*/
  const handleClick = useCallback((notif: Notification) => {
    markAsRead(notif.id)
    setSelectedNotifId(notif.id)
  }, [markAsRead])

  const handleDelete = useCallback((e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    setDismissingIds((prev) => new Set(prev).add(id))
    setTimeout(() => {
      deleteNotification(id)
      setDismissingIds((prev) => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
      setSelectedIds((prev) => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
      if (selectedNotifId === id) setSelectedNotifId(null)
    }, 300)
  }, [deleteNotification, selectedNotifId])

  const handleArchive = useCallback((e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    archiveNotification(id)
    if (selectedNotifId === id) setSelectedNotifId(null)
  }, [archiveNotification, selectedNotifId])

  const handleToggleRead = useCallback((e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    toggleRead(id)
  }, [toggleRead])

  const handleSelectToggle = useCallback((e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const handleSelectAll = useCallback(() => {
    if (allSelected) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(allFilteredIds))
    }
  }, [allSelected, allFilteredIds])

  const handleBatchMarkRead = useCallback(() => {
    markSelectedAsRead(Array.from(selectedIds))
    setSelectedIds(new Set())
  }, [markSelectedAsRead, selectedIds])

  const handleBatchDelete = useCallback(() => {
    const ids = Array.from(selectedIds)
    setDismissingIds(new Set(ids))
    setTimeout(() => {
      deleteMultiple(ids)
      setDismissingIds(new Set())
      setSelectedIds(new Set())
      if (selectedNotifId && ids.includes(selectedNotifId)) setSelectedNotifId(null)
    }, 300)
  }, [deleteMultiple, selectedIds, selectedNotifId])

  const handleBatchArchive = useCallback(() => {
    const ids = Array.from(selectedIds)
    archiveMultiple(ids)
    setSelectedIds(new Set())
    if (selectedNotifId && ids.includes(selectedNotifId)) setSelectedNotifId(null)
  }, [archiveMultiple, selectedIds, selectedNotifId])

  const handleCompose = useCallback(() => {
    if (!composeTitle.trim() || !composeMessage.trim()) return
    const cat = TYPE_TO_CATEGORY[composeType]
    const actionMap: Partial<Record<NotificationType, { url: string; label: string }>> = {
      [NotificationType.SignatureRequest]: { url: '/documents', label: 'Sign Now' },
      [NotificationType.Assignment]: { url: '/projects', label: 'View Issue' },
      [NotificationType.Booking]: { url: '/scheduling', label: 'View Booking' },
      [NotificationType.Comment]: { url: '/documents', label: 'View Comment' },
    }
    const action = actionMap[composeType]
    addNotification(composeType, composeTitle.trim(), composeMessage.trim(), {
      link: cat === 'documents' ? '/documents' : cat === 'projects' ? '/projects' : undefined,
      actionUrl: action?.url,
      actionLabel: action?.label,
    })
    setComposeTitle('')
    setComposeMessage('')
    setComposeType(NotificationType.System)
    setShowCompose(false)
  }, [addNotification, composeType, composeTitle, composeMessage])

  const handleCategoryChange = useCallback((cat: NotifCategoryType) => {
    setActiveCategory(cat)
    setSelectedIds(new Set())
    setSelectedNotifId(null)
  }, [])

  const handleToggleGroup = useCallback((label: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev)
      if (next.has(label)) next.delete(label)
      else next.add(label)
      return next
    })
  }, [])

  const handleActionClick = useCallback((e: React.MouseEvent, notif: Notification) => {
    e.stopPropagation()
    markAsRead(notif.id)
    if (notif.actionUrl) navigate(notif.actionUrl)
  }, [markAsRead, navigate])

  const handleDetailAction = useCallback((notif: Notification) => {
    markAsRead(notif.id)
    if (notif.actionUrl) navigate(notif.actionUrl)
  }, [markAsRead, navigate])

  /* Render ----------------------------------------------------------*/
  const emptyState = EMPTY_MESSAGES[activeCategory] ?? EMPTY_MESSAGES[NotificationCategory.All]

  return (
    <div className="inbox-page">
      {/* Header */}
      <div className="inbox-page__header">
        <div>
          <h1 className="inbox-page__title">
            Inbox
            {unreadCount > 0 && <span className="inbox-page__badge">{unreadCount}</span>}
          </h1>
          <p className="inbox-page__subtitle">Your notifications and updates</p>
        </div>
        <div className="inbox-page__header-actions">
          <button
            className="inbox-page__compose-btn"
            onClick={() => setShowCompose((v) => !v)}
            aria-label="New notification"
          >
            {showCompose ? <X size={16} /> : <Plus size={16} />}
            <span>{showCompose ? 'Cancel' : 'New Notification'}</span>
          </button>
          {unreadCount > 0 && (
            <button className="btn-secondary" onClick={markAllAsRead}>
              <CheckCheck size={14} /> Mark all as read
            </button>
          )}
        </div>
      </div>

      {/* Compose form */}
      {showCompose && (
        <div className="inbox-page__compose">
          <h3 className="inbox-page__compose-title">Create Test Notification</h3>
          <div className="inbox-page__compose-fields">
            <div className="inbox-page__compose-field">
              <label className="inbox-page__compose-label" htmlFor="compose-type">Type</label>
              <div className="inbox-page__select-wrap">
                <select
                  id="compose-type"
                  className="inbox-page__compose-select"
                  value={composeType}
                  onChange={(e) => setComposeType(e.target.value as NotificationType)}
                >
                  {NOTIFICATION_TYPE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="inbox-page__select-icon" />
              </div>
            </div>
            <div className="inbox-page__compose-field">
              <label className="inbox-page__compose-label" htmlFor="compose-title">Title</label>
              <input
                id="compose-title"
                className="inbox-page__compose-input"
                type="text"
                placeholder="Notification title"
                value={composeTitle}
                onChange={(e) => setComposeTitle(e.target.value)}
              />
            </div>
            <div className="inbox-page__compose-field">
              <label className="inbox-page__compose-label" htmlFor="compose-message">Message</label>
              <input
                id="compose-message"
                className="inbox-page__compose-input"
                type="text"
                placeholder="Notification message"
                value={composeMessage}
                onChange={(e) => setComposeMessage(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleCompose() }}
              />
            </div>
          </div>
          <div className="inbox-page__compose-actions">
            <button className="inbox-page__compose-cancel" onClick={() => setShowCompose(false)}>Cancel</button>
            <button
              className="inbox-page__compose-submit"
              onClick={handleCompose}
              disabled={!composeTitle.trim() || !composeMessage.trim()}
            >
              <Plus size={14} /> Create
            </button>
          </div>
        </div>
      )}

      {/* Three-pane layout */}
      <div className="inbox-page__layout">
        {/* Sidebar filters */}
        <aside className="inbox-page__sidebar" role="navigation" aria-label="Filter by category">
          <div className="inbox-page__sidebar-title">Categories</div>
          <ul className="inbox-page__sidebar-list">
            {CATEGORY_ORDER.map((cat) => {
              const CatIcon = CATEGORY_ICON[cat] ?? Bell
              const count = unreadByCategory[cat] ?? 0
              return (
                <li key={cat}>
                  <button
                    className={`inbox-page__sidebar-item ${activeCategory === cat ? 'inbox-page__sidebar-item--active' : ''}`}
                    onClick={() => handleCategoryChange(cat)}
                    aria-current={activeCategory === cat ? 'true' : undefined}
                  >
                    <CatIcon size={16} />
                    <span className="inbox-page__sidebar-item-label">{CATEGORY_LABELS[cat]}</span>
                    {count > 0 && (
                      <span className="inbox-page__sidebar-item-badge">{count}</span>
                    )}
                  </button>
                </li>
              )
            })}
          </ul>
        </aside>

        {/* Message list pane */}
        <div className="inbox-page__list-pane">
          {/* Search bar */}
          <div className="inbox-page__search">
            <Search size={16} className="inbox-page__search-icon" />
            <input
              className="inbox-page__search-input"
              type="text"
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search notifications"
            />
            {searchQuery && (
              <button
                className="inbox-page__search-clear"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Batch action bar */}
          <div className={`inbox-page__batch ${selectedIds.size > 0 ? 'inbox-page__batch--visible' : ''}`}>
            <div className="inbox-page__batch-left">
              <button
                className="inbox-page__batch-checkbox"
                onClick={handleSelectAll}
                aria-label={allSelected ? 'Deselect all' : 'Select all'}
              >
                {allSelected ? <Check size={14} /> : null}
              </button>
              <span className="inbox-page__batch-count">{selectedIds.size} selected</span>
            </div>
            <div className="inbox-page__batch-actions">
              <button className="inbox-page__batch-btn" onClick={handleBatchMarkRead}>
                <CheckCheck size={14} /> Mark as read
              </button>
              <button className="inbox-page__batch-btn" onClick={handleBatchArchive}>
                <Archive size={14} /> Archive
              </button>
              <button className="inbox-page__batch-btn inbox-page__batch-btn--danger" onClick={handleBatchDelete}>
                <Trash2 size={14} /> Delete
              </button>
            </div>
          </div>

          {/* Notification list */}
          {filtered.length === 0 ? (
            <EmptyState
              icon={<Bell size={36} />}
              title={emptyState?.title ?? 'No notifications'}
              description={emptyState?.desc ?? ''}
            />
          ) : (
            <div className="inbox-page__list">
              {groups.map((group) => {
                const isCollapsed = collapsedGroups.has(group.label)
                return (
                  <div key={group.label} className="inbox-page__group">
                    <button
                      className="inbox-page__group-header"
                      onClick={() => handleToggleGroup(group.label)}
                      aria-expanded={!isCollapsed}
                      aria-label={`${group.label} - ${group.items.length} notifications`}
                    >
                      <ChevronRight
                        size={14}
                        className={`inbox-page__group-chevron ${!isCollapsed ? 'inbox-page__group-chevron--expanded' : ''}`}
                      />
                      <span className="inbox-page__group-label">{group.label}</span>
                      <span className="inbox-page__group-count">{group.items.length}</span>
                      <span className="inbox-page__group-line" />
                    </button>
                    {!isCollapsed && group.items.map((notif) => {
                      const Icon = ICON_MAP[notif.type] ?? Bell
                      const borderColor = PRIORITY_COLOR[notif.type] ?? '#94A3B8'
                      const isDismissing = dismissingIds.has(notif.id)
                      const isSelected = selectedIds.has(notif.id)
                      const isActive = selectedNotifId === notif.id
                      const sourceCount = notif.sourceId ? sourceGroupCounts.get(notif.sourceId) ?? 0 : 0

                      return (
                        <div
                          key={notif.id}
                          className={[
                            'inbox-page__item',
                            !notif.read ? 'inbox-page__item--unread' : '',
                            isDismissing ? 'inbox-page__item--dismissing' : '',
                            isSelected ? 'inbox-page__item--selected' : '',
                            isActive ? 'inbox-page__item--active' : '',
                          ].filter(Boolean).join(' ')}
                          style={{ '--priority-color': borderColor } as React.CSSProperties}
                          onClick={() => handleClick(notif)}
                        >
                          <div className="inbox-page__item-priority" />

                          <button
                            className={`inbox-page__item-checkbox ${isSelected ? 'inbox-page__item-checkbox--checked' : ''}`}
                            onClick={(e) => handleSelectToggle(e, notif.id)}
                            aria-label={isSelected ? 'Deselect notification' : 'Select notification'}
                          >
                            {isSelected && <Check size={12} />}
                          </button>

                          <button
                            className="inbox-page__read-toggle"
                            onClick={(e) => handleToggleRead(e, notif.id)}
                            aria-label={notif.read ? 'Mark as unread' : 'Mark as read'}
                            title={notif.read ? 'Mark as unread' : 'Mark as read'}
                          >
                            <span className={`inbox-page__read-dot ${!notif.read ? 'inbox-page__read-dot--unread' : ''}`} />
                          </button>

                          <div className="inbox-page__item-icon">
                            <Icon size={18} />
                          </div>
                          <div className="inbox-page__item-content">
                            <div className="inbox-page__item-header">
                              <span className="inbox-page__item-title">{notif.title}</span>
                              <span className="inbox-page__item-time">{timeAgo(notif.createdAt)}</span>
                            </div>
                            <p className="inbox-page__item-message">{notif.message}</p>
                            <div className="inbox-page__item-meta">
                              {notif.actorName && (
                                <span className="inbox-page__item-actor">{notif.actorName}</span>
                              )}
                              <span
                                className="inbox-page__item-category-badge"
                                data-category={notif.category}
                              >
                                {CATEGORY_BADGE_LABEL[notif.category] ?? notif.category}
                              </span>
                              {sourceCount > 1 && (
                                <span className="inbox-page__item-source-count">
                                  +{sourceCount - 1} related
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="inbox-page__item-actions">
                            {notif.actionLabel && (
                              <button
                                className="inbox-page__item-action-btn"
                                onClick={(e) => handleActionClick(e, notif)}
                                title={notif.actionLabel}
                              >
                                <ExternalLink size={12} />
                                <span>{notif.actionLabel}</span>
                              </button>
                            )}
                            <button
                              className="inbox-page__item-archive"
                              onClick={(e) => handleArchive(e, notif.id)}
                              aria-label="Archive notification"
                              title="Archive"
                            >
                              <Archive size={14} />
                            </button>
                            <button
                              className="inbox-page__item-delete"
                              onClick={(e) => handleDelete(e, notif.id)}
                              aria-label="Delete notification"
                              title="Delete notification"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Detail pane */}
        <div className="inbox-page__detail-pane">
          {selectedNotification ? (
            <div className="inbox-page__detail">
              <div className="inbox-page__detail-header">
                <div className="inbox-page__detail-icon" style={{ '--priority-color': PRIORITY_COLOR[selectedNotification.type] ?? '#94A3B8' } as React.CSSProperties}>
                  {(() => {
                    const DetailIcon = ICON_MAP[selectedNotification.type] ?? Bell
                    return <DetailIcon size={24} />
                  })()}
                </div>
                <div>
                  <h2 className="inbox-page__detail-title">{selectedNotification.title}</h2>
                  <span className="inbox-page__detail-time">{formatDate(selectedNotification.createdAt)}</span>
                </div>
              </div>
              <div className="inbox-page__detail-body">
                <p className="inbox-page__detail-message">{selectedNotification.message}</p>
                {selectedNotification.actorName && (
                  <div className="inbox-page__detail-actor">
                    <span className="inbox-page__detail-actor-label">From:</span>
                    <span className="inbox-page__detail-actor-name">{selectedNotification.actorName}</span>
                  </div>
                )}
                <div className="inbox-page__detail-category">
                  <span className="inbox-page__detail-category-label">Category:</span>
                  <span
                    className="inbox-page__item-category-badge"
                    data-category={selectedNotification.category}
                  >
                    {CATEGORY_BADGE_LABEL[selectedNotification.category] ?? selectedNotification.category}
                  </span>
                </div>
              </div>
              {selectedNotification.actionLabel && selectedNotification.actionUrl && (
                <div className="inbox-page__detail-actions">
                  <button
                    className="inbox-page__detail-action-btn"
                    onClick={() => handleDetailAction(selectedNotification)}
                  >
                    <ExternalLink size={14} />
                    {selectedNotification.actionLabel}
                  </button>
                </div>
              )}
              <div className="inbox-page__detail-footer">
                <button
                  className="inbox-page__detail-footer-btn"
                  onClick={() => { archiveNotification(selectedNotification.id); setSelectedNotifId(null) }}
                >
                  <Archive size={14} /> Archive
                </button>
                <button
                  className="inbox-page__detail-footer-btn inbox-page__detail-footer-btn--danger"
                  onClick={() => { deleteNotification(selectedNotification.id); setSelectedNotifId(null) }}
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </div>
          ) : (
            <div className="inbox-page__detail-empty">
              <Bell size={32} />
              <p>Select a notification to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
