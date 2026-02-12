import type { ProfitAndLossData } from '../../lib/reportCalculations'
import { formatCurrency } from '../../lib/formatCurrency'
import './ProfitAndLoss.css'

interface ProfitAndLossProps {
  data: ProfitAndLossData
}

function ProfitAndLoss({ data }: ProfitAndLossProps) {
  return (
    <div className="profit-loss">
      <section className="profit-loss__section">
        <h3 className="profit-loss__section-title">Revenue</h3>
        {data.revenue.length === 0 ? (
          <p className="profit-loss__empty">No revenue accounts</p>
        ) : (
          <table className="profit-loss__table">
            <tbody>
              {data.revenue.map((row) => (
                <tr key={row.accountName} className="profit-loss__row">
                  <td className="profit-loss__account">{row.accountName}</td>
                  <td className="profit-loss__amount">{formatCurrency(row.amount)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="profit-loss__subtotal">
                <td className="profit-loss__account">Total Revenue</td>
                <td className="profit-loss__amount">{formatCurrency(data.totalRevenue)}</td>
              </tr>
            </tfoot>
          </table>
        )}
      </section>

      <section className="profit-loss__section">
        <h3 className="profit-loss__section-title">Expenses</h3>
        {data.expenses.length === 0 ? (
          <p className="profit-loss__empty">No expense accounts</p>
        ) : (
          <table className="profit-loss__table">
            <tbody>
              {data.expenses.map((row) => (
                <tr key={row.accountName} className="profit-loss__row">
                  <td className="profit-loss__account">{row.accountName}</td>
                  <td className="profit-loss__amount">{formatCurrency(row.amount)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="profit-loss__subtotal">
                <td className="profit-loss__account">Total Expenses</td>
                <td className="profit-loss__amount">{formatCurrency(data.totalExpenses)}</td>
              </tr>
            </tfoot>
          </table>
        )}
      </section>

      <div className={`profit-loss__net-income ${data.netIncome >= 0 ? 'profit-loss__net-income--positive' : 'profit-loss__net-income--negative'}`}>
        <span className="profit-loss__net-label">Net Income</span>
        <span className="profit-loss__net-amount">{formatCurrency(data.netIncome)}</span>
      </div>
    </div>
  )
}

export default ProfitAndLoss
