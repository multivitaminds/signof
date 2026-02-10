import { useState, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Bell, CheckCheck, Trash2, FileSignature, AtSign,
  MessageSquare, UserPlus, ArrowRightLeft, Clock, Sparkles,
  Search, Plus, X, ChevronDown, Check,
} from 'lucide-react'
import { useInboxStore } from '../stores/useInboxStore'
import { NotificationType } from '../types'
import type { Notification } from '../types'
import './InboxPage.css'

/* ------------------------------------------------------------------ */
/*  Constants                                                         */
/* ------------------------------------------------------------------ */

const ICON_MAP: Record<string, React.ComponentType<{ size?: number }>> = {
  [NotificationType.SignatureRequest]: FileSignature,
  [NotificationType.Mention]: AtSign,
  [NotificationType.Comment]: MessageSquare,
  [NotificationType.Assignment]: UserPlus,
  [NotificationType.StatusChange]: ArrowRightLeft,
  [NotificationType.Invitation]: UserPlus,
  [NotificationType.Reminder]: Clock,
  [NotificationType.System]: Sparkles,
}

const PRIORITY_COLOR: Record<string, string> = {
  [NotificationType.SignatureRequest]: '#EF4444',
  [NotificationType.Mention]: '#4F46E5',
  [NotificationType.Comment]: '#0EA5E9',
  [NotificationType.Assignment]: '#F59E0B',
  [NotificationType.StatusChange]: '#059669',
  [NotificationType.Invitation]: '#8B5CF6',
  [NotificationType.Reminder]: '#F97316',
  [NotificationType.System]: '#94A3B8',
}

type FilterTab = 'all' | 'unread' | 'mentions' | 'signatures' | 'assignments' | 'system'

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'unread', label: 'Unread' },
  { key: 'mentions', label: 'Mentions' },
  { key: 'signatures', label: 'Signatures' },
  { key: 'assignments', label: 'Assignments' },
  { key: 'system', label: 'System' },
]

const EMPTY_MESSAGES: Record<FilterTab, { title: string; desc: string }> = {
  all: { title: 'All caught up!', desc: 'No notifications to show. We will notify you when something needs your attention.' },
  unread: { title: 'Inbox zero!', desc: 'You have read all your notifications. Nice work.' },
  mentions: { title: 'No mentions', desc: 'Nobody has mentioned you yet. When someone @mentions you, it will appear here.' },
  signatures: { title: 'No signature requests', desc: 'No documents are waiting for your signature right now.' },
  assignments: { title: 'No assignments', desc: 'You have no task assignments. When someone assigns you work, it will show up here.' },
  system: { title: 'No system updates', desc: 'There are no system notifications at this time.' },
}

const NOTIFICATION_TYPE_OPTIONS: { value: NotificationType; label: string }[] = [
  { value: NotificationType.SignatureRequest, label: 'Signature Request' },
  { value: NotificationType.Mention, label: 'Mention' },
  { value: NotificationType.Comment, label: 'Comment' },
  { value: NotificationType.Assignment, label: 'Assignment' },
  { value: NotificationType.StatusChange, label: 'Status Change' },
  { value: NotificationType.Invitation, label: 'Invitation' },
  { value: NotificationType.Reminder, label: 'Reminder' },
  { value: NotificationType.System, label: 'System' },
]

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

function filterByTab(notifications: Notification[], tab: FilterTab): Notification[] {
  switch (tab) {
    case 'all': return notifications
    case 'unread': return notifications.filter((n) => !n.read)
    case 'mentions': return notifications.filter((n) => n.type === NotificationType.Mention)
    case 'signatures': return notifications.filter((n) => n.type === NotificationType.SignatureRequest)
    case 'assignments': return notifications.filter((n) => n.type === NotificationType.Assignment)
    case 'system': return notifications.filter(
      (n) => n.type === NotificationType.System || n.type === NotificationType.StatusChange || n.type === NotificationType.Reminder
    )
  }
}

