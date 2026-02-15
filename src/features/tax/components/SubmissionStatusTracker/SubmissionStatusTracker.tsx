import {
  CheckCircle,
  Circle,
  XCircle,
  FileText,
  Download,
  Loader,
} from 'lucide-react'
import type { TaxBanditSubmission } from '../../types'
import { FilingState, TAX_FORM_LABELS } from '../../types'
import './SubmissionStatusTracker.css'

interface SubmissionStatusTrackerProps {
  submission: TaxBanditSubmission
}

interface Step {
  id: string
  label: string
  filingState: FilingState
}

const STEPS: Step[] = [
  { id: 'created', label: 'Created', filingState: FilingState.NotStarted },
  { id: 'validated', label: 'Validated', filingState: FilingState.Review },
  { id: 'transmitted', label: 'Transmitted', filingState: FilingState.Filed },
  { id: 'pending', label: 'Pending', filingState: FilingState.InProgress },
  { id: 'accepted', label: 'Accepted', filingState: FilingState.Accepted },
]

const STATE_ORDER: Record<string, number> = {
  [FilingState.NotStarted]: 0,
  [FilingState.InProgress]: 1,
  [FilingState.Review]: 2,
  [FilingState.ReadyToFile]: 2,
  [FilingState.Filed]: 3,
  [FilingState.Accepted]: 4,
  [FilingState.Rejected]: 4,
}

function SubmissionStatusTracker({ submission }: SubmissionStatusTrackerProps) {
  const currentOrder = STATE_ORDER[submission.state] ?? 0
  const isRejected = submission.state === FilingState.Rejected

  const getStepStatus = (stepIndex: number): 'complete' | 'active' | 'rejected' | 'future' => {
    if (isRejected && stepIndex === STEPS.length - 1) return 'rejected'
    if (stepIndex < currentOrder) return 'complete'
    if (stepIndex === currentOrder) return 'active'
    return 'future'
  }

  return (
    <div className="submission-tracker">
      {/* Header */}
      <div className="submission-tracker__header">
        <div className="submission-tracker__info">
          <span className="submission-tracker__form-badge">
            <FileText size={14} />
            <span>{TAX_FORM_LABELS[submission.formType]}</span>
          </span>
          <span className="submission-tracker__year">Tax Year {submission.taxYear}</span>
        </div>
        {submission.pdfUrl && (
          <a
            href={submission.pdfUrl}
            className="submission-tracker__download"
            download
            aria-label="Download PDF"
          >
            <Download size={14} />
            <span>Download PDF</span>
          </a>
        )}
      </div>

      {/* Timeline */}
      <div className="submission-tracker__timeline" role="list" aria-label="Submission status">
        {STEPS.map((step, index) => {
          const status = getStepStatus(index)
          const isLast = index === STEPS.length - 1
          const label = isRejected && isLast ? 'Rejected' : step.label

          return (
            <div
              key={step.id}
              className={`submission-tracker__step submission-tracker__step--${status}`}
              role="listitem"
              aria-current={status === 'active' ? 'step' : undefined}
            >
              <span className="submission-tracker__step-icon">
                {status === 'complete' && <CheckCircle size={20} />}
                {status === 'active' && <Loader size={20} className="submission-tracker__pulse" />}
                {status === 'rejected' && <XCircle size={20} />}
                {status === 'future' && <Circle size={20} />}
              </span>
              <span className="submission-tracker__step-label">{label}</span>
              {!isLast && (
                <span
                  className={`submission-tracker__connector${status === 'complete' ? ' submission-tracker__connector--done' : ''}`}
                />
              )}
            </div>
          )
        })}
      </div>

      {/* Error Info */}
      {isRejected && submission.irsErrors.length > 0 && (
        <div className="submission-tracker__errors">
          {submission.irsErrors.map((err, i) => (
            <div key={i} className="submission-tracker__error">
              <XCircle size={14} />
              <span>
                <strong>{err.code}:</strong> {err.message}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default SubmissionStatusTracker
