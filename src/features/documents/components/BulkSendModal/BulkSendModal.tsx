import { useState, useCallback } from 'react'
import { X, Send, Plus, Trash2, Users, FileText } from 'lucide-react'
import type { Document } from '../../../../types'
import './BulkSendModal.css'

// ─── Types ────────────────────────────────────────────────────────────

interface Recipient {
  id: string
  name: string
  email: string
}

interface BulkSendModalProps {
  document: Document
  onSend: (recipients: { name: string; email: string }[]) => void
  onCancel: () => void
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

// ─── Component ────────────────────────────────────────────────────────

function BulkSendModal({ document: doc, onSend, onCancel }: BulkSendModalProps) {
  const [recipients, setRecipients] = useState<Recipient[]>([
    { id: generateId(), name: '', email: '' },
  ])
  const [error, setError] = useState('')

  // ── Handlers ────────────────────────────────────────────────────
  const handleAddRecipient = useCallback(() => {
    setRecipients((prev) => [...prev, { id: generateId(), name: '', email: '' }])
    setError('')
  }, [])

  const handleRemoveRecipient = useCallback((recipientId: string) => {
    setRecipients((prev) => prev.filter((r) => r.id !== recipientId))
  }, [])

  const handleUpdateRecipient = useCallback(
    (recipientId: string, field: 'name' | 'email', value: string) => {
      setRecipients((prev) =>
        prev.map((r) =>
          r.id === recipientId ? { ...r, [field]: value } : r
        )
      )
      setError('')
    },
    []
  )

  const handleSendAll = useCallback(() => {
    // Validate all recipients
    const validRecipients = recipients.filter(
      (r) => r.name.trim() !== '' && r.email.trim() !== ''
    )

    if (validRecipients.length === 0) {
      setError('Please add at least one recipient with name and email.')
      return
    }

    // Validate email format
    const invalidEmails = validRecipients.filter(
      (r) => !r.email.includes('@')
    )
    if (invalidEmails.length > 0) {
      setError('Please enter valid email addresses for all recipients.')
      return
    }

    onSend(
      validRecipients.map((r) => ({
        name: r.name.trim(),
        email: r.email.trim(),
      }))
    )
  }, [recipients, onSend])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel()
      }
    },
    [onCancel]
  )

  const validCount = recipients.filter(
    (r) => r.name.trim() !== '' && r.email.trim() !== '' && r.email.includes('@')
  ).length

  // ── Render ──────────────────────────────────────────────────────
  return (
    <div
      className="bulk-send-modal"
      role="dialog"
      aria-modal="true"
      aria-label="Bulk send document"
      onKeyDown={handleKeyDown}
    >
      <div className="bulk-send-modal__overlay" onClick={onCancel} />
      <div className="bulk-send-modal__content">
        {/* Header */}
        <div className="bulk-send-modal__header">
          <div className="bulk-send-modal__header-left">
            <Send className="bulk-send-modal__header-icon" />
            <div>
              <h2 className="bulk-send-modal__title">Bulk Send</h2>
              <p className="bulk-send-modal__subtitle">
                Send this document to multiple recipients at once
              </p>
            </div>
          </div>
          <button
            type="button"
            className="bulk-send-modal__close-btn"
            onClick={onCancel}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Document Info */}
        <div className="bulk-send-modal__doc-info">
          <FileText className="bulk-send-modal__doc-icon" />
          <span className="bulk-send-modal__doc-name">{doc.name}</span>
        </div>

        {/* Recipients List */}
        <div className="bulk-send-modal__recipients">
          <div className="bulk-send-modal__recipients-header">
            <h3 className="bulk-send-modal__recipients-title">
              <Users size={16} /> Recipients
            </h3>
            <span className="bulk-send-modal__count">
              {recipients.length} added
            </span>
          </div>

          <div className="bulk-send-modal__recipients-list">
            {recipients.map((recipient, index) => (
              <div key={recipient.id} className="bulk-send-modal__recipient-row">
                <span className="bulk-send-modal__recipient-number">
                  {index + 1}
                </span>
                <input
                  type="text"
                  className="bulk-send-modal__input"
                  value={recipient.name}
                  onChange={(e) =>
                    handleUpdateRecipient(recipient.id, 'name', e.target.value)
                  }
                  placeholder="Full name"
                  aria-label={`Recipient ${index + 1} name`}
                />
                <input
                  type="email"
                  className="bulk-send-modal__input"
                  value={recipient.email}
                  onChange={(e) =>
                    handleUpdateRecipient(recipient.id, 'email', e.target.value)
                  }
                  placeholder="email@example.com"
                  aria-label={`Recipient ${index + 1} email`}
                />
                <button
                  type="button"
                  className="bulk-send-modal__remove-btn"
                  onClick={() => handleRemoveRecipient(recipient.id)}
                  disabled={recipients.length <= 1}
                  aria-label={`Remove recipient ${index + 1}`}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            className="bulk-send-modal__add-btn"
            onClick={handleAddRecipient}
          >
            <Plus size={16} /> Add Recipient
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="bulk-send-modal__error" role="alert">
            {error}
          </div>
        )}

        {/* Footer */}
        <div className="bulk-send-modal__footer">
          <span className="bulk-send-modal__preview-count">
            Will send to {validCount} {validCount === 1 ? 'recipient' : 'recipients'}
          </span>
          <div className="bulk-send-modal__footer-actions">
            <button
              type="button"
              className="bulk-send-modal__cancel-btn"
              onClick={onCancel}
            >
              Cancel
            </button>
            <button
              type="button"
              className="bulk-send-modal__send-btn"
              onClick={handleSendAll}
              disabled={validCount === 0}
            >
              <Send size={16} /> Send All
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BulkSendModal
