import { useState, useCallback, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, Bell, CheckCheck } from 'lucide-react'
import { useNotificationStore } from '../../stores/useNotificationStore'
import NotificationItem from '../NotificationItem/NotificationItem'
import './NotificationCenter.css'

const FILTER_TABS = [
  { key: 'all', label: 'All' },
  { key: 'unread', label: 'Unread' },
  { key: 'documents', label: 'Documents' },
  { key: 'projects', label: 'Projects' },
  { key: 'copilot', label: 'Agents' },
  { key: 'system', label: 'System' },
] as const

type FilterKey = (typeof FILTER_TABS)[number]['key']

interface NotificationCenterProps {
  open: boolean
  onClose: () => void
}

export default function NotificationCenter({ open, onClose }: NotificationCenterProps) {
  const navigate = useNavigate()
  const panelRef = useRef<HTMLDivElement>(null)
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all')

  // Subscribe to notifications to trigger re-renders when they change
  useNotificationStore((s) => s.notifications)
  const markRead = useNotificationStore((s) => s.markRead)
  const markAllRead = useNotificationStore((s) => s.markAllRead)
  const dismiss = useNotificationStore((s) => s.dismiss)
  const getUnreadCount = useNotificationStore((s) => s.getUnreadCount)
  const getGroupedByDate = useNotificationStore((s) => s.getGroupedByDate)

  const unreadCount = getUnreadCount()
  const grouped = getGroupedByDate()

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handleClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    // Delay to avoid closing immediately from the open click
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClick)
    }, 0)
    return () => {
      clearTimeout(timer)
      document.removeEventListener('mousedown', handleClick)
    }
  }, [open, onClose])

  const handleNavigate = useCallback(
    (path: string) => {
      navigate(path)
      onClose()
    },
    [navigate, onClose]
  )

  const handleMarkAllRead = useCallback(() => {
    markAllRead()
  }, [markAllRead])

  // Apply filter
  const filteredGroups = grouped
    .map((group) => ({
      ...group,
      notifications: group.notifications.filter((n) => {
        if (activeFilter === 'all') return true
        if (activeFilter === 'unread') return !n.read
        return n.module === activeFilter
      }),
    }))
    .filter((group) => group.notifications.length > 0)

  const totalFiltered = filteredGroups.reduce(
    (sum, g) => sum + g.notifications.length,
    0
  )

  if (!open) return null

  return (
    <div className="notification-center__overlay" aria-hidden={!open}>
      <div
        ref={panelRef}
        className="nc-panel"
        role="dialog"
        aria-label="Notification Center"
        aria-modal="true"
      >
        {/* Header */}
        <div className="notification-center__header">
          <div className="notification-center__header-left">
            <Bell size={18} />
            <h2 className="notification-center__title">Notifications</h2>
            {unreadCount > 0 && (
              <span className="notification-center__unread-badge">{unreadCount}</span>
            )}
          </div>
          <div className="notification-center__header-actions">
            {unreadCount > 0 && (
              <button
                className="notification-center__mark-all-btn"
                onClick={handleMarkAllRead}
                aria-label="Mark all as read"
              >
                <CheckCheck size={16} />
                <span>Mark all read</span>
              </button>
            )}
            <button
              className="notification-center__close-btn"
              onClick={onClose}
              aria-label="Close notification center"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="notification-center__filters" role="tablist">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.key}
              className={`notification-center__filter-tab ${activeFilter === tab.key ? 'notification-center__filter-tab--active' : ''}`}
              onClick={() => setActiveFilter(tab.key)}
              role="tab"
              aria-selected={activeFilter === tab.key}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Notification list */}
        <div className="notification-center__list">
          {totalFiltered === 0 ? (
            <div className="notification-center__empty">
              <Bell size={32} className="notification-center__empty-icon" />
              <p className="notification-center__empty-text">
                {activeFilter === 'unread'
                  ? 'All caught up!'
                  : `No ${activeFilter === 'all' ? '' : activeFilter + ' '}notifications`}
              </p>
            </div>
          ) : (
            filteredGroups.map((group) => (
              <div key={group.label} className="notification-center__group">
                <div className="notification-center__group-label">{group.label}</div>
                {group.notifications.map((n) => (
                  <NotificationItem
                    key={n.id}
                    notification={n}
                    onMarkRead={markRead}
                    onDismiss={dismiss}
                    onNavigate={handleNavigate}
                  />
                ))}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
