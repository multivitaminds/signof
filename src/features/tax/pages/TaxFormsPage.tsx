import { useMemo, useCallback, useState } from 'react'
import { ChevronLeft, ChevronRight, Check, FileText } from 'lucide-react'
import {
  useTaxFormStore,
  TAXBANDITS_FORM_DEFINITIONS,
  FORM_CATEGORY_LABELS,
  WIZARD_STEPS,
  FormCompletionStatus,
} from '../stores/useTaxFormStore'
import type { TaxFormType, FormCategory } from '../types'
import type { FormEntryData } from '../stores/useTaxFormStore'
import { useTaxStore } from '../stores/useTaxStore'
import './TaxFormsPage.css'

function TaxFormsPage() {
  const activeTaxYear = useTaxStore((s) => s.activeTaxYear)
  const entries = useTaxFormStore((s) => s.entries)
  const startForm = useTaxFormStore((s) => s.startForm)
  const updateFormData = useTaxFormStore((s) => s.updateFormData)
  const setCurrentStep = useTaxFormStore((s) => s.setCurrentStep)
  const completeStep = useTaxFormStore((s) => s.completeStep)
  const completeForm = useTaxFormStore((s) => s.completeForm)
  const getFormStatus = useTaxFormStore((s) => s.getFormStatus)
  const getEntryByForm = useTaxFormStore((s) => s.getEntryByForm)
  const getProgressPercent = useTaxFormStore((s) => s.getProgressPercent)

  const [activeFormId, setActiveFormId] = useState<TaxFormType | null>(null)
  const [activeEntryId, setActiveEntryId] = useState<string | null>(null)

  const activeEntry = useMemo(() => {
    if (!activeEntryId) return null
    return entries.find((e) => e.id === activeEntryId) ?? null
  }, [entries, activeEntryId])

  const categories = useMemo(() => {
    const cats: Record<string, typeof TAXBANDITS_FORM_DEFINITIONS> = {}
    for (const def of TAXBANDITS_FORM_DEFINITIONS) {
      if (!cats[def.category]) cats[def.category] = []
      cats[def.category]!.push(def)
    }
    return cats
  }, [])

  const handleStartOrContinue = useCallback(
    (formId: TaxFormType) => {
      const entryId = startForm(formId, activeTaxYear)
      setActiveFormId(formId)
      setActiveEntryId(entryId)
    },
    [startForm, activeTaxYear]
  )

  const handleBack = useCallback(() => {
    setActiveFormId(null)
    setActiveEntryId(null)
  }, [])

  const handleStepChange = useCallback(
    (step: number) => {
      if (!activeEntryId) return
      setCurrentStep(activeEntryId, step)
    },
    [activeEntryId, setCurrentStep]
  )

  const handleNext = useCallback(() => {
    if (!activeEntry) return
    completeStep(activeEntry.id, activeEntry.currentStep)
    if (activeEntry.currentStep < WIZARD_STEPS.length - 1) {
      setCurrentStep(activeEntry.id, activeEntry.currentStep + 1)
    }
  }, [activeEntry, completeStep, setCurrentStep])

  const handlePrev = useCallback(() => {
    if (!activeEntry || activeEntry.currentStep <= 0) return
    setCurrentStep(activeEntry.id, activeEntry.currentStep - 1)
  }, [activeEntry, setCurrentStep])

  const handleComplete = useCallback(() => {
    if (!activeEntry) return
    completeForm(activeEntry.id)
    setActiveFormId(null)
    setActiveEntryId(null)
  }, [activeEntry, completeForm])

  const handleFieldChange = useCallback(
    (field: keyof FormEntryData, value: string | number | boolean) => {
      if (!activeEntryId) return
      updateFormData(activeEntryId, { [field]: value })
    },
    [activeEntryId, updateFormData]
  )

  const handleNumericChange = useCallback(
    (field: keyof FormEntryData, rawValue: string) => {
      const value = parseFloat(rawValue) || 0
      handleFieldChange(field, value)
    },
    [handleFieldChange]
  )

  // ─── Wizard View ──────────────────────────────────────────────────────

  if (activeEntry && activeFormId) {
    const formDef = TAXBANDITS_FORM_DEFINITIONS.find((d) => d.id === activeFormId)
    const progress = getProgressPercent(activeEntry.id)
    const isLastStep = activeEntry.currentStep === WIZARD_STEPS.length - 1

    return (
      <div className="tax-forms__wizard">
        <div className="tax-forms__wizard-header">
          <button className="btn-ghost" onClick={handleBack} type="button" aria-label="Back to form list">
            <ChevronLeft size={16} />
            <span>Back to Forms</span>
          </button>
          <div className="tax-forms__wizard-title">
            <h2>{formDef?.name ?? 'Tax Form'}</h2>
            <span className="tax-forms__wizard-subtitle">{formDef?.fullName}</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="tax-forms__progress" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
          <div className="tax-forms__progress-bar" style={{ width: `${progress}%` }} />
          <span className="tax-forms__progress-label">{progress}% Complete</span>
        </div>

        {/* Step Indicators */}
        <div className="tax-forms__steps" role="tablist" aria-label="Form steps">
          {WIZARD_STEPS.map((step, index) => {
            const isActive = index === activeEntry.currentStep
            const isCompleted = activeEntry.completedSteps.includes(index)
            const isClickable = isCompleted || index <= activeEntry.currentStep
            return (
              <button
                key={step}
                className={`tax-forms__step ${isActive ? 'tax-forms__step--active' : ''} ${isCompleted ? 'tax-forms__step--completed' : ''}`}
                onClick={() => isClickable && handleStepChange(index)}
                disabled={!isClickable}
                role="tab"
                aria-selected={isActive}
                aria-label={`Step ${index + 1}: ${step}`}
                type="button"
              >
                <span className="tax-forms__step-number">
                  {isCompleted ? <Check size={12} /> : index + 1}
                </span>
                <span className="tax-forms__step-label">{step}</span>
              </button>
            )
          })}
        </div>

        {/* Step Content */}
        <div className="tax-forms__step-content" role="tabpanel">
          {activeEntry.currentStep === 0 && (
            <div className="tax-forms__fields">
              <h3 className="tax-forms__section-title">Payer / Employer Information</h3>
              <div className="tax-forms__field-grid">
                <div className="tax-forms__field">
                  <label htmlFor="tf-payerName" className="tax-forms__label">Payer Name</label>
                  <input id="tf-payerName" type="text" value={activeEntry.data.payerName} onChange={(e) => handleFieldChange('payerName', e.target.value)} className="tax-forms__input" placeholder="Company name" />
                </div>
                <div className="tax-forms__field">
                  <label htmlFor="tf-payerTin" className="tax-forms__label">Payer TIN/EIN</label>
                  <input id="tf-payerTin" type="text" value={activeEntry.data.payerTin} onChange={(e) => handleFieldChange('payerTin', e.target.value)} className="tax-forms__input" placeholder="XX-XXXXXXX" />
                </div>
                <div className="tax-forms__field">
                  <label htmlFor="tf-payerAddress" className="tax-forms__label">Address</label>
                  <input id="tf-payerAddress" type="text" value={activeEntry.data.payerAddress} onChange={(e) => handleFieldChange('payerAddress', e.target.value)} className="tax-forms__input" placeholder="Street address" />
                </div>
                <div className="tax-forms__field">
                  <label htmlFor="tf-payerCity" className="tax-forms__label">City</label>
                  <input id="tf-payerCity" type="text" value={activeEntry.data.payerCity} onChange={(e) => handleFieldChange('payerCity', e.target.value)} className="tax-forms__input" placeholder="City" />
                </div>
                <div className="tax-forms__field">
                  <label htmlFor="tf-payerState" className="tax-forms__label">State</label>
                  <input id="tf-payerState" type="text" value={activeEntry.data.payerState} onChange={(e) => handleFieldChange('payerState', e.target.value)} className="tax-forms__input" placeholder="ST" />
                </div>
                <div className="tax-forms__field">
                  <label htmlFor="tf-payerZip" className="tax-forms__label">ZIP</label>
                  <input id="tf-payerZip" type="text" value={activeEntry.data.payerZip} onChange={(e) => handleFieldChange('payerZip', e.target.value)} className="tax-forms__input" placeholder="00000" />
                </div>
              </div>
            </div>
          )}

          {activeEntry.currentStep === 1 && (
            <div className="tax-forms__fields">
              <h3 className="tax-forms__section-title">Recipient / Employee Information</h3>
              <div className="tax-forms__field-grid">
                <div className="tax-forms__field">
                  <label htmlFor="tf-recipientName" className="tax-forms__label">Recipient Name</label>
                  <input id="tf-recipientName" type="text" value={activeEntry.data.recipientName} onChange={(e) => handleFieldChange('recipientName', e.target.value)} className="tax-forms__input" placeholder="Full name" />
                </div>
                <div className="tax-forms__field">
                  <label htmlFor="tf-recipientTin" className="tax-forms__label">Recipient TIN/SSN</label>
                  <input id="tf-recipientTin" type="text" value={activeEntry.data.recipientTin} onChange={(e) => handleFieldChange('recipientTin', e.target.value)} className="tax-forms__input" placeholder="XXX-XX-XXXX" />
                </div>
                <div className="tax-forms__field">
                  <label htmlFor="tf-recipientAddress" className="tax-forms__label">Address</label>
                  <input id="tf-recipientAddress" type="text" value={activeEntry.data.recipientAddress} onChange={(e) => handleFieldChange('recipientAddress', e.target.value)} className="tax-forms__input" placeholder="Street address" />
                </div>
                <div className="tax-forms__field">
                  <label htmlFor="tf-recipientCity" className="tax-forms__label">City</label>
                  <input id="tf-recipientCity" type="text" value={activeEntry.data.recipientCity} onChange={(e) => handleFieldChange('recipientCity', e.target.value)} className="tax-forms__input" placeholder="City" />
                </div>
                <div className="tax-forms__field">
                  <label htmlFor="tf-recipientState" className="tax-forms__label">State</label>
                  <input id="tf-recipientState" type="text" value={activeEntry.data.recipientState} onChange={(e) => handleFieldChange('recipientState', e.target.value)} className="tax-forms__input" placeholder="ST" />
                </div>
                <div className="tax-forms__field">
                  <label htmlFor="tf-recipientZip" className="tax-forms__label">ZIP</label>
                  <input id="tf-recipientZip" type="text" value={activeEntry.data.recipientZip} onChange={(e) => handleFieldChange('recipientZip', e.target.value)} className="tax-forms__input" placeholder="00000" />
                </div>
              </div>
            </div>
          )}

          {activeEntry.currentStep === 2 && (
            <div className="tax-forms__fields">
              <h3 className="tax-forms__section-title">Amounts</h3>
              <div className="tax-forms__field-grid">
                <div className="tax-forms__field">
                  <label htmlFor="tf-amount1" className="tax-forms__label">Amount 1</label>
                  <input id="tf-amount1" type="number" step="0.01" min="0" value={activeEntry.data.amount1 || ''} onChange={(e) => handleNumericChange('amount1', e.target.value)} className="tax-forms__input" placeholder="0.00" />
                </div>
                <div className="tax-forms__field">
                  <label htmlFor="tf-amount2" className="tax-forms__label">Amount 2</label>
                  <input id="tf-amount2" type="number" step="0.01" min="0" value={activeEntry.data.amount2 || ''} onChange={(e) => handleNumericChange('amount2', e.target.value)} className="tax-forms__input" placeholder="0.00" />
                </div>
                <div className="tax-forms__field">
                  <label htmlFor="tf-amount3" className="tax-forms__label">Amount 3</label>
                  <input id="tf-amount3" type="number" step="0.01" min="0" value={activeEntry.data.amount3 || ''} onChange={(e) => handleNumericChange('amount3', e.target.value)} className="tax-forms__input" placeholder="0.00" />
                </div>
                <div className="tax-forms__field">
                  <label htmlFor="tf-amount4" className="tax-forms__label">Amount 4</label>
                  <input id="tf-amount4" type="number" step="0.01" min="0" value={activeEntry.data.amount4 || ''} onChange={(e) => handleNumericChange('amount4', e.target.value)} className="tax-forms__input" placeholder="0.00" />
                </div>
                <div className="tax-forms__field">
                  <label htmlFor="tf-accountNumber" className="tax-forms__label">Account Number</label>
                  <input id="tf-accountNumber" type="text" value={activeEntry.data.accountNumber} onChange={(e) => handleFieldChange('accountNumber', e.target.value)} className="tax-forms__input" placeholder="Optional" />
                </div>
              </div>
            </div>
          )}

          {activeEntry.currentStep === 3 && (
            <div className="tax-forms__fields">
              <h3 className="tax-forms__section-title">State Information</h3>
              <div className="tax-forms__field-grid">
                <div className="tax-forms__field">
                  <label htmlFor="tf-stateCode" className="tax-forms__label">State Code</label>
                  <input id="tf-stateCode" type="text" value={activeEntry.data.stateCode} onChange={(e) => handleFieldChange('stateCode', e.target.value)} className="tax-forms__input" placeholder="ST" />
                </div>
                <div className="tax-forms__field">
                  <label htmlFor="tf-stateTaxId" className="tax-forms__label">State Tax ID</label>
                  <input id="tf-stateTaxId" type="text" value={activeEntry.data.stateTaxId} onChange={(e) => handleFieldChange('stateTaxId', e.target.value)} className="tax-forms__input" placeholder="State tax ID" />
                </div>
                <div className="tax-forms__field">
                  <label htmlFor="tf-stateIncome" className="tax-forms__label">State Income</label>
                  <input id="tf-stateIncome" type="number" step="0.01" min="0" value={activeEntry.data.stateIncome || ''} onChange={(e) => handleNumericChange('stateIncome', e.target.value)} className="tax-forms__input" placeholder="0.00" />
                </div>
                <div className="tax-forms__field">
                  <label htmlFor="tf-stateTaxWithheld" className="tax-forms__label">State Tax Withheld</label>
                  <input id="tf-stateTaxWithheld" type="number" step="0.01" min="0" value={activeEntry.data.stateTaxWithheld || ''} onChange={(e) => handleNumericChange('stateTaxWithheld', e.target.value)} className="tax-forms__input" placeholder="0.00" />
                </div>
              </div>
            </div>
          )}

          {activeEntry.currentStep === 4 && (
            <div className="tax-forms__fields">
              <h3 className="tax-forms__section-title">Review</h3>
              <div className="tax-forms__review-grid">
                <div className="tax-forms__review-item">
                  <span className="tax-forms__review-label">Payer</span>
                  <span className="tax-forms__review-value">{activeEntry.data.payerName} ({activeEntry.data.payerTin})</span>
                </div>
                <div className="tax-forms__review-item">
                  <span className="tax-forms__review-label">Recipient</span>
                  <span className="tax-forms__review-value">{activeEntry.data.recipientName} ({activeEntry.data.recipientTin})</span>
                </div>
                <div className="tax-forms__review-item">
                  <span className="tax-forms__review-label">Total Amounts</span>
                  <span className="tax-forms__review-value">
                    ${(activeEntry.data.amount1 + activeEntry.data.amount2 + activeEntry.data.amount3 + activeEntry.data.amount4).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="tax-forms__review-item">
                  <span className="tax-forms__review-label">State</span>
                  <span className="tax-forms__review-value">{activeEntry.data.stateCode || 'N/A'}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="tax-forms__nav">
          <button className="btn-secondary" onClick={handlePrev} disabled={activeEntry.currentStep === 0} type="button">
            <ChevronLeft size={16} />
            <span>Back</span>
          </button>
          {isLastStep ? (
            <button className="btn-primary" onClick={handleComplete} type="button">
              <Check size={16} />
              <span>Complete Form</span>
            </button>
          ) : (
            <button className="btn-primary" onClick={handleNext} type="button">
              <span>Next</span>
              <ChevronRight size={16} />
            </button>
          )}
        </div>
      </div>
    )
  }

  // ─── Form Selection View ────────────────────────────────────────────

  return (
    <div className="tax-forms">
      <div className="tax-forms__header">
        <h2 className="tax-forms__title">Tax Forms</h2>
        <p className="tax-forms__subtitle">
          Select a tax form to begin filling out for tax year {activeTaxYear}.
        </p>
      </div>

      {Object.entries(categories).map(([category, forms]) => (
        <div key={category} className="tax-forms__category">
          <h3 className="tax-forms__category-title">{FORM_CATEGORY_LABELS[category as FormCategory] ?? category}</h3>
          <div className="tax-forms__grid">
            {forms.map((formDef) => {
              const status = getFormStatus(formDef.id, activeTaxYear)
              const entry = getEntryByForm(formDef.id, activeTaxYear)
              const progress = entry ? getProgressPercent(entry.id) : 0

              return (
                <div key={formDef.id} className="tax-forms__card">
                  <div className="tax-forms__card-header">
                    <div className="tax-forms__card-icon">
                      <FileText size={20} />
                    </div>
                    <div className="tax-forms__card-info">
                      <h4 className="tax-forms__card-name">{formDef.name}</h4>
                      <span className="tax-forms__card-full-name">{formDef.fullName}</span>
                    </div>
                  </div>
                  <p className="tax-forms__card-description">{formDef.description}</p>

                  {status === FormCompletionStatus.InProgress && (
                    <div className="tax-forms__card-progress">
                      <div className="tax-forms__card-progress-bar" style={{ width: `${progress}%` }} />
                      <span className="tax-forms__card-progress-label">{progress}%</span>
                    </div>
                  )}

                  <button
                    className={`tax-forms__card-action ${
                      status === FormCompletionStatus.Completed
                        ? 'tax-forms__card-action--completed'
                        : status === FormCompletionStatus.InProgress
                          ? 'tax-forms__card-action--continue'
                          : 'tax-forms__card-action--start'
                    }`}
                    onClick={() => handleStartOrContinue(formDef.id)}
                    type="button"
                  >
                    {status === FormCompletionStatus.Completed
                      ? 'Completed'
                      : status === FormCompletionStatus.InProgress
                        ? 'Continue'
                        : 'Start'}
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

export default TaxFormsPage
