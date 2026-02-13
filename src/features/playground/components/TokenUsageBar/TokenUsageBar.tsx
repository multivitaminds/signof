import { formatTokenCount } from '../../lib/models'
import './TokenUsageBar.css'

interface TokenUsageBarProps {
  used: number
  total: number
}

function TokenUsageBar({ used, total }: TokenUsageBarProps) {
  const percentage = total > 0 ? Math.min(100, (used / total) * 100) : 0
  const colorClass = percentage > 80 ? 'token-usage-bar__fill--high'
    : percentage > 50 ? 'token-usage-bar__fill--medium'
    : 'token-usage-bar__fill--low'

  return (
    <div className="token-usage-bar">
      <div className="token-usage-bar__track">
        <div
          className={`token-usage-bar__fill ${colorClass}`}
          style={{ width: `${percentage}%` }}
          data-testid="token-bar-fill"
        />
      </div>
      <span className="token-usage-bar__label">
        {formatTokenCount(used)} / {formatTokenCount(total)} tokens
      </span>
    </div>
  )
}

export default TokenUsageBar
