import type { PendingApproval } from '../../types'
import './ApprovalQueue.css'

interface ApprovalQueueProps {
  approvals: PendingApproval[]
  onApprove?: (approvalId: string) => void
  onReject?: (approvalId: string) => void
}

export default function ApprovalQueue({ approvals, onApprove, onReject }: ApprovalQueueProps) {
  const sorted = [...approvals].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )

  if (sorted.length === 0) {
    return (
      <div className="approval-queue approval-queue--empty">
        <p className="approval-queue__empty-text">No pending approvals</p>
      </div>
    )
  }

  return (
    <div className="approval-queue">
      {sorted.map((item) => (
        <div key={item.id} className="approval-queue__item">
          <div className="approval-queue__item-header">
            <span className="approval-queue__agent">{item.agentId}</span>
            <span className="approval-queue__time">
              {new Date(item.createdAt).toLocaleTimeString()}
            </span>
          </div>
          <p className="approval-queue__action">{item.action}</p>
          <p className="approval-queue__desc">{item.description}</p>
          <div className="approval-queue__buttons">
            <button
              className="approval-queue__btn approval-queue__btn--approve"
              onClick={() => onApprove?.(item.id)}
            >
              Approve
            </button>
            <button
              className="approval-queue__btn approval-queue__btn--reject"
              onClick={() => onReject?.(item.id)}
            >
              Reject
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
