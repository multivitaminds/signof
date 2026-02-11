import { useState, useEffect } from 'react'
import { WifiOff } from 'lucide-react'
import './OfflineBanner.css'

/**
 * OfflineBanner — detects offline status via navigator.onLine + event listeners.
 * Shows a yellow banner at top when offline with slide-in/out animation.
 */
export default function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(() => {
    if (typeof navigator === 'undefined') return false
    return !navigator.onLine
  })

  // Track if we've ever gone offline to enable exit animation
  const [showBanner, setShowBanner] = useState(false)
  const [animatingOut, setAnimatingOut] = useState(false)

  useEffect(() => {
    const handleOffline = () => {
      setIsOffline(true)
      setShowBanner(true)
      setAnimatingOut(false)
    }

    const handleOnline = () => {
      setIsOffline(false)
      setAnimatingOut(true)
      // Wait for animation to complete before hiding
      const timer = setTimeout(() => {
        setShowBanner(false)
        setAnimatingOut(false)
      }, 400)
      return () => clearTimeout(timer)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (!showBanner && !isOffline) return null

  const bannerClass = [
    'offline-banner',
    isOffline && !animatingOut ? 'offline-banner--visible' : '',
    animatingOut ? 'offline-banner--hiding' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={bannerClass} role="alert" aria-live="polite">
      <WifiOff size={16} className="offline-banner__icon" />
      <span className="offline-banner__text">
        You&apos;re offline. Changes will sync when reconnected.
      </span>
    </div>
  )
}
