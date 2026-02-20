import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import SearchResultsPage from './SearchResultsPage'
import { useChorusStore } from '../stores/useChorusStore'
import { useChorusMessageStore } from '../stores/useChorusMessageStore'
import { ChorusChannelType } from '../types'
import type { ChorusMessage } from '../types'

// Mock SearchBar to keep tests focused
vi.mock('../components/SearchBar/SearchBar', () => ({
  default: ({ onSearch, initialQuery }: { onSearch: (q: string) => void; initialQuery?: string }) => (
    <div data-testid="search-bar">
      <input
        data-testid="search-input"
        defaultValue={initialQuery}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            onSearch((e.target as HTMLInputElement).value)
          }
        }}
      />
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
    description: '',
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
]

function makeMessage(overrides: Partial<ChorusMessage> = {}): ChorusMessage {
  return {
    id: 'msg-1',
    conversationId: 'ch-general',
    conversationType: 'channel',
    senderId: 'user-alex',
    senderName: 'Alex Johnson',
    senderAvatarUrl: '',
    content: 'Hello world this is a test message',
    messageType: 'text',
    timestamp: '2026-02-19T10:00:00Z',
    editedAt: null,
    isEdited: false,
    threadId: null,
    threadReplyCount: 0,
    threadParticipantIds: [],
    threadLastReplyAt: null,
    reactions: [],
    isPinned: false,
    isBookmarked: false,
    isDeleted: false,
    attachments: [],
    mentions: [],
    pollData: null,
    crossModuleRef: null,
    ...overrides,
  }
}

function renderPage(initialRoute = '/chorus/search') {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <SearchResultsPage />
    </MemoryRouter>
  )
}

describe('SearchResultsPage', () => {
  beforeEach(() => {
    useChorusStore.setState({ channels: mockChannels })
    useChorusMessageStore.setState({ messages: {} })
  })

  it('renders the search bar', () => {
    renderPage()
    expect(screen.getByTestId('search-bar')).toBeInTheDocument()
  })

  it('shows initial empty state', () => {
    renderPage()
    expect(screen.getByText('Search messages across all channels')).toBeInTheDocument()
  })

  it('shows no results state when query matches nothing', async () => {
    const user = userEvent.setup()
    renderPage()

    const input = screen.getByTestId('search-input')
    await user.clear(input)
    await user.type(input, 'nonexistent{Enter}')
    expect(screen.getByText('No results found')).toBeInTheDocument()
  })

  it('displays search results grouped by channel', async () => {
    const user = userEvent.setup()
    useChorusMessageStore.setState({
      messages: {
        'ch-general': [
          makeMessage({ content: 'database optimization is important' }),
          makeMessage({
            id: 'msg-2',
            content: 'we should optimize the database layer',
            senderName: 'Sarah Chen',
          }),
        ],
      },
    })

    renderPage()

    const input = screen.getByTestId('search-input')
    await user.clear(input)
    await user.type(input, 'database{Enter}')

    expect(screen.getByText('2 results')).toBeInTheDocument()
    expect(screen.getByText('General')).toBeInTheDocument()
  })

  it('shows singular result text for 1 result', async () => {
    const user = userEvent.setup()
    useChorusMessageStore.setState({
      messages: {
        'ch-general': [makeMessage({ content: 'unique search term' })],
      },
    })

    renderPage()

    const input = screen.getByTestId('search-input')
    await user.clear(input)
    await user.type(input, 'unique{Enter}')

    expect(screen.getByText('1 result')).toBeInTheDocument()
  })
})
