import { useState, useCallback, useRef, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Bell, FileSignature, AtSign, MessageSquare, UserPlus,
  ArrowRightLeft, Sparkles, CheckCheck, Calendar, Clock,
  ExternalLink,
} from 'lucide-react'
import { useInboxStore } from '../../features/inbox/stores/useInboxStore'
import { NotificationType } from '../../features/inbox/types'
import type { Notification } from '../../features/inbox/types'
import './NotificationCenter.css'

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
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

const TYPE_COLOR: Record<string, string> = {
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

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
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

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function NotificationCenter() {
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  /* Store */
  const notifications = useInboxStore((s) => s.notifications)
  const markAsRead = useInboxStore((s) => s.markAsRead)
  const markAllAsRead = useInboxStore((s) => s.markAllAsRead)

  /* Derived */
  const activeNotifications = useMemo(
    () => notifications.filter((n) => !n.archived),
    [notifications],
  )

  const unreadCount = useMemo(
    () => activeNotifications.filter((n) => !n.read).length,
    [activeNotifications],
  )

  const unreadNotifications = useMemo(
    () => activeNotifications.filter((n) => !n.read),
    [activeNotifications],
  )

  const readNotifications = useMemo(
    () => activeNotifications.filter((n) => n.read).slice(0, 10),
    [activeNotifications],
  )

  /* Toggle */
  const toggleOpen = useCallback(() => {
    setIsOpen((prev) => !prev)
  }, [])

  /* Close on outside click */
  useEffect(() => {
    if (!isOpen) return

    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node
      if (
        panelRef.current &&
        !panelRef.current.contains(target) &&
        buttonRef.current &&
        !buttonRef.current.contains(target)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  /* Close on Escape */
  useEffect(() => {
    if (!isOpen) return

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setIsOpen(false)
        buttonRef.current?.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  /* Click notification */
  const handleNotificationClick = useCallback(
    (notif: Notification) => {
      markAsRead(notif.id)
      if (notif.link) {
        navigate(notif.link)
      }
      setIsOpen(false)
    },
    [markAsRead, navigate],
  )

  /* Click action button */
  const handleActionClick = useCallback(
    (e: React.MouseEvent, notif: Notification) => {
      e.stopPropagation()
      markAsRead(notif.id)
      if (notif.actionUrl) {
        navigate(notif.actionUrl)
      }
      setIsOpen(false)
    },
    [markAsRead, navigate],
  )

  /* Mark all as read */
  const handleMarkAllAsRead = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      markAllAsRead()
    },
    [markAllAsRead],
  )

  /* View all */
  const handleViewAll = useCallback(() => {
    navigate('/inbox')
    setIsOpen(false)
  }, [navigate])

  /* Render a notification item */
  function renderNotificationItem(notif: Notification) {
    const Icon = ICON_MAP[notif.type] ?? Bell
    const color = TYPE_COLOR[notif.type] ?? '#94A3B8'

    return (
      <button
        key={notif.id}
        className={`notification-center__item ${!notif.read ? 'notification-center__item--unread' : ''}`}
        onClick={() => handleNotificationClick(notif)}
        type="button"
      >
        <div
          className="notification-center__item-icon"
          style={{ '--nc-type-color': color } as React.CSSProperties}
        >
          <Icon size={16} />
        </div>
        <div className="notification-center__item-content">
          <div className="notification-center__item-header">
            <span className="notification-center__item-title">{notif.title}</span>
            {!notif.read && (
              <span className="notification-center__item-dot" aria-label="Unread" />
            )}
          </div>
          <p className="notification-center__item-message">{notif.message}</p>
          <div className="notification-center__item-footer">
            <span className="notification-center__item-time">{timeAgo(notif.createdAt)}</span>
            {notif.actionLabel && notif.actionUrl && (
              <button
                className="notification-center__item-action"
                onClick={(e) => handleActionClick(e, notif)}
                type="button"
              >
                <ExternalLink size={10} />
                {notif.actionLabel}
              </button>
            )}
          </div>
        </div>
      </button>
    )
  }

  return (
    <div className="notification-center">
      {/* Bell trigger button */}
      <button
        ref={buttonRef}
        className="notification-center__trigger"
        onClick={toggleOpen}
        aria-label="Notifications"
        aria-expanded={isOpen}
        aria-haspopup="true"
        title="Notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="notification-center__badge" data-testid="notification-badge">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {isOpen && (
        <div
          ref={panelRef}
          className="notification-center__panel"
          role="dialog"
          aria-label="Notifications panel"
        >
          {/* Panel header */}
          <div className="notification-center__panel-header">
            <h2 className="notification-center__panel-title">Notifications</h2>
            {unreadCount > 0 && (
              <button
                className="notification-center__mark-all"
                onClick={handleMarkAllAsRead}
                type="button"
              >
                <CheckCheck size={14} />
                Mark all as read
              </button>
            )}
          </div>

          {/* Panel body */}
          <div className="notification-center__panel-body">
            {activeNotifications.length === 0 ? (
              <div className="notification-center__empty">
                <Bell size={32} />
                <p>No notifications yet</p>
              </div>
            ) : (
              <>
                {/* New (unread) section */}
                {unreadNotifications.length > 0 && (
                  <div className="notification-center__section">
                    <div className="notification-center__section-label">New</div>
                    {unreadNotifications.map((notif) => renderNotificationItem(notif))}
                  </div>
                )}

                {/* Earlier (read) section */}
                {readNotifications.length > 0 && (
                  <div className="notification-center__section">
                    <div className="notification-center__section-label">Earlier</div>
                    {readNotifications.map((notif) => renderNotificationItem(notif))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Panel footer */}
          <div className="notification-center__panel-footer">
            <button
              className="notification-center__view-all"
              onClick={handleViewAll}
              type="button"
            >
              View all notifications
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
