import { useState, useCallback, useMemo } from 'react'
import { Pencil, Trash2, Plus, X } from 'lucide-react'
import { useAccountingStore } from '../stores/useAccountingStore'
import {
  AccountType,
  AccountSubType,
  ACCOUNT_TYPE_LABELS,
  ACCOUNT_SUBTYPE_LABELS,
  SUBTYPE_TO_TYPE,
} from '../types'
import type { Account, AccountType as AccountTypeT } from '../types'
import { formatCurrency } from '../lib/formatCurrency'
import './ChartOfAccountsPage.css'

const FILTER_TABS: { label: string; value: string }[] = [
  { label: 'All', value: 'all' },
  { label: 'Assets', value: AccountType.Asset },
  { label: 'Liabilities', value: AccountType.Liability },
  { label: 'Equity', value: AccountType.Equity },
  { label: 'Revenue', value: AccountType.Revenue },
  { label: 'Expenses', value: AccountType.Expense },
]

function getFirstSubTypeForType(type: AccountTypeT): AccountSubType {
  const entry = Object.entries(SUBTYPE_TO_TYPE).find(([, t]) => t === type)
  return (entry?.[0] ?? AccountSubType.Checking) as AccountSubType
}

function ChartOfAccountsPage() {
  const accounts = useAccountingStore((s) => s.accounts)
  const addAccount = useAccountingStore((s) => s.addAccount)
  const updateAccount = useAccountingStore((s) => s.updateAccount)
  const deleteAccount = useAccountingStore((s) => s.deleteAccount)

  const [activeFilter, setActiveFilter] = useState<string>('all')
  const [showModal, setShowModal] = useState(false)
  const [editingAccount, setEditingAccount] = useState<Account | null>(null)

  // Modal form state
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [type, setType] = useState<AccountTypeT>(AccountType.Asset)
  const [subType, setSubType] = useState<AccountSubType>(AccountSubType.Checking)
  const [description, setDescription] = useState('')
  const [balance, setBalance] = useState('')

  const filteredAccounts = useMemo(() => {
    const sorted = [...accounts].sort((a, b) => a.code.localeCompare(b.code))
    if (activeFilter === 'all') return sorted
    return sorted.filter((a) => a.type === activeFilter)
  }, [accounts, activeFilter])

  const subTypesForType = useMemo(() => {
    return (Object.entries(SUBTYPE_TO_TYPE) as [AccountSubType, AccountTypeT][]).filter(
      ([, t]) => t === type
    )
  }, [type])

  const resetForm = useCallback(() => {
    setName('')
    setCode('')
    setType(AccountType.Asset)
    setSubType(AccountSubType.Checking)
    setDescription('')
    setBalance('')
  }, [])

  const handleOpenAdd = useCallback(() => {
    resetForm()
    setEditingAccount(null)
    setShowModal(true)
  }, [resetForm])

  const handleOpenEdit = useCallback((account: Account) => {
    setEditingAccount(account)
    setName(account.name)
    setCode(account.code)
    setType(account.type)
    setSubType(account.subType)
    setDescription(account.description)
    setBalance(String(account.balance))
    setShowModal(true)
  }, [])

  const handleClose = useCallback(() => {
    setShowModal(false)
    setEditingAccount(null)
  }, [])

  const handleTypeChange = useCallback((newType: AccountTypeT) => {
    setType(newType)
    setSubType(getFirstSubTypeForType(newType))
  }, [])

  const handleSave = useCallback(() => {
    const parsedBalance = parseFloat(balance) || 0

    if (editingAccount) {
      updateAccount(editingAccount.id, {
        name,
        code,
        type,
        subType,
        description,
        balance: parsedBalance,
      })
    } else {
      addAccount({
        name,
        code,
        type,
        subType,
        description,
        balance: parsedBalance,
      })
    }

    setShowModal(false)
    setEditingAccount(null)
  }, [editingAccount, name, code, type, subType, description, balance, addAccount, updateAccount])

  const handleDelete = useCallback(
    (account: Account) => {
      if (window.confirm(`Delete account "${account.name}"?`)) {
        deleteAccount(account.id)
      }
    },
    [deleteAccount]
  )

  return (
    <div className="chart-of-accounts">
      {/* Header */}
      <div className="chart-of-accounts__header">
        <h1 className="chart-of-accounts__title">Chart of Accounts</h1>
        <button className="btn-primary" onClick={handleOpenAdd} type="button">
          <Plus size={16} />
          Add Account
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="chart-of-accounts__filters">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.value}
            className={`chart-of-accounts__filter-tab ${
              activeFilter === tab.value ? 'chart-of-accounts__filter-tab--active' : ''
            }`}
            onClick={() => setActiveFilter(tab.value)}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="chart-of-accounts__table-wrapper">
        <table className="chart-of-accounts__table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Account Name</th>
              <th>Type</th>
              <th>Sub-Type</th>
              <th>Balance</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAccounts.map((account) => (
              <tr key={account.id}>
                <td className="chart-of-accounts__code">{account.code}</td>
                <td>{account.name}</td>
                <td>{ACCOUNT_TYPE_LABELS[account.type]}</td>
                <td>{ACCOUNT_SUBTYPE_LABELS[account.subType]}</td>
                <td className="chart-of-accounts__balance">
                  {formatCurrency(account.balance)}
                </td>
                <td className="chart-of-accounts__actions">
                  <button
                    className="chart-of-accounts__action-btn"
                    onClick={() => handleOpenEdit(account)}
                    type="button"
                    aria-label={`Edit ${account.name}`}
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    className="chart-of-accounts__action-btn chart-of-accounts__action-btn--danger"
                    onClick={() => handleDelete(account)}
                    type="button"
                    aria-label={`Delete ${account.name}`}
                  >
                    <Trash2 size={15} />
                  </button>
                </td>
              </tr>
            ))}
            {filteredAccounts.length === 0 && (
              <tr>
                <td colSpan={6} className="chart-of-accounts__empty">
                  No accounts found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={handleClose}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingAccount ? 'Edit Account' : 'Add Account'}</h2>
              <button
                className="chart-of-accounts__close-btn"
                onClick={handleClose}
                type="button"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            <form
              className="chart-of-accounts__form"
              onSubmit={(e) => {
                e.preventDefault()
                handleSave()
              }}
            >
              <div className="chart-of-accounts__field">
                <label htmlFor="coa-name">Name</label>
                <input
                  id="coa-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="chart-of-accounts__field">
                <label htmlFor="coa-code">Code</label>
                <input
                  id="coa-code"
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                />
              </div>

              <div className="chart-of-accounts__field">
                <label htmlFor="coa-type">Type</label>
                <select
                  id="coa-type"
                  value={type}
                  onChange={(e) => handleTypeChange(e.target.value as AccountTypeT)}
                >
                  {Object.entries(ACCOUNT_TYPE_LABELS).map(([val, label]) => (
                    <option key={val} value={val}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="chart-of-accounts__field">
                <label htmlFor="coa-subtype">Sub-Type</label>
                <select
                  id="coa-subtype"
                  value={subType}
                  onChange={(e) => setSubType(e.target.value as AccountSubType)}
                >
                  {subTypesForType.map(([val]) => (
                    <option key={val} value={val}>
                      {ACCOUNT_SUBTYPE_LABELS[val]}
                    </option>
                  ))}
                </select>
              </div>

              <div className="chart-of-accounts__field">
                <label htmlFor="coa-description">Description</label>
                <textarea
                  id="coa-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="chart-of-accounts__field">
                <label htmlFor="coa-balance">Opening Balance</label>
                <input
                  id="coa-balance"
                  type="number"
                  step="0.01"
                  value={balance}
                  onChange={(e) => setBalance(e.target.value)}
                />
              </div>

              <div className="chart-of-accounts__form-actions">
                <button type="button" className="btn-secondary" onClick={handleClose}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingAccount ? 'Save Changes' : 'Add Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default ChartOfAccountsPage
