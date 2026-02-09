import { StepStatus } from '../../types'
import type { SimulationStep } from '../../types'
import { CheckCircle2, Loader2, Circle, XCircle } from 'lucide-react'
import './ProgressPanel.css'

interface ProgressPanelProps {
  steps: SimulationStep[]
}

const STATUS_ICONS = {
  [StepStatus.Completed]: <CheckCircle2 size={18} className="progress-panel__icon progress-panel__icon--completed" />,
  [StepStatus.Running]: <Loader2 size={18} className="progress-panel__icon progress-panel__icon--running" />,
  [StepStatus.Pending]: <Circle size={18} className="progress-panel__icon progress-panel__icon--pending" />,
  [StepStatus.Error]: <XCircle size={18} className="progress-panel__icon progress-panel__icon--error" />,
} as const

export default function ProgressPanel({ steps }: ProgressPanelProps) {
  return (
    <div className="progress-panel" role="list" aria-label="Simulation progress">
      {steps.map((step, index) => (
        <div
          key={step.id}
          className={`progress-panel__step progress-panel__step--${step.status}`}
          role="listitem"
        >
          {index < steps.length - 1 && <div className="progress-panel__line" />}
          <div className="progress-panel__icon-wrapper">
            {STATUS_ICONS[step.status]}
          </div>
          <div className="progress-panel__content">
            <span className="progress-panel__label">{step.label}</span>
            {step.output && step.status === StepStatus.Completed && (
              <span className="progress-panel__output">{step.output}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
