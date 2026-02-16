import { Check, Sun, Moon, Monitor, Palette } from 'lucide-react'
import type { OnboardingData } from '../../types'

interface AccentColor {
  label: string
  value: string
}

interface OnboardingAppearanceStepProps {
  theme: OnboardingData['theme']
  accentColor: string
  accentColors: AccentColor[]
  onThemeChange: (theme: OnboardingData['theme']) => void
  onAccentChange: (color: string) => void
}

export default function OnboardingAppearanceStep({
  theme,
  accentColor,
  accentColors,
  onThemeChange,
  onAccentChange,
}: OnboardingAppearanceStepProps) {
  return (
    <div className="onboarding__step" key="step-appearance">
      <div className="onboarding__illustration">
        <Palette size={48} className="onboarding__step-icon" />
      </div>
      <h1 className="onboarding__title">Choose your look</h1>
      <p className="onboarding__subtitle">
        Pick a theme and accent color. You can change these anytime.
      </p>
      <div className="onboarding__theme-grid">
        <button
          type="button"
          className={`onboarding__theme-card ${theme === 'light' ? 'onboarding__theme-card--selected' : ''}`}
          onClick={() => onThemeChange('light')}
        >
          <div className="onboarding__theme-preview onboarding__theme-preview--light">
            <div className="onboarding__theme-sidebar" />
            <div className="onboarding__theme-content">
              <div className="onboarding__theme-bar" />
              <div className="onboarding__theme-lines">
                <div className="onboarding__theme-line" />
                <div className="onboarding__theme-line onboarding__theme-line--short" />
                <div className="onboarding__theme-line" />
              </div>
            </div>
          </div>
          <Sun size={16} />
          <span>Light</span>
          {theme === 'light' && <Check size={14} className="onboarding__theme-check" />}
        </button>

        <button
          type="button"
          className={`onboarding__theme-card ${theme === 'dark' ? 'onboarding__theme-card--selected' : ''}`}
          onClick={() => onThemeChange('dark')}
        >
          <div className="onboarding__theme-preview onboarding__theme-preview--dark">
            <div className="onboarding__theme-sidebar" />
            <div className="onboarding__theme-content">
              <div className="onboarding__theme-bar" />
              <div className="onboarding__theme-lines">
                <div className="onboarding__theme-line" />
                <div className="onboarding__theme-line onboarding__theme-line--short" />
                <div className="onboarding__theme-line" />
              </div>
            </div>
          </div>
          <Moon size={16} />
          <span>Dark</span>
          {theme === 'dark' && <Check size={14} className="onboarding__theme-check" />}
        </button>

        <button
          type="button"
          className={`onboarding__theme-card ${theme === 'system' ? 'onboarding__theme-card--selected' : ''}`}
          onClick={() => onThemeChange('system')}
        >
          <div className="onboarding__theme-preview onboarding__theme-preview--system">
            <div className="onboarding__theme-sidebar" />
            <div className="onboarding__theme-content">
              <div className="onboarding__theme-bar" />
              <div className="onboarding__theme-lines">
                <div className="onboarding__theme-line" />
                <div className="onboarding__theme-line onboarding__theme-line--short" />
                <div className="onboarding__theme-line" />
              </div>
            </div>
          </div>
          <Monitor size={16} />
          <span>System</span>
          {theme === 'system' && <Check size={14} className="onboarding__theme-check" />}
        </button>
      </div>

      {/* Accent color picker */}
      <div className="onboarding__field" style={{ marginTop: 'var(--space-4, 1rem)' }}>
        <label className="onboarding__label">Accent color</label>
        <div className="onboarding__accent-grid">
          {accentColors.map((color) => (
            <button
              key={color.value}
              type="button"
              className={`onboarding__accent-option ${accentColor === color.value ? 'onboarding__accent-option--selected' : ''}`}
              onClick={() => onAccentChange(color.value)}
              aria-label={`Select ${color.label} accent color`}
              style={{ '--accent-swatch': color.value } as React.CSSProperties}
            >
              <span className="onboarding__accent-swatch" />
              <span className="onboarding__accent-label">{color.label}</span>
              {accentColor === color.value && (
                <Check size={12} className="onboarding__accent-check" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
