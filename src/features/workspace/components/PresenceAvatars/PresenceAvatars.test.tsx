import { render, screen } from '@testing-library/react'
import PresenceAvatars from './PresenceAvatars'
import type { PresenceUser } from '../../hooks/usePresenceSimulator'

const mockUsers: PresenceUser[] = [
  { id: 'u1', name: 'Alex Kim', initials: 'AK', color: '#E94560', cursorY: 100, isActive: true },
  { id: 'u2', name: 'Maya Chen', initials: 'MC', color: '#059669', cursorY: 200, isActive: true },
  { id: 'u3', name: 'Sam Rivera', initials: 'SR', color: '#D97706', cursorY: 300, isActive: false },
]

describe('PresenceAvatars', () => {
  it('renders active users only', () => {
    render(<PresenceAvatars users={mockUsers} />)
    expect(screen.getByText('AK')).toBeInTheDocument()
    expect(screen.getByText('MC')).toBeInTheDocument()
    expect(screen.queryByText('SR')).not.toBeInTheDocument()
  })

  it('shows viewing count for active users', () => {
    render(<PresenceAvatars users={mockUsers} />)
    expect(screen.getByText('2 viewing')).toBeInTheDocument()
  })

  it('renders nothing when no active users', () => {
    const inactiveUsers = mockUsers.map((u) => ({ ...u, isActive: false }))
    const { container } = render(<PresenceAvatars users={inactiveUsers} />)
    expect(container.innerHTML).toBe('')
  })

  it('renders nothing for empty user list', () => {
    const { container } = render(<PresenceAvatars users={[]} />)
    expect(container.innerHTML).toBe('')
  })

  it('has proper aria label', () => {
    render(<PresenceAvatars users={mockUsers} />)
    expect(screen.getByLabelText('2 users viewing this page')).toBeInTheDocument()
  })

  it('displays user initials with title', () => {
    render(<PresenceAvatars users={mockUsers} />)
    expect(screen.getByTitle('Alex Kim')).toBeInTheDocument()
    expect(screen.getByTitle('Maya Chen')).toBeInTheDocument()
  })
})
