import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ContactDetail from './ContactDetail'
import type { Contact } from '../../../../types'

const sampleContact: Contact = {
  id: 'c1',
  name: 'Jane Smith',
  email: 'jane@example.com',
  company: 'Acme Corp',
  phone: '+1 555-0101',
  signingHistory: [
    { documentId: 'doc1', date: '2026-02-01T10:00:00Z', status: 'signed' },
    { documentId: 'doc2', date: '2026-02-05T14:00:00Z', status: 'pending' },
  ],
  createdAt: '2026-01-10T10:00:00Z',
}

describe('ContactDetail', () => {
  it('renders contact info', () => {
    render(
      <ContactDetail contact={sampleContact} onEdit={vi.fn()} onClose={vi.fn()} />
    )
    expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    expect(screen.getByText('jane@example.com')).toBeInTheDocument()
    expect(screen.getByText('Acme Corp')).toBeInTheDocument()
    expect(screen.getByText('+1 555-0101')).toBeInTheDocument()
  })

  it('displays initials in avatar', () => {
    render(
      <ContactDetail contact={sampleContact} onEdit={vi.fn()} onClose={vi.fn()} />
    )
    expect(screen.getByText('JS')).toBeInTheDocument()
  })

  it('renders signing history', () => {
    render(
      <ContactDetail contact={sampleContact} onEdit={vi.fn()} onClose={vi.fn()} />
    )
    expect(screen.getByText('Signing History')).toBeInTheDocument()
    expect(screen.getByText('signed')).toBeInTheDocument()
    expect(screen.getByText('pending')).toBeInTheDocument()
  })

  it('shows empty signing history message', () => {
    const noHistory = { ...sampleContact, signingHistory: [] }
    render(
      <ContactDetail contact={noHistory} onEdit={vi.fn()} onClose={vi.fn()} />
    )
    expect(screen.getByText('No signing history')).toBeInTheDocument()
  })

  it('enters edit mode on Edit click', async () => {
    const user = userEvent.setup()
    render(
      <ContactDetail contact={sampleContact} onEdit={vi.fn()} onClose={vi.fn()} />
    )
    await user.click(screen.getByText('Edit'))
    expect(screen.getByLabelText('Contact name')).toHaveValue('Jane Smith')
    expect(screen.getByLabelText('Contact email')).toHaveValue('jane@example.com')
  })

  it('saves edits on Save click', async () => {
    const user = userEvent.setup()
    const onEdit = vi.fn()
    render(
      <ContactDetail contact={sampleContact} onEdit={onEdit} onClose={vi.fn()} />
    )
    await user.click(screen.getByText('Edit'))
    const nameInput = screen.getByLabelText('Contact name')
    await user.clear(nameInput)
    await user.type(nameInput, 'Janet Smith')
    await user.click(screen.getByText('Save'))
    expect(onEdit).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Janet Smith' })
    )
  })

  it('cancels edits on Cancel click', async () => {
    const user = userEvent.setup()
    render(
      <ContactDetail contact={sampleContact} onEdit={vi.fn()} onClose={vi.fn()} />
    )
    await user.click(screen.getByText('Edit'))
    const nameInput = screen.getByLabelText('Contact name')
    await user.clear(nameInput)
    await user.type(nameInput, 'Modified')
    await user.click(screen.getByText('Cancel'))
    // Should be back to display mode showing original name
    expect(screen.getByText('Jane Smith')).toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(
      <ContactDetail contact={sampleContact} onEdit={vi.fn()} onClose={onClose} />
    )
    await user.click(screen.getByLabelText('Close contact detail'))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('shows dashes for missing company and phone', () => {
    const minimal: Contact = {
      id: 'c2',
      name: 'Bob',
      email: 'bob@example.com',
      signingHistory: [],
      createdAt: '2026-01-01T00:00:00Z',
    }
    render(
      <ContactDetail contact={minimal} onEdit={vi.fn()} onClose={vi.fn()} />
    )
    const dashes = screen.getAllByText('--')
    expect(dashes).toHaveLength(2)
  })
})
