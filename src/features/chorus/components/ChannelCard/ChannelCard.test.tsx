import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ChannelCard from './ChannelCard'
import { ChorusChannelType } from '../../types'
import type { ChorusChannel } from '../../types'

const mockChannel: ChorusChannel = {
  id: 'ch-general',
  name: 'general',
  displayName: 'General',
  type: ChorusChannelType.Public,
  topic: 'General discussion',
  description: 'A place for general team discussion and announcements.',
  createdBy: 'user-1',
  createdAt: '2026-01-01T00:00:00Z',
  memberIds: ['user-1', 'user-2', 'user-3'],
  pinnedMessageIds: [],
  isStarred: false,
  isMuted: false,
  lastMessageAt: '2026-02-19T10:00:00Z',
  unreadCount: 0,
  mentionCount: 0,
}

const privateChannel: ChorusChannel = {
  ...mockChannel,
  id: 'ch-private',
  name: 'leadership',
  displayName: 'Leadership',
  type: ChorusChannelType.Private,
}

describe('ChannelCard', () => {
  it('renders channel name and description', () => {
    render(
      <ChannelCard
        channel={mockChannel}
        isMember={false}
        onJoin={vi.fn()}
        onOpen={vi.fn()}
      />
    )
    expect(screen.getByText('General')).toBeInTheDocument()
    expect(screen.getByText('A place for general team discussion and announcements.')).toBeInTheDocument()
  })

  it('shows member count', () => {
    render(
      <ChannelCard
        channel={mockChannel}
        isMember={false}
        onJoin={vi.fn()}
        onOpen={vi.fn()}
      />
    )
    expect(screen.getByText('3 members')).toBeInTheDocument()
  })

  it('shows singular member text for 1 member', () => {
    const singleMemberChannel = { ...mockChannel, memberIds: ['user-1'] }
    render(
      <ChannelCard
        channel={singleMemberChannel}
        isMember={false}
        onJoin={vi.fn()}
        onOpen={vi.fn()}
      />
    )
    expect(screen.getByText('1 member')).toBeInTheDocument()
  })

  it('shows Join button for non-member channels', () => {
    render(
      <ChannelCard
        channel={mockChannel}
        isMember={false}
        onJoin={vi.fn()}
        onOpen={vi.fn()}
      />
    )
    expect(screen.getByRole('button', { name: 'Join' })).toBeInTheDocument()
  })

  it('shows Open button for member channels', () => {
    render(
      <ChannelCard
        channel={mockChannel}
        isMember={true}
        onJoin={vi.fn()}
        onOpen={vi.fn()}
      />
    )
    expect(screen.getByRole('button', { name: 'Open' })).toBeInTheDocument()
  })

  it('calls onJoin when Join button is clicked', async () => {
    const user = userEvent.setup()
    const onJoin = vi.fn()
    render(
      <ChannelCard
        channel={mockChannel}
        isMember={false}
        onJoin={onJoin}
        onOpen={vi.fn()}
      />
    )
    await user.click(screen.getByRole('button', { name: 'Join' }))
    expect(onJoin).toHaveBeenCalledWith('ch-general')
  })

  it('calls onOpen when Open button is clicked', async () => {
    const user = userEvent.setup()
    const onOpen = vi.fn()
    render(
      <ChannelCard
        channel={mockChannel}
        isMember={true}
        onJoin={vi.fn()}
        onOpen={onOpen}
      />
    )
    await user.click(screen.getByRole('button', { name: 'Open' }))
    expect(onOpen).toHaveBeenCalledWith('ch-general')
  })

  it('renders lock icon for private channels', () => {
    render(
      <ChannelCard
        channel={privateChannel}
        isMember={false}
        onJoin={vi.fn()}
        onOpen={vi.fn()}
      />
    )
    expect(screen.getByLabelText('Leadership channel')).toBeInTheDocument()
  })

  it('has aria-label on the card', () => {
    render(
      <ChannelCard
        channel={mockChannel}
        isMember={true}
        onJoin={vi.fn()}
        onOpen={vi.fn()}
      />
    )
    expect(screen.getByLabelText('General channel')).toBeInTheDocument()
  })
})
