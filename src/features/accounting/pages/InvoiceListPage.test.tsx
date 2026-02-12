import { render, screen } from '@testing-library/react'

vi.mock('../stores/useInvoiceStore', () => ({
  useInvoiceStore: (selector: (s: Record<string, unknown>) => unknown) => {
    const state = {
      invoices: [
        {
          id: 'inv-1',
          invoiceNumber: 'INV-0001',
          customerId: 'c-1',
          customerName: 'Acme Corp',
          issueDate: '2026-02-01',
          dueDate: '2026-03-03',
          paymentTerms: 'net_30',
          status: 'draft',
          lineItems: [],
          subtotal: 1200,
          taxRate: 0,
          taxAmount: 0,
          discount: 0,
          total: 1200,
          amountPaid: 0,
          balance: 1200,
          notes: '',
          createdAt: '2026-02-01T00:00:00Z',
        },
        {
          id: 'inv-2',
          invoiceNumber: 'INV-0002',
          customerId: 'c-2',
          customerName: 'Globex Inc',
          issueDate: '2026-01-15',
          dueDate: '2026-02-14',
          paymentTerms: 'net_30',
          status: 'sent',
          lineItems: [],
          subtotal: 3450,
          taxRate: 0,
          taxAmount: 0,
          discount: 0,
          total: 3450,
          amountPaid: 0,
          balance: 3450,
          notes: '',
          createdAt: '2026-01-15T00:00:00Z',
        },
      ],
      deleteInvoice: vi.fn(),
      sendInvoice: vi.fn(),
      voidInvoice: vi.fn(),
      getOutstandingTotal: () => 3450,
      getOverdueTotal: () => 0,
    }
    return selector(state)
  },
}))

vi.mock('../stores/useAccountingContactStore', () => ({
  useAccountingContactStore: (selector: (s: Record<string, unknown>) => unknown) => {
    const state = { contacts: [] }
    return selector(state)
  },
}))

vi.mock('../components/InvoiceBuilder/InvoiceBuilder', () => ({
  default: () => <div data-testid="invoice-builder">InvoiceBuilder</div>,
}))

vi.mock('../components/PaymentModal/PaymentModal', () => ({
  default: () => <div data-testid="payment-modal">PaymentModal</div>,
}))

describe('InvoiceListPage', () => {
  beforeEach(async () => {
    const { default: InvoiceListPage } = await import('./InvoiceListPage')
    render(<InvoiceListPage />)
  })

  it('renders the Invoicing heading', () => {
    expect(screen.getByRole('heading', { name: 'Invoicing' })).toBeInTheDocument()
  })

  it('shows filter pills', () => {
    expect(screen.getByRole('tab', { name: 'All' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Draft' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Sent' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Paid' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Overdue' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Void' })).toBeInTheDocument()
  })

  it('shows sample invoices in the table', () => {
    expect(screen.getByText('INV-0001')).toBeInTheDocument()
    expect(screen.getByText('INV-0002')).toBeInTheDocument()
    expect(screen.getByText('Acme Corp')).toBeInTheDocument()
    expect(screen.getByText('Globex Inc')).toBeInTheDocument()
  })

  it('shows summary cards', () => {
    expect(screen.getByText('Total Outstanding')).toBeInTheDocument()
    expect(screen.getByText('Total Overdue')).toBeInTheDocument()
  })

  it('shows the New Invoice button', () => {
    expect(screen.getByRole('button', { name: /new invoice/i })).toBeInTheDocument()
  })
})
