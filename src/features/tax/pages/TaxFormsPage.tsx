import { useMemo, useCallback, useState } from 'react'
import { ChevronLeft, ChevronRight, Check, FileText } from 'lucide-react'
import {
  useTaxFormStore,
  TAX_FORM_DEFINITIONS,
  WIZARD_STEPS,
  FormCompletionStatus,
} from '../stores/useTaxFormStore'
import type { TaxFormId, FormEntryData } from '../stores/useTaxFormStore'
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

  const [activeFormId, setActiveFormId] = useState<TaxFormId | null>(null)
  const [activeEntryId, setActiveEntryId] = useState<string | null>(null)

  const activeEntry = useMemo(() => {
    if (!activeEntryId) return null
    return entries.find((e) => e.id === activeEntryId) ?? null
  }, [entries, activeEntryId])

  const categories = useMemo(() => {
    const cats: Record<string, typeof TAX_FORM_DEFINITIONS> = {}
    for (const def of TAX_FORM_DEFINITIONS) {
      if (!cats[def.category]) cats[def.category] = []
      cats[def.category]!.push(def)
    }
    return cats
  }, [])

  const handleStartOrContinue = useCallback(
    (formId: TaxFormId) => {
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
    const formDef = TAX_FORM_DEFINITIONS.find((d) => d.id === activeFormId)
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
              <h3 className="tax-forms__section-title">Personal Information</h3>
              <div className="tax-forms__field-grid">
                <div className="tax-forms__field">
                  <label htmlFor="tf-firstName" className="tax-forms__label">First Name</label>
                  <input id="tf-firstName" type="text" value={activeEntry.data.firstName} onChange={(e) => handleFieldChange('firstName', e.target.value)} className="tax-forms__input" placeholder="First name" />
                </div>
                <div className="tax-forms__field">
                  <label htmlFor="tf-lastName" className="tax-forms__label">Last Name</label>
                  <input id="tf-lastName" type="text" value={activeEntry.data.lastName} onChange={(e) => handleFieldChange('lastName', e.target.value)} className="tax-forms__input" placeholder="Last name" />
                </div>
                <div className="tax-forms__field">
                  <label htmlFor="tf-ssn" className="tax-forms__label">SSN</label>
                  <input id="tf-ssn" type="text" value={activeEntry.data.ssn} onChange={(e) => handleFieldChange('ssn', e.target.value)} className="tax-forms__input" placeholder="***-**-0000" />
                </div>
                <div className="tax-forms__field">
                  <label htmlFor="tf-filingStatus" className="tax-forms__label">Filing Status</label>
                  <select id="tf-filingStatus" value={activeEntry.data.filingStatus} onChange={(e) => handleFieldChange('filingStatus', e.target.value)} className="tax-forms__select">
                    <option value="single">Single</option>
                    <option value="married_joint">Married Filing Jointly</option>
                    <option value="married_separate">Married Filing Separately</option>
                    <option value="head_of_household">Head of Household</option>
                    <option value="qualifying_widow">Qualifying Surviving Spouse</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeEntry.currentStep === 1 && (
            <div className="tax-forms__fields">
              <h3 className="tax-forms__section-title">Income</h3>
              <div className="tax-forms__field-grid">
                <div className="tax-forms__field">
                  <label htmlFor="tf-wages" className="tax-forms__label">Wages & Salaries</label>
                  <input id="tf-wages" type="number" step="0.01" min="0" value={activeEntry.data.wagesIncome || ''} onChange={(e) => handleNumericChange('wagesIncome', e.target.value)} className="tax-forms__input" placeholder="0.00" />
                </div>
                <div className="tax-forms__field">
                  <label htmlFor="tf-interest" className="tax-forms__label">Interest Income</label>
                  <input id="tf-interest" type="number" step="0.01" min="0" value={activeEntry.data.interestIncome || ''} onChange={(e) => handleNumericChange('interestIncome', e.target.value)} className="tax-forms__input" placeholder="0.00" />
                </div>
                <div className="tax-forms__field">
                  <label htmlFor="tf-dividends" className="tax-forms__label">Dividend Income</label>
                  <input id="tf-dividends" type="number" step="0.01" min="0" value={activeEntry.data.dividendIncome || ''} onChange={(e) => handleNumericChange('dividendIncome', e.target.value)} className="tax-forms__input" placeholder="0.00" />
                </div>
                <div className="tax-forms__field">
                  <label htmlFor="tf-business" className="tax-forms__label">Business Income</label>
                  <input id="tf-business" type="number" step="0.01" min="0" value={activeEntry.data.businessIncome || ''} onChange={(e) => handleNumericChange('businessIncome', e.target.value)} className="tax-forms__input" placeholder="0.00" />
                </div>
                <div className="tax-forms__field">
                  <label htmlFor="tf-capgains" className="tax-forms__label">Capital Gains</label>
                  <input id="tf-capgains" type="number" step="0.01" min="0" value={activeEntry.data.capitalGains || ''} onChange={(e) => handleNumericChange('capitalGains', e.target.value)} className="tax-forms__input" placeholder="0.00" />
                </div>
                <div className="tax-forms__field">
                  <label htmlFor="tf-otherIncome" className="tax-forms__label">Other Income</label>
                  <input id="tf-otherIncome" type="number" step="0.01" min="0" value={activeEntry.data.otherIncome || ''} onChange={(e) => handleNumericChange('otherIncome', e.target.value)} className="tax-forms__input" placeholder="0.00" />
                </div>
              </div>
            </div>
          )}

          {activeEntry.currentStep === 2 && (
            <div className="tax-forms__fields">
              <h3 className="tax-forms__section-title">Deductions</h3>
              <div className="tax-forms__deduction-toggle">
                <label className="tax-forms__checkbox-label">
                  <input type="checkbox" checked={activeEntry.data.useStandardDeduction} onChange={(e) => handleFieldChange('useStandardDeduction', e.target.checked)} />
                  <span>Use Standard Deduction ($15,000)</span>
                </label>
              </div>
              {!activeEntry.data.useStandardDeduction && (
                <div className="tax-forms__field-grid">
                  <div className="tax-forms__field">
                    <label htmlFor="tf-medical" className="tax-forms__label">Medical Expenses</label>
                    <input id="tf-medical" type="number" step="0.01" min="0" value={activeEntry.data.medicalExpenses || ''} onChange={(e) => handleNumericChange('medicalExpenses', e.target.value)} className="tax-forms__input" placeholder="0.00" />
                  </div>
                  <div className="tax-forms__field">
                    <label htmlFor="tf-salt" className="tax-forms__label">State & Local Taxes</label>
                    <input id="tf-salt" type="number" step="0.01" min="0" value={activeEntry.data.stateLocalTaxes || ''} onChange={(e) => handleNumericChange('stateLocalTaxes', e.target.value)} className="tax-forms__input" placeholder="0.00" />
                  </div>
                  <div className="tax-forms__field">
                    <label htmlFor="tf-mortgage" className="tax-forms__label">Mortgage Interest</label>
                    <input id="tf-mortgage" type="number" step="0.01" min="0" value={activeEntry.data.mortgageInterest || ''} onChange={(e) => handleNumericChange('mortgageInterest', e.target.value)} className="tax-forms__input" placeholder="0.00" />
                  </div>
                  <div className="tax-forms__field">
                    <label htmlFor="tf-charity" className="tax-forms__label">Charitable Contributions</label>
                    <input id="tf-charity" type="number" step="0.01" min="0" value={activeEntry.data.charitableContributions || ''} onChange={(e) => handleNumericChange('charitableContributions', e.target.value)} className="tax-forms__input" placeholder="0.00" />
                  </div>
                </div>
              )}
            </div>
          )}

          {activeEntry.currentStep === 3 && (
            <div className="tax-forms__fields">
              <h3 className="tax-forms__section-title">Credits</h3>
              <div className="tax-forms__field-grid">
                <div className="tax-forms__field">
                  <label htmlFor="tf-childcredit" className="tax-forms__label">Child Tax Credit</label>
                  <input id="tf-childcredit" type="number" step="0.01" min="0" value={activeEntry.data.childTaxCredit || ''} onChange={(e) => handleNumericChange('childTaxCredit', e.target.value)} className="tax-forms__input" placeholder="0.00" />
                </div>
                <div className="tax-forms__field">
                  <label htmlFor="tf-educredit" className="tax-forms__label">Education Credit</label>
                  <input id="tf-educredit" type="number" step="0.01" min="0" value={activeEntry.data.educationCredit || ''} onChange={(e) => handleNumericChange('educationCredit', e.target.value)} className="tax-forms__input" placeholder="0.00" />
                </div>
                <div className="tax-forms__field">
                  <label htmlFor="tf-energycredit" className="tax-forms__label">Energy Credit</label>
                  <input id="tf-energycredit" type="number" step="0.01" min="0" value={activeEntry.data.energyCredit || ''} onChange={(e) => handleNumericChange('energyCredit', e.target.value)} className="tax-forms__input" placeholder="0.00" />
                </div>
                <div className="tax-forms__field">
                  <label htmlFor="tf-othercredits" className="tax-forms__label">Other Credits</label>
                  <input id="tf-othercredits" type="number" step="0.01" min="0" value={activeEntry.data.otherCredits || ''} onChange={(e) => handleNumericChange('otherCredits', e.target.value)} className="tax-forms__input" placeholder="0.00" />
                </div>
              </div>
            </div>
          )}

          {activeEntry.currentStep === 4 && (
            <div className="tax-forms__fields">
              <h3 className="tax-forms__section-title">Review</h3>
              <div className="tax-forms__review-grid">
                <div className="tax-forms__review-item">
                  <span className="tax-forms__review-label">Name</span>
                  <span className="tax-forms__review-value">{activeEntry.data.firstName} {activeEntry.data.lastName}</span>
                </div>
                <div className="tax-forms__review-item">
                  <span className="tax-forms__review-label">Total Income</span>
                  <span className="tax-forms__review-value">
                    ${(activeEntry.data.wagesIncome + activeEntry.data.interestIncome + activeEntry.data.dividendIncome + activeEntry.data.businessIncome + activeEntry.data.capitalGains + activeEntry.data.otherIncome).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="tax-forms__review-item">
                  <span className="tax-forms__review-label">Deduction Type</span>
                  <span className="tax-forms__review-value">{activeEntry.data.useStandardDeduction ? 'Standard ($15,000)' : 'Itemized'}</span>
                </div>
                <div className="tax-forms__review-item">
                  <span className="tax-forms__review-label">Total Credits</span>
                  <span className="tax-forms__review-value">
                    ${(activeEntry.data.childTaxCredit + activeEntry.data.educationCredit + activeEntry.data.energyCredit + activeEntry.data.otherCredits).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
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
          <h3 className="tax-forms__category-title">{category}</h3>
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
