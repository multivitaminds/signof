import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ContactList from './ContactList'
import type { Contact } from '../../../../types'

const sampleContacts: Contact[] = [
  {
    id: 'c1',
    name: 'Jane Smith',
    email: 'jane@example.com',
    company: 'Acme Corp',
    signingHistory: [],
    createdAt: '2026-01-10T10:00:00Z',
  },
  {
    id: 'c2',
    name: 'Bob Johnson',
    email: 'bob@globex.com',
    company: 'Globex',
    signingHistory: [],
    createdAt: '2026-01-15T09:00:00Z',
  },
]

describe('ContactList', () => {
  it('renders all contacts', () => {
    render(
      <ContactList contacts={sampleContacts} onSelect={vi.fn()} />
    )
    expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    expect(screen.getByText('Bob Johnson')).toBeInTheDocument()
  })

  it('shows email and company', () => {
    render(
      <ContactList contacts={sampleContacts} onSelect={vi.fn()} />
    )
    expect(screen.getByText('jane@example.com')).toBeInTheDocument()
    expect(screen.getByText('Acme Corp')).toBeInTheDocument()
  })

  it('shows initials in avatar', () => {
    render(
      <ContactList contacts={sampleContacts} onSelect={vi.fn()} />
    )
    expect(screen.getByText('JS')).toBeInTheDocument()
    expect(screen.getByText('BJ')).toBeInTheDocument()
  })

  it('calls onSelect when contact is clicked', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(
      <ContactList contacts={sampleContacts} onSelect={onSelect} />
    )
    await user.click(screen.getByText('Jane Smith'))
    expect(onSelect).toHaveBeenCalledWith(sampleContacts[0])
  })

  it('highlights selected contact', () => {
    const { container } = render(
      <ContactList contacts={sampleContacts} onSelect={vi.fn()} selectedId="c1" />
    )
    expect(container.querySelector('.contact-list__item--selected')).toBeInTheDocument()
  })

  it('filters contacts by search query', async () => {
    const user = userEvent.setup()
    render(
      <ContactList contacts={sampleContacts} onSelect={vi.fn()} />
    )
    await user.type(screen.getByPlaceholderText('Search contacts...'), 'bob')
    expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument()
    expect(screen.getByText('Bob Johnson')).toBeInTheDocument()
  })

  it('shows empty state when no matches', async () => {
    const user = userEvent.setup()
    render(
      <ContactList contacts={sampleContacts} onSelect={vi.fn()} />
    )
    await user.type(screen.getByPlaceholderText('Search contacts...'), 'xyz')
    expect(screen.getByText('No contacts match your search')).toBeInTheDocument()
  })

  it('shows empty state when no contacts', () => {
    render(
      <ContactList contacts={[]} onSelect={vi.fn()} />
    )
    expect(screen.getByText('No contacts yet')).toBeInTheDocument()
  })

  it('calls onDelete when delete button is clicked', async () => {
    const user = userEvent.setup()
    const onDelete = vi.fn()
    render(
      <ContactList contacts={sampleContacts} onSelect={vi.fn()} onDelete={onDelete} />
    )
    const deleteBtn = screen.getByLabelText('Delete Jane Smith')
    await user.click(deleteBtn)
    expect(onDelete).toHaveBeenCalledWith('c1')
  })

  it('supports keyboard navigation', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(
      <ContactList contacts={sampleContacts} onSelect={onSelect} />
    )
    const item = screen.getByText('Jane Smith').closest('[role="option"]')! as HTMLElement
    item.focus()
    await user.keyboard('{Enter}')
    expect(onSelect).toHaveBeenCalledWith(sampleContacts[0])
  })
})
