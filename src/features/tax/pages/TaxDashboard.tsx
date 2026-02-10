import { useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FileText,
  DollarSign,
  Upload,
  CalendarClock,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Play,
} from 'lucide-react'
import { useTaxStore } from '../stores/useTaxStore'
import { FILING_STATE_LABELS } from '../types'
import TaxTimeline from '../components/TaxTimeline/TaxTimeline'
import './TaxDashboard.css'

function TaxDashboard() {
  const activeTaxYear = useTaxStore((s) => s.activeTaxYear)
  const documents = useTaxStore((s) => s.documents)
  const filings = useTaxStore((s) => s.filings)
  const deadlines = useTaxStore((s) => s.deadlines)
  const toggleDeadline = useTaxStore((s) => s.toggleDeadline)
  const createFiling = useTaxStore((s) => s.createFiling)
  const navigate = useNavigate()

  const yearDocuments = useMemo(
    () => documents.filter((d) => d.taxYear === activeTaxYear),
    [documents, activeTaxYear]
  )

  const filing = useMemo(
    () => filings.find((f) => f.taxYear === activeTaxYear),
    [filings, activeTaxYear]
  )

  const yearDeadlines = useMemo(
    () => deadlines.filter((d) => d.taxYear === activeTaxYear),
    [deadlines, activeTaxYear]
  )

  const completedDeadlines = useMemo(
    () => yearDeadlines.filter((d) => d.completed).length,
    [yearDeadlines]
  )

  // Progress: count completed steps out of 4 (personal info, income, deductions, ready)
  const filingProgress = useMemo(() => {
    if (!filing) return 0
    let steps = 0
    if (filing.firstName && filing.lastName && filing.ssn) steps++
    if (filing.wages > 0 || filing.otherIncome > 0) steps++
    if (filing.effectiveDeduction > 0) steps++
    if (filing.state === 'ready_to_file' || filing.state === 'filed' || filing.state === 'accepted') steps++
    return steps
  }, [filing])

  const handleUploadClick = useCallback(() => {
    navigate('/tax/documents')
  }, [navigate])

  const handleStartFiling = useCallback(() => {
    if (!filing) {
      createFiling(activeTaxYear)
    }
    navigate('/tax/file')
  }, [filing, createFiling, activeTaxYear, navigate])

  const refundOrOwed = filing?.refundOrOwed ?? 0
  const isRefund = refundOrOwed < 0

  return (
    <div className="tax-dashboard">
      {/* Overview Cards */}
      <div className="tax-dashboard__cards">
        <div className="tax-dashboard__card">
          <div className="tax-dashboard__card-icon tax-dashboard__card-icon--primary">
            <FileText size={20} />
          </div>
          <div className="tax-dashboard__card-body">
            <span className="tax-dashboard__card-label">Filing Status</span>
            <span className="tax-dashboard__card-value">
              {filing ? FILING_STATE_LABELS[filing.state] : 'Not Started'}
            </span>
          </div>
        </div>

        <div className="tax-dashboard__card">
          <div
            className={`tax-dashboard__card-icon ${
              isRefund
                ? 'tax-dashboard__card-icon--success'
                : 'tax-dashboard__card-icon--warning'
            }`}
          >
            {isRefund ? <TrendingDown size={20} /> : <TrendingUp size={20} />}
          </div>
          <div className="tax-dashboard__card-body">
            <span className="tax-dashboard__card-label">
              {isRefund ? 'Estimated Refund' : 'Estimated Tax Owed'}
            </span>
            <span
              className={`tax-dashboard__card-value ${
                isRefund
                  ? 'tax-dashboard__card-value--success'
                  : 'tax-dashboard__card-value--warning'
              }`}
            >
              <DollarSign size={16} />
              {Math.abs(refundOrOwed).toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
        </div>

        <div className="tax-dashboard__card">
          <div className="tax-dashboard__card-icon tax-dashboard__card-icon--info">
            <Upload size={20} />
          </div>
          <div className="tax-dashboard__card-body">
            <span className="tax-dashboard__card-label">Documents Uploaded</span>
            <span className="tax-dashboard__card-value">{yearDocuments.length}</span>
          </div>
        </div>

        <div className="tax-dashboard__card">
          <div className="tax-dashboard__card-icon tax-dashboard__card-icon--muted">
            <CalendarClock size={20} />
          </div>
          <div className="tax-dashboard__card-body">
            <span className="tax-dashboard__card-label">Deadlines</span>
            <span className="tax-dashboard__card-value">
              {completedDeadlines}/{yearDeadlines.length}
            </span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="tax-dashboard__progress-section">
        <div className="tax-dashboard__progress-header">
          <h2 className="tax-dashboard__section-title">Filing Progress</h2>
          <span className="tax-dashboard__progress-label">
            {filingProgress} of 4 steps
          </span>
        </div>
        <div className="tax-dashboard__progress-bar">
          <div
            className="tax-dashboard__progress-fill"
            style={{ width: `${(filingProgress / 4) * 100}%` }}
            role="progressbar"
            aria-valuenow={filingProgress}
            aria-valuemin={0}
            aria-valuemax={4}
            aria-label="Filing progress"
          />
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="tax-dashboard__grid">
        {/* Timeline */}
        <div className="tax-dashboard__section">
          <h2 className="tax-dashboard__section-title">Upcoming Deadlines</h2>
          <TaxTimeline deadlines={yearDeadlines} onToggle={toggleDeadline} />
        </div>

        {/* Quick Actions */}
        <div className="tax-dashboard__section">
          <h2 className="tax-dashboard__section-title">Quick Actions</h2>
          <div className="tax-dashboard__actions">
            <button
              className="tax-dashboard__action-btn"
              onClick={handleUploadClick}
              type="button"
            >
              <div className="tax-dashboard__action-icon">
                <Upload size={20} />
              </div>
              <div className="tax-dashboard__action-text">
                <span className="tax-dashboard__action-title">
                  Upload Document
                </span>
                <span className="tax-dashboard__action-desc">
                  Add W-2, 1099, or other tax forms
                </span>
              </div>
              <ArrowRight size={16} className="tax-dashboard__action-arrow" />
            </button>

            <button
              className="tax-dashboard__action-btn"
              onClick={handleStartFiling}
              type="button"
            >
              <div className="tax-dashboard__action-icon tax-dashboard__action-icon--primary">
                <Play size={20} />
              </div>
              <div className="tax-dashboard__action-text">
                <span className="tax-dashboard__action-title">
                  {filing ? 'Continue Filing' : 'Start Filing'}
                </span>
                <span className="tax-dashboard__action-desc">
                  {filing
                    ? 'Pick up where you left off'
                    : `Begin your ${activeTaxYear} tax return`}
                </span>
              </div>
              <ArrowRight size={16} className="tax-dashboard__action-arrow" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TaxDashboard
