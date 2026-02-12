import { useState, useCallback, useMemo } from 'react'
import { Plus, Pencil, Trash2, Upload } from 'lucide-react'
import { useExpenseStore } from '../stores/useExpenseStore'
import { EXPENSE_CATEGORY_LABELS } from '../types'
import type { Expense, ExpenseCategory } from '../types'
import { formatCurrency } from '../lib/formatCurrency'
import ExpenseForm from '../components/ExpenseForm/ExpenseForm'
import CategoryBreakdown from '../components/CategoryBreakdown/CategoryBreakdown'
import './ExpenseListPage.css'

function ExpenseListPage() {
  const expenses = useExpenseStore((s) => s.expenses)
  const deleteExpense = useExpenseStore((s) => s.deleteExpense)

  const [categoryFilter, setCategoryFilter] = useState<'all' | ExpenseCategory>('all')
  const [dateStart, setDateStart] = useState('')
  const [dateEnd, setDateEnd] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)

  const filteredExpenses = useMemo(() => {
    let result = [...expenses]
    if (categoryFilter !== 'all') {
      result = result.filter((e) => e.categoryId === categoryFilter)
    }
    if (dateStart) {
      result = result.filter((e) => e.date >= dateStart)
    }
    if (dateEnd) {
      result = result.filter((e) => e.date <= dateEnd)
    }
    result.sort((a, b) => b.date.localeCompare(a.date))
    return result
  }, [expenses, categoryFilter, dateStart, dateEnd])

  const thisMonthTotal = useMemo(() => {
    const now = new Date()
    const yearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    return expenses
      .filter((e) => e.date.startsWith(yearMonth))
      .reduce((sum, e) => sum + e.amount, 0)
  }, [expenses])

  const largestCategory = useMemo(() => {
    const totals: Record<string, number> = {}
    for (const e of expenses) {
      totals[e.categoryId] = (totals[e.categoryId] ?? 0) + e.amount
    }
    let maxCat = ''
    let maxVal = 0
    for (const [cat, val] of Object.entries(totals)) {
      if (val > maxVal) {
        maxCat = cat
        maxVal = val
      }
    }
    return maxCat ? EXPENSE_CATEGORY_LABELS[maxCat as ExpenseCategory] : 'None'
  }, [expenses])

  const recurringTotal = useMemo(
    () => expenses.filter((e) => e.recurring).reduce((sum, e) => sum + e.amount, 0),
    [expenses]
  )

  const handleAddExpense = useCallback(() => {
    setEditingExpense(null)
    setShowForm(true)
  }, [])

  const handleEditExpense = useCallback((expense: Expense) => {
    setEditingExpense(expense)
    setShowForm(true)
  }, [])

  const handleDeleteExpense = useCallback(
    (id: string) => {
      deleteExpense(id)
    },
    [deleteExpense]
  )

  const handleCloseForm = useCallback(() => {
    setShowForm(false)
    setEditingExpense(null)
  }, [])

  const handleCategoryFilterChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setCategoryFilter(e.target.value as 'all' | ExpenseCategory)
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

  return (
    <div className="expense-list">
      {/* Header */}
      <div className="expense-list__header">
        <h1 className="expense-list__title">Expenses</h1>
        <button
          className="btn-primary expense-list__add-btn"
          onClick={handleAddExpense}
          type="button"
        >
          <Plus size={16} />
          Add Expense
        </button>
      </div>

      {/* Filters */}
      <div className="expense-list__filters">
        <div className="expense-list__filter-group">
          <label className="expense-list__filter-label" htmlFor="category-filter">
            Category
          </label>
          <select
            id="category-filter"
            className="expense-list__select"
            value={categoryFilter}
            onChange={handleCategoryFilterChange}
          >
            <option value="all">All Categories</option>
            {Object.entries(EXPENSE_CATEGORY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div className="expense-list__filter-group">
          <label className="expense-list__filter-label" htmlFor="date-start">
            From
          </label>
          <input
            id="date-start"
            className="expense-list__input"
            type="date"
            value={dateStart}
            onChange={handleDateStartChange}
          />
        </div>
        <div className="expense-list__filter-group">
          <label className="expense-list__filter-label" htmlFor="date-end">
            To
          </label>
          <input
            id="date-end"
            className="expense-list__input"
            type="date"
            value={dateEnd}
            onChange={handleDateEndChange}
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="expense-list__summary">
        <div className="expense-list__summary-card">
          <span className="expense-list__summary-label">Total Expenses (This Month)</span>
          <span className="expense-list__summary-value">{formatCurrency(thisMonthTotal)}</span>
        </div>
        <div className="expense-list__summary-card">
          <span className="expense-list__summary-label">Largest Category</span>
          <span className="expense-list__summary-value expense-list__summary-value--text">
            {largestCategory}
          </span>
        </div>
        <div className="expense-list__summary-card">
          <span className="expense-list__summary-label">Recurring Total</span>
          <span className="expense-list__summary-value">{formatCurrency(recurringTotal)}</span>
        </div>
      </div>

      {/* Category Breakdown */}
      <CategoryBreakdown />

      {/* Table */}
      <div className="expense-list__table-wrapper">
        <table className="expense-list__table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Vendor</th>
              <th>Category</th>
              <th>Description</th>
              <th className="expense-list__th-right">Amount</th>
              <th>Receipt</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredExpenses.length === 0 ? (
              <tr>
                <td colSpan={7} className="expense-list__empty">
                  No expenses found.
                </td>
              </tr>
            ) : (
              filteredExpenses.map((expense) => (
                <tr key={expense.id} className="expense-list__row">
                  <td className="expense-list__cell-date">{expense.date}</td>
                  <td>{expense.vendorName}</td>
                  <td>
                    <span className="expense-list__category-badge">
                      {EXPENSE_CATEGORY_LABELS[expense.categoryId]}
                    </span>
                  </td>
                  <td className="expense-list__cell-desc">{expense.description}</td>
                  <td className="expense-list__cell-amount">{formatCurrency(expense.amount)}</td>
                  <td className="expense-list__cell-receipt">
                    {expense.receipt ? (
                      <Upload size={14} aria-label="Receipt attached" />
                    ) : (
                      <span className="expense-list__no-receipt">&mdash;</span>
                    )}
                  </td>
                  <td className="expense-list__cell-actions">
                    <button
                      className="expense-list__action-btn"
                      onClick={() => handleEditExpense(expense)}
                      type="button"
                      aria-label={`Edit ${expense.vendorName} expense`}
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      className="expense-list__action-btn expense-list__action-btn--danger"
                      onClick={() => handleDeleteExpense(expense.id)}
                      type="button"
                      aria-label={`Delete ${expense.vendorName} expense`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Form Modal */}
      {showForm && (
        <ExpenseForm expense={editingExpense ?? undefined} onClose={handleCloseForm} />
      )}
    </div>
  )
}

export default ExpenseListPage
