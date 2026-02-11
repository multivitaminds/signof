import { type Document, ACTIVE_STATUSES, DocumentStatus, SignerStatus, STATUS_LABELS } from '../../types'
import StatusProgress from '../StatusProgress/StatusProgress'
import './DocumentList.css'

interface DocumentListProps {
  documents: Document[]
  onSign: (docId: string) => void
  onDelete: (docId: string) => void
  onView: (docId: string) => void
  onSend?: (docId: string) => void
  onCertificate?: (docId: string) => void
  onViewAudit?: (docId: string) => void
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function getSignerStatusIcon(status: SignerStatus): string {
  switch (status) {
    case SignerStatus.Signed:
      return '\u2713'
    case SignerStatus.Declined:
      return '\u2717'
    case SignerStatus.Pending:
      return '\u25CB'
  }
}

function isActiveStatus(status: DocumentStatus): boolean {
  return (ACTIVE_STATUSES as string[]).includes(status)
}

function DocumentList({ documents, onSign, onDelete, onView, onSend, onCertificate, onViewAudit }: DocumentListProps) {
  if (documents.length === 0) {
    return (
      <div className="document-list__empty">
        <p>No documents yet. Upload one to get started.</p>
      </div>
    )
  }

  const sorted = [...documents].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  return (
    <div className="document-list" role="list" aria-label="Documents">
      {sorted.map((doc) => (
        <article className="document-card" key={doc.id} role="listitem">
          <div className="document-card__header">
            <h3 className="document-card__name" title={doc.name}>
              {doc.name}
            </h3>
            <span className={`status-badge status-${doc.status}`}>
              {STATUS_LABELS[doc.status]}
            </span>
          </div>

          <p className="document-card__date">{formatDate(doc.createdAt)}</p>

          <StatusProgress currentStatus={doc.status} />

          {doc.signers.length > 0 && (
            <ul className="document-card__signers">
              {doc.signers.map((signer) => (
                <li key={signer.id} className={`document-card__signer document-card__signer--${signer.status}`}>
                  <span className="document-card__signer-icon" aria-hidden="true">
                    {getSignerStatusIcon(signer.status)}
                  </span>
                  <span className="document-card__signer-name">{signer.name}</span>
                </li>
              ))}
            </ul>
          )}

          <div className="document-card__actions">
            {doc.status === DocumentStatus.Draft && doc.signers.length > 0 && onSend && (
              <button
                className="document-card__btn document-card__btn--send"
                onClick={() => onSend(doc.id)}
              >
                Send
              </button>
            )}
            {isActiveStatus(doc.status) && (
              <button
                className="document-card__btn document-card__btn--sign"
                onClick={() => onSign(doc.id)}
              >
                Sign
              </button>
            )}
            {doc.status === DocumentStatus.Completed && onCertificate && (
              <button
                className="document-card__btn document-card__btn--certificate"
                onClick={() => onCertificate(doc.id)}
              >
                Certificate
              </button>
            )}
            {doc.status !== DocumentStatus.Draft && onViewAudit && (
              <button
                className="document-card__btn document-card__btn--audit"
                onClick={() => onViewAudit(doc.id)}
              >
                Audit
              </button>
            )}
            <button
              className="document-card__btn document-card__btn--view"
              onClick={() => onView(doc.id)}
            >
              View
            </button>
            <button
              className="document-card__btn document-card__btn--delete"
              onClick={() => onDelete(doc.id)}
            >
              Delete
            </button>
          </div>
        </article>
      ))}
    </div>
  )
}

export default DocumentList
