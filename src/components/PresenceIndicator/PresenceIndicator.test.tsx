import { render, screen } from '@testing-library/react'
import { PresenceIndicator, AvatarStack } from './PresenceIndicator'
import type { AvatarStackUser } from './PresenceIndicator'

describe('PresenceIndicator', () => {
  it('renders with online status', () => {
    render(<PresenceIndicator status="online" />)
    const dot = screen.getByRole('status')
    expect(dot).toBeInTheDocument()
    expect(dot).toHaveAttribute('aria-label', 'Status: online')
    expect(dot).toHaveClass('presence-indicator--online')
  })

  it('renders with away status', () => {
    render(<PresenceIndicator status="away" />)
    const dot = screen.getByRole('status')
    expect(dot).toHaveClass('presence-indicator--away')
    expect(dot).toHaveAttribute('aria-label', 'Status: away')
  })

  it('renders with offline status', () => {
    render(<PresenceIndicator status="offline" />)
    const dot = screen.getByRole('status')
    expect(dot).toHaveClass('presence-indicator--offline')
  })

  it('renders with correct size classes', () => {
    const { rerender } = render(<PresenceIndicator status="online" size="sm" />)
    expect(screen.getByRole('status')).toHaveClass('presence-indicator--sm')

    rerender(<PresenceIndicator status="online" size="lg" />)
    expect(screen.getByRole('status')).toHaveClass('presence-indicator--lg')
  })

  it('defaults to medium size', () => {
    render(<PresenceIndicator status="online" />)
    expect(screen.getByRole('status')).toHaveClass('presence-indicator--md')
  })
})

describe('AvatarStack', () => {
  const users: AvatarStackUser[] = [
    { name: 'Alice Johnson', status: 'online' },
    { name: 'Bob Smith', status: 'away' },
    { name: 'Charlie Brown', status: 'offline' },
    { name: 'Diana Prince', status: 'online' },
    { name: 'Eve Wilson', status: 'away' },
    { name: 'Frank Castle', status: 'online' },
  ]

  it('renders the correct number of visible avatars', () => {
    render(<AvatarStack users={users} max={3} />)
    const group = screen.getByRole('group')
    expect(group).toBeInTheDocument()
    // 3 visible users should have initials
    expect(screen.getByText('AJ')).toBeInTheDocument()
    expect(screen.getByText('BS')).toBeInTheDocument()
    expect(screen.getByText('CB')).toBeInTheDocument()
  })

  it('shows overflow badge with correct count', () => {
    render(<AvatarStack users={users} max={3} />)
    expect(screen.getByText('+3')).toBeInTheDocument()
  })

  it('shows no overflow badge when users fit within max', () => {
    render(<AvatarStack users={users.slice(0, 2)} max={4} />)
    expect(screen.queryByText(/^\+/)).not.toBeInTheDocument()
  })

  it('renders with the correct group aria-label', () => {
    render(<AvatarStack users={users} max={4} />)
    expect(screen.getByRole('group')).toHaveAttribute(
      'aria-label',
      '6 team members'
    )
  })

  it('shows user initials when no avatarUrl is provided', () => {
    render(<AvatarStack users={[{ name: 'Jane Doe', status: 'online' }]} />)
    expect(screen.getByText('JD')).toBeInTheDocument()
  })

  it('defaults max to 4', () => {
    render(<AvatarStack users={users} />)
    // With default max of 4, overflow should show +2
    expect(screen.getByText('+2')).toBeInTheDocument()
  })
})
