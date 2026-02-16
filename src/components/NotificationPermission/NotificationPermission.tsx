import { useState, useCallback, useEffect } from 'react'
import { Bell, X } from 'lucide-react'
import { isPushSupported, getPushPermission, requestPushPermission } from '../../lib/pushNotifications'
import './NotificationPermission.css'

function NotificationPermission() {
  const [visible, setVisible] = useState(false)
  const [requesting, setRequesting] = useState(false)

  useEffect(() => {
    const dismissed = localStorage.getItem('orchestree-push-dismissed')
    if (!dismissed && isPushSupported() && getPushPermission() === 'default') {
      const timer = setTimeout(() => setVisible(true), 10000)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleEnable = useCallback(async () => {
    setRequesting(true)
    await requestPushPermission()
    setVisible(false)
    setRequesting(false)
  }, [])

  const handleDismiss = useCallback(() => {
    setVisible(false)
    localStorage.setItem('orchestree-push-dismissed', 'true')
  }, [])

  if (!visible) return null

  return (
    <div className="notification-permission" role="alert">
      <div className="notification-permission__content">
        <Bell size={18} className="notification-permission__icon" />
        <p className="notification-permission__text">
          Enable notifications to stay updated on document signatures, bookings, and team activity.
        </p>
      </div>
      <div className="notification-permission__actions">
        <button
          type="button"
          className="notification-permission__enable"
          onClick={handleEnable}
          disabled={requesting}
        >
          {requesting ? 'Enabling...' : 'Enable'}
        </button>
        <button
          type="button"
          className="notification-permission__dismiss"
          onClick={handleDismiss}
          aria-label="Dismiss notification prompt"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  )
}

export default NotificationPermission
