import { useState, useCallback } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { useAccountingStore } from '../../stores/useAccountingStore'
import {
  TransactionType,
  TRANSACTION_TYPE_LABELS,
  ReconciliationStatus,
} from '../../types'
import type { Transaction } from '../../types'
import './TransactionForm.css'

interface TransactionFormProps {
  transaction?: Transaction
  onClose: () => void
}

interface JournalLine {
  accountId: string
  debit: string
  credit: string
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

function TransactionForm({ transaction, onClose }: TransactionFormProps) {
  const accounts = useAccountingStore((s) => s.accounts)
  const addTransaction = useAccountingStore((s) => s.addTransaction)
  const updateTransaction = useAccountingStore((s) => s.updateTransaction)

  const isEditing = !!transaction

  const [type, setType] = useState<TransactionType>(
    transaction?.type ?? TransactionType.Income
  )
  const [date, setDate] = useState(
    transaction?.date ?? (new Date().toISOString().split('T')[0] ?? '')
  )
  const [description, setDescription] = useState(
    transaction?.description ?? ''
  )
  const [reference, setReference] = useState(transaction?.reference ?? '')
  const [accountId, setAccountId] = useState(
    () => {
      if (!transaction) return 'acct-checking'
      const bankLine = transaction.lines.find(
        (l) => l.accountId.startsWith('acct-checking') || l.accountId.startsWith('acct-savings')
      )
      return bankLine?.accountId ?? 'acct-checking'
    }
  )
  const [amount, setAmount] = useState(
    () => {
      if (!transaction) return ''
      const total = transaction.lines.reduce(
        (sum, l) => sum + l.debit, 0
      )
      return total > 0 ? total.toString() : ''
    }
  )
  const [fromAccountId, setFromAccountId] = useState(
    () => {
      if (!transaction || transaction.type !== TransactionType.Transfer) return 'acct-checking'
      const creditLine = transaction.lines.find((l) => l.credit > 0)
      return creditLine?.accountId ?? 'acct-checking'
    }
  )
  const [toAccountId, setToAccountId] = useState(
    () => {
      if (!transaction || transaction.type !== TransactionType.Transfer) return 'acct-savings'
      const debitLine = transaction.lines.find((l) => l.debit > 0)
      return debitLine?.accountId ?? 'acct-savings'
    }
  )

  const [journalLines, setJournalLines] = useState<JournalLine[]>(
    () => {
      if (transaction?.type === TransactionType.JournalEntry) {
        return transaction.lines.map((l) => ({
          accountId: l.accountId,
          debit: l.debit > 0 ? l.debit.toString() : '',
          credit: l.credit > 0 ? l.credit.toString() : '',
        }))
      }
      return [
        { accountId: '', debit: '', credit: '' },
        { accountId: '', debit: '', credit: '' },
      ]
    }
  )

  const bankAccounts = accounts.filter(
    (a) => a.subType === 'checking' || a.subType === 'savings'
  )

  const totalDebits = journalLines.reduce(
    (sum, l) => sum + (parseFloat(l.debit) || 0), 0
  )
  const totalCredits = journalLines.reduce(
    (sum, l) => sum + (parseFloat(l.credit) || 0), 0
  )
  const isBalanced = Math.abs(totalDebits - totalCredits) < 0.01

  const handleTypeChange = useCallback((newType: TransactionType) => {
    setType(newType)
  }, [])

  const handleAddJournalLine = useCallback(() => {
    setJournalLines((prev) => [...prev, { accountId: '', debit: '', credit: '' }])
  }, [])

  const handleRemoveJournalLine = useCallback((index: number) => {
    setJournalLines((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const handleJournalLineChange = useCallback(
    (index: number, field: keyof JournalLine, value: string) => {
      setJournalLines((prev) =>
        prev.map((line, i) => (i === index ? { ...line, [field]: value } : line))
      )
    },
    []
  )

  const getAccountName = useCallback(
    (id: string) => accounts.find((a) => a.id === id)?.name ?? '',
    [accounts]
  )

  const handleSave = useCallback(() => {
    const parsedAmount = parseFloat(amount) || 0

    if (type === TransactionType.Income) {
      const expenseAccount = accounts.find(
        (a) => a.type === 'revenue'
      )
      const txn = {
        date,
        description,
        type,
        reference,
        reconciliationStatus: ReconciliationStatus.Unreconciled,
        contactId: null,
        lines: [
          {
            id: generateId(),
            accountId,
            accountName: getAccountName(accountId),
            debit: parsedAmount,
            credit: 0,
            description,
          },
          {
            id: generateId(),
            accountId: expenseAccount?.id ?? 'acct-service-rev',
            accountName: expenseAccount?.name ?? 'Service Revenue',
            debit: 0,
            credit: parsedAmount,
            description,
          },
        ],
      }
      if (isEditing) {
        updateTransaction(transaction.id, txn)
      } else {
        addTransaction(txn)
      }
    } else if (type === TransactionType.Expense) {
      const expAccount = accounts.find(
        (a) => a.type === 'expense'
      )
      const txn = {
        date,
        description,
        type,
        reference,
        reconciliationStatus: ReconciliationStatus.Unreconciled,
        contactId: null,
        lines: [
          {
            id: generateId(),
            accountId: expAccount?.id ?? 'acct-rent',
            accountName: expAccount?.name ?? 'Rent Expense',
            debit: parsedAmount,
            credit: 0,
            description,
          },
          {
            id: generateId(),
            accountId,
            accountName: getAccountName(accountId),
            debit: 0,
            credit: parsedAmount,
            description,
          },
        ],
      }
      if (isEditing) {
        updateTransaction(transaction.id, txn)
      } else {
        addTransaction(txn)
      }
    } else if (type === TransactionType.Transfer) {
      const txn = {
        date,
        description,
        type,
        reference,
        reconciliationStatus: ReconciliationStatus.Unreconciled,
        contactId: null,
        lines: [
          {
            id: generateId(),
            accountId: toAccountId,
            accountName: getAccountName(toAccountId),
            debit: parsedAmount,
            credit: 0,
            description: 'Transfer in',
          },
          {
            id: generateId(),
            accountId: fromAccountId,
            accountName: getAccountName(fromAccountId),
            debit: 0,
            credit: parsedAmount,
            description: 'Transfer out',
          },
        ],
      }
      if (isEditing) {
        updateTransaction(transaction.id, txn)
      } else {
        addTransaction(txn)
      }
    } else if (type === TransactionType.JournalEntry) {
      if (!isBalanced) return
      const txn = {
        date,
        description,
        type,
        reference,
        reconciliationStatus: ReconciliationStatus.Unreconciled,
        contactId: null,
        lines: journalLines
          .filter((l) => l.accountId)
          .map((l) => ({
            id: generateId(),
            accountId: l.accountId,
            accountName: getAccountName(l.accountId),
            debit: parseFloat(l.debit) || 0,
            credit: parseFloat(l.credit) || 0,
            description,
          })),
      }
      if (isEditing) {
        updateTransaction(transaction.id, txn)
      } else {
        addTransaction(txn)
      }
    }

    onClose()
  }, [
    type, date, description, reference, accountId, amount, fromAccountId,
    toAccountId, journalLines, isBalanced, accounts, getAccountName,
    addTransaction, updateTransaction, isEditing, transaction, onClose,
  ])

  return (
    <div className="modal-overlay" onClick={onClose} role="presentation">
      <div
        className="modal-content transaction-form"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label={isEditing ? 'Edit Transaction' : 'New Transaction'}
      >
        <div className="modal-header">
          <h2>{isEditing ? 'Edit Transaction' : 'New Transaction'}</h2>
          <button className="modal-close" onClick={onClose} type="button" aria-label="Close">
            &times;
          </button>
        </div>

        <div className="transaction-form__type-selector">
          {Object.entries(TRANSACTION_TYPE_LABELS).map(([value, label]) => (
            <button
              key={value}
              type="button"
              className={`transaction-form__type-btn ${
                type === value ? 'transaction-form__type-btn--active' : ''
              }`}
              onClick={() => handleTypeChange(value as TransactionType)}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="transaction-form__fields">
          <div className="transaction-form__row">
            <div className="transaction-form__field">
              <label htmlFor="txn-date" className="transaction-form__label">
                Date
              </label>
              <input
                id="txn-date"
                type="date"
                className="transaction-form__input"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="transaction-form__field">
              <label htmlFor="txn-reference" className="transaction-form__label">
                Reference
              </label>
              <input
                id="txn-reference"
                type="text"
                className="transaction-form__input"
                placeholder="e.g., INV-001"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
              />
            </div>
          </div>

          <div className="transaction-form__field">
            <label htmlFor="txn-description" className="transaction-form__label">
              Description
            </label>
            <input
              id="txn-description"
              type="text"
              className="transaction-form__input"
              placeholder="Transaction description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {(type === TransactionType.Income || type === TransactionType.Expense) && (
            <>
              <div className="transaction-form__row">
                <div className="transaction-form__field">
                  <label htmlFor="txn-account" className="transaction-form__label">
                    Bank Account
                  </label>
                  <select
                    id="txn-account"
                    className="transaction-form__select"
                    value={accountId}
                    onChange={(e) => setAccountId(e.target.value)}
                  >
                    {bankAccounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="transaction-form__field">
                  <label htmlFor="txn-amount" className="transaction-form__label">
                    Amount
                  </label>
                  <input
                    id="txn-amount"
                    type="number"
                    className="transaction-form__input"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
              </div>
            </>
          )}

          {type === TransactionType.Transfer && (
            <>
              <div className="transaction-form__row">
                <div className="transaction-form__field">
                  <label htmlFor="txn-from" className="transaction-form__label">
                    From Account
                  </label>
                  <select
                    id="txn-from"
                    className="transaction-form__select"
                    value={fromAccountId}
                    onChange={(e) => setFromAccountId(e.target.value)}
                  >
                    {bankAccounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="transaction-form__field">
                  <label htmlFor="txn-to" className="transaction-form__label">
                    To Account
                  </label>
                  <select
                    id="txn-to"
                    className="transaction-form__select"
                    value={toAccountId}
                    onChange={(e) => setToAccountId(e.target.value)}
                  >
                    {bankAccounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="transaction-form__field">
                <label htmlFor="txn-transfer-amount" className="transaction-form__label">
                  Amount
                </label>
                <input
                  id="txn-transfer-amount"
                  type="number"
                  className="transaction-form__input"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
            </>
          )}

          {type === TransactionType.JournalEntry && (
            <div className="transaction-form__journal">
              <div className="transaction-form__journal-header">
                <span>Account</span>
                <span>Debit</span>
                <span>Credit</span>
                <span />
              </div>
              {journalLines.map((line, index) => (
                <div key={index} className="transaction-form__journal-row">
                  <select
                    className="transaction-form__select"
                    value={line.accountId}
                    onChange={(e) =>
                      handleJournalLineChange(index, 'accountId', e.target.value)
                    }
                    aria-label={`Line ${index + 1} account`}
                  >
                    <option value="">Select account</option>
                    {accounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.code} - {a.name}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    className="transaction-form__input"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    value={line.debit}
                    onChange={(e) =>
                      handleJournalLineChange(index, 'debit', e.target.value)
                    }
                    aria-label={`Line ${index + 1} debit`}
                  />
                  <input
                    type="number"
                    className="transaction-form__input"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    value={line.credit}
                    onChange={(e) =>
                      handleJournalLineChange(index, 'credit', e.target.value)
                    }
                    aria-label={`Line ${index + 1} credit`}
                  />
                  <button
                    type="button"
                    className="transaction-form__remove-line"
                    onClick={() => handleRemoveJournalLine(index)}
                    aria-label={`Remove line ${index + 1}`}
                    disabled={journalLines.length <= 2}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="transaction-form__add-line"
                onClick={handleAddJournalLine}
              >
                <Plus size={14} />
                Add Line
              </button>
              <div className="transaction-form__journal-totals">
                <span className="transaction-form__journal-total-label">Totals</span>
                <span className="transaction-form__journal-total-value">
                  {totalDebits.toFixed(2)}
                </span>
                <span className="transaction-form__journal-total-value">
                  {totalCredits.toFixed(2)}
                </span>
                <span />
              </div>
              {!isBalanced && totalDebits + totalCredits > 0 && (
                <p className="transaction-form__balance-warning">
                  Debits and credits must be equal. Difference:{' '}
                  {Math.abs(totalDebits - totalCredits).toFixed(2)}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="transaction-form__actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={handleSave}
            disabled={
              type === TransactionType.JournalEntry && !isBalanced
            }
          >
            {isEditing ? 'Update' : 'Save'} Transaction
          </button>
        </div>
      </div>
    </div>
  )
}

export default TransactionForm
