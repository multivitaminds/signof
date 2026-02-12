import { useMemo } from 'react'
import { useExpenseStore } from '../../stores/useExpenseStore'
import { EXPENSE_CATEGORY_LABELS } from '../../types'
import type { ExpenseCategory } from '../../types'
import { formatCurrency } from '../../lib/formatCurrency'
import './CategoryBreakdown.css'

const BAR_COLORS = [
  '#4F46E5',
  '#059669',
  '#D97706',
  '#DC2626',
  '#7C3AED',
  '#0891B2',
  '#EA580C',
  '#4338CA',
  '#16A34A',
  '#CA8A04',
  '#9333EA',
]

function CategoryBreakdown() {
  const getTotalByCategory = useExpenseStore((s) => s.getTotalByCategory)

  const categoryData = useMemo(() => {
    const totals = getTotalByCategory()
    const entries = Object.entries(totals)
      .filter(([, total]) => total > 0)
      .sort((a, b) => b[1] - a[1])
    const maxValue = entries.length > 0 ? (entries[0]?.[1] ?? 0) : 0
    return { entries, maxValue }
  }, [getTotalByCategory])

  if (categoryData.entries.length === 0) return null

  return (
    <div className="category-breakdown">
      <h2 className="category-breakdown__title">Expense Breakdown</h2>
      <div className="category-breakdown__bars">
        {categoryData.entries.map(([categoryId, total], index) => (
          <div key={categoryId} className="category-breakdown__row">
            <span className="category-breakdown__label">
              {EXPENSE_CATEGORY_LABELS[categoryId as ExpenseCategory] ?? categoryId}
            </span>
            <div className="category-breakdown__bar-track">
              <div
                className="category-breakdown__bar-fill"
                style={{
                  width: `${(total / categoryData.maxValue) * 100}%`,
                  backgroundColor: BAR_COLORS[index % BAR_COLORS.length],
                }}
              />
            </div>
            <span className="category-breakdown__amount">{formatCurrency(total)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default CategoryBreakdown
