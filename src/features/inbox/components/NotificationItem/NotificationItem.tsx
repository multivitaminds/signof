import {
  Bell, Check, Archive, Trash2, ExternalLink,
} from 'lucide-react'
import type { Notification } from '../../types'

interface NotificationItemProps {
  notif: Notification
  iconMap: Record<string, React.ComponentType<{ size?: number }>>
  priorityColor: Record<string, string>
  categoryBadgeLabel: Record<string, string>
  sourceCount: number
  isDismissing: boolean
  isSelected: boolean
  isActive: boolean
  onClick: (notif: Notification) => void
  onSelectToggle: (e: React.MouseEvent, id: string) => void
  onToggleRead: (e: React.MouseEvent, id: string) => void
  onArchive: (e: React.MouseEvent, id: string) => void
  onDelete: (e: React.MouseEvent, id: string) => void
  onActionClick: (e: React.MouseEvent, notif: Notification) => void
}

export default function NotificationItem({
  notif,
  iconMap,
  priorityColor,
  categoryBadgeLabel,
  sourceCount,
  isDismissing,
  isSelected,
  isActive,
  onClick,
  onSelectToggle,
  onToggleRead,
  onArchive,
  onDelete,
  onActionClick,
}: NotificationItemProps) {
  const Icon = iconMap[notif.type] ?? Bell
  const borderColor = priorityColor[notif.type] ?? '#94A3B8'

  return (
    <div
      className={[
        'inbox-page__item',
        !notif.read ? 'inbox-page__item--unread' : '',
        isDismissing ? 'inbox-page__item--dismissing' : '',
        isSelected ? 'inbox-page__item--selected' : '',
        isActive ? 'inbox-page__item--active' : '',
      ].filter(Boolean).join(' ')}
      style={{ '--priority-color': borderColor } as React.CSSProperties}
      onClick={() => onClick(notif)}
    >
      <div className="inbox-page__item-priority" />

      <button
        className={`inbox-page__item-checkbox ${isSelected ? 'inbox-page__item-checkbox--checked' : ''}`}
        onClick={(e) => onSelectToggle(e, notif.id)}
        aria-label={isSelected ? 'Deselect notification' : 'Select notification'}
      >
        {isSelected && <Check size={12} />}
      </button>

      <button
        className="inbox-page__read-toggle"
        onClick={(e) => onToggleRead(e, notif.id)}
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
            {categoryBadgeLabel[notif.category] ?? notif.category}
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
            onClick={(e) => onActionClick(e, notif)}
            title={notif.actionLabel}
          >
            <ExternalLink size={12} />
            <span>{notif.actionLabel}</span>
          </button>
        )}
        <button
          className="inbox-page__item-archive"
          onClick={(e) => onArchive(e, notif.id)}
          aria-label="Archive notification"
          title="Archive"
        >
          <Archive size={14} />
        </button>
        <button
          className="inbox-page__item-delete"
          onClick={(e) => onDelete(e, notif.id)}
          aria-label="Delete notification"
          title="Delete notification"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  )
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
  return `${Math.floor(days / 7)}w ago`
}
