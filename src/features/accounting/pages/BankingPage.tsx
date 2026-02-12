import { useState, useCallback, useMemo } from 'react'
import { Plus, Upload, Search, Pencil, Trash2, Check } from 'lucide-react'
import { useAccountingStore } from '../stores/useAccountingStore'
import { TRANSACTION_TYPE_LABELS, ReconciliationStatus } from '../types'
import type { Transaction, TransactionType } from '../types'
import { formatCurrency } from '../lib/formatCurrency'
import TransactionForm from '../components/TransactionForm/TransactionForm'
import CsvImportModal from '../components/CsvImportModal/CsvImportModal'
import './BankingPage.css'

function BankingPage() {
  const accounts = useAccountingStore((s) => s.accounts)
  const transactions = useAccountingStore((s) => s.transactions)
  const updateTransaction = useAccountingStore((s) => s.updateTransaction)
  const deleteTransaction = useAccountingStore((s) => s.deleteTransaction)

  const [selectedAccountId, setSelectedAccountId] = useState('acct-checking')
  const [typeFilter, setTypeFilter] = useState<'all' | TransactionType>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [dateStart, setDateStart] = useState('')
  const [dateEnd, setDateEnd] = useState('')
  const [showTransactionForm, setShowTransactionForm] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [showCsvImport, setShowCsvImport] = useState(false)

  const bankAccounts = useMemo(
    () => accounts.filter((a) => a.subType === 'checking' || a.subType === 'savings'),
    [accounts]
  )

  const selectedAccount = useMemo(
    () => accounts.find((a) => a.id === selectedAccountId),
    [accounts, selectedAccountId]
  )

  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((t) => t.lines.some((l) => l.accountId === selectedAccountId))
      .filter((t) => typeFilter === 'all' || t.type === typeFilter)
      .filter((t) => {
        if (!searchQuery) return true
        const q = searchQuery.toLowerCase()
        return (
          t.description.toLowerCase().includes(q) ||
          t.reference.toLowerCase().includes(q)
        )
      })
      .filter((t) => {
        if (dateStart && t.date < dateStart) return false
        if (dateEnd && t.date > dateEnd) return false
        return true
      })
      .sort((a, b) => b.date.localeCompare(a.date))
  }, [transactions, selectedAccountId, typeFilter, searchQuery, dateStart, dateEnd])

  const getTransactionAmount = useCallback(
    (transaction: Transaction): number => {
      let amount = 0
      for (const line of transaction.lines) {
        if (line.accountId === selectedAccountId) {
          amount += line.debit - line.credit
        }
      }
      return amount
    },
    [selectedAccountId]
  )

  const handleAccountChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setSelectedAccountId(e.target.value)
    },
    []
  )

  const handleTypeFilterChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setTypeFilter(e.target.value as 'all' | TransactionType)
    },
    []
  )

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value)
    },
    []
  )

  const handleDateStartChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setDateStart(e.target.value)
    },
    []
  )

  const handleDateEndChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setDateEnd(e.target.value)
    },
    []
  )

  const handleAddTransaction = useCallback(() => {
    setEditingTransaction(null)
    setShowTransactionForm(true)
  }, [])

  const handleEditTransaction = useCallback((transaction: Transaction) => {
    setEditingTransaction(transaction)
    setShowTransactionForm(true)
  }, [])

  const handleCloseForm = useCallback(() => {
    setShowTransactionForm(false)
    setEditingTransaction(null)
  }, [])

  const handleDeleteTransaction = useCallback(
    (id: string) => {
      deleteTransaction(id)
    },
    [deleteTransaction]
  )

  const handleToggleReconciled = useCallback(
    (transaction: Transaction) => {
      const newStatus =
        transaction.reconciliationStatus === ReconciliationStatus.Reconciled
          ? ReconciliationStatus.Unreconciled
          : ReconciliationStatus.Reconciled
      updateTransaction(transaction.id, { reconciliationStatus: newStatus })
    },
    [updateTransaction]
  )

  const handleOpenCsvImport = useCallback(() => {
    setShowCsvImport(true)
  }, [])

  const handleCloseCsvImport = useCallback(() => {
    setShowCsvImport(false)
  }, [])

  const typeBadgeClass = (type: TransactionType): string => {
    switch (type) {
      case 'income':
        return 'banking__type-badge--income'
      case 'expense':
        return 'banking__type-badge--expense'
      case 'transfer':
        return 'banking__type-badge--transfer'
      case 'journal_entry':
        return 'banking__type-badge--journal'
      default:
        return ''
    }
  }

  return (
    <div className="banking">
      <div className="banking__header">
        <h1 className="banking__title">Banking &amp; Transactions</h1>
        <div className="banking__header-actions">
          <button
            className="btn-primary banking__add-btn"
            onClick={handleAddTransaction}
            type="button"
          >
            <Plus size={16} />
            Add Transaction
          </button>
          <button
            className="btn-secondary banking__import-btn"
            onClick={handleOpenCsvImport}
            type="button"
          >
            <Upload size={16} />
            Import CSV
          </button>
        </div>
      </div>

      <div className="banking__account-selector">
        <div className="banking__account-dropdown">
          <label htmlFor="bank-account-select" className="banking__label">
            Account
          </label>
          <select
            id="bank-account-select"
            className="banking__select"
            value={selectedAccountId}
            onChange={handleAccountChange}
          >
            {bankAccounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name}
              </option>
            ))}
          </select>
        </div>
        {selectedAccount && (
          <div className="banking__account-balance">
            <span className="banking__balance-label">Balance</span>
            <span className="banking__balance-value">
              {formatCurrency(selectedAccount.balance)}
            </span>
          </div>
        )}
      </div>

      <div className="banking__filters">
        <div className="banking__filter-group">
          <label htmlFor="date-start" className="banking__label">
            From
          </label>
          <input
            id="date-start"
            type="date"
            className="banking__input"
            value={dateStart}
            onChange={handleDateStartChange}
          />
        </div>
        <div className="banking__filter-group">
          <label htmlFor="date-end" className="banking__label">
            To
          </label>
          <input
            id="date-end"
            type="date"
            className="banking__input"
            value={dateEnd}
            onChange={handleDateEndChange}
          />
        </div>
        <div className="banking__filter-group">
          <label htmlFor="type-filter" className="banking__label">
            Type
          </label>
          <select
            id="type-filter"
            className="banking__select"
            value={typeFilter}
            onChange={handleTypeFilterChange}
          >
            <option value="all">All Types</option>
            {Object.entries(TRANSACTION_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div className="banking__filter-group banking__filter-group--search">
          <label htmlFor="search-input" className="banking__label">
            Search
          </label>
          <div className="banking__search-wrapper">
            <Search size={14} className="banking__search-icon" />
            <input
              id="search-input"
              type="text"
              className="banking__input banking__input--search"
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
        </div>
      </div>

      <div className="banking__table-wrapper">
        <table className="banking__table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Type</th>
              <th>Reference</th>
              <th className="banking__th--right">Amount</th>
              <th className="banking__th--center">Reconciled</th>
              <th className="banking__th--right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan={7} className="banking__empty">
                  No transactions found for this account.
                </td>
              </tr>
            ) : (
              filteredTransactions.map((transaction) => {
                const amount = getTransactionAmount(transaction)
                const isPositive = amount >= 0
                return (
                  <tr key={transaction.id} className="banking__row">
                    <td className="banking__cell--date">{transaction.date}</td>
                    <td className="banking__cell--desc">
                      {transaction.description}
                    </td>
                    <td>
                      <span
                        className={`banking__type-badge ${typeBadgeClass(transaction.type)}`}
                      >
                        {TRANSACTION_TYPE_LABELS[transaction.type]}
                      </span>
                    </td>
                    <td className="banking__cell--ref">
                      {transaction.reference}
                    </td>
                    <td
                      className={`banking__cell--amount ${
                        isPositive
                          ? 'banking__cell--positive'
                          : 'banking__cell--negative'
                      }`}
                    >
                      {formatCurrency(amount)}
                    </td>
                    <td className="banking__cell--reconciled">
                      <button
                        className={`banking__reconcile-btn ${
                          transaction.reconciliationStatus ===
                          ReconciliationStatus.Reconciled
                            ? 'banking__reconcile-btn--active'
                            : ''
                        }`}
                        onClick={() => handleToggleReconciled(transaction)}
                        type="button"
                        aria-label={
                          transaction.reconciliationStatus ===
                          ReconciliationStatus.Reconciled
                            ? 'Mark as unreconciled'
                            : 'Mark as reconciled'
                        }
                      >
                        <Check size={14} />
                      </button>
                    </td>
                    <td className="banking__cell--actions">
                      <button
                        className="banking__action-btn"
                        onClick={() => handleEditTransaction(transaction)}
                        type="button"
                        aria-label="Edit transaction"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        className="banking__action-btn banking__action-btn--danger"
                        onClick={() =>
                          handleDeleteTransaction(transaction.id)
                        }
                        type="button"
                        aria-label="Delete transaction"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {showTransactionForm && (
        <TransactionForm
          transaction={editingTransaction ?? undefined}
          onClose={handleCloseForm}
        />
      )}

      {showCsvImport && <CsvImportModal onClose={handleCloseCsvImport} />}
    </div>
  )
}

export default BankingPage
