import type { HeaderColor } from '../types'
import './DataTable.css'

interface DataTableProps {
  headers: string[]
  rows: (string | React.ReactNode)[][]
  headerColor?: HeaderColor
}

function DataTable({ headers, rows, headerColor = 'dark' }: DataTableProps) {
  return (
    <div className="data-table">
      <div className="data-table__wrapper">
        <table className="data-table__table">
          <thead>
            <tr className={`data-table__header--${headerColor}`}>
              {headers.map((header) => (
                <th key={header} className="data-table__cell">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="data-table__row">
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className="data-table__cell">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default DataTable
