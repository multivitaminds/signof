import './NotificationBadge.css'

interface NotificationBadgeProps {
  count: number
  onClick: () => void
}

export default function NotificationBadge({ count, onClick }: NotificationBadgeProps) {
  if (count <= 0) return null

  const display = count > 99 ? '99+' : String(count)

  return (
    <button
      className="notification-badge"
      onClick={onClick}
      aria-label={`${count} unread notifications`}
    >
      <span className="notification-badge__count">{display}</span>
    </button>
  )
}
