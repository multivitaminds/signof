import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ContactPicker from './ContactPicker'
import type { Contact } from '../../../../types'

const sampleContacts: Contact[] = [
  {
    id: 'c1',
    name: 'Jane Smith',
    email: 'jane@example.com',
    signingHistory: [],
    createdAt: '2026-01-10T10:00:00Z',
  },
  {
    id: 'c2',
    name: 'Bob Johnson',
    email: 'bob@globex.com',
    signingHistory: [],
    createdAt: '2026-01-15T09:00:00Z',
  },
  {
    id: 'c3',
    name: 'Alice Williams',
    email: 'alice@startup.io',
    signingHistory: [],
    createdAt: '2026-01-20T10:00:00Z',
  },
]

describe('ContactPicker', () => {
  it('renders all contacts', () => {
    render(
      <ContactPicker contacts={sampleContacts} selectedIds={[]} onChange={vi.fn()} />
    )
    expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    expect(screen.getByText('Bob Johnson')).toBeInTheDocument()
    expect(screen.getByText('Alice Williams')).toBeInTheDocument()
  })

  it('shows selected contacts as chips', () => {
    render(
      <ContactPicker contacts={sampleContacts} selectedIds={['c1', 'c2']} onChange={vi.fn()} />
    )
    const chips = screen.getByRole('list', { name: 'Selected contacts' })
    expect(chips).toBeInTheDocument()
    // Chips show the name
    const items = screen.getAllByRole('listitem')
    expect(items).toHaveLength(2)
  })

  it('calls onChange when a contact is toggled on', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(
      <ContactPicker contacts={sampleContacts} selectedIds={[]} onChange={onChange} />
    )
    await user.click(screen.getByLabelText('Jane Smith'))
    expect(onChange).toHaveBeenCalledWith(['c1'])
  })

  it('calls onChange when a contact is toggled off', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(
      <ContactPicker contacts={sampleContacts} selectedIds={['c1']} onChange={onChange} />
    )
    await user.click(screen.getByLabelText('Jane Smith'))
    expect(onChange).toHaveBeenCalledWith([])
  })

  it('removes chip on click', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(
      <ContactPicker contacts={sampleContacts} selectedIds={['c1', 'c2']} onChange={onChange} />
    )
    await user.click(screen.getByLabelText('Remove Jane Smith'))
    expect(onChange).toHaveBeenCalledWith(['c2'])
  })

  it('filters contacts by search', async () => {
    const user = userEvent.setup()
    render(
      <ContactPicker contacts={sampleContacts} selectedIds={[]} onChange={vi.fn()} />
    )
    await user.type(screen.getByPlaceholderText('Search contacts...'), 'bob')
    expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument()
    expect(screen.getByText('Bob Johnson')).toBeInTheDocument()
  })

  it('shows empty state when no matches', async () => {
    const user = userEvent.setup()
    render(
      <ContactPicker contacts={sampleContacts} selectedIds={[]} onChange={vi.fn()} />
    )
    await user.type(screen.getByPlaceholderText('Search contacts...'), 'xyz')
    expect(screen.getByText('No contacts found')).toBeInTheDocument()
  })

  it('shows add new contact button', () => {
    render(
      <ContactPicker
        contacts={sampleContacts}
        selectedIds={[]}
        onChange={vi.fn()}
        onAddNew={vi.fn()}
      />
    )
    expect(screen.getByText('+ Add new contact')).toBeInTheDocument()
  })

  it('expands add new form and calls onAddNew', async () => {
    const user = userEvent.setup()
    const onAddNew = vi.fn()
    render(
      <ContactPicker
        contacts={sampleContacts}
        selectedIds={[]}
        onChange={vi.fn()}
        onAddNew={onAddNew}
      />
    )
    await user.click(screen.getByText('+ Add new contact'))
    await user.type(screen.getByLabelText('New contact name'), 'New Person')
    await user.type(screen.getByLabelText('New contact email'), 'new@example.com')
    await user.click(screen.getByText('Add'))
    expect(onAddNew).toHaveBeenCalledWith('New Person', 'new@example.com')
  })

  it('hides add new button when onAddNew is not provided', () => {
    render(
      <ContactPicker contacts={sampleContacts} selectedIds={[]} onChange={vi.fn()} />
    )
    expect(screen.queryByText('+ Add new contact')).not.toBeInTheDocument()
  })
})
