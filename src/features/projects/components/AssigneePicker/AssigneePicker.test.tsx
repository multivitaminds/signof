import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AssigneePicker from './AssigneePicker'
import type { Member } from '../../types'

const mockMembers: Member[] = [
  { id: 'm1', name: 'Alice Johnson', email: 'alice@test.com', avatarUrl: '' },
  { id: 'm2', name: 'Bob Smith', email: 'bob@test.com', avatarUrl: '' },
  { id: 'm3', name: 'Charlie', email: 'charlie@test.com', avatarUrl: '' },
]

describe('AssigneePicker', () => {
  const defaultProps = {
    members: mockMembers,
    value: null as string | null,
    onChange: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders trigger with "Unassigned" when no value', () => {
    render(<AssigneePicker {...defaultProps} />)
    expect(screen.getByText('Unassigned')).toBeInTheDocument()
  })

  it('renders trigger with member name and initials when assigned', () => {
    render(<AssigneePicker {...defaultProps} value="m1" />)
    expect(screen.getByText('Alice Johnson')).toBeInTheDocument()
    expect(screen.getByText('AJ')).toBeInTheDocument()
  })

  it('opens dropdown on click', async () => {
    const user = userEvent.setup()
    render(<AssigneePicker {...defaultProps} />)

    await user.click(screen.getByRole('button'))
    expect(screen.getByRole('listbox')).toBeInTheDocument()
    // Unassigned + 3 members = 4 options
    expect(screen.getAllByRole('option')).toHaveLength(4)
  })

  it('shows Unassigned option first in dropdown', async () => {
    const user = userEvent.setup()
    render(<AssigneePicker {...defaultProps} />)

    await user.click(screen.getByRole('button'))
    const options = screen.getAllByRole('option')
    expect(options[0]).toHaveTextContent('Unassigned')
  })

  it('shows member names with avatar initials', async () => {
    const user = userEvent.setup()
    render(<AssigneePicker {...defaultProps} />)

    await user.click(screen.getByRole('button'))
    expect(screen.getByText('Alice Johnson')).toBeInTheDocument()
    expect(screen.getByText('Bob Smith')).toBeInTheDocument()
    expect(screen.getByText('Charlie')).toBeInTheDocument()
    // Check initials
    expect(screen.getByText('AJ')).toBeInTheDocument()
    expect(screen.getByText('BS')).toBeInTheDocument()
    expect(screen.getByText('C')).toBeInTheDocument()
  })

  it('calls onChange with member id on selection', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<AssigneePicker {...defaultProps} onChange={onChange} />)

    await user.click(screen.getByRole('button'))
    await user.click(screen.getByText('Bob Smith'))
    expect(onChange).toHaveBeenCalledWith('m2')
  })

  it('calls onChange with null when selecting Unassigned', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<AssigneePicker {...defaultProps} value="m1" onChange={onChange} />)

    await user.click(screen.getByRole('button'))
    // There are two "Unassigned" texts: one in the dropdown option.
    // Click the one in the listbox
    const options = screen.getAllByRole('option')
    const firstOption = options[0]!
    await user.click(firstOption)
    expect(onChange).toHaveBeenCalledWith(null)
  })

  it('closes dropdown after selection', async () => {
    const user = userEvent.setup()
    render(<AssigneePicker {...defaultProps} />)

    await user.click(screen.getByRole('button'))
    await user.click(screen.getByText('Alice Johnson'))
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('closes dropdown on Escape', async () => {
    const user = userEvent.setup()
    render(<AssigneePicker {...defaultProps} />)

    await user.click(screen.getByRole('button'))
    expect(screen.getByRole('listbox')).toBeInTheDocument()

    await user.keyboard('{Escape}')
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('navigates with arrow keys and selects with Enter', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<AssigneePicker {...defaultProps} onChange={onChange} />)

    await user.click(screen.getByRole('button'))
    // Default focus is on Unassigned (index 0), arrow down to Alice (index 1)
    await user.keyboard('{ArrowDown}')
    await user.keyboard('{Enter}')
    expect(onChange).toHaveBeenCalledWith('m1')
  })
})
