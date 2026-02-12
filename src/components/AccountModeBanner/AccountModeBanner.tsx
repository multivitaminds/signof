import { useCallback } from 'react'
import { Link } from 'react-router-dom'
import { TestTube2, ShieldCheck } from 'lucide-react'
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
