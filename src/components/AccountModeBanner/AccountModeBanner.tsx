import { useCallback } from 'react'
import { Link } from 'react-router-dom'
import { TestTube2, ShieldCheck, Zap } from 'lucide-react'
import { useAuthStore } from '../../features/auth/stores/useAuthStore'
import { useBillingStore } from '../../features/settings/stores/useBillingStore'
import { AuthStatus } from '../../features/auth/types'
import './AccountModeBanner.css'

export default function AccountModeBanner() {
  const status = useAuthStore((s) => s.status)
  const accountMode = useAuthStore((s) => s.accountMode)
  const setAccountMode = useAuthStore((s) => s.setAccountMode)
  const currentPlan = useBillingStore((s) => s.currentPlan)

  const isAuthenticated = status === AuthStatus.Authenticated
  const isDemo = accountMode === 'demo'

  const handleToggle = useCallback(() => {
    setAccountMode(accountMode === 'demo' ? 'live' : 'demo')
  }, [accountMode, setAccountMode])

  // Authenticated + paid plan → hide banner entirely
  if (isAuthenticated && !isDemo && currentPlan !== 'starter') {
    return null
  }

  // Authenticated + Starter (free) plan
  if (isAuthenticated && !isDemo && currentPlan === 'starter') {
    return (
      <div
        className="account-mode-banner account-mode-banner--starter"
        role="status"
        aria-label="Free plan active"
      >
        <div className="account-mode-banner__left">
          <Zap size={14} />
          <span className="account-mode-banner__text">
            Free plan &mdash; Upgrade to Pro for more documents, storage, and features.
          </span>
        </div>
        <Link to="/settings/billing" className="account-mode-banner__cta">
          Upgrade to Pro &rarr;
        </Link>
      </div>
    )
  }

  // Unauthenticated / demo mode
  return (
    <div
      className={`account-mode-banner ${isDemo ? 'account-mode-banner--demo' : 'account-mode-banner--live'}`}
      role="status"
      aria-label={isDemo ? 'Demo mode active' : 'Live mode active'}
    >
      <div className="account-mode-banner__left">
        {isDemo ? <TestTube2 size={14} /> : <ShieldCheck size={14} />}
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
      {isDemo && (
        <Link to="/signup" className="account-mode-banner__cta">
          Register for Live Account &rarr;
        </Link>
      )}
    </div>
  )
}