function groupByDate(notifications: Notification[]): { label: string; items: Notification[] }[] {
  const order = ['Today', 'Yesterday', 'This Week', 'Earlier']
  const groups: Record<string, Notification[]> = {}
  for (const n of notifications) {
    const label = getDateGroup(n.createdAt)
    if (!groups[label]) groups[label] = []
    groups[label].push(n)
  }
  const result: { label: string; items: Notification[] }[] = []
  for (const label of order) {
    const items = groups[label]
    if (items) result.push({ label, items })
  }
  return result
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

  /* Local UI state --------------------------------------------------*/
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [showCompose, setShowCompose] = useState(false)
  const [dismissingIds, setDismissingIds] = useState<Set<string>>(new Set())

  /* Compose form state */
  const [composeType, setComposeType] = useState<NotificationType>(NotificationType.System)
  const [composeTitle, setComposeTitle] = useState('')
  const [composeMessage, setComposeMessage] = useState('')

  /* Derived data ----------------------------------------------------*/
  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  )

  const filtered = useMemo(() => {
    let result = filterByTab(notifications, activeFilter)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (n) => n.title.toLowerCase().includes(q) || n.message.toLowerCase().includes(q)
      )
    }
    return result
  }, [notifications, activeFilter, searchQuery])

  const groups = useMemo(() => groupByDate(filtered), [filtered])

  const allFilteredIds = useMemo(() => new Set(filtered.map((n) => n.id)), [filtered])

  const allSelected = filtered.length > 0 && filtered.every((n) => selectedIds.has(n.id))

  /* Handlers --------------------------------------------------------*/
  const handleClick = useCallback((notif: Notification) => {
    markAsRead(notif.id)
    if (notif.link) navigate(notif.link)
  }, [markAsRead, navigate])

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
    }, 300)
  }, [deleteNotification])

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
    }, 300)
  }, [deleteMultiple, selectedIds])

  const handleCompose = useCallback(() => {
    if (!composeTitle.trim() || !composeMessage.trim()) return
    addNotification(composeType, composeTitle.trim(), composeMessage.trim())
    setComposeTitle('')
    setComposeMessage('')
    setComposeType(NotificationType.System)
    setShowCompose(false)
  }, [addNotification, composeType, composeTitle, composeMessage])

  const handleFilterChange = useCallback((tab: FilterTab) => {
    setActiveFilter(tab)
    setSelectedIds(new Set())
  }, [])

  /* Render ----------------------------------------------------------*/
  const emptyState = EMPTY_MESSAGES[activeFilter]

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

      {/* Filter tabs */}
      <div className="inbox-page__tabs" role="tablist" aria-label="Filter notifications">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.key}
            role="tab"
            aria-selected={activeFilter === tab.key}
            className={`inbox-page__tab ${activeFilter === tab.key ? 'inbox-page__tab--active' : ''}`}
            onClick={() => handleFilterChange(tab.key)}
          >
            {tab.label}
            {tab.key === 'unread' && unreadCount > 0 && (
              <span className="inbox-page__tab-count">{unreadCount}</span>
            )}
          </button>
        ))}
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
          <button className="inbox-page__batch-btn inbox-page__batch-btn--danger" onClick={handleBatchDelete}>
            <Trash2 size={14} /> Delete
          </button>
        </div>
      </div>

      {/* Notification list */}
      {filtered.length === 0 ? (
        <div className="inbox-page__empty">
          <Bell size={48} />
          <h2>{emptyState.title}</h2>
          <p>{emptyState.desc}</p>
        </div>
      ) : (
        <div className="inbox-page__list">
          {groups.map((group) => (
            <div key={group.label} className="inbox-page__group">
              <div className="inbox-page__group-header">
                <span className="inbox-page__group-label">{group.label}</span>
                <span className="inbox-page__group-line" />
              </div>
              {group.items.map((notif) => {
                const Icon = ICON_MAP[notif.type] ?? Bell
                const borderColor = PRIORITY_COLOR[notif.type] ?? '#94A3B8'
                const isDismissing = dismissingIds.has(notif.id)
                const isSelected = selectedIds.has(notif.id)

                return (
                  <div
                    key={notif.id}
                    className={[
                      'inbox-page__item',
                      !notif.read ? 'inbox-page__item--unread' : '',
                      isDismissing ? 'inbox-page__item--dismissing' : '',
                      isSelected ? 'inbox-page__item--selected' : '',
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
                      {notif.actorName && (
                        <span className="inbox-page__item-actor">{notif.actorName}</span>
                      )}
                    </div>
                    <button
                      className="inbox-page__item-delete"
                      onClick={(e) => handleDelete(e, notif.id)}
                      aria-label="Delete notification"
                      title="Delete notification"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
