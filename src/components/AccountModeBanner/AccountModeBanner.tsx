import { useCallback } from 'react'
import { useAuthStore } from '../../features/auth/stores/useAuthStore'
import './AccountModeBanner.css'

export default function AccountModeBanner() {
  const accountMode = useAuthStore((s) => s.accountMode)
  const setAccountMode = useAuthStore((s) => s.setAccountMode)

  const handleToggle = useCallback(() => {
    setAccountMode(accountMode === 'demo' ? 'live' : 'demo')
  }, [accountMode, setAccountMode])

  const isDemo = accountMode === 'demo'

  return (
    <div
      className={`account-mode-banner ${isDemo ? 'account-mode-banner--demo' : 'account-mode-banner--live'}`}
      role="status"
      aria-label={isDemo ? 'Demo mode active' : 'Live mode active'}
    >
      <span className="account-mode-banner__text">
        {isDemo
          ? "You're viewing demo data with sample content."
          : 'Live Account'}
      </span>
      <button
        className="account-mode-banner__toggle"
        onClick={handleToggle}
        type="button"
      >
        {isDemo ? 'Switch to Live Account' : 'Switch to Demo'}
      </button>
    </div>
  )
}
