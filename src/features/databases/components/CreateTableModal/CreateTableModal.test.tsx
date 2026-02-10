import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CreateTableModal from './CreateTableModal'

describe('CreateTableModal', () => {
  const defaultProps = {
    databaseId: 'db1',
    existingTableNames: ['Contacts', 'Products'],
    onCreateTable: vi.fn(),
    onClose: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders name input and create button', () => {
    render(<CreateTableModal {...defaultProps} />)

    expect(screen.getByLabelText(/table name/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /create table/i })).toBeInTheDocument()
  })

  it('create button is disabled when name is empty', () => {
    render(<CreateTableModal {...defaultProps} />)

    const createBtn = screen.getByRole('button', { name: /create table/i })
    expect(createBtn).toBeDisabled()
  })

  it('shows error for duplicate name', async () => {
    const user = userEvent.setup()
    render(<CreateTableModal {...defaultProps} />)

    const input = screen.getByLabelText(/table name/i)
    await user.type(input, 'Contacts')

    expect(screen.getByText('A table with this name already exists')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /create table/i })).toBeDisabled()
  })

  it('calls onCreateTable with name and icon', async () => {
    const user = userEvent.setup()
    render(<CreateTableModal {...defaultProps} />)

    const input = screen.getByLabelText(/table name/i)
    await user.type(input, 'Orders')

    const createBtn = screen.getByRole('button', { name: /create table/i })
    await user.click(createBtn)

    expect(defaultProps.onCreateTable).toHaveBeenCalledWith('Orders', expect.any(String))
  })

  it('calls onClose on cancel', async () => {
    const user = userEvent.setup()
    render(<CreateTableModal {...defaultProps} />)

    const cancelBtn = screen.getByRole('button', { name: /cancel/i })
    await user.click(cancelBtn)

    expect(defaultProps.onClose).toHaveBeenCalled()
  })

  it('auto-focuses name input', () => {
    render(<CreateTableModal {...defaultProps} />)

    const input = screen.getByLabelText(/table name/i)
    expect(input).toHaveFocus()
  })
})
