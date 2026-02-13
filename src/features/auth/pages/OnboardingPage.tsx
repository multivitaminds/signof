import { useState, useCallback, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/useAuthStore'
import { useOnboardingStore } from '../stores/useOnboardingStore'
import { useAppearanceStore } from '../../settings/stores/useAppearanceStore'
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Users,
  Building2,
  Palette,
  Layers,
  CheckCircle2,
  Mail,
  X,
  Rocket,
  UserCircle,
  Briefcase,
  PenTool,
  BarChart3,
  Settings,
  Megaphone,
  Scale,
  Heart,
  DollarSign,
  FileSignature,
  FolderKanban,
  BookOpen,
  CalendarDays,
  Database,
  Workflow,
  FileText,
  Code,
  Sun,
  Moon,
  Monitor,
  BookOpenCheck,
} from 'lucide-react'
import type { OnboardingData } from '../types'
import { clearAllSampleData } from '../../../lib/clearSampleData'
import './OnboardingPage.css'

const WORKSPACE_ICONS = [
  '\u{1F680}', '\u{1F4BC}', '\u{2B50}', '\u{1F3AF}',
  '\u{1F4A1}', '\u{26A1}', '\u{1F525}', '\u{1F48E}',
  '\u{1F30D}', '\u{1F3E2}', '\u{1F6E0}\u{FE0F}', '\u{1F3A8}',
]

const ROLES = [
  { label: 'Founder / CEO', icon: Rocket },
  { label: 'Engineering', icon: Code },
  { label: 'Design', icon: PenTool },
  { label: 'Product', icon: BarChart3 },
  { label: 'Operations', icon: Settings },
  { label: 'Sales', icon: Briefcase },
  { label: 'Legal', icon: Scale },
  { label: 'HR', icon: Heart },
  { label: 'Marketing', icon: Megaphone },
  { label: 'Finance', icon: DollarSign },
]

const TEAM_SIZES = [
  { label: 'Just me', description: 'Solo workspace' },
  { label: '2-5', description: 'Small team' },
  { label: '6-20', description: 'Growing team' },
  { label: '21-50', description: 'Mid-size org' },
  { label: '51-200', description: 'Large org' },
  { label: '200+', description: 'Enterprise' },
]

const USE_CASES = [
  { label: 'Document Signing', icon: FileSignature },
  { label: 'Project Management', icon: FolderKanban },
  { label: 'Knowledge Base', icon: BookOpen },
  { label: 'Scheduling', icon: CalendarDays },
  { label: 'Database/CRM', icon: Database },
  { label: 'Team Collaboration', icon: Users },
  { label: 'Client Portal', icon: FileText },
  { label: 'Automations', icon: Workflow },
]

const ACCENT_COLORS = [
  { label: 'Indigo', value: '#4F46E5' },
  { label: 'Blue', value: '#2563EB' },
  { label: 'Emerald', value: '#059669' },
  { label: 'Rose', value: '#E11D48' },
  { label: 'Amber', value: '#D97706' },
  { label: 'Purple', value: '#7C3AED' },
]

