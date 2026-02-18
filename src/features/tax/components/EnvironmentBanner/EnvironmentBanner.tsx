import { useCallback } from 'react'
import { AlertTriangle, ShieldCheck, ToggleLeft, ToggleRight } from 'lucide-react'
import './EnvironmentBanner.css'

interface EnvironmentBannerProps {
  environment: 'sandbox' | 'production'
  onToggle: () => void
}

function EnvironmentBanner({ environment, onToggle }: EnvironmentBannerProps) {
  const handleToggle = useCallback(() => {
    onToggle()
  }, [onToggle])

  const isSandbox = environment === 'sandbox'

  return (
    <div
      className={`environment-banner${isSandbox ? ' environment-banner--sandbox' : ' environment-banner--production'}`}
      role="status"
    >
      <span className="environment-banner__icon">
        {isSandbox ? <AlertTriangle size={16} /> : <ShieldCheck size={16} />}
      </span>
      <span className="environment-banner__text">
        {isSandbox
          ? 'Demo Mode \u2014 filings go to a sandbox environment, NOT the IRS'
          : 'Live Account \u2014 filings will be submitted to the IRS'}
      </span>
      <button
        type="button"
        className="environment-banner__toggle"
        onClick={handleToggle}
        aria-label={`Switch to ${isSandbox ? 'production' : 'sandbox'} mode`}
      >
        {isSandbox ? <ToggleLeft size={20} /> : <ToggleRight size={20} />}
        <span>{isSandbox ? 'Go Live' : 'Switch to Demo'}</span>
      </button>
    </div>
  )
}

export default EnvironmentBanner
