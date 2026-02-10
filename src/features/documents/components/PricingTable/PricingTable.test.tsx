import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PricingTable from './PricingTable'
import type { PricingTableData } from '../../../../types'

function makeData(overrides: Partial<PricingTableData> = {}): PricingTableData {
  return {
    items: [
      { id: 'item-1', item: 'Widget A', description: 'Standard widget', quantity: 2, unitPrice: 25.0 },
      { id: 'item-2', item: 'Widget B', description: 'Premium widget', quantity: 1, unitPrice: 50.0 },
    ],
    taxRate: 10,
    currency: 'USD',
    ...overrides,
  }
}

describe('PricingTable', () => {
  it('renders the pricing header', () => {
    render(<PricingTable data={makeData()} onChange={vi.fn()} />)
    expect(screen.getByText('Pricing')).toBeInTheDocument()
  })

  it('renders table headers', () => {
    render(<PricingTable data={makeData()} onChange={vi.fn()} />)
    expect(screen.getByText('Item')).toBeInTheDocument()
    expect(screen.getByText('Description')).toBeInTheDocument()
    expect(screen.getByText('Qty')).toBeInTheDocument()
    expect(screen.getByText('Unit Price')).toBeInTheDocument()
    expect(screen.getByText('Total')).toBeInTheDocument()
  })

  it('renders item rows with correct data', () => {
    render(<PricingTable data={makeData()} onChange={vi.fn()} />)
    expect(screen.getByDisplayValue('Widget A')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Widget B')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Standard widget')).toBeInTheDocument()
  })

  it('calculates and displays row totals correctly', () => {
    render(<PricingTable data={makeData()} onChange={vi.fn()} />)
    // Widget A: 2 * 25 = $50.00, Widget B: 1 * 50 = $50.00
    const totals = screen.getAllByText('$50.00')
    expect(totals.length).toBeGreaterThanOrEqual(2)
  })

  it('displays subtotal, tax, and grand total', () => {
    render(<PricingTable data={makeData()} onChange={vi.fn()} />)
    // Subtotal: 50 + 50 = 100
    expect(screen.getByTestId('pricing-subtotal')).toHaveTextContent('$100.00')
    // Tax: 100 * 10% = 10
    expect(screen.getByTestId('pricing-tax')).toHaveTextContent('$10.00')
    // Grand total: 100 + 10 = 110
    expect(screen.getByTestId('pricing-grand-total')).toHaveTextContent('$110.00')
  })

  it('calls onChange when Add Item is clicked', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<PricingTable data={makeData()} onChange={onChange} />)

    await user.click(screen.getByText('Add Item'))
    expect(onChange).toHaveBeenCalledOnce()
    const call = onChange.mock.calls[0] as [PricingTableData] | undefined
    expect(call?.[0].items).toHaveLength(3)
  })

  it('calls onChange when Remove button is clicked', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<PricingTable data={makeData()} onChange={onChange} />)

    await user.click(screen.getByLabelText('Remove Widget A'))
    expect(onChange).toHaveBeenCalledOnce()
    const call = onChange.mock.calls[0] as [PricingTableData] | undefined
    expect(call?.[0].items).toHaveLength(1)
    expect(call?.[0].items[0]?.item).toBe('Widget B')
  })

  it('calls onChange when item name is edited', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<PricingTable data={makeData()} onChange={onChange} />)

    const input = screen.getByDisplayValue('Widget A')
    await user.clear(input)
    await user.type(input, 'Super Widget')

    expect(onChange).toHaveBeenCalled()
  })

  it('shows empty state when no items', () => {
    render(<PricingTable data={makeData({ items: [] })} onChange={vi.fn()} />)
    expect(screen.getByText('No items added yet')).toBeInTheDocument()
  })

  it('hides Add Item and Remove in readOnly mode', () => {
    render(<PricingTable data={makeData()} onChange={vi.fn()} readOnly />)
    expect(screen.queryByText('Add Item')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Remove Widget A')).not.toBeInTheDocument()
  })

  it('shows text content instead of inputs in readOnly mode', () => {
    render(<PricingTable data={makeData()} onChange={vi.fn()} readOnly />)
    expect(screen.getByText('Widget A')).toBeInTheDocument()
    expect(screen.queryByDisplayValue('Widget A')).not.toBeInTheDocument()
  })

  it('has correct aria-label on region', () => {
    render(<PricingTable data={makeData()} onChange={vi.fn()} />)
    expect(screen.getByRole('region', { name: 'Pricing table' })).toBeInTheDocument()
  })
})
