import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import NotificationBadge from './NotificationBadge'

describe('NotificationBadge', () => {
  it('renders nothing when count is 0', () => {
    const { container } = render(<NotificationBadge count={0} onClick={() => {}} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders nothing when count is negative', () => {
    const { container } = render(<NotificationBadge count={-1} onClick={() => {}} />)
    expect(container.firstChild).toBeNull()
  })

  it('shows the count when > 0', () => {
    render(<NotificationBadge count={5} onClick={() => {}} />)
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('caps display at 99+', () => {
    render(<NotificationBadge count={150} onClick={() => {}} />)
    expect(screen.getByText('99+')).toBeInTheDocument()
  })

  it('shows 99 without plus sign', () => {
    render(<NotificationBadge count={99} onClick={() => {}} />)
    expect(screen.getByText('99')).toBeInTheDocument()
  })

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(<NotificationBadge count={3} onClick={onClick} />)
    await user.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('has accessible label with count', () => {
    render(<NotificationBadge count={7} onClick={() => {}} />)
    expect(screen.getByLabelText('7 unread notifications')).toBeInTheDocument()
  })
})
