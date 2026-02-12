import { render, screen } from '@testing-library/react'
import ContactForm from './ContactForm'

vi.mock('../../stores/useAccountingContactStore', () => {
  const store = {
    addContact: vi.fn(),
    updateContact: vi.fn(),
  }
  return {
    useAccountingContactStore: (selector: (s: typeof store) => unknown) => selector(store),
  }
})

function renderForm(props: { contact?: undefined; onClose?: () => void } = {}) {
  const onClose = props.onClose ?? vi.fn()
  return render(<ContactForm onClose={onClose} />)
}

describe('ContactForm', () => {
  it('renders form fields', () => {
    renderForm()
    expect(screen.getByLabelText(/Name/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Email/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Phone/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Company/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Address/)).toBeInTheDocument()
  })

  it('renders type selector with 3 options', () => {
    renderForm()
    const group = screen.getByRole('radiogroup', { name: 'Contact type' })
    expect(group).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'Customer' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'Vendor' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'Both' })).toBeInTheDocument()
  })

  it('defaults to Customer type', () => {
    renderForm()
    expect(screen.getByRole('radio', { name: 'Customer' })).toHaveAttribute('aria-checked', 'true')
  })

  it('renders Save and Cancel buttons', () => {
    renderForm()
    expect(screen.getByRole('button', { name: 'Add Contact' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
  })

  it('shows "New Contact" title for new contact', () => {
    renderForm()
    expect(screen.getByText('New Contact')).toBeInTheDocument()
  })
})
