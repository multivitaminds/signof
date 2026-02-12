import { useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Receipt,
  Wallet,
  ArrowRight,
  BarChart3,
  UserCheck,
} from 'lucide-react'
import { useAccountingStore } from '../stores/useAccountingStore'
import { useInvoiceStore } from '../stores/useInvoiceStore'
import { useBillingStore } from '../../settings/stores/useBillingStore'
import { formatCurrency } from '../lib/formatCurrency'
import './AccountingDashboard.css'

const CASH_FLOW_DATA = [
  { month: 'Sep', income: 8500, expense: 6200 },
  { month: 'Oct', income: 9200, expense: 7100 },
  { month: 'Nov', income: 11000, expense: 7800 },
  { month: 'Dec', income: 9800, expense: 8500 },
  { month: 'Jan', income: 12500, expense: 9000 },
  { month: 'Feb', income: 10200, expense: 7400 },
]

function AccountingDashboard() {
  const accounts = useAccountingStore((s) => s.accounts)
  const transactions = useAccountingStore((s) => s.transactions)
  const invoices = useInvoiceStore((s) => s.invoices)
  const getOutstandingTotal = useInvoiceStore((s) => s.getOutstandingTotal)
  const accountingPlan = useBillingStore((s) => s.accountingPlan)
  const navigate = useNavigate()

  const totalRevenue = useMemo(
    () =>
      accounts
        .filter((a) => a.type === 'revenue')
        .reduce((sum, a) => sum + a.balance, 0),
    [accounts]
  )

  const totalExpenses = useMemo(
    () =>
      accounts
        .filter((a) => a.type === 'expense')
        .reduce((sum, a) => sum + a.balance, 0),
    [accounts]
  )

  const netProfit = useMemo(() => totalRevenue - totalExpenses, [totalRevenue, totalExpenses])

  const outstandingTotal = useMemo(() => getOutstandingTotal(), [getOutstandingTotal])

  const outstandingCount = useMemo(
    () => invoices.filter((inv) => inv.status !== 'paid' && inv.status !== 'void').length,
    [invoices]
  )

  const recentTransactions = useMemo(
    () =>
      [...transactions]
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 5),
    [transactions]
  )

  const cashFlowMax = useMemo(
    () => Math.max(...CASH_FLOW_DATA.map((d) => Math.max(d.income, d.expense))),
    []
  )

  const handleUpgradeAccounting = useCallback(() => {
    navigate('/accounting/pricing')
  }, [navigate])

  const handleCreateInvoice = useCallback(() => {
    navigate('/accounting/invoices')
  }, [navigate])

  const handleRecordExpense = useCallback(() => {
    navigate('/accounting/expenses')
  }, [navigate])

  const handleRunPayroll = useCallback(() => {
    navigate('/accounting/payroll')
  }, [navigate])

  const handleViewReports = useCallback(() => {
    navigate('/accounting/reports')
  }, [navigate])

  return (
    <div className="accounting-dashboard">
      {/* Upgrade Banner */}
      {accountingPlan === 'acct_free' && (
        <div className="accounting-dashboard__upgrade-banner">
          <span className="accounting-dashboard__upgrade-text">
            You&apos;re on <strong>Accounting Free</strong> &mdash; limited to 20 invoices/mo.
          </span>
          <button
            className="accounting-dashboard__upgrade-btn"
            onClick={handleUpgradeAccounting}
            type="button"
          >
            Upgrade to Accounting Plus
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="accounting-dashboard__cards">
        <div className="accounting-dashboard__card">
          <div className="accounting-dashboard__card-icon accounting-dashboard__card-icon--success">
            <TrendingUp size={20} />
          </div>
          <div className="accounting-dashboard__card-body">
            <span className="accounting-dashboard__card-label">Total Revenue</span>
            <span className="accounting-dashboard__card-value accounting-dashboard__card-value--success">
              {formatCurrency(totalRevenue)}
            </span>
          </div>
        </div>

        <div className="accounting-dashboard__card">
          <div className="accounting-dashboard__card-icon accounting-dashboard__card-icon--warning">
            <TrendingDown size={20} />
          </div>
          <div className="accounting-dashboard__card-body">
            <span className="accounting-dashboard__card-label">Total Expenses</span>
            <span className="accounting-dashboard__card-value accounting-dashboard__card-value--warning">
              {formatCurrency(totalExpenses)}
            </span>
          </div>
        </div>

        <div className="accounting-dashboard__card">
          <div className={`accounting-dashboard__card-icon ${
            netProfit >= 0
              ? 'accounting-dashboard__card-icon--primary'
              : 'accounting-dashboard__card-icon--danger'
          }`}>
            <DollarSign size={20} />
          </div>
          <div className="accounting-dashboard__card-body">
            <span className="accounting-dashboard__card-label">Net Profit</span>
            <span className={`accounting-dashboard__card-value ${
              netProfit >= 0
                ? 'accounting-dashboard__card-value--success'
                : 'accounting-dashboard__card-value--danger'
            }`}>
              {formatCurrency(netProfit)}
            </span>
          </div>
        </div>

        <div className="accounting-dashboard__card">
          <div className="accounting-dashboard__card-icon accounting-dashboard__card-icon--info">
            <Receipt size={20} />
          </div>
          <div className="accounting-dashboard__card-body">
            <span className="accounting-dashboard__card-label">Outstanding Invoices</span>
            <span className="accounting-dashboard__card-value">
              {formatCurrency(outstandingTotal)}
              <span className="accounting-dashboard__card-count">({outstandingCount})</span>
            </span>
          </div>
        </div>
      </div>

      {/* Cash Flow Chart */}
      <div className="accounting-dashboard__section">
        <div className="accounting-dashboard__section-header">
          <h2 className="accounting-dashboard__section-title">Cash Flow</h2>
          <div className="accounting-dashboard__chart-legend">
            <span className="accounting-dashboard__legend-item">
              <span className="accounting-dashboard__legend-dot accounting-dashboard__legend-dot--income" />
              Income
            </span>
            <span className="accounting-dashboard__legend-item">
              <span className="accounting-dashboard__legend-dot accounting-dashboard__legend-dot--expense" />
              Expenses
            </span>
          </div>
        </div>
        <div className="accounting-dashboard__chart">
          <div className="accounting-dashboard__chart-bars">
            {CASH_FLOW_DATA.map((d) => (
              <div key={d.month} className="accounting-dashboard__chart-month">
                <div className="accounting-dashboard__chart-bar-group">
                  <div
                    className="accounting-dashboard__chart-bar accounting-dashboard__chart-bar--income"
                    style={{ height: `${(d.income / cashFlowMax) * 120}px` }}
                    title={`Income: ${formatCurrency(d.income)}`}
                  />
                  <div
                    className="accounting-dashboard__chart-bar accounting-dashboard__chart-bar--expense"
                    style={{ height: `${(d.expense / cashFlowMax) * 120}px` }}
                    title={`Expense: ${formatCurrency(d.expense)}`}
                  />
                </div>
                <span className="accounting-dashboard__chart-label">{d.month}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Two Column Grid */}
      <div className="accounting-dashboard__grid">
        {/* Recent Transactions */}
        <div className="accounting-dashboard__section">
          <h2 className="accounting-dashboard__section-title">Recent Transactions</h2>
          <div className="accounting-dashboard__transactions">
            {recentTransactions.length === 0 ? (
              <p className="accounting-dashboard__empty">No transactions yet.</p>
            ) : (
              recentTransactions.map((txn) => (
                <div key={txn.id} className="accounting-dashboard__txn-row">
                  <div className="accounting-dashboard__txn-info">
                    <span className="accounting-dashboard__txn-date">{txn.date}</span>
                    <span className="accounting-dashboard__txn-desc">{txn.description}</span>
                  </div>
                  <span className={`accounting-dashboard__txn-amount ${
                    txn.type === 'income'
                      ? 'accounting-dashboard__txn-amount--income'
                      : 'accounting-dashboard__txn-amount--expense'
                  }`}>
                    {txn.type === 'income' ? '+' : '-'}
                    {formatCurrency(txn.lines[0]?.debit || txn.lines[0]?.credit || 0)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="accounting-dashboard__section">
          <h2 className="accounting-dashboard__section-title">Quick Actions</h2>
          <div className="accounting-dashboard__actions">
            <button
              className="accounting-dashboard__action-btn"
              onClick={handleCreateInvoice}
              type="button"
            >
              <div className="accounting-dashboard__action-icon">
                <Receipt size={20} />
              </div>
              <div className="accounting-dashboard__action-text">
                <span className="accounting-dashboard__action-title">Create Invoice</span>
                <span className="accounting-dashboard__action-desc">Send a new invoice to a client</span>
              </div>
              <ArrowRight size={16} className="accounting-dashboard__action-arrow" />
            </button>

            <button
              className="accounting-dashboard__action-btn"
              onClick={handleRecordExpense}
              type="button"
            >
              <div className="accounting-dashboard__action-icon">
                <Wallet size={20} />
              </div>
              <div className="accounting-dashboard__action-text">
                <span className="accounting-dashboard__action-title">Record Expense</span>
                <span className="accounting-dashboard__action-desc">Track a business expense</span>
              </div>
              <ArrowRight size={16} className="accounting-dashboard__action-arrow" />
            </button>

            <button
              className="accounting-dashboard__action-btn"
              onClick={handleRunPayroll}
              type="button"
            >
              <div className="accounting-dashboard__action-icon">
                <UserCheck size={20} />
              </div>
              <div className="accounting-dashboard__action-text">
                <span className="accounting-dashboard__action-title">Run Payroll</span>
                <span className="accounting-dashboard__action-desc">Process employee payments</span>
              </div>
              <ArrowRight size={16} className="accounting-dashboard__action-arrow" />
            </button>

            <button
              className="accounting-dashboard__action-btn"
              onClick={handleViewReports}
              type="button"
            >
              <div className="accounting-dashboard__action-icon">
                <BarChart3 size={20} />
              </div>
              <div className="accounting-dashboard__action-text">
                <span className="accounting-dashboard__action-title">View Reports</span>
                <span className="accounting-dashboard__action-desc">P&amp;L, balance sheet, cash flow</span>
              </div>
              <ArrowRight size={16} className="accounting-dashboard__action-arrow" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AccountingDashboard
