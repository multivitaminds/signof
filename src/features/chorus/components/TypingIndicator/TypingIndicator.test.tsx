import { render, screen } from '@testing-library/react'
import TypingIndicator from './TypingIndicator'
import { useChorusPresenceStore } from '../../stores/useChorusPresenceStore'

describe('TypingIndicator', () => {
  beforeEach(() => {
    useChorusPresenceStore.setState({ typingUsers: [] })
  })

  it('renders nothing when no one is typing', () => {
    const { container } = render(<TypingIndicator conversationId="ch-general" />)
    expect(container.querySelector('.typing-indicator')).not.toBeInTheDocument()
  })

  it('renders single user typing message', () => {
    useChorusPresenceStore.setState({
      typingUsers: [
        { userId: 'user-alex', userName: 'Alex', conversationId: 'ch-general', startedAt: Date.now() },
      ],
    })

    render(<TypingIndicator conversationId="ch-general" />)
    expect(screen.getByText('Alex is typing')).toBeInTheDocument()
  })

  it('renders two users typing message', () => {
    useChorusPresenceStore.setState({
      typingUsers: [
        { userId: 'user-alex', userName: 'Alex', conversationId: 'ch-general', startedAt: Date.now() },
        { userId: 'user-sarah', userName: 'Sarah', conversationId: 'ch-general', startedAt: Date.now() },
      ],
    })

    render(<TypingIndicator conversationId="ch-general" />)
    expect(screen.getByText('Alex and Sarah are typing')).toBeInTheDocument()
  })

  it('renders "X people are typing" for 3+ users', () => {
    useChorusPresenceStore.setState({
      typingUsers: [
        { userId: 'user-alex', userName: 'Alex', conversationId: 'ch-general', startedAt: Date.now() },
        { userId: 'user-sarah', userName: 'Sarah', conversationId: 'ch-general', startedAt: Date.now() },
        { userId: 'user-mike', userName: 'Mike', conversationId: 'ch-general', startedAt: Date.now() },
      ],
    })

    render(<TypingIndicator conversationId="ch-general" />)
    expect(screen.getByText('3 people are typing')).toBeInTheDocument()
  })

  it('does not show typing users from other conversations', () => {
    useChorusPresenceStore.setState({
      typingUsers: [
        { userId: 'user-alex', userName: 'Alex', conversationId: 'ch-engineering', startedAt: Date.now() },
      ],
    })

    const { container } = render(<TypingIndicator conversationId="ch-general" />)
    expect(container.querySelector('.typing-indicator')).not.toBeInTheDocument()
  })

  it('renders animated dots', () => {
    useChorusPresenceStore.setState({
      typingUsers: [
        { userId: 'user-alex', userName: 'Alex', conversationId: 'ch-general', startedAt: Date.now() },
      ],
    })

    const { container } = render(<TypingIndicator conversationId="ch-general" />)
    const dots = container.querySelectorAll('.typing-indicator__dot')
    expect(dots).toHaveLength(3)
  })

  it('has a status role for accessibility', () => {
    useChorusPresenceStore.setState({
      typingUsers: [
        { userId: 'user-alex', userName: 'Alex', conversationId: 'ch-general', startedAt: Date.now() },
      ],
    })

    render(<TypingIndicator conversationId="ch-general" />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })
})