const TOTAL_STEPS = 8

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export default function OnboardingPage() {
  const navigate = useNavigate()
  const completeOnboarding = useAuthStore((s) => s.completeOnboarding)
  const completeRegistration = useAuthStore((s) => s.completeRegistration)
  const user = useAuthStore((s) => s.user)
  const onboardingStore = useOnboardingStore()

  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward')
  const [animating, setAnimating] = useState(false)
  const [emailInput, setEmailInput] = useState('')
  const [emailError, setEmailError] = useState('')
  const stepRef = useRef<HTMLDivElement>(null)

  const [data, setData] = useState<OnboardingData>({
    displayName: user?.name ?? '',
    workspaceName: '',
    workspaceSlug: '',
    workspaceIcon: '\u{1F680}',
    role: '',
    teamSize: '',
    useCases: [],
    inviteEmails: [],
    theme: 'system',
  })

  const [accentColor, setAccentColor] = useState('#4F46E5')

  const progressPercent = ((step + 1) / TOTAL_STEPS) * 100

  const updateField = useCallback(<K extends keyof OnboardingData>(key: K, value: OnboardingData[K]) => {
    setData((prev) => ({ ...prev, [key]: value }))
  }, [])

  const handleWorkspaceNameChange = useCallback((name: string) => {
    setData((prev) => ({
      ...prev,
      workspaceName: name,
      workspaceSlug: slugify(name),
    }))
  }, [])

  const toggleUseCase = useCallback((useCase: string) => {
    setData((prev) => {
      const exists = prev.useCases.includes(useCase)
      return {
        ...prev,
        useCases: exists
          ? prev.useCases.filter((u) => u !== useCase)
          : [...prev.useCases, useCase],
      }
    })
  }, [])

  const addEmail = useCallback(() => {
    const trimmed = emailInput.trim()
    if (!trimmed) return
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(trimmed)) {
      setEmailError('Please enter a valid email address')
      return
    }
    if (data.inviteEmails.includes(trimmed)) {
      setEmailError('This email has already been added')
      return
    }
    setData((prev) => ({
      ...prev,
      inviteEmails: [...prev.inviteEmails, trimmed],
    }))
    setEmailInput('')
    setEmailError('')
  }, [emailInput, data.inviteEmails])

  const removeEmail = useCallback((email: string) => {
    setData((prev) => ({
      ...prev,
      inviteEmails: prev.inviteEmails.filter((e) => e !== email),
    }))
  }, [])

  const canProceed = (): boolean => {
    switch (step) {
      case 0: return data.displayName.trim().length > 0
      case 1: return data.workspaceName.trim().length > 0
      case 2: return data.role.length > 0
      case 3: return data.teamSize.length > 0
      case 4: return data.useCases.length > 0
      case 5: return true // skip allowed
      case 6: return true // skip allowed
      case 7: return true
      default: return false
    }
  }

  const isOptionalStep = step === 5 || step === 6

  const goToStep = useCallback((targetStep: number, dir: 'forward' | 'backward') => {
    if (animating) return
    setDirection(dir)
    setAnimating(true)
    setTimeout(() => {
      setStep(targetStep)
      setAnimating(false)
    }, 300)
  }, [animating])

  const syncToStore = useCallback(() => {
    onboardingStore.setWorkspace(data.workspaceName, data.workspaceIcon)
    onboardingStore.setRole(data.role)
    onboardingStore.setTeamSize(data.teamSize)
    onboardingStore.setUseCases(data.useCases)
    onboardingStore.setTheme(data.theme)
    onboardingStore.setAccentColor(accentColor)
    for (const email of data.inviteEmails) {
      onboardingStore.addInviteEmail(email)
    }
    onboardingStore.completeOnboarding()

    // Sync theme choices to the appearance store (single source of truth)
    useAppearanceStore.getState().setTheme(data.theme)
    useAppearanceStore.getState().setAccentColor(accentColor)
  }, [data, accentColor, onboardingStore])

  const handleNext = useCallback(() => {
    if (step < TOTAL_STEPS - 1) {
      goToStep(step + 1, 'forward')
    } else {
      syncToStore()
      clearAllSampleData()
      completeOnboarding(data)
      completeRegistration()
      navigate('/')
    }
  }, [step, data, completeOnboarding, completeRegistration, navigate, goToStep, syncToStore])

  const handleBack = useCallback(() => {
    if (step > 0) {
      goToStep(step - 1, 'backward')
    }
  }, [step, goToStep])

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      // Don't trigger on email input enter (handled separately)
      const target = e.target as HTMLElement
      if (target.classList.contains('onboarding__email-input')) return
      if (canProceed()) {
        e.preventDefault()
        handleNext()
      }
    }
    if (e.key === 'Escape' && step > 0) {
      e.preventDefault()
      handleBack()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, handleNext, handleBack])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  const handleEmailKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addEmail()
    }
  }, [addEmail])

  const getSlideClass = (): string => {
    if (!animating) return 'onboarding__step-content--active'
    return direction === 'forward'
      ? 'onboarding__step-content--exit-left'
      : 'onboarding__step-content--exit-right'
  }

  const renderStepContent = () => {
    switch (step) {
      case 0:
        return (
          <div className="onboarding__step" key="step-welcome">
            <div className="onboarding__illustration">
              <div className="onboarding__logo-animated">
                <span className="onboarding__logo-s">S</span>
                <span className="onboarding__logo-rest">ignOf</span>
              </div>
            </div>
            <h1 className="onboarding__title">
              Welcome to Orchestree{data.displayName ? `, ${data.displayName.split(' ')[0]}` : ''}
            </h1>
            <p className="onboarding__subtitle">
              The everything platform for your team. Let&apos;s set up your workspace in under a minute.
            </p>
            <div className="onboarding__field">
              <label className="onboarding__label" htmlFor="display-name">
                What should we call you?
              </label>
              <input
                id="display-name"
                className="onboarding__input"
                type="text"
                value={data.displayName}
                onChange={(e) => updateField('displayName', e.target.value)}
                placeholder="Your name"
                autoFocus
                autoComplete="name"
              />
            </div>
          </div>
        )

      case 1:
        return (
          <div className="onboarding__step" key="step-workspace">
            <div className="onboarding__illustration">
              <Building2 size={48} className="onboarding__step-icon" />
            </div>
            <h1 className="onboarding__title">Name your workspace</h1>
            <p className="onboarding__subtitle">
              This is your team&apos;s shared space for everything.
            </p>
            <div className="onboarding__field">
              <label className="onboarding__label" htmlFor="workspace-name">
                Workspace name
              </label>
              <input
                id="workspace-name"
                className="onboarding__input"
                type="text"
                value={data.workspaceName}
                onChange={(e) => handleWorkspaceNameChange(e.target.value)}
                placeholder="Acme Inc."
                autoFocus
              />
            </div>
            <div className="onboarding__field">
              <label className="onboarding__label" htmlFor="workspace-slug">
                Workspace URL
              </label>
              <div className="onboarding__slug-row">
                <span className="onboarding__slug-prefix">orchestree.com/</span>
                <input
                  id="workspace-slug"
                  className="onboarding__input onboarding__input--slug"
                  type="text"
                  value={data.workspaceSlug}
                  onChange={(e) => updateField('workspaceSlug', slugify(e.target.value))}
                  placeholder="acme-inc"
                />
              </div>
            </div>
            <div className="onboarding__field">
              <label className="onboarding__label">Workspace icon</label>
              <div className="onboarding__icon-grid">
                {WORKSPACE_ICONS.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    className={`onboarding__icon-option ${data.workspaceIcon === icon ? 'onboarding__icon-option--selected' : ''}`}
                    onClick={() => updateField('workspaceIcon', icon)}
                    aria-label={`Select ${icon} as workspace icon`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>
            {/* Workspace preview card */}
            {data.workspaceName.trim() && (
              <div className="onboarding__preview-card">
                <span className="onboarding__preview-icon">{data.workspaceIcon}</span>
                <div className="onboarding__preview-info">
                  <span className="onboarding__preview-name">{data.workspaceName}</span>
                  <span className="onboarding__preview-url">orchestree.com/{data.workspaceSlug}</span>
                </div>
              </div>
            )}
          </div>
        )

      case 2:
        return (
          <div className="onboarding__step" key="step-role">
            <div className="onboarding__illustration">
              <UserCircle size={48} className="onboarding__step-icon" />
            </div>
            <h1 className="onboarding__title">What is your role?</h1>
            <p className="onboarding__subtitle">
              We&apos;ll customize your experience based on this.
            </p>
            <div className="onboarding__role-grid">
              {ROLES.map(({ label, icon: Icon }) => (
                <button
                  key={label}
                  type="button"
                  className={`onboarding__role-card ${data.role === label ? 'onboarding__role-card--selected' : ''}`}
                  onClick={() => updateField('role', label)}
                >
                  <Icon size={20} className="onboarding__role-icon" />
                  <span className="onboarding__role-label">{label}</span>
                  {data.role === label && (
                    <Check size={14} className="onboarding__role-check" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )

      case 3:
        return (
          <div className="onboarding__step" key="step-team-size">
            <div className="onboarding__illustration">
              <Users size={48} className="onboarding__step-icon" />
            </div>
            <h1 className="onboarding__title">How large is your team?</h1>
            <p className="onboarding__subtitle">
              This helps us configure the right defaults.
            </p>
            <div className="onboarding__size-grid">
              {TEAM_SIZES.map(({ label, description }) => (
                <button
                  key={label}
                  type="button"
                  className={`onboarding__size-card ${data.teamSize === label ? 'onboarding__size-card--selected' : ''}`}
                  onClick={() => updateField('teamSize', label)}
                >
                  <div className="onboarding__size-visual">
                    {label === 'Just me' && (
                      <div className="onboarding__size-dots">
                        <div className="onboarding__size-dot onboarding__size-dot--large" />
                      </div>
                    )}
                    {label === '2-5' && (
                      <div className="onboarding__size-dots">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <div key={i} className="onboarding__size-dot" />
                        ))}
                      </div>
                    )}
                    {label === '6-20' && (
                      <div className="onboarding__size-dots">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div key={i} className="onboarding__size-dot" />
                        ))}
                      </div>
                    )}
                    {label === '21-50' && (
                      <div className="onboarding__size-dots onboarding__size-dots--grid">
                        {Array.from({ length: 6 }).map((_, i) => (
                          <div key={i} className="onboarding__size-dot onboarding__size-dot--small" />
                        ))}
                      </div>
                    )}
                    {label === '51-200' && (
                      <div className="onboarding__size-dots onboarding__size-dots--grid">
                        {Array.from({ length: 8 }).map((_, i) => (
                          <div key={i} className="onboarding__size-dot onboarding__size-dot--small" />
                        ))}
                      </div>
                    )}
                    {label === '200+' && (
                      <div className="onboarding__size-dots onboarding__size-dots--grid">
                        {Array.from({ length: 12 }).map((_, i) => (
                          <div key={i} className="onboarding__size-dot onboarding__size-dot--small" />
                        ))}
                      </div>
                    )}
                  </div>
                  <span className="onboarding__size-label">{label}</span>
                  <span className="onboarding__size-desc">{description}</span>
                  {data.teamSize === label && (
                    <Check size={14} className="onboarding__size-check" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )

      case 4:
        return (
          <div className="onboarding__step" key="step-use-cases">
            <div className="onboarding__illustration">
              <Layers size={48} className="onboarding__step-icon" />
            </div>
            <h1 className="onboarding__title">What will you use Orchestree for?</h1>
            <p className="onboarding__subtitle">
              Select all that apply. You can change this later.
            </p>
            <div className="onboarding__usecase-grid">
              {USE_CASES.map(({ label, icon: Icon }) => {
                const selected = data.useCases.includes(label)
                return (
                  <button
                    key={label}
                    type="button"
                    className={`onboarding__usecase-card ${selected ? 'onboarding__usecase-card--selected' : ''}`}
                    onClick={() => toggleUseCase(label)}
                    aria-pressed={selected}
                  >
                    <div className="onboarding__usecase-checkbox">
                      {selected && <Check size={12} />}
                    </div>
                    <Icon size={20} className="onboarding__usecase-icon" />
                    <span className="onboarding__usecase-label">{label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        )

      case 5:
        return (
          <div className="onboarding__step" key="step-invite">
            <div className="onboarding__illustration">
              <Mail size={48} className="onboarding__step-icon" />
            </div>
            <h1 className="onboarding__title">Invite your team</h1>
            <p className="onboarding__subtitle">
              Collaboration is better together. Add teammates by email.
            </p>
            <div className="onboarding__field">
              <div className="onboarding__email-row">
                <input
                  className="onboarding__input onboarding__email-input"
                  type="email"
                  value={emailInput}
                  onChange={(e) => {
                    setEmailInput(e.target.value)
                    setEmailError('')
                  }}
                  onKeyDown={handleEmailKeyDown}
                  placeholder="colleague@company.com"
                  autoFocus
                />
                <button
                  type="button"
                  className="btn-primary onboarding__email-add"
                  onClick={addEmail}
                  disabled={!emailInput.trim()}
                  aria-label="Add email"
                >
                  Add
                </button>
              </div>
              {emailError && (
                <p className="onboarding__email-error">{emailError}</p>
              )}
            </div>
            {data.inviteEmails.length > 0 && (
              <div className="onboarding__email-list">
                {data.inviteEmails.map((email) => (
                  <div key={email} className="onboarding__email-chip">
                    <Mail size={12} />
                    <span>{email}</span>
                    <button
                      type="button"
                      className="onboarding__email-remove"
                      onClick={() => removeEmail(email)}
                      aria-label={`Remove ${email}`}
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <p className="onboarding__email-hint">
              You can also invite teammates later from Settings.
            </p>
          </div>
        )

      case 6:
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
                className={`onboarding__theme-card ${data.theme === 'light' ? 'onboarding__theme-card--selected' : ''}`}
                onClick={() => updateField('theme', 'light')}
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
                {data.theme === 'light' && <Check size={14} className="onboarding__theme-check" />}
              </button>

              <button
                type="button"
                className={`onboarding__theme-card ${data.theme === 'dark' ? 'onboarding__theme-card--selected' : ''}`}
                onClick={() => updateField('theme', 'dark')}
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
                {data.theme === 'dark' && <Check size={14} className="onboarding__theme-check" />}
              </button>

              <button
                type="button"
                className={`onboarding__theme-card ${data.theme === 'system' ? 'onboarding__theme-card--selected' : ''}`}
                onClick={() => updateField('theme', 'system')}
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
                {data.theme === 'system' && <Check size={14} className="onboarding__theme-check" />}
              </button>
            </div>

            {/* Accent color picker */}
            <div className="onboarding__field" style={{ marginTop: 'var(--space-4, 1rem)' }}>
              <label className="onboarding__label">Accent color</label>
              <div className="onboarding__accent-grid">
                {ACCENT_COLORS.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    className={`onboarding__accent-option ${accentColor === color.value ? 'onboarding__accent-option--selected' : ''}`}
                    onClick={() => setAccentColor(color.value)}
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

      case 7:
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
                  {ACCENT_COLORS.find((c) => c.value === accentColor)?.label ?? 'Custom'}
                </span>
              </div>
            </div>
            <div className="onboarding__ready-actions">
              <button
                type="button"
                className="onboarding__tour-link"
                onClick={() => {
                  syncToStore()
                  clearAllSampleData()
                  completeOnboarding(data)
                  completeRegistration()
                  navigate('/?tour=1')
                }}
              >
                <BookOpenCheck size={16} />
                Take a tour
              </button>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="onboarding">
      {/* Progress bar */}
      <div className="onboarding__progress-bar">
        <div
          className="onboarding__progress-fill"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Segment indicators */}
      <div className="onboarding__segments">
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <div
            key={i}
            className={`onboarding__segment ${i <= step ? 'onboarding__segment--filled' : ''}`}
          />
        ))}
      </div>

      <div className="onboarding__container">
        {/* Step counter */}
        <div className="onboarding__step-counter">
          Step {step + 1} of {TOTAL_STEPS}
        </div>

        {/* Card */}
        <div className="onboarding__card" ref={stepRef}>
          <div className={`onboarding__step-content ${getSlideClass()}`}>
            {renderStepContent()}
          </div>

          {/* Navigation */}
          <div className="onboarding__nav">
            {step > 0 ? (
              <button
                type="button"
                className="onboarding__back"
                onClick={handleBack}
                aria-label="Go back"
              >
                <ArrowLeft size={16} />
                Back
              </button>
            ) : (
              <div />
            )}

            <div className="onboarding__nav-right">
              {isOptionalStep && (
                <button
                  type="button"
                  className="onboarding__skip"
                  onClick={handleNext}
                >
                  Skip
                </button>
              )}
              <button
                type="button"
                className="btn-primary onboarding__next"
                onClick={handleNext}
                disabled={!canProceed()}
              >
                {step === TOTAL_STEPS - 1 ? (
                  <>
                    Go to Dashboard
                    <Rocket size={16} />
                  </>
                ) : (
                  <>
                    Continue
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
