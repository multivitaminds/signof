import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import NewMessageModal from './NewMessageModal'
import { useChorusStore } from '../../stores/useChorusStore'
import { ChorusPresenceStatus } from '../../types'
import type { ChorusUser } from '../../types'

// Mock PresenceAvatar
vi.mock('../PresenceAvatar/PresenceAvatar', () => ({
  default: ({ name }: { name: string }) => (
    <div data-testid="presence-avatar" aria-label={name} />
  ),
}))

const mockUsers: ChorusUser[] = [
  {
    id: 'user-you',
    name: 'you',
    displayName: 'You',
    email: 'you@test.com',
    avatarUrl: '',
    presence: ChorusPresenceStatus.Online,
    customStatus: null,
    customStatusEmoji: null,
    timezone: 'UTC',
    lastSeenAt: '2026-02-19T10:00:00Z',
  },
  {
    id: 'user-alex',
    name: 'alex.johnson',
    displayName: 'Alex Johnson',
    email: 'alex@test.com',
    avatarUrl: '',
    presence: ChorusPresenceStatus.Online,
    customStatus: null,
    customStatusEmoji: null,
    timezone: 'UTC',
    lastSeenAt: '2026-02-19T10:00:00Z',
  },
  {
    id: 'user-sarah',
    name: 'sarah.chen',
    displayName: 'Sarah Chen',
    email: 'sarah@test.com',
    avatarUrl: '',
    presence: ChorusPresenceStatus.Away,
    customStatus: null,
    customStatusEmoji: null,
    timezone: 'UTC',
    lastSeenAt: '2026-02-19T10:00:00Z',
  },
]

describe('NewMessageModal', () => {
  const onClose = vi.fn()
  const createDM = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    useChorusStore.setState({
      users: mockUsers,
      currentUserId: 'user-you',
      createDM,
    })
  })

  it('renders nothing when not open', () => {
    const { container } = render(<NewMessageModal isOpen={false} onClose={onClose} />)
    expect(container.innerHTML).toBe('')
  })

  it('renders modal with title when open', () => {
    render(<NewMessageModal isOpen={true} onClose={onClose} />)
    expect(screen.getByText('New Message')).toBeInTheDocument()
  })

  it('shows other users but not current user', () => {
    render(<NewMessageModal isOpen={true} onClose={onClose} />)
    expect(screen.getByText('Alex Johnson')).toBeInTheDocument()
    expect(screen.getByText('Sarah Chen')).toBeInTheDocument()
    // Current user should not appear in the list
    expect(screen.queryByText('you@test.com')).not.toBeInTheDocument()
  })

  it('filters users by search query', async () => {
    const user = userEvent.setup()
    render(<NewMessageModal isOpen={true} onClose={onClose} />)

    const searchInput = screen.getByLabelText('Search people')
    await user.type(searchInput, 'alex')

    expect(screen.getByText('Alex Johnson')).toBeInTheDocument()
    expect(screen.queryByText('Sarah Chen')).not.toBeInTheDocument()
  })

  it('shows "No users found" for empty search results', async () => {
    const user = userEvent.setup()
    render(<NewMessageModal isOpen={true} onClose={onClose} />)

    const searchInput = screen.getByLabelText('Search people')
    await user.type(searchInput, 'zzzzz')

    expect(screen.getByText('No users found')).toBeInTheDocument()
  })

  it('allows selecting a user', async () => {
    const user = userEvent.setup()
    render(<NewMessageModal isOpen={true} onClose={onClose} />)

    await user.click(screen.getByText('Alex Johnson'))
    // Chip should appear in selected area
    const selectedArea = screen.getByLabelText('Selected users')
    expect(selectedArea).toHaveTextContent('Alex Johnson')
  })

  it('allows deselecting a user via chip remove button', async () => {
    const user = userEvent.setup()
    render(<NewMessageModal isOpen={true} onClose={onClose} />)

    await user.click(screen.getByText('Alex Johnson'))
    expect(screen.getByLabelText('Selected users')).toBeInTheDocument()

    await user.click(screen.getByLabelText('Remove Alex Johnson'))
    expect(screen.queryByLabelText('Selected users')).not.toBeInTheDocument()
  })

  it('disables create button when no users selected', () => {
    render(<NewMessageModal isOpen={true} onClose={onClose} />)
    const createBtn = screen.getByText('Start Conversation')
    expect(createBtn).toBeDisabled()
  })

  it('shows "Create Group" when multiple users selected', async () => {
    const user = userEvent.setup()
    render(<NewMessageModal isOpen={true} onClose={onClose} />)

    await user.click(screen.getByText('Alex Johnson'))
    await user.click(screen.getByText('Sarah Chen'))

    expect(screen.getByText('Create Group')).toBeInTheDocument()
  })

  it('calls createDM and onClose when creating a conversation', async () => {
    const user = userEvent.setup()
    render(<NewMessageModal isOpen={true} onClose={onClose} />)

    await user.click(screen.getByText('Alex Johnson'))
    await user.click(screen.getByText('Start Conversation'))

    expect(createDM).toHaveBeenCalledWith(['user-you', 'user-alex'], 'Alex Johnson')
    expect(onClose).toHaveBeenCalled()
  })

  it('calls onClose when Cancel is clicked', async () => {
    const user = userEvent.setup()
    render(<NewMessageModal isOpen={true} onClose={onClose} />)

    await user.click(screen.getByText('Cancel'))
    expect(onClose).toHaveBeenCalled()
  })

  it('calls onClose when close button is clicked', async () => {
    const user = userEvent.setup()
    render(<NewMessageModal isOpen={true} onClose={onClose} />)

    await user.click(screen.getByLabelText('Close'))
    expect(onClose).toHaveBeenCalled()
  })

  it('has a dialog role', () => {
    render(<NewMessageModal isOpen={true} onClose={onClose} />)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })
})
