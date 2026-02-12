import { useState, useCallback } from 'react'
import { useExpenseStore } from '../../stores/useExpenseStore'
import { useAccountingContactStore } from '../../stores/useAccountingContactStore'
import { useAccountingStore } from '../../stores/useAccountingStore'
import { EXPENSE_CATEGORY_LABELS } from '../../types'
import type { Expense, ExpenseCategory } from '../../types'
import './ExpenseForm.css'

interface ExpenseFormProps {
  expense?: Expense
  onClose: () => void
}

function ExpenseForm({ expense, onClose }: ExpenseFormProps) {
  const addExpense = useExpenseStore((s) => s.addExpense)
  const updateExpense = useExpenseStore((s) => s.updateExpense)
  const vendors = useAccountingContactStore((s) => s.getVendors)()
  const accounts = useAccountingStore((s) => s.accounts)

  const today = new Date().toISOString().slice(0, 10)

  const [date, setDate] = useState(expense?.date ?? today)
  const [amount, setAmount] = useState(expense ? String(expense.amount) : '')
  const [vendorId, setVendorId] = useState(expense?.vendorId ?? '')
  const [vendorName, setVendorName] = useState(expense?.vendorName ?? '')
  const [categoryId, setCategoryId] = useState<ExpenseCategory>(
    expense?.categoryId ?? 'other'
  )
  const [description, setDescription] = useState(expense?.description ?? '')
  const [accountId, setAccountId] = useState(expense?.accountId ?? '')
  const [recurring, setRecurring] = useState(expense?.recurring ?? false)

  const handleVendorChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const val = e.target.value
      if (val === '__manual__') {
        setVendorId('')
        setVendorName('')
      } else {
        const vendor = vendors.find((v) => v.id === val)
        setVendorId(val)
        setVendorName(vendor?.company ?? vendor?.name ?? '')
      }
    },
    [vendors]
  )

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      const parsedAmount = parseFloat(amount)
      if (isNaN(parsedAmount) || parsedAmount <= 0) return

      const data = {
        date,
        amount: parsedAmount,
        vendorId: vendorId || null,
        vendorName,
        categoryId,
        description,
        accountId,
        receipt: expense?.receipt ?? null,
        recurring,
      }

      if (expense) {
        updateExpense(expense.id, data)
      } else {
        addExpense(data)
      }
      onClose()
    },
    [
      date, amount, vendorId, vendorName, categoryId,
      description, accountId, recurring, expense,
      addExpense, updateExpense, onClose,
    ]
  )

  return (
    <div className="modal-overlay" onClick={onClose} role="presentation">
      <div
        className="modal-content expense-form"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label={expense ? 'Edit Expense' : 'Add Expense'}
      >
        <div className="modal-header">
          <h2>{expense ? 'Edit Expense' : 'Add Expense'}</h2>
          <button className="modal-close" onClick={onClose} type="button" aria-label="Close">
            &times;
          </button>
        </div>

        <form className="expense-form__body" onSubmit={handleSubmit}>
          {/* Date */}
          <div className="expense-form__field">
            <label className="expense-form__label" htmlFor="expense-date">
              Date
            </label>
            <input
              id="expense-date"
              className="expense-form__input"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          {/* Amount */}
          <div className="expense-form__field">
            <label className="expense-form__label" htmlFor="expense-amount">
              Amount
            </label>
            <input
              id="expense-amount"
              className="expense-form__input"
              type="number"
              min="0.01"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          {/* Vendor */}
          <div className="expense-form__field">
            <label className="expense-form__label" htmlFor="expense-vendor">
              Vendor
            </label>
            <select
              id="expense-vendor"
              className="expense-form__select"
              value={vendorId || '__manual__'}
              onChange={handleVendorChange}
            >
              <option value="__manual__">Enter manually</option>
              {vendors.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.company || v.name}
                </option>
              ))}
            </select>
            {!vendorId && (
              <input
                className="expense-form__input expense-form__input--mt"
                type="text"
                placeholder="Vendor name"
                value={vendorName}
                onChange={(e) => setVendorName(e.target.value)}
                aria-label="Vendor name"
              />
            )}
          </div>

          {/* Category */}
          <div className="expense-form__field">
            <label className="expense-form__label" htmlFor="expense-category">
              Category
            </label>
            <select
              id="expense-category"
              className="expense-form__select"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value as ExpenseCategory)}
            >
              {Object.entries(EXPENSE_CATEGORY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div className="expense-form__field">
            <label className="expense-form__label" htmlFor="expense-description">
              Description
            </label>
            <textarea
              id="expense-description"
              className="expense-form__textarea"
              placeholder="What was this expense for?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          {/* Account */}
          <div className="expense-form__field">
            <label className="expense-form__label" htmlFor="expense-account">
              Account
            </label>
            <select
              id="expense-account"
              className="expense-form__select"
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
            >
              <option value="">Select account</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.code} - {a.name}
                </option>
              ))}
            </select>
          </div>

          {/* Recurring */}
          <div className="expense-form__field expense-form__field--row">
            <input
              id="expense-recurring"
              type="checkbox"
              checked={recurring}
              onChange={(e) => setRecurring(e.target.checked)}
            />
            <label className="expense-form__label" htmlFor="expense-recurring">
              Recurring expense
            </label>
          </div>

          {/* Receipt Drop Zone */}
          <div className="expense-form__drop-zone">
            <span className="expense-form__drop-text">Drop receipt here</span>
          </div>

          {/* Actions */}
          <div className="expense-form__actions">
            <button className="btn-secondary" type="button" onClick={onClose}>
              Cancel
            </button>
            <button className="btn-primary" type="submit">
              {expense ? 'Save Changes' : 'Add Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ExpenseForm
