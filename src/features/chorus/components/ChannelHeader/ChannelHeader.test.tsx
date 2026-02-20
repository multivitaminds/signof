import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ChannelHeader from './ChannelHeader'
import type { ChorusChannel } from '../../types'
import { ChorusChannelType } from '../../types'

function makeChannel(overrides: Partial<ChorusChannel> = {}): ChorusChannel {
  return {
    id: 'ch-general',
    name: 'general',
    displayName: 'General',
    type: ChorusChannelType.Public,
    topic: 'Company-wide announcements',
    description: '',
    createdBy: 'user-1',
    createdAt: '2026-01-01T00:00:00Z',
    memberIds: ['user-you', 'user-alex', 'user-sarah'],
    pinnedMessageIds: [],
    isStarred: false,
    isMuted: false,
    lastMessageAt: '2026-02-19T10:00:00Z',
    unreadCount: 0,
    mentionCount: 0,
    ...overrides,
  }
}

describe('ChannelHeader', () => {
  it('renders channel name', () => {
    render(<ChannelHeader channel={makeChannel()} />)
    expect(screen.getByText('General')).toBeInTheDocument()
  })

  it('renders topic text', () => {
    render(<ChannelHeader channel={makeChannel()} />)
    expect(screen.getByText('Company-wide announcements')).toBeInTheDocument()
  })

  it('renders hash icon for public channels', () => {
    const { container } = render(<ChannelHeader channel={makeChannel()} />)
    // Hash icon is aria-hidden, just check it renders
    expect(container.querySelector('.chorus-channel-header__icon')).toBeInTheDocument()
  })

  it('renders lock icon for private channels', () => {
    render(
      <ChannelHeader channel={makeChannel({ type: ChorusChannelType.Private })} />
    )
    expect(screen.getByLabelText('Private channel')).toBeInTheDocument()
  })

  it('renders DM name when channel is null', () => {
    render(<ChannelHeader channel={null} dmName="Sarah Chen" />)
    expect(screen.getByText('Sarah Chen')).toBeInTheDocument()
  })

  it('renders fallback name when no channel or dmName', () => {
    render(<ChannelHeader channel={null} />)
    expect(screen.getByText('Conversation')).toBeInTheDocument()
  })

  it('renders member count', () => {
    render(
      <ChannelHeader
        channel={makeChannel()}
        memberCount={42}
        onToggleMembers={vi.fn()}
      />
    )
    expect(screen.getByText('42')).toBeInTheDocument()
  })

  it('calls onToggleMembers when members button clicked', async () => {
    const user = userEvent.setup()
    const onToggleMembers = vi.fn()
    render(
      <ChannelHeader
        channel={makeChannel()}
        onToggleMembers={onToggleMembers}
      />
    )
    await user.click(screen.getByLabelText('Toggle members'))
    expect(onToggleMembers).toHaveBeenCalledOnce()
  })

  it('calls onTogglePins when pins button clicked', async () => {
    const user = userEvent.setup()
    const onTogglePins = vi.fn()
    render(
      <ChannelHeader
        channel={makeChannel()}
        onTogglePins={onTogglePins}
      />
    )
    await user.click(screen.getByLabelText('Toggle pins'))
    expect(onTogglePins).toHaveBeenCalledOnce()
  })

  it('calls onSearchClick when search button clicked', async () => {
    const user = userEvent.setup()
    const onSearchClick = vi.fn()
    render(
      <ChannelHeader
        channel={makeChannel()}
        onSearchClick={onSearchClick}
      />
    )
    await user.click(screen.getByLabelText('Search in channel'))
    expect(onSearchClick).toHaveBeenCalledOnce()
  })

  it('does not render action buttons when callbacks not provided', () => {
    render(<ChannelHeader channel={makeChannel()} />)
    expect(screen.queryByLabelText('Toggle members')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Toggle pins')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Search in channel')).not.toBeInTheDocument()
  })

  it('does not render topic when empty', () => {
    render(<ChannelHeader channel={makeChannel({ topic: '' })} />)
    expect(screen.queryByRole('paragraph')).not.toBeInTheDocument()
  })
})
