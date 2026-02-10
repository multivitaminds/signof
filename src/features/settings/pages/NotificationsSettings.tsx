import { useSettingsStore } from '../stores/useSettingsStore'
import './NotificationsSettings.css'

export default function NotificationsSettings() {
  const notifications = useSettingsStore((s) => s.notifications)
  const updateNotifications = useSettingsStore((s) => s.updateNotifications)

  const toggles: Array<{ key: keyof typeof notifications; label: string; description: string }> = [
    { key: 'emailDigest', label: 'Email Digest', description: 'Receive a daily summary of activity in your workspace' },
    { key: 'mentionAlerts', label: 'Mention Alerts', description: 'Get notified when someone mentions you in a page or comment' },
    { key: 'signatureRequests', label: 'Signature Requests', description: 'Get notified when a document is sent to you for signing' },
    { key: 'weeklyReport', label: 'Weekly Report', description: 'Receive a weekly summary of workspace analytics' },
    { key: 'desktopNotifications', label: 'Desktop Notifications', description: 'Show browser push notifications for real-time alerts' },
  ]

  return (
    <div className="notif-settings">
      <h1 className="notif-settings__title">Notifications</h1>
      <p className="notif-settings__subtitle">Choose how you want to be notified</p>

      <div className="notif-settings__list">
        {toggles.map(({ key, label, description }) => (
          <div key={key} className="notif-settings__item">
            <div className="notif-settings__item-info">
              <span className="notif-settings__item-label">{label}</span>
              <span className="notif-settings__item-desc">{description}</span>
            </div>
            <button
              className={`notif-settings__toggle ${notifications[key] ? 'notif-settings__toggle--on' : ''}`}
              onClick={() => updateNotifications({ [key]: !notifications[key] })}
              role="switch"
              aria-checked={notifications[key]}
            >
              <span className="notif-settings__toggle-thumb" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
