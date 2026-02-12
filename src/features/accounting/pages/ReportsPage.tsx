import { useState, useMemo, useCallback } from 'react'
import { useAccountingStore } from '../stores/useAccountingStore'
import { computeProfitAndLoss, computeBalanceSheet, computeCashFlow } from '../lib/reportCalculations'
import ProfitAndLoss from '../components/ProfitAndLoss/ProfitAndLoss'
import BalanceSheet from '../components/BalanceSheet/BalanceSheet'
import CashFlowStatement from '../components/CashFlowStatement/CashFlowStatement'
import './ReportsPage.css'

type ReportTab = 'pnl' | 'balance' | 'cashflow'

function ReportsPage() {
  const accounts = useAccountingStore((s) => s.accounts)
  const transactions = useAccountingStore((s) => s.transactions)

  const currentYear = new Date().getFullYear()
  const [activeTab, setActiveTab] = useState<ReportTab>('pnl')
  const [startDate, setStartDate] = useState(`${currentYear}-01-01`)
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10))
  const [appliedRange, setAppliedRange] = useState({ startDate: `${currentYear}-01-01`, endDate: new Date().toISOString().slice(0, 10) })

  const handleApply = useCallback(() => {
    setAppliedRange({ startDate, endDate })
  }, [startDate, endDate])

  const pnlData = useMemo(
    () => computeProfitAndLoss(accounts, transactions, appliedRange),
    [accounts, transactions, appliedRange]
  )

  const balanceData = useMemo(
    () => computeBalanceSheet(accounts),
    [accounts]
  )

  const cashFlowData = useMemo(
    () => computeCashFlow(accounts, transactions, appliedRange),
    [accounts, transactions, appliedRange]
  )

  const handleTabClick = useCallback((tab: ReportTab) => {
    setActiveTab(tab)
  }, [])

  return (
    <div className="reports-page">
      <h1 className="reports-page__title">Financial Reports</h1>

      <div className="reports-page__date-range">
        <label className="reports-page__date-label">
          Start Date
          <input
            type="date"
            className="reports-page__date-input"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </label>
        <label className="reports-page__date-label">
          End Date
          <input
            type="date"
            className="reports-page__date-input"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </label>
        <button
          className="btn-primary reports-page__apply-btn"
          onClick={handleApply}
          type="button"
        >
          Apply
        </button>
      </div>

      <nav className="reports-page__tabs" role="tablist" aria-label="Report type">
        <button
          className={`reports-page__tab ${activeTab === 'pnl' ? 'reports-page__tab--active' : ''}`}
          onClick={() => handleTabClick('pnl')}
          role="tab"
          aria-selected={activeTab === 'pnl'}
          type="button"
        >
          Profit &amp; Loss
        </button>
        <button
          className={`reports-page__tab ${activeTab === 'balance' ? 'reports-page__tab--active' : ''}`}
          onClick={() => handleTabClick('balance')}
          role="tab"
          aria-selected={activeTab === 'balance'}
          type="button"
        >
          Balance Sheet
        </button>
        <button
          className={`reports-page__tab ${activeTab === 'cashflow' ? 'reports-page__tab--active' : ''}`}
          onClick={() => handleTabClick('cashflow')}
          role="tab"
          aria-selected={activeTab === 'cashflow'}
          type="button"
        >
          Cash Flow
        </button>
      </nav>

      <div className="reports-page__content" role="tabpanel">
        {activeTab === 'pnl' && <ProfitAndLoss data={pnlData} />}
        {activeTab === 'balance' && <BalanceSheet data={balanceData} />}
        {activeTab === 'cashflow' && <CashFlowStatement data={cashFlowData} />}
      </div>
    </div>
  )
}

export default ReportsPage
