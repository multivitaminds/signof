import { useCallback } from 'react'
import {
  FileSignature,
  Send,
  CircleDot,
  CheckCircle,
  Sparkles,
  AlertTriangle,
  CalendarCheck,
  CalendarX,
  DollarSign,
  AtSign,
  MessageCircle,
  AlertCircle,
} from 'lucide-react'
import type { Notification } from '../../types'
import { NotificationType } from '../../types'
import './NotificationItem.css'

interface NotificationItemProps {
  notification: Notification
  onMarkRead: (id: string) => void
  onDismiss: (id: string) => void
  onNavigate: (path: string) => void
}

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  'file-signature': FileSignature,
  'send': Send,
  'circle-dot': CircleDot,
  'check-circle': CheckCircle,
  'sparkles': Sparkles,
  'alert-triangle': AlertTriangle,
  'calendar-check': CalendarCheck,
  'calendar-x': CalendarX,
  'dollar-sign': DollarSign,
  'at-sign': AtSign,
  'message-circle': MessageCircle,
  'alert-circle': AlertCircle,
}

const TYPE_COLOR_MAP: Record<string, string> = {
  [NotificationType.DocumentSigned]: 'var(--color-success, #059669)',
  [NotificationType.DocumentSent]: 'var(--color-primary, #4F46E5)',
  [NotificationType.IssueAssigned]: 'var(--color-warning, #D97706)',
  [NotificationType.IssueCompleted]: 'var(--color-success, #059669)',
  [NotificationType.BookingConfirmed]: 'var(--color-success, #059669)',
  [NotificationType.BookingCancelled]: 'var(--color-danger, #DC2626)',
  [NotificationType.AgentCompleted]: 'var(--color-primary, #4F46E5)',
  [NotificationType.AgentFailed]: 'var(--color-danger, #DC2626)',
  [NotificationType.InvoicePaid]: 'var(--color-success, #059669)',
  [NotificationType.PageMentioned]: 'var(--color-primary, #4F46E5)',
  [NotificationType.CommentAdded]: '#64748B',
  [NotificationType.SystemAlert]: 'var(--color-warning, #D97706)',
}

function formatRelativeTime(dateStr: string): string {
  const now = Date.now()
  const diff = now - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString()
}

export default function NotificationItem({
  notification,
  onMarkRead,
  onDismiss,
  onNavigate,
}: NotificationItemProps) {
  const Icon = ICON_MAP[notification.icon] || AlertCircle
  const color = TYPE_COLOR_MAP[notification.type] || '#64748B'

  const handleClick = useCallback(() => {
    onMarkRead(notification.id)
    if (notification.entityPath) {
      onNavigate(notification.entityPath)
    }
  }, [notification.id, notification.entityPath, onMarkRead, onNavigate])

  const handleDismiss = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      onDismiss(notification.id)
    },
    [notification.id, onDismiss]
  )

  return (
    <div
      className={`notification-item ${!notification.read ? 'notification-item--unread' : ''}`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleClick()
        }
      }}
      aria-label={`${notification.title}: ${notification.body}`}
    >
      {!notification.read && <span className="notification-item__unread-dot" />}
      <div className="notification-item__icon" style={{ color }}>
        <Icon size={18} />
      </div>
      <div className="notification-item__content">
        <span className="notification-item__title">{notification.title}</span>
        <span className="notification-item__body">{notification.body}</span>
        <span className="notification-item__time">{formatRelativeTime(notification.createdAt)}</span>
      </div>
      <button
        className="notification-item__dismiss"
        onClick={handleDismiss}
        aria-label={`Dismiss notification: ${notification.title}`}
      >
        &times;
      </button>
    </div>
  )
}
