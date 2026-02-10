import { useState, useCallback } from 'react'
import { X, ChevronLeft, ChevronRight, Zap, Check } from 'lucide-react'
import type { DbField } from '../../types'
import type { AutomationRule } from '../../types/automation'
import {
  AutomationTrigger,
  AutomationAction,
  TRIGGER_LABELS,
  ACTION_LABELS,
  TRIGGER_DESCRIPTIONS,
  ACTION_DESCRIPTIONS,
} from '../../types/automation'
import './AutomationBuilder.css'

const STEPS = [
  'Name & Description',
  'Select Trigger',
  'Configure Trigger',
  'Select Action',
  'Configure Action',
] as const

type Step = 0 | 1 | 2 | 3 | 4

interface AutomationBuilderProps {
  fields: DbField[]
  existingRule?: AutomationRule
  onSave: (rule: Omit<AutomationRule, 'id' | 'createdAt' | 'lastRunAt' | 'runCount'>) => void
  onClose: () => void
}

const ALL_TRIGGERS = Object.values(AutomationTrigger) as AutomationTrigger[]
const ALL_ACTIONS = Object.values(AutomationAction) as AutomationAction[]

export default function AutomationBuilder({
  fields,
  existingRule,
  onSave,
  onClose,
}: AutomationBuilderProps) {
  const [step, setStep] = useState<Step>(0)
  const [name, setName] = useState(existingRule?.name ?? '')
  const [description, setDescription] = useState(existingRule?.description ?? '')
  const [trigger, setTrigger] = useState<AutomationTrigger>(
    existingRule?.trigger ?? AutomationTrigger.RecordCreated
  )
  const [triggerConfig, setTriggerConfig] = useState<Record<string, string>>(
    existingRule?.triggerConfig ?? {}
  )
  const [action, setAction] = useState<AutomationAction>(
    existingRule?.action ?? AutomationAction.SendNotification
  )
  const [actionConfig, setActionConfig] = useState<Record<string, string>>(
    existingRule?.actionConfig ?? {}
  )

  const canProceed = useCallback((): boolean => {
    switch (step) {
      case 0:
        return name.trim().length > 0
      case 1:
        return true
      case 2:
        return true
      case 3:
        return true
      case 4:
        return true
      default:
        return false
    }
  }, [step, name])

  const handleNext = useCallback(() => {
    if (step < 4) setStep((s) => (s + 1) as Step)
  }, [step])

  const handleBack = useCallback(() => {
    if (step > 0) setStep((s) => (s - 1) as Step)
  }, [step])

  const handleSave = useCallback(() => {
    onSave({
      name: name.trim(),
      description: description.trim(),
      trigger,
      triggerConfig,
      action,
      actionConfig,
      enabled: existingRule?.enabled ?? true,
    })
  }, [name, description, trigger, triggerConfig, action, actionConfig, existingRule, onSave])

  const updateTriggerConfig = useCallback((key: string, value: string) => {
    setTriggerConfig((prev) => ({ ...prev, [key]: value }))
  }, [])

  const updateActionConfig = useCallback((key: string, value: string) => {
    setActionConfig((prev) => ({ ...prev, [key]: value }))
  }, [])

  const handleOverlayClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose()
  }, [onClose])

  // ─── Trigger Config UI ────────────────────────────────────────────

  const renderTriggerConfig = () => {
    switch (trigger) {
      case AutomationTrigger.FieldChanged:
      case AutomationTrigger.StatusChanged:
        return (
          <div className="automation-builder__config-fields">
            <div className="automation-builder__config-field">
              <label className="automation-builder__config-label">
                Watch Field
              </label>
              <select
                className="automation-builder__config-select"
                value={triggerConfig['fieldId'] ?? ''}
                onChange={(e) => updateTriggerConfig('fieldId', e.target.value)}
              >
                <option value="">Select a field...</option>
                {fields.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="automation-builder__config-field">
              <label className="automation-builder__config-label">
                Expected Value (optional)
              </label>
              <input
                className="automation-builder__config-input"
                type="text"
                placeholder="Leave empty to trigger on any change"
                value={triggerConfig['value'] ?? ''}
                onChange={(e) => updateTriggerConfig('value', e.target.value)}
              />
            </div>
          </div>
        )
      case AutomationTrigger.ScheduledTime:
        return (
          <div className="automation-builder__config-fields">
            <div className="automation-builder__config-field">
              <label className="automation-builder__config-label">
                Interval
              </label>
              <select
                className="automation-builder__config-select"
                value={triggerConfig['interval'] ?? 'daily'}
                onChange={(e) => updateTriggerConfig('interval', e.target.value)}
              >
                <option value="hourly">Every hour</option>
                <option value="daily">Every day</option>
                <option value="weekly">Every week</option>
                <option value="monthly">Every month</option>
              </select>
            </div>
            <div className="automation-builder__config-field">
              <label className="automation-builder__config-label">
                Time
              </label>
              <input
                className="automation-builder__config-input"
                type="time"
                value={triggerConfig['time'] ?? '09:00'}
                onChange={(e) => updateTriggerConfig('time', e.target.value)}
              />
            </div>
          </div>
        )
      case AutomationTrigger.RecordCreated:
      case AutomationTrigger.RecordUpdated:
      default:
        return (
          <div className="automation-builder__config-empty">
            <p>No additional configuration needed for this trigger.</p>
            <p className="automation-builder__config-hint">
              This automation will fire whenever a record is {trigger === AutomationTrigger.RecordCreated ? 'created' : 'updated'}.
            </p>
          </div>
        )
    }
  }

  // ─── Action Config UI ─────────────────────────────────────────────

  const renderActionConfig = () => {
    switch (action) {
      case AutomationAction.SendNotification:
        return (
          <div className="automation-builder__config-fields">
            <div className="automation-builder__config-field">
              <label className="automation-builder__config-label">
                Notification Message
              </label>
              <textarea
                className="automation-builder__config-textarea"
                placeholder="Enter notification message..."
                value={actionConfig['message'] ?? ''}
                onChange={(e) => updateActionConfig('message', e.target.value)}
                rows={3}
              />
            </div>
          </div>
        )
      case AutomationAction.UpdateField:
        return (
          <div className="automation-builder__config-fields">
            <div className="automation-builder__config-field">
              <label className="automation-builder__config-label">
                Field to Update
              </label>
              <select
                className="automation-builder__config-select"
                value={actionConfig['fieldId'] ?? ''}
                onChange={(e) => updateActionConfig('fieldId', e.target.value)}
              >
                <option value="">Select a field...</option>
                {fields.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="automation-builder__config-field">
              <label className="automation-builder__config-label">
                New Value
              </label>
              <input
                className="automation-builder__config-input"
                type="text"
                placeholder="Enter new value..."
                value={actionConfig['value'] ?? ''}
                onChange={(e) => updateActionConfig('value', e.target.value)}
              />
            </div>
          </div>
        )
      case AutomationAction.CreateRecord:
        return (
          <div className="automation-builder__config-fields">
            <div className="automation-builder__config-field">
              <label className="automation-builder__config-label">
                Template Values (JSON)
              </label>
              <textarea
                className="automation-builder__config-textarea"
                placeholder='{"Field Name": "value"}'
                value={actionConfig['template'] ?? ''}
                onChange={(e) => updateActionConfig('template', e.target.value)}
                rows={3}
              />
            </div>
          </div>
        )
      case AutomationAction.MoveToView:
        return (
          <div className="automation-builder__config-fields">
            <div className="automation-builder__config-field">
              <label className="automation-builder__config-label">
                Target View Name
              </label>
              <input
                className="automation-builder__config-input"
                type="text"
                placeholder="Enter view name..."
                value={actionConfig['viewName'] ?? ''}
                onChange={(e) => updateActionConfig('viewName', e.target.value)}
              />
            </div>
          </div>
        )
      case AutomationAction.SendWebhook:
        return (
          <div className="automation-builder__config-fields">
            <div className="automation-builder__config-field">
              <label className="automation-builder__config-label">
                Webhook URL
              </label>
              <input
                className="automation-builder__config-input"
                type="url"
                placeholder="https://example.com/webhook"
                value={actionConfig['url'] ?? ''}
                onChange={(e) => updateActionConfig('url', e.target.value)}
              />
            </div>
            <div className="automation-builder__config-field">
              <label className="automation-builder__config-label">
                Custom Headers (optional, JSON)
              </label>
              <input
                className="automation-builder__config-input"
                type="text"
                placeholder='{"Authorization": "Bearer ..."}'
                value={actionConfig['headers'] ?? ''}
                onChange={(e) => updateActionConfig('headers', e.target.value)}
              />
            </div>
          </div>
        )
      default:
        return null
    }
  }

  // ─── Summary Card ──────────────────────────────────────────────────

  const renderSummary = () => (
    <div className="automation-builder__summary">
      <h3 className="automation-builder__summary-title">Automation Summary</h3>
      <div className="automation-builder__summary-grid">
        <div className="automation-builder__summary-item">
          <span className="automation-builder__summary-label">Name</span>
          <span className="automation-builder__summary-value">{name}</span>
        </div>
        {description && (
          <div className="automation-builder__summary-item">
            <span className="automation-builder__summary-label">Description</span>
            <span className="automation-builder__summary-value">{description}</span>
          </div>
        )}
        <div className="automation-builder__summary-item">
          <span className="automation-builder__summary-label">When</span>
          <span className="automation-builder__summary-value">{TRIGGER_LABELS[trigger]}</span>
        </div>
        <div className="automation-builder__summary-item">
          <span className="automation-builder__summary-label">Then</span>
          <span className="automation-builder__summary-value">{ACTION_LABELS[action]}</span>
        </div>
      </div>
    </div>
  )

  return (
    <div className="modal-overlay" onClick={handleOverlayClick} role="dialog" aria-modal="true" aria-label="Automation Builder">
      <div className="modal-content automation-builder">
        <div className="modal-header">
          <h2>
            <Zap size={18} />
            {existingRule ? 'Edit Automation' : 'New Automation'}
          </h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        {/* Step indicators */}
        <div className="automation-builder__steps">
          {STEPS.map((label, idx) => (
            <div
              key={idx}
              className={`automation-builder__step ${
                idx === step
                  ? 'automation-builder__step--active'
                  : idx < step
                    ? 'automation-builder__step--done'
                    : ''
              }`}
            >
              <span className="automation-builder__step-num">
                {idx < step ? <Check size={12} /> : idx + 1}
              </span>
              <span className="automation-builder__step-label">{label}</span>
            </div>
          ))}
        </div>

        {/* Step content */}
        <div className="automation-builder__body">
          {/* Step 0: Name & Description */}
          {step === 0 && (
            <div className="automation-builder__section">
              <div className="automation-builder__config-field">
                <label className="automation-builder__config-label">
                  Automation Name <span className="automation-builder__required">*</span>
                </label>
                <input
                  className="automation-builder__config-input"
                  type="text"
                  placeholder="e.g., Notify on status change"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="automation-builder__config-field">
                <label className="automation-builder__config-label">
                  Description
                </label>
                <textarea
                  className="automation-builder__config-textarea"
                  placeholder="What does this automation do?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          )}

          {/* Step 1: Select Trigger */}
          {step === 1 && (
            <div className="automation-builder__section">
              <p className="automation-builder__section-desc">
                Choose when this automation should run:
              </p>
              <div className="automation-builder__option-list">
                {ALL_TRIGGERS.map((t) => (
                  <label
                    key={t}
                    className={`automation-builder__option ${trigger === t ? 'automation-builder__option--selected' : ''}`}
                  >
                    <input
                      type="radio"
                      name="trigger"
                      value={t}
                      checked={trigger === t}
                      onChange={() => setTrigger(t)}
                      className="automation-builder__option-radio"
                    />
                    <div className="automation-builder__option-content">
                      <span className="automation-builder__option-name">
                        {TRIGGER_LABELS[t]}
                      </span>
                      <span className="automation-builder__option-desc">
                        {TRIGGER_DESCRIPTIONS[t]}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Configure Trigger */}
          {step === 2 && (
            <div className="automation-builder__section">
              <p className="automation-builder__section-desc">
                Configure the <strong>{TRIGGER_LABELS[trigger]}</strong> trigger:
              </p>
              {renderTriggerConfig()}
            </div>
          )}

          {/* Step 3: Select Action */}
          {step === 3 && (
            <div className="automation-builder__section">
              <p className="automation-builder__section-desc">
                Choose what should happen:
              </p>
              <div className="automation-builder__option-list">
                {ALL_ACTIONS.map((a) => (
                  <label
                    key={a}
                    className={`automation-builder__option ${action === a ? 'automation-builder__option--selected' : ''}`}
                  >
                    <input
                      type="radio"
                      name="action"
                      value={a}
                      checked={action === a}
                      onChange={() => setAction(a)}
                      className="automation-builder__option-radio"
                    />
                    <div className="automation-builder__option-content">
                      <span className="automation-builder__option-name">
                        {ACTION_LABELS[a]}
                      </span>
                      <span className="automation-builder__option-desc">
                        {ACTION_DESCRIPTIONS[a]}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Configure Action */}
          {step === 4 && (
            <div className="automation-builder__section">
              <p className="automation-builder__section-desc">
                Configure the <strong>{ACTION_LABELS[action]}</strong> action:
              </p>
              {renderActionConfig()}
              {renderSummary()}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="automation-builder__nav">
          <button
            className="btn-secondary"
            onClick={step === 0 ? onClose : handleBack}
          >
            {step === 0 ? (
              'Cancel'
            ) : (
              <>
                <ChevronLeft size={14} />
                Back
              </>
            )}
          </button>
          {step < 4 ? (
            <button
              className="btn-primary"
              onClick={handleNext}
              disabled={!canProceed()}
            >
              Next
              <ChevronRight size={14} />
            </button>
          ) : (
            <button className="btn-primary" onClick={handleSave}>
              <Zap size={14} />
              {existingRule ? 'Update Automation' : 'Create Automation'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
