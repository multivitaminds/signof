import { useState, useCallback, useMemo } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { useInvoiceStore } from '../../stores/useInvoiceStore'
import { useAccountingContactStore } from '../../stores/useAccountingContactStore'
import { PaymentTerms, PAYMENT_TERMS_LABELS, PAYMENT_TERMS_DAYS } from '../../types'
import type { InvoiceLineItem, Invoice } from '../../types'
import { formatCurrency } from '../../lib/formatCurrency'
import './InvoiceBuilder.css'

function generateLineId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0] ?? ''
}

function addDays(dateStr: string, days: number): string {
  const date = new Date(dateStr + 'T00:00:00')
  date.setDate(date.getDate() + days)
  return formatDate(date)
}

interface InvoiceBuilderProps {
  invoice?: Invoice
  onClose: () => void
}

function InvoiceBuilder({ invoice, onClose }: InvoiceBuilderProps) {
  const addInvoice = useInvoiceStore((s) => s.addInvoice)
  const updateInvoice = useInvoiceStore((s) => s.updateInvoice)
  const sendInvoice = useInvoiceStore((s) => s.sendInvoice)
  const nextInvoiceNumber = useInvoiceStore((s) => s.nextInvoiceNumber)
  const getCustomers = useAccountingContactStore((s) => s.getCustomers)
  const getContactById = useAccountingContactStore((s) => s.getContactById)

  const customers = useMemo(() => getCustomers(), [getCustomers])

  const [customerId, setCustomerId] = useState(invoice?.customerId ?? '')
  const [issueDate, setIssueDate] = useState(invoice?.issueDate ?? formatDate(new Date()))
  const [paymentTerms, setPaymentTerms] = useState<PaymentTerms>(
    invoice?.paymentTerms ?? PaymentTerms.Net30
  )
  const [lineItems, setLineItems] = useState<InvoiceLineItem[]>(
    invoice?.lineItems ?? [
      { id: generateLineId(), description: '', quantity: 1, rate: 0, amount: 0 },
    ]
  )
  const [taxRate, setTaxRate] = useState(invoice?.taxRate ?? 0)
  const [discount, setDiscount] = useState(invoice?.discount ?? 0)
  const [notes, setNotes] = useState(invoice?.notes ?? '')

  const dueDate = useMemo(
    () => addDays(issueDate, PAYMENT_TERMS_DAYS[paymentTerms]),
    [issueDate, paymentTerms]
  )

  const invoiceNumber = invoice?.invoiceNumber ?? `INV-${String(nextInvoiceNumber).padStart(4, '0')}`

  const subtotal = useMemo(
    () => lineItems.reduce((sum, item) => sum + item.amount, 0),
    [lineItems]
  )

  const taxAmount = useMemo(
    () => Math.round(subtotal * (taxRate / 100) * 100) / 100,
    [subtotal, taxRate]
  )

  const total = useMemo(
    () => subtotal + taxAmount - discount,
    [subtotal, taxAmount, discount]
  )

  const handleLineItemChange = useCallback(
    (id: string, field: keyof InvoiceLineItem, value: string | number) => {
      setLineItems((prev) =>
        prev.map((item) => {
          if (item.id !== id) return item
          const updated = { ...item, [field]: value }
          if (field === 'quantity' || field === 'rate') {
            updated.amount = Math.round(updated.quantity * updated.rate * 100) / 100
          }
          return updated
        })
      )
    },
    []
  )

  const handleAddLineItem = useCallback(() => {
    setLineItems((prev) => [
      ...prev,
      { id: generateLineId(), description: '', quantity: 1, rate: 0, amount: 0 },
    ])
  }, [])

  const handleRemoveLineItem = useCallback((id: string) => {
    setLineItems((prev) => (prev.length <= 1 ? prev : prev.filter((item) => item.id !== id)))
  }, [])

  const buildInvoiceData = useCallback(() => {
    const customer = getContactById(customerId)
    return {
      customerId,
      customerName: customer?.name ?? customer?.company ?? '',
      issueDate,
      dueDate,
      paymentTerms,
      status: 'draft' as const,
      lineItems,
      subtotal,
      taxRate,
      taxAmount,
      discount,
      total,
      amountPaid: invoice?.amountPaid ?? 0,
      balance: total - (invoice?.amountPaid ?? 0),
      notes,
    }
  }, [customerId, getContactById, issueDate, dueDate, paymentTerms, lineItems, subtotal, taxRate, taxAmount, discount, total, invoice, notes])

  const handleSaveDraft = useCallback(() => {
    const data = buildInvoiceData()
    if (invoice) {
      updateInvoice(invoice.id, data)
    } else {
      addInvoice(data)
    }
    onClose()
  }, [buildInvoiceData, invoice, updateInvoice, addInvoice, onClose])

  const handleSendInvoice = useCallback(() => {
    const data = buildInvoiceData()
    if (invoice) {
      updateInvoice(invoice.id, data)
      sendInvoice(invoice.id)
    } else {
      const newInvoice = addInvoice(data)
      sendInvoice(newInvoice.id)
    }
    onClose()
  }, [buildInvoiceData, invoice, updateInvoice, addInvoice, sendInvoice, onClose])

  return (
    <div className="invoice-builder__overlay" onClick={onClose} role="presentation">
      <div
        className="invoice-builder__modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Invoice Builder"
      >
        <div className="invoice-builder__header">
          <h2 className="invoice-builder__title">
            {invoice ? `Edit ${invoice.invoiceNumber}` : 'New Invoice'}
          </h2>
          <button
            className="invoice-builder__close"
            onClick={onClose}
            type="button"
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        <div className="invoice-builder__body">
          {/* Invoice Meta */}
          <div className="invoice-builder__meta">
            <div className="invoice-builder__field">
              <label className="invoice-builder__label">Invoice #</label>
              <input
                className="invoice-builder__input"
                type="text"
                value={invoiceNumber}
                readOnly
                aria-label="Invoice number"
              />
            </div>

            <div className="invoice-builder__field">
              <label className="invoice-builder__label" htmlFor="ib-customer">
                Customer
              </label>
              <select
                id="ib-customer"
                className="invoice-builder__select"
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
              >
                <option value="">Select customer...</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.company ? `${c.company} (${c.name})` : c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="invoice-builder__field">
              <label className="invoice-builder__label" htmlFor="ib-issue-date">
                Issue Date
              </label>
              <input
                id="ib-issue-date"
                className="invoice-builder__input"
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
              />
            </div>

            <div className="invoice-builder__field">
              <label className="invoice-builder__label" htmlFor="ib-terms">
                Payment Terms
              </label>
              <select
                id="ib-terms"
                className="invoice-builder__select"
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value as PaymentTerms)}
              >
                {(Object.keys(PAYMENT_TERMS_LABELS) as PaymentTerms[]).map((key) => (
                  <option key={key} value={key}>
                    {PAYMENT_TERMS_LABELS[key]}
                  </option>
                ))}
              </select>
            </div>

            <div className="invoice-builder__field">
              <label className="invoice-builder__label">Due Date</label>
              <input
                className="invoice-builder__input"
                type="date"
                value={dueDate}
                readOnly
                aria-label="Due date"
              />
            </div>
          </div>

          {/* Line Items */}
          <div className="invoice-builder__line-items">
            <h3 className="invoice-builder__section-title">Line Items</h3>
            <table className="invoice-builder__items-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Qty</th>
                  <th>Rate</th>
                  <th>Amount</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {lineItems.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <input
                        className="invoice-builder__input"
                        type="text"
                        value={item.description}
                        onChange={(e) =>
                          handleLineItemChange(item.id, 'description', e.target.value)
                        }
                        placeholder="Description"
                        aria-label="Line item description"
                      />
                    </td>
                    <td>
                      <input
                        className="invoice-builder__input invoice-builder__input--number"
                        type="number"
                        min={0}
                        step={1}
                        value={item.quantity}
                        onChange={(e) =>
                          handleLineItemChange(item.id, 'quantity', parseFloat(e.target.value) || 0)
                        }
                        aria-label="Quantity"
                      />
                    </td>
                    <td>
                      <input
                        className="invoice-builder__input invoice-builder__input--number"
                        type="number"
                        min={0}
                        step={0.01}
                        value={item.rate}
                        onChange={(e) =>
                          handleLineItemChange(item.id, 'rate', parseFloat(e.target.value) || 0)
                        }
                        aria-label="Rate"
                      />
                    </td>
                    <td className="invoice-builder__cell--amount">
                      {formatCurrency(item.amount)}
                    </td>
                    <td>
                      <button
                        className="invoice-builder__remove-btn"
                        onClick={() => handleRemoveLineItem(item.id)}
                        type="button"
                        aria-label="Remove line item"
                        disabled={lineItems.length <= 1}
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button
              className="invoice-builder__add-line-btn"
              onClick={handleAddLineItem}
              type="button"
            >
              <Plus size={14} />
              Add Line Item
            </button>
          </div>

          {/* Footer Calculations */}
          <div className="invoice-builder__totals">
            <div className="invoice-builder__total-row">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="invoice-builder__total-row">
              <span className="invoice-builder__total-row-input">
                <label htmlFor="ib-tax-rate">Tax Rate (%)</label>
                <input
                  id="ib-tax-rate"
                  className="invoice-builder__input invoice-builder__input--number invoice-builder__input--small"
                  type="number"
                  min={0}
                  max={100}
                  step={0.01}
                  value={taxRate}
                  onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                />
              </span>
              <span>{formatCurrency(taxAmount)}</span>
            </div>
            <div className="invoice-builder__total-row">
              <span className="invoice-builder__total-row-input">
                <label htmlFor="ib-discount">Discount ($)</label>
                <input
                  id="ib-discount"
                  className="invoice-builder__input invoice-builder__input--number invoice-builder__input--small"
                  type="number"
                  min={0}
                  step={0.01}
                  value={discount}
                  onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                />
              </span>
              <span>({formatCurrency(discount)})</span>
            </div>
            <div className="invoice-builder__total-row invoice-builder__total-row--total">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>

          {/* Notes */}
          <div className="invoice-builder__field">
            <label className="invoice-builder__label" htmlFor="ib-notes">
              Notes
            </label>
            <textarea
              id="ib-notes"
              className="invoice-builder__textarea"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Payment instructions or notes for the customer..."
            />
          </div>
        </div>

        {/* Actions */}
        <div className="invoice-builder__footer">
          <button
            className="btn-secondary"
            onClick={onClose}
            type="button"
          >
            Cancel
          </button>
          <div className="invoice-builder__footer-actions">
            <button
              className="btn-secondary"
              onClick={handleSaveDraft}
              type="button"
            >
              Save as Draft
            </button>
            <button
              className="btn-primary"
              onClick={handleSendInvoice}
              type="button"
            >
              Send Invoice
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InvoiceBuilder
