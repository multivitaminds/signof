import { render, screen } from '@testing-library/react'
import PresenceCursors from './PresenceCursors'
import type { PresenceUser } from '../../hooks/usePresenceSimulator'

const mockUsers: PresenceUser[] = [
  { id: 'u1', name: 'Alex Kim', initials: 'AK', color: '#E94560', cursorY: 100, isActive: true },
  { id: 'u2', name: 'Maya Chen', initials: 'MC', color: '#059669', cursorY: 200, isActive: true },
  { id: 'u3', name: 'Sam Rivera', initials: 'SR', color: '#D97706', cursorY: 300, isActive: false },
]

describe('PresenceCursors', () => {
  it('renders cursor labels for active users', () => {
    render(<PresenceCursors users={mockUsers} />)
    expect(screen.getByText('Alex Kim')).toBeInTheDocument()
    expect(screen.getByText('Maya Chen')).toBeInTheDocument()
    expect(screen.queryByText('Sam Rivera')).not.toBeInTheDocument()
  })

  it('renders nothing when no active users', () => {
    const inactiveUsers = mockUsers.map((u) => ({ ...u, isActive: false }))
    const { container } = render(<PresenceCursors users={inactiveUsers} />)
    expect(container.innerHTML).toBe('')
  })

  it('renders nothing for empty user list', () => {
    const { container } = render(<PresenceCursors users={[]} />)
    expect(container.innerHTML).toBe('')
  })

  it('positions cursors with cursorY', () => {
    const { container } = render(<PresenceCursors users={mockUsers} />)
    const cursors = container.querySelectorAll('.presence-cursor')
    expect(cursors).toHaveLength(2)
    expect(cursors[0]).toHaveStyle({ top: '100px' })
    expect(cursors[1]).toHaveStyle({ top: '200px' })
  })
})
