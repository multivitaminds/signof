import { useState, useCallback, useMemo, useEffect } from 'react'
import { useTaxStore } from '../stores/useTaxStore'
import { FILING_STATUS_LABELS, FilingState, STANDARD_DEDUCTION_2025 } from '../types'
import type { TaxFiling, FilingStatus } from '../types'
import FilingWizard from '../components/FilingWizard/FilingWizard'
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

function TaxFilingPage() {
  const activeTaxYear = useTaxStore((s) => s.activeTaxYear)
  const filings = useTaxStore((s) => s.filings)
  const createFiling = useTaxStore((s) => s.createFiling)
  const updateFiling = useTaxStore((s) => s.updateFiling)
  const calculateTax = useTaxStore((s) => s.calculateTax)
  const submitFiling = useTaxStore((s) => s.submitFiling)
  const documents = useTaxStore((s) => s.documents)

  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const filing = useMemo(
    () => filings.find((f) => f.taxYear === activeTaxYear),
    [filings, activeTaxYear]
  )

  // Auto-create filing if it does not exist
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
    // Reset submitting state after simulated delay
    setTimeout(() => {
      setIsSubmitting(false)
    }, 3500)
  }, [filing, submitFiling])

  // Auto-populate income from extracted documents
  const autoPopulatedWages = useMemo(() => {
    const yearDocs = documents.filter(
      (d) => d.taxYear === activeTaxYear && d.extractionStatus === 'completed'
    )
    let wages = 0
    let otherIncome = 0
    let withheld = 0
    for (const doc of yearDocs) {
      for (const field of doc.extractedData) {
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
  }, [documents, activeTaxYear])

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

  const isFiled =
    filing.state === FilingState.Filed ||
    filing.state === FilingState.Accepted ||
    filing.state === FilingState.Rejected

  if (isFiled) {
    return (
      <div className="tax-filing__filed">
        <div className="tax-filing__filed-card">
          <div
            className={`tax-filing__filed-icon ${
              filing.state === FilingState.Accepted
                ? 'tax-filing__filed-icon--success'
                : filing.state === FilingState.Rejected
                  ? 'tax-filing__filed-icon--danger'
                  : 'tax-filing__filed-icon--primary'
            }`}
          >
            {filing.state === FilingState.Accepted ? '&#10003;' : filing.state === FilingState.Rejected ? '!' : '...'}
          </div>
          <h2 className="tax-filing__filed-title">
            {filing.state === FilingState.Accepted
              ? 'Filing Accepted!'
              : filing.state === FilingState.Rejected
                ? 'Filing Rejected'
                : 'Filing Submitted'}
          </h2>
          <p className="tax-filing__filed-desc">
            {filing.state === FilingState.Accepted
              ? `Your ${activeTaxYear} tax return has been accepted by the IRS.`
              : filing.state === FilingState.Rejected
                ? 'There was an issue with your filing. Please review and resubmit.'
                : 'Your filing is being processed. This may take a few moments.'}
          </p>
          {filing.filedAt && (
            <p className="tax-filing__filed-date">
              Filed on{' '}
              {new Date(filing.filedAt).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
              })}
            </p>
          )}
          <div className="tax-filing__filed-summary">
            <div className="tax-filing__filed-row">
              <span>Total Income</span>
              <span>${filing.totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="tax-filing__filed-row">
              <span>Federal Tax</span>
              <span>${filing.federalTax.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="tax-filing__filed-row tax-filing__filed-row--highlight">
              <span>{filing.refundOrOwed < 0 ? 'Refund' : 'Amount Owed'}</span>
              <span
                className={
                  filing.refundOrOwed < 0
                    ? 'tax-filing__amount--refund'
                    : 'tax-filing__amount--owed'
                }
              >
                ${Math.abs(filing.refundOrOwed).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="tax-filing">
      <FilingWizard
        steps={WIZARD_STEPS}
        currentStep={currentStep}
        onStepChange={setCurrentStep}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
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
              Review your tax return summary before submitting.
            </p>

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
