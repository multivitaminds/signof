import type { DocumentStatus } from '../../types'
import './StatusProgress.css'

interface StatusProgressProps {
  currentStatus: DocumentStatus
}

const FLOW_STEPS = ['draft', 'sent', 'delivered', 'viewed', 'signed', 'completed'] as const

const STEP_LABELS: Record<string, string> = {
  draft: 'Draft',
  sent: 'Sent',
  delivered: 'Delivered',
  viewed: 'Viewed',
  signed: 'Signed',
  completed: 'Completed',
}

function StatusProgress({ currentStatus }: StatusProgressProps) {
  const isDeclinedOrVoided = currentStatus === 'declined' || currentStatus === 'voided'
  const currentIndex = FLOW_STEPS.indexOf(currentStatus as typeof FLOW_STEPS[number])

  // For declined/voided, treat as stopped at the beginning
  const activeIndex = isDeclinedOrVoided ? -1 : currentIndex

  return (
    <div className="status-progress" role="group" aria-label="Document status progress">
      {FLOW_STEPS.map((step, index) => {
        let state: 'completed' | 'active' | 'future' | 'declined'

        if (isDeclinedOrVoided) {
          state = 'declined'
        } else if (index < activeIndex) {
          state = 'completed'
        } else if (index === activeIndex) {
          state = 'active'
        } else {
          state = 'future'
        }

        return (
          <div className="status-progress__step" key={step}>
            {index > 0 && (
              <div
                className={`status-progress__line ${
                  !isDeclinedOrVoided && index <= activeIndex
                    ? 'status-progress__line--completed'
                    : ''
                }`}
                aria-hidden="true"
              />
            )}
            <div
              className={`status-progress__circle status-progress__circle--${state}`}
              aria-label={`${STEP_LABELS[step]}: ${state}`}
            >
              {state === 'completed' && (
                <span aria-hidden="true">{'\u2713'}</span>
              )}
              {state === 'declined' && (
                <span aria-hidden="true">{'\u2717'}</span>
              )}
            </div>
            <span className="status-progress__label">{STEP_LABELS[step]}</span>
          </div>
        )
      })}
    </div>
  )
}

export default StatusProgress
