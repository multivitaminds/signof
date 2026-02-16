import { CheckCircle2, BookOpenCheck } from 'lucide-react'
import type { OnboardingData } from '../../types'

interface AccentColor {
  label: string
  value: string
}

interface OnboardingSummaryStepProps {
  data: OnboardingData
  accentColor: string
  accentColors: AccentColor[]
  onLaunchWithTour: () => void
}

export default function OnboardingSummaryStep({
  data,
  accentColor,
  accentColors,
  onLaunchWithTour,
}: OnboardingSummaryStepProps) {
  return (
    <div className="onboarding__step onboarding__step--ready" key="step-ready">
      <div className="onboarding__confetti" aria-hidden="true">
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className="onboarding__confetti-piece"
            style={{
              '--confetti-left': `${Math.random() * 100}%`,
              '--confetti-delay': `${Math.random() * 2}s`,
              '--confetti-duration': `${2 + Math.random() * 2}s`,
              '--confetti-rotation': `${Math.random() * 360}deg`,
            } as React.CSSProperties}
          />
        ))}
      </div>
      <div className="onboarding__illustration">
        <CheckCircle2 size={48} className="onboarding__step-icon onboarding__step-icon--success" />
      </div>
      <h1 className="onboarding__title">You&apos;re all set!</h1>
      <p className="onboarding__subtitle">
        Your workspace is ready. Here&apos;s a summary of your setup:
      </p>
      <div className="onboarding__summary">
        <div className="onboarding__summary-row">
          <span className="onboarding__summary-label">Workspace</span>
          <span className="onboarding__summary-value">
            {data.workspaceIcon} {data.workspaceName}
          </span>
        </div>
        <div className="onboarding__summary-row">
          <span className="onboarding__summary-label">Role</span>
          <span className="onboarding__summary-value">{data.role}</span>
        </div>
        <div className="onboarding__summary-row">
          <span className="onboarding__summary-label">Team size</span>
          <span className="onboarding__summary-value">{data.teamSize}</span>
        </div>
        <div className="onboarding__summary-row">
          <span className="onboarding__summary-label">Use cases</span>
          <span className="onboarding__summary-value">
            {data.useCases.join(', ')}
          </span>
        </div>
        {data.inviteEmails.length > 0 && (
          <div className="onboarding__summary-row">
            <span className="onboarding__summary-label">Invites</span>
            <span className="onboarding__summary-value">
              {data.inviteEmails.length} teammate{data.inviteEmails.length !== 1 ? 's' : ''}
            </span>
          </div>
        )}
        <div className="onboarding__summary-row">
          <span className="onboarding__summary-label">Theme</span>
          <span className="onboarding__summary-value onboarding__summary-value--capitalize">
            {data.theme}
          </span>
        </div>
        <div className="onboarding__summary-row">
          <span className="onboarding__summary-label">Accent</span>
          <span className="onboarding__summary-value">
            <span
              className="onboarding__summary-color-dot"
              style={{ backgroundColor: accentColor }}
            />
            {accentColors.find((c) => c.value === accentColor)?.label ?? 'Custom'}
          </span>
        </div>
      </div>
      <div className="onboarding__ready-actions">
        <button
          type="button"
          className="onboarding__tour-link"
          onClick={onLaunchWithTour}
        >
          <BookOpenCheck size={16} />
          Take a tour
        </button>
      </div>
    </div>
  )
}
