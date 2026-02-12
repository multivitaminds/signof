import { useState, useCallback, useMemo } from 'react'
import { usePayrollStore } from '../../stores/usePayrollStore'
import { PAY_FREQUENCY_LABELS } from '../../types'
import { formatCurrency } from '../../lib/formatCurrency'
import './PayRunWizard.css'

interface PayRunWizardProps {
  onClose: () => void
}

const PERIODS_PER_YEAR: Record<string, number> = {
  weekly: 52,
  biweekly: 26,
  semimonthly: 24,
  monthly: 12,
}

function PayRunWizard({ onClose }: PayRunWizardProps) {
  const employees = usePayrollStore((s) => s.employees)
  const createPayRun = usePayrollStore((s) => s.createPayRun)
  const processPayRun = usePayrollStore((s) => s.processPayRun)

  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<string[]>([])
  const [payDate, setPayDate] = useState(
    new Date().toISOString().split('T')[0] ?? ''
  )
  const [processing, setProcessing] = useState(false)
  const [completed, setCompleted] = useState(false)

  const activeEmployees = useMemo(
    () => employees.filter((e) => e.status === 'active'),
    [employees]
  )

  const selectedEmployees = useMemo(
    () => activeEmployees.filter((e) => selectedEmployeeIds.includes(e.id)),
    [activeEmployees, selectedEmployeeIds]
  )

  const payrollBreakdown = useMemo(() => {
    return selectedEmployees.map((emp) => {
      const periods = PERIODS_PER_YEAR[emp.payFrequency] ?? 12
      const gross = emp.payRate / periods
      const federalTax = gross * emp.federalWithholding
      const stateTax = gross * emp.stateWithholding
      const net = gross - federalTax - stateTax
      return {
        employee: emp,
        gross: Math.round(gross * 100) / 100,
        federalTax: Math.round(federalTax * 100) / 100,
        stateTax: Math.round(stateTax * 100) / 100,
        net: Math.round(net * 100) / 100,
      }
    })
  }, [selectedEmployees])

  const totals = useMemo(() => {
    const totalGross = payrollBreakdown.reduce((sum, r) => sum + r.gross, 0)
    const totalFederalTax = payrollBreakdown.reduce(
      (sum, r) => sum + r.federalTax,
      0
    )
    const totalStateTax = payrollBreakdown.reduce(
      (sum, r) => sum + r.stateTax,
      0
    )
    const totalNet = payrollBreakdown.reduce((sum, r) => sum + r.net, 0)
    return { totalGross, totalFederalTax, totalStateTax, totalNet }
  }, [payrollBreakdown])

  const handleToggleEmployee = useCallback((id: string) => {
    setSelectedEmployeeIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }, [])

  const handleSelectAll = useCallback(() => {
    if (selectedEmployeeIds.length === activeEmployees.length) {
      setSelectedEmployeeIds([])
    } else {
      setSelectedEmployeeIds(activeEmployees.map((e) => e.id))
    }
  }, [selectedEmployeeIds.length, activeEmployees])

  const handleNext = useCallback(() => {
    setStep((prev) => Math.min(prev + 1, 3) as 1 | 2 | 3)
  }, [])

  const handleBack = useCallback(() => {
    setStep((prev) => Math.max(prev - 1, 1) as 1 | 2 | 3)
  }, [])

  const handleProcess = useCallback(async () => {
    setProcessing(true)
    const payRun = createPayRun(payDate, selectedEmployeeIds)
    await processPayRun(payRun.id)
    setProcessing(false)
    setCompleted(true)
  }, [createPayRun, processPayRun, payDate, selectedEmployeeIds])

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) onClose()
    },
    [onClose]
  )

  return (
    <div
      className="modal-overlay"
      onClick={handleOverlayClick}
      role="presentation"
    >
      <div className="pay-run-wizard" role="dialog" aria-label="Run Payroll">
        {/* Step Indicator */}
        <div className="pay-run-wizard__steps">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`pay-run-wizard__step ${
                s === step
                  ? 'pay-run-wizard__step--active'
                  : s < step
                    ? 'pay-run-wizard__step--done'
                    : ''
              }`}
            >
              <span className="pay-run-wizard__step-number">{s}</span>
              <span className="pay-run-wizard__step-label">
                {s === 1 ? 'Select' : s === 2 ? 'Review' : 'Confirm'}
              </span>
            </div>
          ))}
        </div>

        <div className="pay-run-wizard__header">
          <h2 className="pay-run-wizard__title">
            {step === 1 && 'Select Employees'}
            {step === 2 && 'Review & Adjust'}
            {step === 3 && 'Confirm & Process'}
          </h2>
        </div>

        <div className="pay-run-wizard__body">
          {/* Step 1 - Select Employees */}
          {step === 1 && (
            <div className="pay-run-wizard__employee-list">
              {activeEmployees.length === 0 ? (
                <p className="pay-run-wizard__empty">
                  No active employees found.
                </p>
              ) : (
                <>
                  <label className="pay-run-wizard__select-all">
                    <input
                      type="checkbox"
                      checked={
                        selectedEmployeeIds.length === activeEmployees.length &&
                        activeEmployees.length > 0
                      }
                      onChange={handleSelectAll}
                    />
                    <span>Select All</span>
                  </label>
                  {activeEmployees.map((emp) => (
                    <label key={emp.id} className="pay-run-wizard__employee-row">
                      <input
                        type="checkbox"
                        checked={selectedEmployeeIds.includes(emp.id)}
                        onChange={() => handleToggleEmployee(emp.id)}
                      />
                      <span className="pay-run-wizard__employee-name">
                        {emp.firstName} {emp.lastName}
                      </span>
                      <span className="pay-run-wizard__employee-rate">
                        {formatCurrency(emp.payRate)}/yr
                      </span>
                      <span className="pay-run-wizard__employee-freq">
                        {PAY_FREQUENCY_LABELS[emp.payFrequency]}
                      </span>
                    </label>
                  ))}
                </>
              )}
            </div>
          )}

          {/* Step 2 - Review */}
          {step === 2 && (
            <div className="pay-run-wizard__review">
              <label className="pay-run-wizard__date-field">
                <span className="pay-run-wizard__date-label">Pay Date</span>
                <input
                  className="pay-run-wizard__date-input"
                  type="date"
                  value={payDate}
                  onChange={(e) => setPayDate(e.target.value)}
                />
              </label>

              <div className="pay-run-wizard__table-wrapper">
                <table className="pay-run-wizard__table">
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Gross Pay</th>
                      <th>Federal Tax</th>
                      <th>State Tax</th>
                      <th>Net Pay</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payrollBreakdown.map((row) => (
                      <tr key={row.employee.id}>
                        <td className="pay-run-wizard__cell--name">
                          {row.employee.firstName} {row.employee.lastName}
                        </td>
                        <td>{formatCurrency(row.gross)}</td>
                        <td>{formatCurrency(row.federalTax)}</td>
                        <td>{formatCurrency(row.stateTax)}</td>
                        <td className="pay-run-wizard__cell--net">
                          {formatCurrency(row.net)}
                        </td>
                      </tr>
                    ))}
                    <tr className="pay-run-wizard__totals-row">
                      <td className="pay-run-wizard__cell--name">Totals</td>
                      <td>{formatCurrency(totals.totalGross)}</td>
                      <td>{formatCurrency(totals.totalFederalTax)}</td>
                      <td>{formatCurrency(totals.totalStateTax)}</td>
                      <td className="pay-run-wizard__cell--net">
                        {formatCurrency(totals.totalNet)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Step 3 - Confirm */}
          {step === 3 && (
            <div className="pay-run-wizard__confirm">
              {completed ? (
                <div className="pay-run-wizard__success">
                  <div className="pay-run-wizard__checkmark">&#10003;</div>
                  <p className="pay-run-wizard__success-text">
                    Payroll processed successfully!
                  </p>
                </div>
              ) : processing ? (
                <div className="pay-run-wizard__processing">
                  <div className="pay-run-wizard__spinner" />
                  <p className="pay-run-wizard__processing-text">
                    Processing payroll...
                  </p>
                </div>
              ) : (
                <>
                  <div className="pay-run-wizard__summary">
                    <div className="pay-run-wizard__summary-row">
                      <span>Total Gross</span>
                      <span>{formatCurrency(totals.totalGross)}</span>
                    </div>
                    <div className="pay-run-wizard__summary-row">
                      <span>Total Taxes</span>
                      <span>
                        {formatCurrency(
                          totals.totalFederalTax + totals.totalStateTax
                        )}
                      </span>
                    </div>
                    <div className="pay-run-wizard__summary-row pay-run-wizard__summary-row--highlight">
                      <span>Total Net</span>
                      <span>{formatCurrency(totals.totalNet)}</span>
                    </div>
                    <div className="pay-run-wizard__summary-row">
                      <span>Employee Count</span>
                      <span>{selectedEmployees.length}</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pay-run-wizard__footer">
          {completed ? (
            <button className="btn-primary" onClick={onClose} type="button">
              Close
            </button>
          ) : processing ? null : (
            <>
              {step > 1 && (
                <button
                  className="btn-secondary"
                  onClick={handleBack}
                  type="button"
                >
                  Back
                </button>
              )}
              {step === 1 && (
                <button
                  className="btn-secondary"
                  onClick={onClose}
                  type="button"
                >
                  Cancel
                </button>
              )}
              <div className="pay-run-wizard__footer-spacer" />
              {step < 3 && (
                <button
                  className="btn-primary"
                  onClick={handleNext}
                  type="button"
                  disabled={step === 1 && selectedEmployeeIds.length === 0}
                >
                  Next
                </button>
              )}
              {step === 3 && (
                <button
                  className="btn-primary"
                  onClick={handleProcess}
                  type="button"
                >
                  Process Payroll
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default PayRunWizard
