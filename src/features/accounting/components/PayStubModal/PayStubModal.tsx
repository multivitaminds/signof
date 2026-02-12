import { usePayrollStore } from '../../stores/usePayrollStore'
import { formatCurrency } from '../../lib/formatCurrency'
import type { PayRun } from '../../types'
import { useCallback } from 'react'
import './PayStubModal.css'

interface PayStubModalProps {
  payRun: PayRun
  onClose: () => void
}

function PayStubModal({ payRun, onClose }: PayStubModalProps) {
  const getStubsByPayRun = usePayrollStore((s) => s.getStubsByPayRun)
  const stubs = getStubsByPayRun(payRun.id)

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
      <div className="pay-stub-modal" role="dialog" aria-label="Pay Stubs">
        <div className="pay-stub-modal__header">
          <h2 className="pay-stub-modal__title">
            Pay Stubs &mdash; {new Date(payRun.payDate).toLocaleDateString()}
          </h2>
          <button
            className="pay-stub-modal__close"
            onClick={onClose}
            type="button"
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        <div className="pay-stub-modal__body">
          {stubs.length === 0 ? (
            <p className="pay-stub-modal__empty">
              No pay stubs found for this pay run.
            </p>
          ) : (
            <div className="pay-stub-modal__stubs">
              {stubs.map((stub) => (
                <div key={stub.id} className="pay-stub-modal__card">
                  <div className="pay-stub-modal__card-header">
                    <span className="pay-stub-modal__employee-name">
                      {stub.employeeName}
                    </span>
                    <span className="pay-stub-modal__period">
                      {new Date(stub.payPeriodStart).toLocaleDateString()} &ndash;{' '}
                      {new Date(stub.payPeriodEnd).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="pay-stub-modal__details">
                    {/* Earnings */}
                    <div className="pay-stub-modal__section">
                      <span className="pay-stub-modal__section-label">
                        Earnings
                      </span>
                      <div className="pay-stub-modal__row">
                        <span>Gross Pay</span>
                        <span>{formatCurrency(stub.grossPay)}</span>
                      </div>
                    </div>

                    {/* Deductions */}
                    <div className="pay-stub-modal__section">
                      <span className="pay-stub-modal__section-label">
                        Deductions
                      </span>
                      <div className="pay-stub-modal__row">
                        <span>Federal Tax</span>
                        <span>{formatCurrency(stub.federalTax)}</span>
                      </div>
                      <div className="pay-stub-modal__row">
                        <span>State Tax</span>
                        <span>{formatCurrency(stub.stateTax)}</span>
                      </div>
                    </div>

                    {/* Net Pay */}
                    <div className="pay-stub-modal__net">
                      <span>Net Pay</span>
                      <span className="pay-stub-modal__net-amount">
                        {formatCurrency(stub.netPay)}
                      </span>
                    </div>

                    {/* YTD */}
                    <div className="pay-stub-modal__section">
                      <span className="pay-stub-modal__section-label">
                        Year-to-Date
                      </span>
                      <div className="pay-stub-modal__row">
                        <span>YTD Gross</span>
                        <span>{formatCurrency(stub.ytdGross)}</span>
                      </div>
                      <div className="pay-stub-modal__row">
                        <span>YTD Federal</span>
                        <span>{formatCurrency(stub.ytdFederalTax)}</span>
                      </div>
                      <div className="pay-stub-modal__row">
                        <span>YTD State</span>
                        <span>{formatCurrency(stub.ytdStateTax)}</span>
                      </div>
                      <div className="pay-stub-modal__row">
                        <span>YTD Net</span>
                        <span>{formatCurrency(stub.ytdNetPay)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="pay-stub-modal__footer">
          <button className="btn-secondary" onClick={onClose} type="button">
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default PayStubModal
