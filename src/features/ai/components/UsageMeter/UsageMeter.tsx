import { TOKEN_BUDGET, formatTokenCount } from '../../lib/tokenCount'
import './UsageMeter.css'

interface UsageMeterProps {
  usedTokens: number
  budget?: number
}

export default function UsageMeter({ usedTokens, budget = TOKEN_BUDGET }: UsageMeterProps) {
  const percentage = Math.min((usedTokens / budget) * 100, 100)
  const variant = percentage >= 80 ? 'danger' : percentage >= 50 ? 'warning' : 'success'

  return (
    <div className="usage-meter">
      <div className="usage-meter__header">
        <span className="usage-meter__label">Context Memory</span>
        <span className="usage-meter__count">
          {formatTokenCount(usedTokens)} / {formatTokenCount(budget)} tokens
        </span>
      </div>
      <div className="usage-meter__track">
        <div
          className={`usage-meter__fill usage-meter__fill--${variant}`}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={usedTokens}
          aria-valuemin={0}
          aria-valuemax={budget}
          aria-label={`${formatTokenCount(usedTokens)} of ${formatTokenCount(budget)} tokens used`}
        />
      </div>
    </div>
  )
}
