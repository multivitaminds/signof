import { FILING_STATE_LABELS } from '../../types'
import type { TaxFiling } from '../../types'
import type { FilingConfirmation as FilingConfirmationType } from '../../stores/useTaxFilingStore'

interface FilingConfirmationProps {
  filing: TaxFiling
  confirmation: FilingConfirmationType
  activeTaxYear: string
  submissionId: string | null
  returnPdfUrl: string | null
  isConnected: boolean
  onDownloadPdf: () => void
  onStartAmendment: () => void
}

export default function FilingConfirmation({
  filing,
  confirmation,
  activeTaxYear,
  submissionId,
  returnPdfUrl,
  isConnected,
  onDownloadPdf,
  onStartAmendment,
}: FilingConfirmationProps) {
  return (
    <div className="tax-filing__confirmation">
      <div className="tax-filing__confirmation-card">
        <div className="tax-filing__confirmation-icon tax-filing__confirmation-icon--success">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        <h2 className="tax-filing__confirmation-title">
          {confirmation.isAmendment ? 'Amendment Filed!' : 'Filing Submitted!'}
        </h2>
        <p className="tax-filing__confirmation-desc">
          {confirmation.isAmendment
            ? `Your amended ${activeTaxYear} tax return has been submitted for processing.`
            : `Your ${activeTaxYear} tax return has been submitted to the IRS.`}
        </p>

        <div className="tax-filing__confirmation-ref">
          <span className="tax-filing__confirmation-ref-label">Reference Number</span>
          <span className="tax-filing__confirmation-ref-value">{confirmation.referenceNumber}</span>
        </div>

        {submissionId && (
          <div className="tax-filing__confirmation-ref">
            <span className="tax-filing__confirmation-ref-label">TaxBandit Submission ID</span>
            <span className="tax-filing__confirmation-ref-value">{submissionId}</span>
          </div>
        )}

        <div className="tax-filing__confirmation-details">
          <div className="tax-filing__confirmation-row">
            <span>Filed At</span>
            <span>
              {new Date(confirmation.filedAt).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
              })}
            </span>
          </div>
          <div className="tax-filing__confirmation-row">
            <span>Filing Status</span>
            <span className="tax-filing__confirmation-status">
              {FILING_STATE_LABELS[filing.state]}
            </span>
          </div>
          {confirmation.isAmendment && (
            <div className="tax-filing__confirmation-row">
              <span>Amendment Reason</span>
              <span>{confirmation.amendmentReason}</span>
            </div>
          )}
          <div className="tax-filing__confirmation-row tax-filing__confirmation-row--highlight">
            <span>{confirmation.estimatedRefund !== null ? 'Estimated Refund' : 'Estimated Tax Owed'}</span>
            <span
              className={
                confirmation.estimatedRefund !== null
                  ? 'tax-filing__amount--refund'
                  : 'tax-filing__amount--owed'
              }
            >
              ${(confirmation.estimatedRefund ?? confirmation.estimatedOwed ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        <div className="tax-filing__confirmation-actions">
          {isConnected && !returnPdfUrl && (
            <button
              className="btn-primary"
              onClick={onDownloadPdf}
              type="button"
            >
              Download Return PDF
            </button>
          )}
          {returnPdfUrl && (
            <a
              href={returnPdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
            >
              View Return PDF
            </a>
          )}
          <button
            className="btn-secondary"
            onClick={onStartAmendment}
            type="button"
          >
            File Amendment (1040-X)
          </button>
        </div>
      </div>
    </div>
  )
}
