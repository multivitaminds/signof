import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PinnedMessages from './PinnedMessages'
import { useChorusMessageStore } from '../../stores/useChorusMessageStore'
import type { ChorusMessage } from '../../types'

function makePinnedMessage(overrides: Partial<ChorusMessage> = {}): ChorusMessage {
  return {
    id: 'msg-1',
    conversationId: 'ch-general',
    conversationType: 'channel',
    senderId: 'user-alex',
    senderName: 'Alex Johnson',
    senderAvatarUrl: '',
    content: 'This is a pinned message',
    messageType: 'text',
    timestamp: '2026-02-19T10:00:00Z',
    editedAt: null,
    isEdited: false,
    threadId: null,
    threadReplyCount: 0,
    threadParticipantIds: [],
    threadLastReplyAt: null,
    reactions: [],
    isPinned: true,
    isBookmarked: false,
    isDeleted: false,
    attachments: [],
    mentions: [],
    pollData: null,
    crossModuleRef: null,
    ...overrides,
  }
}

describe('PinnedMessages', () => {
  beforeEach(() => {
    useChorusMessageStore.setState({ messages: {} })
    document.body.style.overflow = ''
  })

  it('does not render when isOpen is false', () => {
    render(
      <PinnedMessages conversationId="ch-general" isOpen={false} onClose={vi.fn()} />
    )
    expect(screen.queryByText('Pinned Messages')).not.toBeInTheDocument()
  })

  it('renders the pinned messages panel when open', () => {
    render(
      <PinnedMessages conversationId="ch-general" isOpen={true} onClose={vi.fn()} />
    )
    expect(screen.getByText('Pinned Messages')).toBeInTheDocument()
  })

  it('shows empty state when no pinned messages', () => {
    render(
      <PinnedMessages conversationId="ch-general" isOpen={true} onClose={vi.fn()} />
    )
    expect(screen.getByText('No pinned messages')).toBeInTheDocument()
  })

  it('displays pinned messages', () => {
    useChorusMessageStore.setState({
      messages: {
        'ch-general': [
          makePinnedMessage(),
          makePinnedMessage({
            id: 'msg-2',
            senderName: 'Sarah Chen',
            content: 'Another pinned message',
          }),
        ],
      },
    })

    render(
      <PinnedMessages conversationId="ch-general" isOpen={true} onClose={vi.fn()} />
    )
    expect(screen.getByText('This is a pinned message')).toBeInTheDocument()
    expect(screen.getByText('Another pinned message')).toBeInTheDocument()
    expect(screen.getByText('Alex Johnson')).toBeInTheDocument()
    expect(screen.getByText('Sarah Chen')).toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(
      <PinnedMessages conversationId="ch-general" isOpen={true} onClose={onClose} />
    )
    await user.click(screen.getByLabelText('Close pinned messages'))
    expect(onClose).toHaveBeenCalled()
  })

  it('calls onClose on Escape key', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(
      <PinnedMessages conversationId="ch-general" isOpen={true} onClose={onClose} />
    )
    await user.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalled()
  })

  it('has proper dialog role and aria attributes', () => {
    render(
      <PinnedMessages conversationId="ch-general" isOpen={true} onClose={vi.fn()} />
    )
    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('aria-label', 'Pinned messages')
    expect(dialog).toHaveAttribute('aria-modal', 'true')
  })
})
