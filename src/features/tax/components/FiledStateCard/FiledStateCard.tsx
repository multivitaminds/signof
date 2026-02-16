import { FilingState } from '../../types'
import type { TaxFiling } from '../../types'

interface FiledStateCardProps {
  filing: TaxFiling
  activeTaxYear: string
  transmissionError: string | null
  onStartAmendment: () => void
}

export default function FiledStateCard({
  filing,
  activeTaxYear,
  transmissionError,
  onStartAmendment,
}: FiledStateCardProps) {
  return (
    <div className="tax-filing__filed">
      <div className="tax-filing__filed-card">
        <div
          className={`tax-filing__filed-icon ${
            filing.state === FilingState.Accepted
              ? 'tax-filing__filed-icon--success'
              : filing.state === FilingState.Rejected
                ? 'tax-filing__filed-icon--danger'
                : 'tax-filing__filed-icon--primary'
          }`}
        >
          {filing.state === FilingState.Accepted ? (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : filing.state === FilingState.Rejected ? '!' : '...'}
        </div>
        <h2 className="tax-filing__filed-title">
          {filing.state === FilingState.Accepted
            ? 'Filing Accepted!'
            : filing.state === FilingState.Rejected
              ? 'Filing Rejected'
              : 'Filing Submitted'}
        </h2>
        <p className="tax-filing__filed-desc">
          {filing.state === FilingState.Accepted
            ? `Your ${activeTaxYear} tax return has been accepted by the IRS.`
            : filing.state === FilingState.Rejected
              ? 'There was an issue with your filing. Please review and resubmit.'
              : 'Your filing is being processed. This may take a few moments.'}
        </p>
        {filing.filedAt && (
          <p className="tax-filing__filed-date">
            Filed on{' '}
            {new Date(filing.filedAt).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
            })}
          </p>
        )}
        <div className="tax-filing__filed-summary">
          <div className="tax-filing__filed-row">
            <span>Total Income</span>
            <span>${filing.totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="tax-filing__filed-row">
            <span>Federal Tax</span>
            <span>${filing.federalTax.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="tax-filing__filed-row tax-filing__filed-row--highlight">
            <span>{filing.refundOrOwed < 0 ? 'Refund' : 'Amount Owed'}</span>
            <span
              className={
                filing.refundOrOwed < 0
                  ? 'tax-filing__amount--refund'
                  : 'tax-filing__amount--owed'
              }
            >
              ${Math.abs(filing.refundOrOwed).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {transmissionError && filing.state === FilingState.Rejected && (
          <div className="tax-filing__transmission-error">
            <strong>IRS Rejection Details</strong>
            <p>{transmissionError}</p>
          </div>
        )}

        <div className="tax-filing__filed-actions">
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
