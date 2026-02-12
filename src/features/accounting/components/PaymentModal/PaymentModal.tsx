import { useState, useCallback } from 'react'
import { useInvoiceStore } from '../../stores/useInvoiceStore'
import type { Invoice } from '../../types'
import { formatCurrency } from '../../lib/formatCurrency'
import './PaymentModal.css'

const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash' },
  { value: 'check', label: 'Check' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'other', label: 'Other' },
] as const

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0] ?? ''
}

interface PaymentModalProps {
  invoice: Invoice
  onClose: () => void
}

function PaymentModal({ invoice, onClose }: PaymentModalProps) {
  const recordPayment = useInvoiceStore((s) => s.recordPayment)

  const [amount, setAmount] = useState(String(invoice.balance))
  const [date, setDate] = useState(formatDate(new Date()))
  const [method, setMethod] = useState('bank_transfer')
  const [reference, setReference] = useState('')

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      const parsedAmount = parseFloat(amount)
      if (isNaN(parsedAmount) || parsedAmount <= 0) return
      recordPayment(invoice.id, parsedAmount)
      onClose()
    },
    [amount, invoice.id, recordPayment, onClose]
  )

  return (
    <div className="payment-modal__overlay" onClick={onClose} role="presentation">
      <div
        className="payment-modal__dialog"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Record Payment"
      >
        <div className="payment-modal__header">
          <h2 className="payment-modal__title">Record Payment</h2>
          <button
            className="payment-modal__close"
            onClick={onClose}
            type="button"
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        <form className="payment-modal__body" onSubmit={handleSubmit}>
          <div className="payment-modal__invoice-info">
            <span className="payment-modal__invoice-label">{invoice.invoiceNumber}</span>
            <span className="payment-modal__invoice-detail">
              {invoice.customerName} &mdash; Balance: {formatCurrency(invoice.balance)}
            </span>
          </div>

          <div className="payment-modal__field">
            <label className="payment-modal__label" htmlFor="pm-amount">
              Payment Amount
            </label>
            <input
              id="pm-amount"
              className="payment-modal__input"
              type="number"
              min={0.01}
              max={invoice.balance}
              step={0.01}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <div className="payment-modal__field">
            <label className="payment-modal__label" htmlFor="pm-date">
              Payment Date
            </label>
            <input
              id="pm-date"
              className="payment-modal__input"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div className="payment-modal__field">
            <label className="payment-modal__label" htmlFor="pm-method">
              Payment Method
            </label>
            <select
              id="pm-method"
              className="payment-modal__select"
              value={method}
              onChange={(e) => setMethod(e.target.value)}
            >
              {PAYMENT_METHODS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          <div className="payment-modal__field">
            <label className="payment-modal__label" htmlFor="pm-reference">
              Reference / Notes
            </label>
            <input
              id="pm-reference"
              className="payment-modal__input"
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="Check number, transaction ID, etc."
            />
          </div>

          <div className="payment-modal__footer">
            <button className="btn-secondary" type="button" onClick={onClose}>
              Cancel
            </button>
            <button className="btn-primary" type="submit">
              Record Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default PaymentModal
