import { useCallback } from 'react'
import { ChevronLeft, ChevronRight, Send } from 'lucide-react'
import './FilingWizard.css'

interface WizardStep {
  label: string
  shortLabel?: string
}

interface FilingWizardProps {
  steps: WizardStep[]
  currentStep: number
  onStepChange: (step: number) => void
  onSubmit: () => void
  children: React.ReactNode
  canProceed?: boolean
  isSubmitting?: boolean
}

function FilingWizard({
  steps,
  currentStep,
  onStepChange,
  onSubmit,
  children,
  canProceed = true,
  isSubmitting = false,
}: FilingWizardProps) {
  const isFirstStep = currentStep === 0
  const isLastStep = currentStep === steps.length - 1

  const handleBack = useCallback(() => {
    if (currentStep > 0) {
      onStepChange(currentStep - 1)
    }
  }, [currentStep, onStepChange])

  const handleNext = useCallback(() => {
    if (currentStep < steps.length - 1) {
      onStepChange(currentStep + 1)
    }
  }, [currentStep, steps.length, onStepChange])

  const handleStepClick = useCallback(
    (index: number) => {
      // Allow navigating to any visited step (current or previous)
      if (index <= currentStep) {
        onStepChange(index)
      }
    },
    [currentStep, onStepChange]
  )

  return (
    <div className="filing-wizard">
      {/* Step Indicator */}
      <div className="filing-wizard__steps" role="tablist" aria-label="Filing steps">
        {steps.map((step, index) => {
          const isActive = index === currentStep
          const isCompleted = index < currentStep
          const isClickable = index <= currentStep

          return (
            <button
              key={index}
              className={`filing-wizard__step ${
                isActive ? 'filing-wizard__step--active' : ''
              } ${isCompleted ? 'filing-wizard__step--completed' : ''} ${
                isClickable ? 'filing-wizard__step--clickable' : ''
              }`}
              onClick={() => handleStepClick(index)}
              role="tab"
              aria-selected={isActive}
              aria-label={`Step ${index + 1}: ${step.label}`}
              disabled={!isClickable}
              type="button"
            >
              <span className="filing-wizard__step-number">
                {isCompleted ? (
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  index + 1
                )}
              </span>
              <span className="filing-wizard__step-label">
                {step.shortLabel ?? step.label}
              </span>
              {index < steps.length - 1 && (
                <div
                  className={`filing-wizard__step-connector ${
                    isCompleted ? 'filing-wizard__step-connector--completed' : ''
                  }`}
                />
              )}
            </button>
          )
        })}
      </div>

      {/* Content */}
      <div className="filing-wizard__content" role="tabpanel">
        {children}
      </div>

      {/* Navigation */}
      <div className="filing-wizard__nav">
        <button
          className="btn-secondary filing-wizard__nav-btn"
          onClick={handleBack}
          disabled={isFirstStep}
          type="button"
          aria-label="Go to previous step"
        >
          <ChevronLeft size={16} />
          <span>Back</span>
        </button>

        {isLastStep ? (
          <button
            className="btn-primary filing-wizard__nav-btn"
            onClick={onSubmit}
            disabled={!canProceed || isSubmitting}
            type="button"
            aria-label="Submit filing"
          >
            <Send size={16} />
            <span>{isSubmitting ? 'Submitting...' : 'Submit Filing'}</span>
          </button>
        ) : (
          <button
            className="btn-primary filing-wizard__nav-btn"
            onClick={handleNext}
            disabled={!canProceed}
            type="button"
            aria-label="Go to next step"
          >
            <span>Next</span>
            <ChevronRight size={16} />
          </button>
        )}
      </div>
    </div>
  )
}

export default FilingWizard
