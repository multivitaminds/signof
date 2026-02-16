import {
  Bell, Archive, Trash2, ExternalLink,
} from 'lucide-react'
import type { Notification } from '../../types'

interface NotificationDetailProps {
  notification: Notification
  iconMap: Record<string, React.ComponentType<{ size?: number }>>
  priorityColor: Record<string, string>
  categoryBadgeLabel: Record<string, string>
  onDetailAction: (notif: Notification) => void
  onArchive: (id: string) => void
  onDelete: (id: string) => void
}

export default function NotificationDetail({
  notification,
  iconMap,
  priorityColor,
  categoryBadgeLabel,
  onDetailAction,
  onArchive,
  onDelete,
}: NotificationDetailProps) {
  const DetailIcon = iconMap[notification.type] ?? Bell

  return (
    <div className="inbox-page__detail">
      <div className="inbox-page__detail-header">
        <div className="inbox-page__detail-icon" style={{ '--priority-color': priorityColor[notification.type] ?? '#94A3B8' } as React.CSSProperties}>
          <DetailIcon size={24} />
        </div>
        <div>
          <h2 className="inbox-page__detail-title">{notification.title}</h2>
          <span className="inbox-page__detail-time">{formatDate(notification.createdAt)}</span>
        </div>
      </div>
      <div className="inbox-page__detail-body">
        <p className="inbox-page__detail-message">{notification.message}</p>
        {notification.actorName && (
          <div className="inbox-page__detail-actor">
            <span className="inbox-page__detail-actor-label">From:</span>
            <span className="inbox-page__detail-actor-name">{notification.actorName}</span>
          </div>
        )}
        <div className="inbox-page__detail-category">
          <span className="inbox-page__detail-category-label">Category:</span>
          <span
            className="inbox-page__item-category-badge"
            data-category={notification.category}
          >
            {categoryBadgeLabel[notification.category] ?? notification.category}
          </span>
        </div>
      </div>
      {notification.actionLabel && notification.actionUrl && (
        <div className="inbox-page__detail-actions">
          <button
            className="inbox-page__detail-action-btn"
            onClick={() => onDetailAction(notification)}
          >
            <ExternalLink size={14} />
            {notification.actionLabel}
          </button>
        </div>
      )}
      <div className="inbox-page__detail-footer">
        <button
          className="inbox-page__detail-footer-btn"
          onClick={() => onArchive(notification.id)}
        >
          <Archive size={14} /> Archive
        </button>
        <button
          className="inbox-page__detail-footer-btn inbox-page__detail-footer-btn--danger"
          onClick={() => onDelete(notification.id)}
        >
          <Trash2 size={14} /> Delete
        </button>
      </div>
    </div>
  )
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
