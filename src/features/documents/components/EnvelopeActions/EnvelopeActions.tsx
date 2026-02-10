import { useState, useCallback } from 'react'
import type { Document } from '../../../../types'
import { DocumentStatus } from '../../../../types'
import './EnvelopeActions.css'

interface EnvelopeActionsProps {
  document: Document
  onVoid: () => void
  onResend: () => void
  onRemind: () => void
  onDelete: () => void
}

const VOIDABLE_STATUSES: DocumentStatus[] = [
  DocumentStatus.Sent,
  DocumentStatus.Delivered,
  DocumentStatus.Viewed,
]

const RESENDABLE_STATUSES: DocumentStatus[] = [
  DocumentStatus.Sent,
  DocumentStatus.Delivered,
  DocumentStatus.Viewed,
]

type ConfirmAction = 'void' | 'delete' | null

export default function EnvelopeActions({
  document: doc,
  onVoid,
  onResend,
  onRemind,
  onDelete,
}: EnvelopeActionsProps) {
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null)

  const canVoid = VOIDABLE_STATUSES.includes(doc.status)
  const canResend = RESENDABLE_STATUSES.includes(doc.status)
  const canRemind = RESENDABLE_STATUSES.includes(doc.status)

  const handleConfirm = useCallback(() => {
    if (confirmAction === 'void') {
      onVoid()
    } else if (confirmAction === 'delete') {
      onDelete()
    }
    setConfirmAction(null)
  }, [confirmAction, onVoid, onDelete])

  const handleCancel = useCallback(() => {
    setConfirmAction(null)
  }, [])

  return (
    <div className="envelope-actions" role="group" aria-label="Envelope actions">
      {confirmAction ? (
        <div className="envelope-actions__confirm">
          <span className="envelope-actions__confirm-text">
            Are you sure you want to {confirmAction} this document?
          </span>
          <button className="btn-danger envelope-actions__btn" onClick={handleConfirm}>
            Confirm
          </button>
          <button className="btn-secondary envelope-actions__btn" onClick={handleCancel}>
            Cancel
          </button>
        </div>
      ) : (
        <>
          <button
            className="btn-danger envelope-actions__btn envelope-actions__btn--danger"
            disabled={!canVoid}
            onClick={() => setConfirmAction('void')}
          >
            Void
          </button>
          <button
            className="btn-secondary envelope-actions__btn"
            disabled={!canResend}
            onClick={onResend}
          >
            Resend
          </button>
          <button
            className="btn-secondary envelope-actions__btn"
            disabled={!canRemind}
            onClick={onRemind}
          >
            Remind
          </button>
          <button
            className="btn-danger envelope-actions__btn envelope-actions__btn--danger"
            onClick={() => setConfirmAction('delete')}
          >
            Delete
          </button>
        </>
      )}
    </div>
  )
}
