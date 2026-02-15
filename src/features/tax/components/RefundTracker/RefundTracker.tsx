import { TrendingUp, TrendingDown } from 'lucide-react'
import './RefundTracker.css'

interface RefundTrackerProps {
  amount: number
  isRefund: boolean
}

function RefundTracker({ amount, isRefund }: RefundTrackerProps) {
  const formattedAmount = Math.abs(amount).toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })

  return (
    <div
      className={`refund-tracker${isRefund ? ' refund-tracker--refund' : ' refund-tracker--owed'}`}
      role="status"
      aria-live="polite"
    >
      <span className="refund-tracker__icon">
        {isRefund ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
      </span>
      <span className="refund-tracker__label">
        {isRefund ? 'Estimated Refund' : 'Estimated Tax Owed'}
      </span>
      <span className="refund-tracker__amount">${formattedAmount}</span>
    </div>
  )
}

export default RefundTracker
