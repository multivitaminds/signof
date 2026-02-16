// Expert Mode filing — direct wizard with manual field entry.
// For the guided Interview flow, see TaxInterviewPage.
import { useState, useCallback, useMemo, useEffect } from 'react'
import { useTaxStore } from '../stores/useTaxStore'
import { useTaxDocumentStore } from '../stores/useTaxDocumentStore'
import { useTaxFilingStore } from '../stores/useTaxFilingStore'
import { FILING_STATUS_LABELS, FILING_STATE_LABELS, FilingState, STANDARD_DEDUCTION_2025, TransmissionStatus } from '../types'
import type { TaxFiling, FilingStatus, TaxBanditConfig } from '../types'
import FilingWizard from '../components/FilingWizard/FilingWizard'
import TaxBanditSettings from '../components/TaxBanditSettings/TaxBanditSettings'
import FilingConfirmation from '../components/FilingConfirmation/FilingConfirmation'
import FiledStateCard from '../components/FiledStateCard/FiledStateCard'
import PreFilingChecklist from '../components/PreFilingChecklist/PreFilingChecklist'
import './TaxFilingPage.css'

const WIZARD_STEPS = [
  { label: 'Personal Info', shortLabel: 'Personal' },
  { label: 'Income', shortLabel: 'Income' },
  { label: 'Deductions', shortLabel: 'Deductions' },
  { label: 'Review & File', shortLabel: 'Review' },
]

const FILING_STATUS_OPTIONS: { value: string; label: string }[] = Object.entries(
  FILING_STATUS_LABELS
).map(([value, label]) => ({ value, label }))

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS',
  'KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY',
  'NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV',
  'WI','WY','DC',
]

const TRANSMISSION_STEP_LABELS: Record<string, string> = {
  [TransmissionStatus.Validating]: 'Validating with IRS...',
  [TransmissionStatus.Transmitting]: 'Transmitting to IRS...',
  [TransmissionStatus.Polling]: 'Waiting for IRS response...',
  [TransmissionStatus.Complete]: 'Transmission complete',
  [TransmissionStatus.Error]: 'Transmission failed',
}

