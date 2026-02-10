import { useCallback } from 'react'
import { useNotificationPrefsStore } from '../stores/useNotificationPrefsStore'
import type { NotificationToggle } from '../types'
import './NotificationsSettings.css'

interface NotifItem {
  key: string
  label: string
  description: string
}

interface NotifCategory {
  key: 'documents' | 'projects' | 'scheduling' | 'workspace'
  title: string
  items: NotifItem[]
}

const CATEGORIES: NotifCategory[] = [
  {
    key: 'documents',
    title: 'Documents',
    items: [
      { key: 'newDocument', label: 'New document', description: 'When a new document is created in your workspace' },
      { key: 'signatureRequest', label: 'Signature request', description: 'When a document is sent to you for signing' },
      { key: 'documentCompleted', label: 'Document completed', description: 'When all signers have completed a document' },
      { key: 'documentExpired', label: 'Document expired', description: 'When a document reaches its expiration date' },
    ],
  },
  {
    key: 'projects',
    title: 'Projects',
    items: [
      { key: 'issueAssigned', label: 'Issue assigned', description: 'When an issue is assigned to you' },
      { key: 'statusChanged', label: 'Status changed', description: 'When an issue you follow changes status' },
      { key: 'commentMention', label: 'Comment mention', description: 'When someone mentions you in a comment' },
      { key: 'cycleCompleted', label: 'Cycle completed', description: 'When a cycle you are part of is completed' },
    ],
  },
  {
    key: 'scheduling',
    title: 'Scheduling',
    items: [
      { key: 'newBooking', label: 'New booking', description: 'When someone books a meeting with you' },
      { key: 'bookingCancelled', label: 'Booking cancelled', description: 'When a booked meeting is cancelled' },
      { key: 'bookingReminder', label: 'Booking reminder', description: 'Reminder before a scheduled meeting' },
    ],
  },
  {
    key: 'workspace',
    title: 'Workspace',
    items: [
      { key: 'pageShared', label: 'Page shared', description: 'When someone shares a page with you' },
      { key: 'commentOnPage', label: 'Comment on page', description: 'When someone comments on your page' },
      { key: 'teamInvite', label: 'Team invite', description: 'When you are invited to join a team' },
    ],
  },
]

export default function NotificationsSettings() {
  const prefs = useNotificationPrefsStore((s) => s.prefs)
  const toggleNotification = useNotificationPrefsStore((s) => s.toggleNotification)
  const updateQuietHours = useNotificationPrefsStore((s) => s.updateQuietHours)

  const handleToggle = useCallback(
    (category: NotifCategory['key'], setting: string, channel: keyof NotificationToggle) => {
      toggleNotification(category, setting, channel)
    },
    [toggleNotification]
  )

  const handleQuietHoursToggle = useCallback(() => {
    updateQuietHours({ enabled: !prefs.quietHours.enabled })
  }, [prefs.quietHours.enabled, updateQuietHours])

  const handleStartTimeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      updateQuietHours({ startTime: e.target.value })
    },
    [updateQuietHours]
  )

  const handleEndTimeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      updateQuietHours({ endTime: e.target.value })
    },
    [updateQuietHours]
  )

  return (
    <div className="notif-settings">
      <h1 className="notif-settings__title">Notifications</h1>
      <p className="notif-settings__subtitle">Choose how you want to be notified</p>

      {CATEGORIES.map((category) => {
        const categoryPrefs = prefs[category.key] as unknown as Record<string, NotificationToggle>
        return (
          <div key={category.key} className="notif-settings__category">
            <h3 className="notif-settings__category-title">{category.title}</h3>
            <div className="notif-settings__table">
              <div className="notif-settings__table-header">
                <span className="notif-settings__table-header-label">Notification</span>
                <span className="notif-settings__table-header-toggle">In-app</span>
                <span className="notif-settings__table-header-toggle">Email</span>
              </div>
              {category.items.map((item) => {
                const toggle = categoryPrefs[item.key]
                if (!toggle) return null
                return (
                  <div key={item.key} className="notif-settings__item">
                    <div className="notif-settings__item-info">
                      <span className="notif-settings__item-label">{item.label}</span>
                      <span className="notif-settings__item-desc">{item.description}</span>
                    </div>
                    <button
                      className={`notif-settings__toggle ${toggle.inApp ? 'notif-settings__toggle--on' : ''}`}
                      onClick={() => handleToggle(category.key, item.key, 'inApp')}
                      role="switch"
                      aria-checked={toggle.inApp}
                      aria-label={`${item.label} in-app notification`}
                    >
                      <span className="notif-settings__toggle-thumb" />
                    </button>
                    <button
                      className={`notif-settings__toggle ${toggle.email ? 'notif-settings__toggle--on' : ''}`}
                      onClick={() => handleToggle(category.key, item.key, 'email')}
                      role="switch"
                      aria-checked={toggle.email}
                      aria-label={`${item.label} email notification`}
                    >
                      <span className="notif-settings__toggle-thumb" />
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}

      {/* Quiet Hours */}
      <div className="notif-settings__category">
        <h3 className="notif-settings__category-title">Quiet Hours</h3>
        <p className="notif-settings__quiet-desc">
          Pause non-urgent notifications during specified hours.
        </p>
        <div className="notif-settings__quiet-row">
          <button
            className={`notif-settings__toggle ${prefs.quietHours.enabled ? 'notif-settings__toggle--on' : ''}`}
            onClick={handleQuietHoursToggle}
            role="switch"
            aria-checked={prefs.quietHours.enabled}
            aria-label="Enable quiet hours"
          >
            <span className="notif-settings__toggle-thumb" />
          </button>
          <span className="notif-settings__quiet-label">
            {prefs.quietHours.enabled ? 'Enabled' : 'Disabled'}
          </span>
        </div>
        {prefs.quietHours.enabled && (
          <div className="notif-settings__quiet-times">
            <div className="notif-settings__quiet-time-field">
              <label className="notif-settings__quiet-time-label" htmlFor="quiet-start">
                From
              </label>
              <input
                id="quiet-start"
                type="time"
                className="notif-settings__time-input"
                value={prefs.quietHours.startTime}
                onChange={handleStartTimeChange}
              />
            </div>
            <div className="notif-settings__quiet-time-field">
              <label className="notif-settings__quiet-time-label" htmlFor="quiet-end">
                To
              </label>
              <input
                id="quiet-end"
                type="time"
                className="notif-settings__time-input"
                value={prefs.quietHours.endTime}
                onChange={handleEndTimeChange}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
