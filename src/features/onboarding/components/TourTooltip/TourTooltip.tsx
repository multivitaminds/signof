import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import './TourTooltip.css'

interface TourTooltipProps {
  title: string
  description: string
  stepIndex: number
  totalSteps: number
  placement: 'top' | 'bottom' | 'left' | 'right'
  position: { top: number; left: number }
  onNext: () => void
  onPrev: () => void
  onSkip: () => void
}

export default function TourTooltip({
  title,
  description,
  stepIndex,
  totalSteps,
  placement,
  position,
  onNext,
  onPrev,
  onSkip,
}: TourTooltipProps) {
  const isFirst = stepIndex === 0
  const isLast = stepIndex === totalSteps - 1

  return (
    <div
      className={`tour-tooltip tour-tooltip--${placement}`}
      style={{ top: position.top, left: position.left }}
      role="dialog"
      aria-label={`Tour step ${stepIndex + 1} of ${totalSteps}`}
    >
      <div className="tour-tooltip__arrow" />

      <div className="tour-tooltip__header">
        <h3 className="tour-tooltip__title">{title}</h3>
        <button
          className="tour-tooltip__close"
          onClick={onSkip}
          aria-label="Skip tour"
        >
          <X size={16} />
        </button>
      </div>

      <p className="tour-tooltip__description">{description}</p>

      <div className="tour-tooltip__footer">
        <span className="tour-tooltip__counter">
          Step {stepIndex + 1} of {totalSteps}
        </span>
        <div className="tour-tooltip__actions">
          {!isFirst && (
            <button
              className="tour-tooltip__btn tour-tooltip__btn--secondary"
              onClick={onPrev}
            >
              <ChevronLeft size={14} />
              Back
            </button>
          )}
          <button
            className="tour-tooltip__btn tour-tooltip__btn--primary"
            onClick={onNext}
          >
            {isLast ? 'Done' : 'Next'}
            {!isLast && <ChevronRight size={14} />}
          </button>
        </div>
      </div>
    </div>
  )
}
