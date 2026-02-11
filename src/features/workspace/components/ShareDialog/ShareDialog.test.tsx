import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ShareDialog from './ShareDialog'

describe('ShareDialog', () => {
  const defaultProps = {
    isOpen: true,
    pageTitle: 'Test Page',
    onClose: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders nothing when not open', () => {
    const { container } = render(<ShareDialog {...defaultProps} isOpen={false} />)
    expect(container.innerHTML).toBe('')
  })

  it('renders dialog with page title', () => {
    render(<ShareDialog {...defaultProps} />)
    expect(screen.getByText(/Test Page/)).toBeInTheDocument()
  })

  it('shows pre-populated shared users', () => {
    render(<ShareDialog {...defaultProps} />)
    expect(screen.getByText('Alex Kim')).toBeInTheDocument()
    expect(screen.getByText('Maya Chen')).toBeInTheDocument()
  })

  it('shows current user as owner', () => {
    render(<ShareDialog {...defaultProps} />)
    expect(screen.getByText('You (Owner)')).toBeInTheDocument()
    expect(screen.getByText('Owner')).toBeInTheDocument()
  })

  it('adds a new user when invite button is clicked', async () => {
    const user = userEvent.setup()
    render(<ShareDialog {...defaultProps} />)

    const input = screen.getByPlaceholderText('Add people by email...')
    await user.type(input, 'newuser@example.com')
    await user.click(screen.getByText('Invite'))

    expect(screen.getByText('newuser')).toBeInTheDocument()
  })

  it('removes a user when remove button is clicked', async () => {
    const user = userEvent.setup()
    render(<ShareDialog {...defaultProps} />)

    expect(screen.getByText('Alex Kim')).toBeInTheDocument()
    const removeButtons = screen.getAllByTitle('Remove')
    await user.click(removeButtons[0]!)

    expect(screen.queryByText('Alex Kim')).not.toBeInTheDocument()
  })

  it('copies link when copy button is clicked', async () => {
    const user = userEvent.setup()
    render(<ShareDialog {...defaultProps} />)

    // Spy on the clipboard stub's writeText after userEvent.setup() has attached it
    const writeTextSpy = vi.spyOn(navigator.clipboard, 'writeText')

    await user.click(screen.getByText('Copy link'))
    expect(writeTextSpy).toHaveBeenCalled()
    expect(screen.getByText('Copied!')).toBeInTheDocument()

    writeTextSpy.mockRestore()
  })

  it('toggles link access', async () => {
    const user = userEvent.setup()
    render(<ShareDialog {...defaultProps} />)

    // Initially restricted
    expect(screen.getByText('Restricted')).toBeInTheDocument()

    // Enable public link
    await user.click(screen.getByText('Enable'))
    expect(screen.getByText('Anyone with the link')).toBeInTheDocument()

    // Restrict again
    await user.click(screen.getByText('Restrict'))
    expect(screen.getByText('Restricted')).toBeInTheDocument()
  })

  it('closes when close button is clicked', async () => {
    const user = userEvent.setup()
    render(<ShareDialog {...defaultProps} />)

    await user.click(screen.getByLabelText('Close share dialog'))
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1)
  })

  it('closes when overlay is clicked', async () => {
    const user = userEvent.setup()
    render(<ShareDialog {...defaultProps} />)

    // Click the overlay (the dialog wrapper)
    const overlay = screen.getByRole('dialog')
    await user.click(overlay)
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1)
  })

  it('has permission dropdowns for shared users', () => {
    render(<ShareDialog {...defaultProps} />)
    const selects = screen.getAllByLabelText(/Change permission/)
    expect(selects.length).toBeGreaterThanOrEqual(2)
  })

  it('invites on Enter key', async () => {
    const user = userEvent.setup()
    render(<ShareDialog {...defaultProps} />)

    const input = screen.getByPlaceholderText('Add people by email...')
    await user.type(input, 'enter@example.com{Enter}')

    expect(screen.getByText('enter')).toBeInTheDocument()
  })
})
