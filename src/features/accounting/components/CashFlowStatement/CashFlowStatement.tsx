import type { CashFlowData } from '../../lib/reportCalculations'
import { formatCurrency } from '../../lib/formatCurrency'
import './CashFlowStatement.css'

interface CashFlowStatementProps {
  data: CashFlowData
}

function CashFlowStatement({ data }: CashFlowStatementProps) {
  return (
    <div className="cash-flow">
      <section className="cash-flow__section">
        <h3 className="cash-flow__section-title">Operating Activities</h3>
        <table className="cash-flow__table">
          <tbody>
            {data.operating.map((row) => (
              <tr key={row.description} className="cash-flow__row">
                <td className="cash-flow__description">{row.description}</td>
                <td className="cash-flow__amount">{formatCurrency(row.amount)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="cash-flow__subtotal">
              <td className="cash-flow__description">Net Operating Cash Flow</td>
              <td className="cash-flow__amount">{formatCurrency(data.netOperating)}</td>
            </tr>
          </tfoot>
        </table>
      </section>

      <section className="cash-flow__section">
        <h3 className="cash-flow__section-title">Investing Activities</h3>
        <table className="cash-flow__table">
          <tbody>
            {data.investing.map((row) => (
              <tr key={row.description} className="cash-flow__row">
                <td className="cash-flow__description">{row.description}</td>
                <td className="cash-flow__amount">{formatCurrency(row.amount)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="cash-flow__subtotal">
              <td className="cash-flow__description">Net Investing Cash Flow</td>
              <td className="cash-flow__amount">{formatCurrency(data.netInvesting)}</td>
            </tr>
          </tfoot>
        </table>
      </section>

      <section className="cash-flow__section">
        <h3 className="cash-flow__section-title">Financing Activities</h3>
        <table className="cash-flow__table">
          <tbody>
            {data.financing.map((row) => (
              <tr key={row.description} className="cash-flow__row">
                <td className="cash-flow__description">{row.description}</td>
                <td className="cash-flow__amount">{formatCurrency(row.amount)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="cash-flow__subtotal">
              <td className="cash-flow__description">Net Financing Cash Flow</td>
              <td className="cash-flow__amount">{formatCurrency(data.netFinancing)}</td>
            </tr>
          </tfoot>
        </table>
      </section>

      <div className={`cash-flow__net-change ${data.netChange >= 0 ? 'cash-flow__net-change--positive' : 'cash-flow__net-change--negative'}`}>
        <span className="cash-flow__net-label">Net Change in Cash</span>
        <span className="cash-flow__net-amount">{formatCurrency(data.netChange)}</span>
      </div>

      <div className="cash-flow__balances">
        <div className="cash-flow__balance-row">
          <span className="cash-flow__balance-label">Beginning Cash Balance</span>
          <span className="cash-flow__balance-amount">{formatCurrency(data.beginningCash)}</span>
        </div>
        <div className="cash-flow__balance-row cash-flow__balance-row--ending">
          <span className="cash-flow__balance-label">Ending Cash Balance</span>
          <span className="cash-flow__balance-amount">{formatCurrency(data.endingCash)}</span>
        </div>
      </div>
    </div>
  )
}

export default CashFlowStatement
