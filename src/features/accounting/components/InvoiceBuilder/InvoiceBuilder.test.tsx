import { render, screen } from '@testing-library/react'

vi.mock('../../stores/useInvoiceStore', () => ({
  useInvoiceStore: (selector: (s: Record<string, unknown>) => unknown) => {
    const state = {
      addInvoice: vi.fn(() => ({ id: 'new-1' })),
      updateInvoice: vi.fn(),
      sendInvoice: vi.fn(),
      nextInvoiceNumber: 6,
    }
    return selector(state)
  },
}))

vi.mock('../../stores/useAccountingContactStore', () => ({
  useAccountingContactStore: (selector: (s: Record<string, unknown>) => unknown) => {
    const state = {
      getCustomers: () => [
        { id: 'c-1', name: 'John Smith', company: 'Acme Corp', email: 'john@acme.com', phone: '', type: 'customer', address: '', outstandingBalance: 0, createdAt: '' },
        { id: 'c-2', name: 'Jane Doe', company: 'Globex Inc', email: 'jane@globex.com', phone: '', type: 'customer', address: '', outstandingBalance: 0, createdAt: '' },
      ],
      getContactById: (id: string) => {
        if (id === 'c-1') return { id: 'c-1', name: 'John Smith', company: 'Acme Corp' }
        if (id === 'c-2') return { id: 'c-2', name: 'Jane Doe', company: 'Globex Inc' }
        return undefined
      },
    }
    return selector(state)
  },
}))

describe('InvoiceBuilder', () => {
  it('renders the form with title', async () => {
    const { default: InvoiceBuilder } = await import('./InvoiceBuilder')
    render(<InvoiceBuilder onClose={vi.fn()} />)

    expect(screen.getByRole('dialog', { name: 'Invoice Builder' })).toBeInTheDocument()
    expect(screen.getByText('New Invoice')).toBeInTheDocument()
  })

  it('shows customer dropdown', async () => {
    const { default: InvoiceBuilder } = await import('./InvoiceBuilder')
    render(<InvoiceBuilder onClose={vi.fn()} />)

    const select = screen.getByLabelText('Customer')
    expect(select).toBeInTheDocument()
    expect(select).toHaveDisplayValue('Select customer...')
  })

  it('shows the line items table', async () => {
    const { default: InvoiceBuilder } = await import('./InvoiceBuilder')
    render(<InvoiceBuilder onClose={vi.fn()} />)

    expect(screen.getByText('Line Items')).toBeInTheDocument()
    expect(screen.getByText('Description')).toBeInTheDocument()
    expect(screen.getByText('Qty')).toBeInTheDocument()
    expect(screen.getByText('Rate')).toBeInTheDocument()
    expect(screen.getByText('Amount')).toBeInTheDocument()
  })

  it('shows Save as Draft and Send Invoice buttons', async () => {
    const { default: InvoiceBuilder } = await import('./InvoiceBuilder')
    render(<InvoiceBuilder onClose={vi.fn()} />)

    expect(screen.getByRole('button', { name: 'Save as Draft' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Send Invoice' })).toBeInTheDocument()
  })

  it('shows auto-generated invoice number', async () => {
    const { default: InvoiceBuilder } = await import('./InvoiceBuilder')
    render(<InvoiceBuilder onClose={vi.fn()} />)

    const invoiceNumberInput = screen.getByLabelText('Invoice number')
    expect(invoiceNumberInput).toHaveValue('INV-0006')
  })
})
