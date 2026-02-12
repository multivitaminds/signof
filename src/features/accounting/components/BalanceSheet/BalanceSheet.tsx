import type { BalanceSheetData } from '../../lib/reportCalculations'
import { formatCurrency } from '../../lib/formatCurrency'
import './BalanceSheet.css'

interface BalanceSheetProps {
  data: BalanceSheetData
}

function BalanceSheet({ data }: BalanceSheetProps) {
  return (
    <div className="balance-sheet">
      <section className="balance-sheet__section">
        <h3 className="balance-sheet__section-title">Assets</h3>
        {data.assets.length === 0 ? (
          <p className="balance-sheet__empty">No asset accounts</p>
        ) : (
          <table className="balance-sheet__table">
            <tbody>
              {data.assets.map((row) => (
                <tr key={row.accountName} className="balance-sheet__row">
                  <td className="balance-sheet__account">{row.accountName}</td>
                  <td className="balance-sheet__amount">{formatCurrency(row.amount)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="balance-sheet__subtotal">
                <td className="balance-sheet__account">Total Assets</td>
                <td className="balance-sheet__amount">{formatCurrency(data.totalAssets)}</td>
              </tr>
            </tfoot>
          </table>
        )}
      </section>

      <section className="balance-sheet__section">
        <h3 className="balance-sheet__section-title">Liabilities</h3>
        {data.liabilities.length === 0 ? (
          <p className="balance-sheet__empty">No liability accounts</p>
        ) : (
          <table className="balance-sheet__table">
            <tbody>
              {data.liabilities.map((row) => (
                <tr key={row.accountName} className="balance-sheet__row">
                  <td className="balance-sheet__account">{row.accountName}</td>
                  <td className="balance-sheet__amount">{formatCurrency(row.amount)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="balance-sheet__subtotal">
                <td className="balance-sheet__account">Total Liabilities</td>
                <td className="balance-sheet__amount">{formatCurrency(data.totalLiabilities)}</td>
              </tr>
            </tfoot>
          </table>
        )}
      </section>

      <section className="balance-sheet__section">
        <h3 className="balance-sheet__section-title">Equity</h3>
        {data.equity.length === 0 ? (
          <p className="balance-sheet__empty">No equity accounts</p>
        ) : (
          <table className="balance-sheet__table">
            <tbody>
              {data.equity.map((row) => (
                <tr key={row.accountName} className="balance-sheet__row">
                  <td className="balance-sheet__account">{row.accountName}</td>
                  <td className="balance-sheet__amount">{formatCurrency(row.amount)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="balance-sheet__subtotal">
                <td className="balance-sheet__account">Total Equity</td>
                <td className="balance-sheet__amount">{formatCurrency(data.totalEquity)}</td>
              </tr>
            </tfoot>
          </table>
        )}
      </section>

      <div className={`balance-sheet__balance-check ${data.isBalanced ? 'balance-sheet__balance-check--balanced' : 'balance-sheet__balance-check--unbalanced'}`}>
        <span className="balance-sheet__check-label">
          {data.isBalanced ? 'Balanced' : 'Unbalanced'}
        </span>
        <span className="balance-sheet__check-detail">
          Assets {formatCurrency(data.totalAssets)} = Liabilities {formatCurrency(data.totalLiabilities)} + Equity {formatCurrency(data.totalEquity)}
        </span>
      </div>
    </div>
  )
}

export default BalanceSheet