function TaxFilingPage() {
  const activeTaxYear = useTaxStore((s) => s.activeTaxYear)
  const documents = useTaxDocumentStore((s) => s.documents)

  const filings = useTaxFilingStore((s) => s.filings)
  const createFiling = useTaxFilingStore((s) => s.createFiling)
  const updateFiling = useTaxFilingStore((s) => s.updateFiling)
  const calculateTax = useTaxFilingStore((s) => s.calculateTax)
  const submitFiling = useTaxFilingStore((s) => s.submitFiling)
  const checklist = useTaxFilingStore((s) => s.checklist)
  const toggleChecklistItem = useTaxFilingStore((s) => s.toggleChecklistItem)
  const checklistProgress = useTaxFilingStore((s) => s.checklistProgress)
  const isChecklistComplete = useTaxFilingStore((s) => s.isChecklistComplete)
  const confirmation = useTaxFilingStore((s) => s.confirmation)
  const clearConfirmation = useTaxFilingStore((s) => s.clearConfirmation)
  const isAmendmentMode = useTaxFilingStore((s) => s.isAmendmentMode)
  const setAmendmentMode = useTaxFilingStore((s) => s.setAmendmentMode)
  const amendmentReason = useTaxFilingStore((s) => s.amendmentReason)
  const setAmendmentReason = useTaxFilingStore((s) => s.setAmendmentReason)
  const submitAmendment = useTaxFilingStore((s) => s.submitAmendment)

  // TaxBandit state
  const taxBanditConfig = useTaxFilingStore((s) => s.taxBanditConfig)
  const setTaxBanditConfig = useTaxFilingStore((s) => s.setTaxBanditConfig)
  const authenticateWithTaxBandit = useTaxFilingStore((s) => s.authenticateWithTaxBandit)
  const isTaxBanditConnected = useTaxFilingStore((s) => s.isTaxBanditConnected)
  const transmissionStatus = useTaxFilingStore((s) => s.transmissionStatus)
  const transmissionError = useTaxFilingStore((s) => s.transmissionError)
  const validationErrors = useTaxFilingStore((s) => s.validationErrors)
  const submissionId = useTaxFilingStore((s) => s.submissionId)
  const returnPdfUrl = useTaxFilingStore((s) => s.returnPdfUrl)
  const downloadReturnPdf = useTaxFilingStore((s) => s.downloadReturnPdf)

  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showChecklist, setShowChecklist] = useState(true)

  const filing = useMemo(
    () => filings.find((f) => f.taxYear === activeTaxYear),
    [filings, activeTaxYear]
  )

  useEffect(() => {
    if (!filing) {
      createFiling(activeTaxYear)
    }
  }, [filing, activeTaxYear, createFiling])

  // Recalculate whenever income/deduction fields change
  const filingId = filing?.id
  const filingWages = filing?.wages
  const filingOtherIncome = filing?.otherIncome
  const filingUseStandard = filing?.useStandardDeduction
  const filingItemized = filing?.itemizedDeductions
  const filingWithheld = filing?.withheld
  const filingEstimated = filing?.estimatedPayments

  useEffect(() => {
    if (filingId) {
      calculateTax(filingId)
    }
  }, [
    filingId,
    filingWages,
    filingOtherIncome,
    filingUseStandard,
    filingItemized,
    filingWithheld,
    filingEstimated,
    calculateTax,
  ])

  const updateField = useCallback(
    <K extends keyof TaxFiling>(field: K, value: TaxFiling[K]) => {
      if (!filing) return
      updateFiling(filing.id, { [field]: value })
    },
    [filing, updateFiling]
  )

  const updateAddressField = useCallback(
    (field: string, value: string) => {
      if (!filing) return
      updateFiling(filing.id, {
        address: { ...filing.address, [field]: value },
      })
    },
    [filing, updateFiling]
  )

  const handleNumericChange = useCallback(
    (field: keyof TaxFiling, rawValue: string) => {
      const value = parseFloat(rawValue) || 0
      updateField(field, value as TaxFiling[keyof TaxFiling])
    },
    [updateField]
  )

  const handleSubmit = useCallback(() => {
    if (!filing) return
    setIsSubmitting(true)
    submitFiling(filing.id)

    // For simulated mode, use timeout. For TaxBandit mode, the async flow handles it.
    if (!isTaxBanditConnected()) {
      setTimeout(() => {
        setIsSubmitting(false)
      }, 3500)
    }
  }, [filing, submitFiling, isTaxBanditConnected])

  // Derive submitting state: if TaxBandit is active, submitting is tied to transmission status
  const isTransmitting =
    transmissionStatus === TransmissionStatus.Validating ||
    transmissionStatus === TransmissionStatus.Transmitting ||
    transmissionStatus === TransmissionStatus.Polling

  const effectiveIsSubmitting = isSubmitting || isTransmitting

  const handleAmendmentSubmit = useCallback(() => {
    if (!filing) return
    setIsSubmitting(true)
    submitAmendment(filing.id)
    setTimeout(() => {
      setIsSubmitting(false)
    }, 3500)
  }, [filing, submitAmendment])

  const handleStartAmendment = useCallback(() => {
    if (!filing) return
    setAmendmentMode(true)
    // Reset filing state so the wizard shows again
    updateFiling(filing.id, { state: FilingState.InProgress, filedAt: null })
    clearConfirmation()
    setCurrentStep(0)
  }, [filing, setAmendmentMode, updateFiling, clearConfirmation])

  const handleToggleChecklist = useCallback(() => {
    setShowChecklist((prev) => !prev)
  }, [])

  const handleConfigChange = useCallback(
    (config: Partial<TaxBanditConfig>) => {
      setTaxBanditConfig(config)
    },
    [setTaxBanditConfig]
  )

  const handleTestConnection = useCallback(async () => {
    return authenticateWithTaxBandit()
  }, [authenticateWithTaxBandit])

  const handleDownloadPdf = useCallback(() => {
    void downloadReturnPdf()
  }, [downloadReturnPdf])

  const handleFixErrors = useCallback(() => {
    // Navigate back to the step with the error
    setCurrentStep(0)
  }, [])

  const connected = isTaxBanditConnected()

  // Auto-populate income from extracted documents
  const extractionResults = useTaxDocumentStore((s) => s.extractionResults)
  const autoPopulatedWages = useMemo(() => {
    const yearDocs = documents.filter(
      (d) => d.taxYear === activeTaxYear
    )
    let wages = 0
    let otherIncome = 0
    let withheld = 0
    for (const doc of yearDocs) {
      const extraction = extractionResults[doc.id]
      if (!extraction || !extraction.extractedAt) continue
      for (const field of extraction.fields) {
        if (field.key.toLowerCase().includes('wages') && field.key.includes('Box 1')) {
          wages += parseFloat(field.value) || 0
        }
        if (field.key.toLowerCase().includes('nonemployee compensation')) {
          otherIncome += parseFloat(field.value) || 0
        }
        if (field.key.toLowerCase().includes('interest income')) {
          otherIncome += parseFloat(field.value) || 0
        }
        if (field.key.toLowerCase().includes('federal tax withheld')) {
          withheld += parseFloat(field.value) || 0
        }
      }
    }
    return { wages, otherIncome, withheld }
  }, [documents, activeTaxYear, extractionResults])

  const handleAutoPopulate = useCallback(() => {
    if (!filing) return
    updateFiling(filing.id, {
      wages: autoPopulatedWages.wages,
      otherIncome: autoPopulatedWages.otherIncome,
      withheld: autoPopulatedWages.withheld,
    })
  }, [filing, updateFiling, autoPopulatedWages])

  if (!filing) {
    return (
      <div className="tax-filing__loading">
        <p>Preparing your tax filing...</p>
      </div>
    )
  }

  // ─── Confirmation View ────────────────────────────────────────────────
  if (confirmation) {
    return (
      <FilingConfirmation
        filing={filing}
        confirmation={confirmation}
        activeTaxYear={activeTaxYear}
        submissionId={submissionId}
        returnPdfUrl={returnPdfUrl}
        isConnected={connected}
        onDownloadPdf={handleDownloadPdf}
        onStartAmendment={handleStartAmendment}
      />
    )
  }

  // ─── Filed State (without confirmation - e.g., reloaded page) ────────
  const isFiled =
    filing.state === FilingState.Filed ||
    filing.state === FilingState.Accepted ||
    filing.state === FilingState.Rejected

  if (isFiled && !isAmendmentMode) {
    return (
      <FiledStateCard
        filing={filing}
        activeTaxYear={activeTaxYear}
        transmissionError={transmissionError}
        onStartAmendment={handleStartAmendment}
      />
    )
  }


  return (
    <div className="tax-filing">
      {/* ─── TaxBandit API Settings ──────────────────────── */}
      <TaxBanditSettings
        config={taxBanditConfig}
        isConnected={connected}
        onConfigChange={handleConfigChange}
        onTestConnection={handleTestConnection}
      />

      {/* ─── Pre-Filing Checklist ───────────────────────────── */}
      <PreFilingChecklist
        checklist={checklist}
        progress={checklistProgress()}
        showChecklist={showChecklist}
        onToggle={handleToggleChecklist}
        onToggleItem={toggleChecklistItem}
      />

      {/* ─── Amendment Banner ──────────────────────────────── */}
      {isAmendmentMode && (
        <div className="tax-filing__amendment-banner">
          <div className="tax-filing__amendment-banner-left">
            <strong>Amendment Mode (Form 1040-X)</strong>
            <p>Make corrections to your previously filed return.</p>
          </div>
          <div className="tax-filing__amendment-reason">
            <label htmlFor="amendReason" className="tax-filing__label">
              Reason for Amendment
            </label>
            <input
              id="amendReason"
              type="text"
              value={amendmentReason}
              onChange={(e) => setAmendmentReason(e.target.value)}
              className="tax-filing__input"
              placeholder="e.g., Forgot to include 1099-INT income"
            />
          </div>
          <button
            className="btn-secondary"
            onClick={() => setAmendmentMode(false)}
            type="button"
          >
            Cancel Amendment
          </button>
        </div>
      )}

      {/* ─── Filing Status Bar ─────────────────────────────── */}
      <div className="tax-filing__status-bar">
        {Object.values(FilingState).map((state) => {
          const isActive = filing.state === state
          const stateIndex = Object.values(FilingState).indexOf(state)
          const currentIndex = Object.values(FilingState).indexOf(filing.state)
          const isPast = stateIndex < currentIndex

          return (
            <div
              key={state}
              className={`tax-filing__status-step ${
                isActive ? 'tax-filing__status-step--active' : ''
              } ${isPast ? 'tax-filing__status-step--past' : ''}`}
            >
              <div className="tax-filing__status-dot" />
              <span className="tax-filing__status-label">{FILING_STATE_LABELS[state]}</span>
            </div>
          )
        })}
      </div>

      {/* ─── Wizard ───────────────────────────────────────── */}
      <FilingWizard
        steps={WIZARD_STEPS}
        currentStep={currentStep}
        onStepChange={setCurrentStep}
        onSubmit={isAmendmentMode ? handleAmendmentSubmit : handleSubmit}
        isSubmitting={effectiveIsSubmitting}
        canProceed={!isAmendmentMode || amendmentReason.length > 0 || currentStep < 3}
      >
        {/* Step 1: Personal Info */}
        {currentStep === 0 && (
          <div className="tax-filing__step">
            <h2 className="tax-filing__step-title">Personal Information</h2>
            <p className="tax-filing__step-desc">
              Enter your personal details as they appear on your tax documents.
            </p>

            <div className="tax-filing__form-grid">
              <div className="tax-filing__field">
                <label htmlFor="firstName" className="tax-filing__label">
                  First Name
                </label>
                <input
                  id="firstName"
                  type="text"
                  value={filing.firstName}
                  onChange={(e) => updateField('firstName', e.target.value)}
                  className="tax-filing__input"
                  placeholder="First name"
                />
              </div>
              <div className="tax-filing__field">
                <label htmlFor="lastName" className="tax-filing__label">
                  Last Name
                </label>
                <input
                  id="lastName"
                  type="text"
                  value={filing.lastName}
                  onChange={(e) => updateField('lastName', e.target.value)}
                  className="tax-filing__input"
                  placeholder="Last name"
                />
              </div>
              <div className="tax-filing__field">
                <label htmlFor="ssn" className="tax-filing__label">
                  SSN (last 4 shown)
                </label>
                <input
                  id="ssn"
                  type="text"
                  value={filing.ssn}
                  onChange={(e) => updateField('ssn', e.target.value)}
                  className="tax-filing__input"
                  placeholder="***-**-0000"
                />
              </div>
              <div className="tax-filing__field">
                <label htmlFor="filingStatus" className="tax-filing__label">
                  Filing Status
                </label>
                <select
                  id="filingStatus"
                  value={filing.filingStatus}
                  onChange={(e) =>
                    updateField('filingStatus', e.target.value as FilingStatus)
                  }
                  className="tax-filing__select"
                >
                  {FILING_STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="tax-filing__field">
                <label htmlFor="email" className="tax-filing__label">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={filing.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  className="tax-filing__input"
                  placeholder="you@example.com"
                />
              </div>
              <div className="tax-filing__field">
                <label htmlFor="phone" className="tax-filing__label">
                  Phone
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={filing.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  className="tax-filing__input"
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>

            <h3 className="tax-filing__section-label">Mailing Address</h3>
            <div className="tax-filing__form-grid">
              <div className="tax-filing__field tax-filing__field--wide">
                <label htmlFor="street" className="tax-filing__label">
                  Street Address
                </label>
                <input
                  id="street"
                  type="text"
                  value={filing.address.street}
                  onChange={(e) => updateAddressField('street', e.target.value)}
                  className="tax-filing__input"
                  placeholder="123 Main St"
                />
              </div>
              <div className="tax-filing__field">
                <label htmlFor="apt" className="tax-filing__label">
                  Apt / Suite
                </label>
                <input
                  id="apt"
                  type="text"
                  value={filing.address.apt}
                  onChange={(e) => updateAddressField('apt', e.target.value)}
                  className="tax-filing__input"
                  placeholder="Apt 4B"
                />
              </div>
              <div className="tax-filing__field">
                <label htmlFor="city" className="tax-filing__label">
                  City
                </label>
                <input
                  id="city"
                  type="text"
                  value={filing.address.city}
                  onChange={(e) => updateAddressField('city', e.target.value)}
                  className="tax-filing__input"
                  placeholder="City"
                />
              </div>
              <div className="tax-filing__field">
                <label htmlFor="state" className="tax-filing__label">
                  State
                </label>
                <select
                  id="state"
                  value={filing.address.state}
                  onChange={(e) => updateAddressField('state', e.target.value)}
                  className="tax-filing__select"
                >
                  <option value="">Select state</option>
                  {US_STATES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>
              <div className="tax-filing__field">
                <label htmlFor="zip" className="tax-filing__label">
                  ZIP Code
                </label>
                <input
                  id="zip"
                  type="text"
                  value={filing.address.zip}
                  onChange={(e) => updateAddressField('zip', e.target.value)}
                  className="tax-filing__input"
                  placeholder="12345"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Income */}
        {currentStep === 1 && (
          <div className="tax-filing__step">
            <h2 className="tax-filing__step-title">Income</h2>
            <p className="tax-filing__step-desc">
              Enter your income for tax year {activeTaxYear}. You can auto-populate
              from your extracted documents.
            </p>

            {(autoPopulatedWages.wages > 0 || autoPopulatedWages.otherIncome > 0) && (
              <div className="tax-filing__auto-populate">
                <div className="tax-filing__auto-populate-info">
                  <strong>Auto-populate from documents?</strong>
                  <p>
                    We found wages of ${autoPopulatedWages.wages.toLocaleString()},
                    other income of ${autoPopulatedWages.otherIncome.toLocaleString()},
                    and ${autoPopulatedWages.withheld.toLocaleString()} withheld from
                    your extracted documents.
                  </p>
                </div>
                <button
                  className="btn-primary"
                  onClick={handleAutoPopulate}
                  type="button"
                >
                  Auto-fill
                </button>
              </div>
            )}

            <div className="tax-filing__form-grid">
              <div className="tax-filing__field">
                <label htmlFor="wages" className="tax-filing__label">
                  Wages, Salaries, Tips (W-2 Box 1)
                </label>
                <div className="tax-filing__currency-input">
                  <span className="tax-filing__currency-symbol">$</span>
                  <input
                    id="wages"
                    type="number"
                    step="0.01"
                    min="0"
                    value={filing.wages || ''}
                    onChange={(e) => handleNumericChange('wages', e.target.value)}
                    className="tax-filing__input tax-filing__input--currency"
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div className="tax-filing__field">
                <label htmlFor="otherIncome" className="tax-filing__label">
                  Other Income (1099s, interest, dividends)
                </label>
                <div className="tax-filing__currency-input">
                  <span className="tax-filing__currency-symbol">$</span>
                  <input
                    id="otherIncome"
                    type="number"
                    step="0.01"
                    min="0"
                    value={filing.otherIncome || ''}
                    onChange={(e) =>
                      handleNumericChange('otherIncome', e.target.value)
                    }
                    className="tax-filing__input tax-filing__input--currency"
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div className="tax-filing__field">
                <label htmlFor="withheld" className="tax-filing__label">
                  Federal Tax Withheld (W-2 Box 2)
                </label>
                <div className="tax-filing__currency-input">
                  <span className="tax-filing__currency-symbol">$</span>
                  <input
                    id="withheld"
                    type="number"
                    step="0.01"
                    min="0"
                    value={filing.withheld || ''}
                    onChange={(e) =>
                      handleNumericChange('withheld', e.target.value)
                    }
                    className="tax-filing__input tax-filing__input--currency"
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div className="tax-filing__field">
                <label htmlFor="estimatedPayments" className="tax-filing__label">
                  Estimated Tax Payments Made
                </label>
                <div className="tax-filing__currency-input">
                  <span className="tax-filing__currency-symbol">$</span>
                  <input
                    id="estimatedPayments"
                    type="number"
                    step="0.01"
                    min="0"
                    value={filing.estimatedPayments || ''}
                    onChange={(e) =>
                      handleNumericChange('estimatedPayments', e.target.value)
                    }
                    className="tax-filing__input tax-filing__input--currency"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>

            <div className="tax-filing__income-total">
              <span>Total Income</span>
              <span className="tax-filing__income-total-value">
                ${filing.totalIncome.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
          </div>
        )}

        {/* Step 3: Deductions */}
        {currentStep === 2 && (
          <div className="tax-filing__step">
            <h2 className="tax-filing__step-title">Deductions</h2>
            <p className="tax-filing__step-desc">
              Choose between the standard deduction or itemize your deductions.
            </p>

            <div className="tax-filing__deduction-toggle">
              <button
                className={`tax-filing__toggle-btn ${
                  filing.useStandardDeduction
                    ? 'tax-filing__toggle-btn--active'
                    : ''
                }`}
                onClick={() => updateField('useStandardDeduction', true)}
                type="button"
              >
                Standard Deduction
                <span className="tax-filing__toggle-amount">
                  ${STANDARD_DEDUCTION_2025.toLocaleString()}
                </span>
              </button>
              <button
                className={`tax-filing__toggle-btn ${
                  !filing.useStandardDeduction
                    ? 'tax-filing__toggle-btn--active'
                    : ''
                }`}
                onClick={() => updateField('useStandardDeduction', false)}
                type="button"
              >
                Itemized Deductions
                <span className="tax-filing__toggle-amount">
                  ${filing.itemizedDeductions.toLocaleString()}
                </span>
              </button>
            </div>

            {filing.useStandardDeduction ? (
              <div className="tax-filing__standard-info">
                <p>
                  The 2025 standard deduction for{' '}
                  {FILING_STATUS_LABELS[filing.filingStatus]} filers is{' '}
                  <strong>${STANDARD_DEDUCTION_2025.toLocaleString()}</strong>.
                </p>
              </div>
            ) : (
              <div className="tax-filing__form-grid">
                <div className="tax-filing__field tax-filing__field--wide">
                  <label
                    htmlFor="itemizedDeductions"
                    className="tax-filing__label"
                  >
                    Total Itemized Deductions
                  </label>
                  <div className="tax-filing__currency-input">
                    <span className="tax-filing__currency-symbol">$</span>
                    <input
                      id="itemizedDeductions"
                      type="number"
                      step="0.01"
                      min="0"
                      value={filing.itemizedDeductions || ''}
                      onChange={(e) =>
                        handleNumericChange(
                          'itemizedDeductions',
                          e.target.value
                        )
                      }
                      className="tax-filing__input tax-filing__input--currency"
                      placeholder="0.00"
                    />
                  </div>
                  <p className="tax-filing__field-hint">
                    Include mortgage interest, state/local taxes, charitable
                    contributions, medical expenses, etc.
                  </p>
                </div>
              </div>
            )}

            <div className="tax-filing__deduction-summary">
              <div className="tax-filing__summary-row">
                <span>Total Income</span>
                <span>
                  ${filing.totalIncome.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
              <div className="tax-filing__summary-row">
                <span>
                  Deduction (
                  {filing.useStandardDeduction ? 'Standard' : 'Itemized'})
                </span>
                <span>
                  -$
                  {filing.effectiveDeduction.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
              <div className="tax-filing__summary-row tax-filing__summary-row--total">
                <span>Taxable Income</span>
                <span>
                  ${filing.taxableIncome.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Review & File */}
        {currentStep === 3 && (
          <div className="tax-filing__step">
            <h2 className="tax-filing__step-title">Review & File</h2>
            <p className="tax-filing__step-desc">
              {connected
                ? 'Review your tax return summary. Your return will be validated and transmitted via TaxBandit.'
                : 'Review your tax return summary before submitting.'}
            </p>

            {!isChecklistComplete() && (
              <div className="tax-filing__checklist-warning">
                <strong>Checklist Incomplete</strong>
                <p>
                  You have not completed all pre-filing checklist items. You can
                  still submit, but we recommend completing the checklist first.
                </p>
              </div>
            )}

            {/* Transmission Progress */}
            {transmissionStatus !== TransmissionStatus.Idle && (
              <div className={`tax-filing__transmission-progress ${
                transmissionStatus === TransmissionStatus.Error
                  ? 'tax-filing__transmission-progress--error'
                  : transmissionStatus === TransmissionStatus.Complete
                    ? 'tax-filing__transmission-progress--success'
                    : ''
              }`}>
                <div className="tax-filing__transmission-steps">
                  {[TransmissionStatus.Validating, TransmissionStatus.Transmitting, TransmissionStatus.Polling].map((step) => {
                    const stepOrder = [TransmissionStatus.Validating, TransmissionStatus.Transmitting, TransmissionStatus.Polling]
                    const currentIdx = stepOrder.indexOf(transmissionStatus as typeof step)
                    const stepIdx = stepOrder.indexOf(step)
                    const isCurrentStep = transmissionStatus === step
                    const isPastStep = currentIdx > stepIdx || transmissionStatus === TransmissionStatus.Complete

                    return (
                      <div
                        key={step}
                        className={`tax-filing__transmission-step ${
                          isCurrentStep ? 'tax-filing__transmission-step--active' : ''
                        } ${isPastStep ? 'tax-filing__transmission-step--done' : ''}`}
                      >
                        <div className="tax-filing__transmission-step-dot" />
                        <span>{TRANSMISSION_STEP_LABELS[step]}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Validation Errors */}
            {validationErrors.length > 0 && (
              <div className="tax-filing__validation-errors">
                <strong>Validation Errors</strong>
                <ul className="tax-filing__validation-error-list">
                  {validationErrors.map((err) => (
                    <li key={err.id} className="tax-filing__validation-error-item">
                      <span className="tax-filing__validation-error-field">{err.field || 'General'}</span>
                      <span className="tax-filing__validation-error-message">{err.message}</span>
                      {err.code && (
                        <span className="tax-filing__validation-error-code">{err.code}</span>
                      )}
                    </li>
                  ))}
                </ul>
                <button
                  className="btn-secondary"
                  onClick={handleFixErrors}
                  type="button"
                >
                  Fix Errors
                </button>
              </div>
            )}

            {/* Transmission Error */}
            {transmissionError && transmissionStatus === TransmissionStatus.Error && validationErrors.length === 0 && (
              <div className="tax-filing__transmission-error">
                <strong>Transmission Error</strong>
                <p>{transmissionError}</p>
              </div>
            )}

            <div className="tax-filing__review">
              {/* Personal Info Summary */}
              <div className="tax-filing__review-section">
                <h3 className="tax-filing__review-heading">Personal Info</h3>
                <div className="tax-filing__review-grid">
                  <div className="tax-filing__review-item">
                    <span className="tax-filing__review-label">Name</span>
                    <span className="tax-filing__review-value">
                      {filing.firstName} {filing.lastName}
                    </span>
                  </div>
                  <div className="tax-filing__review-item">
                    <span className="tax-filing__review-label">SSN</span>
                    <span className="tax-filing__review-value">{filing.ssn}</span>
                  </div>
                  <div className="tax-filing__review-item">
                    <span className="tax-filing__review-label">Filing Status</span>
                    <span className="tax-filing__review-value">
                      {FILING_STATUS_LABELS[filing.filingStatus]}
                    </span>
                  </div>
                  <div className="tax-filing__review-item">
                    <span className="tax-filing__review-label">Email</span>
                    <span className="tax-filing__review-value">{filing.email}</span>
                  </div>
                  <div className="tax-filing__review-item">
                    <span className="tax-filing__review-label">Phone</span>
                    <span className="tax-filing__review-value">{filing.phone}</span>
                  </div>
                  <div className="tax-filing__review-item">
                    <span className="tax-filing__review-label">Address</span>
                    <span className="tax-filing__review-value">
                      {filing.address.street}
                      {filing.address.apt ? `, ${filing.address.apt}` : ''}
                      {filing.address.city ? `, ${filing.address.city}` : ''}
                      {filing.address.state ? `, ${filing.address.state}` : ''}
                      {filing.address.zip ? ` ${filing.address.zip}` : ''}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tax Calculation Summary */}
              <div className="tax-filing__review-section">
                <h3 className="tax-filing__review-heading">Tax Calculation</h3>
                <div className="tax-filing__calc-table">
                  <div className="tax-filing__calc-row">
                    <span>Wages & Salaries</span>
                    <span>
                      ${filing.wages.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                  <div className="tax-filing__calc-row">
                    <span>Other Income</span>
                    <span>
                      ${filing.otherIncome.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                  <div className="tax-filing__calc-row tax-filing__calc-row--subtotal">
                    <span>Total Income</span>
                    <span>
                      ${filing.totalIncome.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                  <div className="tax-filing__calc-row">
                    <span>
                      Deduction (
                      {filing.useStandardDeduction ? 'Standard' : 'Itemized'})
                    </span>
                    <span>
                      -$
                      {filing.effectiveDeduction.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                  <div className="tax-filing__calc-row tax-filing__calc-row--subtotal">
                    <span>Taxable Income</span>
                    <span>
                      ${filing.taxableIncome.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                  <div className="tax-filing__calc-row">
                    <span>Federal Tax</span>
                    <span>
                      ${filing.federalTax.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                  <div className="tax-filing__calc-row">
                    <span>Federal Tax Withheld</span>
                    <span>
                      -$
                      {filing.withheld.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                  <div className="tax-filing__calc-row">
                    <span>Estimated Payments</span>
                    <span>
                      -$
                      {filing.estimatedPayments.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                  <div
                    className={`tax-filing__calc-row tax-filing__calc-row--total ${
                      filing.refundOrOwed < 0
                        ? 'tax-filing__calc-row--refund'
                        : 'tax-filing__calc-row--owed'
                    }`}
                  >
                    <span>
                      {filing.refundOrOwed < 0
                        ? 'Estimated Refund'
                        : 'Estimated Tax Owed'}
                    </span>
                    <span>
                      ${Math.abs(filing.refundOrOwed).toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </FilingWizard>
    </div>
  )
}

export default TaxFilingPage
