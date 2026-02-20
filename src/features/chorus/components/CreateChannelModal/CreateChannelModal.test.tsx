import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CreateChannelModal from './CreateChannelModal'
import { useChorusStore } from '../../stores/useChorusStore'

describe('CreateChannelModal', () => {
  beforeEach(() => {
    useChorusStore.setState({ currentUserId: 'user-you' })
  })

  it('does not render when closed', () => {
    const { container } = render(
      <CreateChannelModal isOpen={false} onClose={vi.fn()} />
    )
    expect(container.querySelector('.create-channel-modal')).not.toBeInTheDocument()
  })

  it('renders form when open', () => {
    render(<CreateChannelModal isOpen={true} onClose={vi.fn()} />)
    expect(screen.getByText('Create a Channel')).toBeInTheDocument()
    expect(screen.getByLabelText('Name')).toBeInTheDocument()
  })

  it('disables submit when name is empty', () => {
    render(<CreateChannelModal isOpen={true} onClose={vi.fn()} />)
    expect(screen.getByText('Create Channel')).toBeDisabled()
  })

  it('enables submit when name is provided', async () => {
    const user = userEvent.setup()
    render(<CreateChannelModal isOpen={true} onClose={vi.fn()} />)

    await user.type(screen.getByPlaceholderText('e.g. project-alpha'), 'my-channel')
    expect(screen.getByText('Create Channel')).not.toBeDisabled()
  })

  it('calls createChannel and onClose on submit', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    const createChannel = vi.fn()
    useChorusStore.setState({ createChannel })

    render(<CreateChannelModal isOpen={true} onClose={onClose} />)

    await user.type(screen.getByPlaceholderText('e.g. project-alpha'), 'new-channel')
    await user.click(screen.getByText('Create Channel'))

    expect(createChannel).toHaveBeenCalledWith('new-channel', '', 'public', 'user-you')
    expect(onClose).toHaveBeenCalled()
  })

  it('calls onClose when cancel clicked', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(<CreateChannelModal isOpen={true} onClose={onClose} />)

    await user.click(screen.getByText('Cancel'))
    expect(onClose).toHaveBeenCalled()
  })

  it('sanitizes channel name', async () => {
    const user = userEvent.setup()
    render(<CreateChannelModal isOpen={true} onClose={vi.fn()} />)

    await user.type(screen.getByPlaceholderText('e.g. project-alpha'), 'My Channel Name!')
    // Should show hint about sanitized name
    expect(screen.getByText(/my-channel-name/)).toBeInTheDocument()
  })
})
