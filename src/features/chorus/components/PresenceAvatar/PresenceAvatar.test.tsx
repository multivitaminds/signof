import { render, screen } from '@testing-library/react'
import PresenceAvatar from './PresenceAvatar'
import { ChorusPresenceStatus } from '../../types'

describe('PresenceAvatar', () => {
  it('renders initials when no avatar URL', () => {
    render(<PresenceAvatar name="Alex Johnson" presence={ChorusPresenceStatus.Online} />)
    expect(screen.getByText('AJ')).toBeInTheDocument()
  })

  it('renders presence dot', () => {
    render(<PresenceAvatar name="Alex Johnson" presence={ChorusPresenceStatus.Online} />)
    expect(screen.getByLabelText('Alex Johnson - online')).toBeInTheDocument()
  })

  it('renders image when avatarUrl provided', () => {
    render(
      <PresenceAvatar
        name="Alex Johnson"
        presence={ChorusPresenceStatus.Online}
        avatarUrl="https://example.com/avatar.jpg"
      />
    )
    expect(screen.getByAltText('Alex Johnson')).toBeInTheDocument()
  })

  it('hides status dot when showStatus is false', () => {
    const { container } = render(
      <PresenceAvatar
        name="Alex Johnson"
        presence={ChorusPresenceStatus.Online}
        showStatus={false}
      />
    )
    expect(container.querySelector('.presence-avatar__dot')).not.toBeInTheDocument()
  })

  it('applies custom size', () => {
    render(<PresenceAvatar name="Test" presence={ChorusPresenceStatus.Away} size={48} />)
    const avatar = screen.getByLabelText('Test - away')
    expect(avatar.style.width).toBe('48px')
    expect(avatar.style.height).toBe('48px')
  })
})
