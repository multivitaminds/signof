import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import ChannelBrowserPage from './ChannelBrowserPage'
import { useChorusStore } from '../stores/useChorusStore'
import { ChorusChannelType } from '../types'

// Mock ChannelCard to keep tests focused
vi.mock('../components/ChannelCard/ChannelCard', () => ({
  default: ({
    channel,
    isMember,
    onJoin,
    onOpen,
  }: {
    channel: { id: string; displayName: string }
    isMember: boolean
    onJoin: (id: string) => void
    onOpen: (id: string) => void
  }) => (
    <div data-testid={`channel-card-${channel.id}`}>
      <span>{channel.displayName}</span>
      {isMember ? (
        <button onClick={() => onOpen(channel.id)}>Open</button>
      ) : (
        <button onClick={() => onJoin(channel.id)}>Join</button>
      )}
    </div>
  ),
}))

const mockChannels = [
  {
    id: 'ch-general',
    name: 'general',
    displayName: 'General',
    type: ChorusChannelType.Public,
    topic: '',
    description: 'General discussion',
    createdBy: 'user-1',
    createdAt: '2026-01-01T00:00:00Z',
    memberIds: ['user-you'],
    pinnedMessageIds: [],
    isStarred: false,
    isMuted: false,
    lastMessageAt: '2026-02-19T10:00:00Z',
    unreadCount: 0,
    mentionCount: 0,
  },
  {
    id: 'ch-engineering',
    name: 'engineering',
    displayName: 'Engineering',
    type: ChorusChannelType.Public,
    topic: '',
    description: 'Engineering team',
    createdBy: 'user-1',
    createdAt: '2026-01-01T00:00:00Z',
    memberIds: ['user-1'],
    pinnedMessageIds: [],
    isStarred: false,
    isMuted: false,
    lastMessageAt: '2026-02-19T09:00:00Z',
    unreadCount: 0,
    mentionCount: 0,
  },
  {
    id: 'ch-archived',
    name: 'old-channel',
    displayName: 'Old Channel',
    type: ChorusChannelType.Archived,
    topic: '',
    description: '',
    createdBy: 'user-1',
    createdAt: '2026-01-01T00:00:00Z',
    memberIds: [],
    pinnedMessageIds: [],
    isStarred: false,
    isMuted: false,
    lastMessageAt: '2025-12-01T10:00:00Z',
    unreadCount: 0,
    mentionCount: 0,
  },
]

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/chorus/browse']}>
      <ChannelBrowserPage />
    </MemoryRouter>
  )
}

describe('ChannelBrowserPage', () => {
  beforeEach(() => {
    useChorusStore.setState({
      channels: mockChannels,
      currentUserId: 'user-you',
    })
  })

  it('renders the page title', () => {
    renderPage()
    expect(screen.getByText('Browse Channels')).toBeInTheDocument()
  })

  it('shows channel count (excluding archived)', () => {
    renderPage()
    expect(screen.getByText('2 channels available')).toBeInTheDocument()
  })

  it('renders channel cards for non-archived channels', () => {
    renderPage()
    expect(screen.getByTestId('channel-card-ch-general')).toBeInTheDocument()
    expect(screen.getByTestId('channel-card-ch-engineering')).toBeInTheDocument()
    expect(screen.queryByTestId('channel-card-ch-archived')).not.toBeInTheDocument()
  })

  it('shows Open for channels user is a member of', () => {
    renderPage()
    // user-you is in ch-general but not ch-engineering
    const generalCard = screen.getByTestId('channel-card-ch-general')
    expect(generalCard.querySelector('button')).toHaveTextContent('Open')
  })

  it('shows Join for channels user is not a member of', () => {
    renderPage()
    const engCard = screen.getByTestId('channel-card-ch-engineering')
    expect(engCard.querySelector('button')).toHaveTextContent('Join')
  })

  it('filters channels by search input', async () => {
    const user = userEvent.setup()
    renderPage()

    const filterInput = screen.getByLabelText('Filter channels')
    await user.type(filterInput, 'eng')

    expect(screen.queryByTestId('channel-card-ch-general')).not.toBeInTheDocument()
    expect(screen.getByTestId('channel-card-ch-engineering')).toBeInTheDocument()
  })

  it('shows empty state when filter matches nothing', async () => {
    const user = userEvent.setup()
    renderPage()

    const filterInput = screen.getByLabelText('Filter channels')
    await user.type(filterInput, 'zzzzz')

    expect(screen.getByText('No channels match your filter')).toBeInTheDocument()
  })

  it('calls joinChannel when Join is clicked', async () => {
    const user = userEvent.setup()
    const joinChannel = vi.fn()
    useChorusStore.setState({ joinChannel })

    renderPage()

    const joinBtn = screen.getByTestId('channel-card-ch-engineering').querySelector('button')
    if (joinBtn) {
      await user.click(joinBtn)
    }
    expect(joinChannel).toHaveBeenCalledWith('ch-engineering', 'user-you')
  })

  it('renders filter input with placeholder', () => {
    renderPage()
    expect(screen.getByPlaceholderText('Search channels...')).toBeInTheDocument()
  })
})
