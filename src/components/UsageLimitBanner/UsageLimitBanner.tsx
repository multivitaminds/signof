import { Link } from 'react-router-dom'
import { AlertTriangle, XCircle } from 'lucide-react'
import './UsageLimitBanner.css'

interface UsageLimitBannerProps {
  label: string
  used: number
  limit: number
}

export default function UsageLimitBanner({ label, used, limit }: UsageLimitBannerProps) {
  if (limit >= 9999) return null

  const percent = Math.round((used / limit) * 100)

  if (percent < 80) return null

  const isBlocked = percent >= 100
  const isCritical = percent >= 90
  const level = isBlocked ? 'danger' : isCritical ? 'warning' : 'caution'

  return (
    <div
      className={`usage-limit-banner usage-limit-banner--${level}`}
      role="alert"
    >
      <div className="usage-limit-banner__content">
        {isBlocked ? <XCircle size={16} /> : <AlertTriangle size={16} />}
        <span className="usage-limit-banner__text">
          {isBlocked
            ? `${label} limit reached (${used}/${limit}). Upgrade to continue.`
            : `${label}: ${used} of ${limit} used (${percent}%).`}
        </span>
      </div>
      <Link to="/settings/billing" className="usage-limit-banner__cta">
        Upgrade Plan
      </Link>
    </div>
  )
}
