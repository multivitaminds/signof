import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ContactsPage from './ContactsPage'

vi.mock('../stores/useAccountingContactStore', () => {
  const sampleContacts = [
    {
      id: 'contact-acme',
      name: 'John Smith',
      company: 'Acme Corp',
      email: 'john@acmecorp.com',
      phone: '(555) 100-1001',
      type: 'customer',
      address: '123 Main St, San Francisco, CA 94102',
      outstandingBalance: 3450,
      createdAt: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 'contact-officedepot',
      name: 'Vendor Relations',
      company: 'Office Depot',
      email: 'orders@officedepot.com',
      phone: '(800) 463-3768',
      type: 'vendor',
      address: '6600 N Military Trail, Boca Raton, FL 33496',
      outstandingBalance: 450,
      createdAt: '2026-01-01T00:00:00.000Z',
    },
  ]

  const store = {
    contacts: sampleContacts,
    addContact: vi.fn(),
    updateContact: vi.fn(),
    deleteContact: vi.fn(),
    getCustomers: vi.fn(() => sampleContacts.filter((c) => c.type === 'customer')),
    getVendors: vi.fn(() => sampleContacts.filter((c) => c.type === 'vendor')),
    getContactById: vi.fn(),
    clearData: vi.fn(),
  }

  return {
    useAccountingContactStore: (selector: (s: typeof store) => unknown) => selector(store),
  }
})

vi.mock('../stores/useInvoiceStore', () => {
  const store = {
    invoices: [],
  }
  return {
    useInvoiceStore: (selector: (s: typeof store) => unknown) => selector(store),
  }
})

vi.mock('../stores/useExpenseStore', () => {
  const store = {
    expenses: [],
  }
  return {
    useExpenseStore: (selector: (s: typeof store) => unknown) => selector(store),
  }
})

function renderPage() {
  return render(
    <MemoryRouter>
      <ContactsPage />
    </MemoryRouter>
  )
}

describe('ContactsPage', () => {
  it('renders the heading', () => {
    renderPage()
    expect(screen.getByRole('heading', { name: /Customers & Vendors/i })).toBeInTheDocument()
  })

  it('shows filter pills', () => {
    renderPage()
    expect(screen.getByRole('button', { name: 'All' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Customers' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Vendors' })).toBeInTheDocument()
  })

  it('shows sample contacts', () => {
    renderPage()
    expect(screen.getByText('Acme Corp')).toBeInTheDocument()
    expect(screen.getByText('Office Depot')).toBeInTheDocument()
  })

  it('shows Add Contact button', () => {
    renderPage()
    expect(screen.getByRole('button', { name: /Add Contact/i })).toBeInTheDocument()
  })

  it('shows search input', () => {
    renderPage()
    expect(screen.getByLabelText('Search contacts')).toBeInTheDocument()
  })

  it('displays contact type badges', () => {
    renderPage()
    expect(screen.getByText('Customer')).toBeInTheDocument()
    expect(screen.getByText('Vendor')).toBeInTheDocument()
  })

  it('displays outstanding balance', () => {
    renderPage()
    expect(screen.getByText('$3,450.00')).toBeInTheDocument()
    expect(screen.getByText('$450.00')).toBeInTheDocument()
  })
})
