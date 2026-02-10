import { useState, useCallback, useMemo } from 'react'
import { Plus, Trash2, DollarSign } from 'lucide-react'
import type { PricingItem, PricingTableData } from '../../../../types'
import './PricingTable.css'

// ─── Helpers ──────────────────────────────────────────────────────────

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

function formatCurrency(amount: number, currency: string): string {
  const symbol = currency === 'USD' ? '$' : currency
  const formatted = amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  return `${symbol}${formatted}`
}

function createEmptyItem(): PricingItem {
  return {
    id: generateId(),
    item: '',
    description: '',
    quantity: 1,
    unitPrice: 0,
  }
}

// ─── Props ────────────────────────────────────────────────────────────

interface PricingTableProps {
  data: PricingTableData
  onChange: (data: PricingTableData) => void
  readOnly?: boolean
}

// ─── Component ────────────────────────────────────────────────────────

function PricingTable({ data, onChange, readOnly = false }: PricingTableProps) {
  const [editingCell, setEditingCell] = useState<string | null>(null)

  // ── Computed totals ─────────────────────────────────────────────
  const subtotal = useMemo(
    () => data.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0),
    [data.items]
  )

  const taxAmount = useMemo(
    () => subtotal * (data.taxRate / 100),
    [subtotal, data.taxRate]
  )

  const grandTotal = useMemo(
    () => subtotal + taxAmount,
    [subtotal, taxAmount]
  )

  // ── Handlers ────────────────────────────────────────────────────
  const handleAddRow = useCallback(() => {
    onChange({
      ...data,
      items: [...data.items, createEmptyItem()],
    })
  }, [data, onChange])

  const handleRemoveRow = useCallback(
    (itemId: string) => {
      onChange({
        ...data,
        items: data.items.filter((item) => item.id !== itemId),
      })
    },
    [data, onChange]
  )

  const handleUpdateItem = useCallback(
    (itemId: string, field: keyof PricingItem, value: string | number) => {
      onChange({
        ...data,
        items: data.items.map((item) =>
          item.id === itemId ? { ...item, [field]: value } : item
        ),
      })
    },
    [data, onChange]
  )

  const handleTaxRateChange = useCallback(
    (value: number) => {
      onChange({ ...data, taxRate: value })
    },
    [data, onChange]
  )

  const handleCellFocus = useCallback((cellId: string) => {
    setEditingCell(cellId)
  }, [])

  const handleCellBlur = useCallback(() => {
    setEditingCell(null)
  }, [])

  // ── Render ──────────────────────────────────────────────────────
  return (
    <div className="pricing-table" role="region" aria-label="Pricing table">
      <div className="pricing-table__header">
        <DollarSign className="pricing-table__header-icon" />
        <h3 className="pricing-table__title">Pricing</h3>
      </div>

      <div className="pricing-table__wrapper">
        <table className="pricing-table__table" role="table">
          <thead>
            <tr>
              <th className="pricing-table__th pricing-table__th--item">Item</th>
              <th className="pricing-table__th pricing-table__th--description">Description</th>
              <th className="pricing-table__th pricing-table__th--qty">Qty</th>
              <th className="pricing-table__th pricing-table__th--price">Unit Price</th>
              <th className="pricing-table__th pricing-table__th--total">Total</th>
              {!readOnly && (
                <th className="pricing-table__th pricing-table__th--actions" aria-label="Actions" />
              )}
            </tr>
          </thead>
          <tbody>
            {data.items.map((item) => {
              const rowTotal = item.quantity * item.unitPrice
              return (
                <tr key={item.id} className="pricing-table__row">
                  <td className="pricing-table__td pricing-table__td--item">
                    {readOnly ? (
                      <span>{item.item}</span>
                    ) : (
                      <input
                        type="text"
                        className={`pricing-table__input${editingCell === `${item.id}-item` ? ' pricing-table__input--focused' : ''}`}
                        value={item.item}
                        onChange={(e) => handleUpdateItem(item.id, 'item', e.target.value)}
                        onFocus={() => handleCellFocus(`${item.id}-item`)}
                        onBlur={handleCellBlur}
                        placeholder="Item name"
                        aria-label="Item name"
                      />
                    )}
                  </td>
                  <td className="pricing-table__td pricing-table__td--description">
                    {readOnly ? (
                      <span>{item.description}</span>
                    ) : (
                      <input
                        type="text"
                        className={`pricing-table__input${editingCell === `${item.id}-desc` ? ' pricing-table__input--focused' : ''}`}
                        value={item.description}
                        onChange={(e) => handleUpdateItem(item.id, 'description', e.target.value)}
                        onFocus={() => handleCellFocus(`${item.id}-desc`)}
                        onBlur={handleCellBlur}
                        placeholder="Description"
                        aria-label="Description"
                      />
                    )}
                  </td>
                  <td className="pricing-table__td pricing-table__td--qty">
                    {readOnly ? (
                      <span>{item.quantity}</span>
                    ) : (
                      <input
                        type="number"
                        className={`pricing-table__input pricing-table__input--number${editingCell === `${item.id}-qty` ? ' pricing-table__input--focused' : ''}`}
                        value={item.quantity}
                        onChange={(e) => handleUpdateItem(item.id, 'quantity', Math.max(0, Number(e.target.value)))}
                        onFocus={() => handleCellFocus(`${item.id}-qty`)}
                        onBlur={handleCellBlur}
                        min={0}
                        step={1}
                        aria-label="Quantity"
                      />
                    )}
                  </td>
                  <td className="pricing-table__td pricing-table__td--price">
                    {readOnly ? (
                      <span>{formatCurrency(item.unitPrice, data.currency)}</span>
                    ) : (
                      <input
                        type="number"
                        className={`pricing-table__input pricing-table__input--number${editingCell === `${item.id}-price` ? ' pricing-table__input--focused' : ''}`}
                        value={item.unitPrice}
                        onChange={(e) => handleUpdateItem(item.id, 'unitPrice', Math.max(0, Number(e.target.value)))}
                        onFocus={() => handleCellFocus(`${item.id}-price`)}
                        onBlur={handleCellBlur}
                        min={0}
                        step={0.01}
                        aria-label="Unit price"
                      />
                    )}
                  </td>
                  <td className="pricing-table__td pricing-table__td--total">
                    <span className="pricing-table__row-total">
                      {formatCurrency(rowTotal, data.currency)}
                    </span>
                  </td>
                  {!readOnly && (
                    <td className="pricing-table__td pricing-table__td--actions">
                      <button
                        type="button"
                        className="pricing-table__remove-btn"
                        onClick={() => handleRemoveRow(item.id)}
                        aria-label={`Remove ${item.item || 'item'}`}
                      >
                        <Trash2 />
                      </button>
                    </td>
                  )}
                </tr>
              )
            })}

            {data.items.length === 0 && (
              <tr>
                <td
                  colSpan={readOnly ? 5 : 6}
                  className="pricing-table__empty"
                >
                  No items added yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {!readOnly && (
        <button
          type="button"
          className="pricing-table__add-btn"
          onClick={handleAddRow}
        >
          <Plus /> Add Item
        </button>
      )}

      <div className="pricing-table__summary">
        <div className="pricing-table__summary-row">
          <span className="pricing-table__summary-label">Subtotal</span>
          <span className="pricing-table__summary-value" data-testid="pricing-subtotal">
            {formatCurrency(subtotal, data.currency)}
          </span>
        </div>
        <div className="pricing-table__summary-row">
          <span className="pricing-table__summary-label">
            Tax Rate
            {!readOnly ? (
              <input
                type="number"
                className="pricing-table__tax-input"
                value={data.taxRate}
                onChange={(e) => handleTaxRateChange(Math.max(0, Number(e.target.value)))}
                min={0}
                max={100}
                step={0.1}
                aria-label="Tax rate percentage"
              />
            ) : (
              <span className="pricing-table__tax-display">{data.taxRate}%</span>
            )}
          </span>
          <span className="pricing-table__summary-value" data-testid="pricing-tax">
            {formatCurrency(taxAmount, data.currency)}
          </span>
        </div>
        <div className="pricing-table__summary-row pricing-table__summary-row--total">
          <span className="pricing-table__summary-label">Grand Total</span>
          <span className="pricing-table__summary-value pricing-table__summary-value--total" data-testid="pricing-grand-total">
            {formatCurrency(grandTotal, data.currency)}
          </span>
        </div>
      </div>
    </div>
  )
}

export default PricingTable
