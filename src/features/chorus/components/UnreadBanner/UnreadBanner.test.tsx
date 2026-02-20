import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import UnreadBanner from './UnreadBanner'

describe('UnreadBanner', () => {
  it('renders nothing when count is 0', () => {
    const { container } = render(<UnreadBanner count={0} onJump={vi.fn()} />)
    expect(container.querySelector('.unread-banner')).not.toBeInTheDocument()
  })

  it('renders nothing when count is negative', () => {
    const { container } = render(<UnreadBanner count={-1} onJump={vi.fn()} />)
    expect(container.querySelector('.unread-banner')).not.toBeInTheDocument()
  })

  it('renders "1 new message" for count of 1', () => {
    render(<UnreadBanner count={1} onJump={vi.fn()} />)
    expect(screen.getByText('1 new message')).toBeInTheDocument()
  })

  it('renders "5 new messages" for count of 5', () => {
    render(<UnreadBanner count={5} onJump={vi.fn()} />)
    expect(screen.getByText('5 new messages')).toBeInTheDocument()
  })

  it('calls onJump when clicked', async () => {
    const user = userEvent.setup()
    const onJump = vi.fn()

    render(<UnreadBanner count={3} onJump={onJump} />)
    await user.click(screen.getByRole('button'))
    expect(onJump).toHaveBeenCalledOnce()
  })

  it('calls onJump on Enter key press', async () => {
    const user = userEvent.setup()
    const onJump = vi.fn()

    render(<UnreadBanner count={3} onJump={onJump} />)
    const banner = screen.getByRole('button')
    banner.focus()
    await user.keyboard('{Enter}')
    expect(onJump).toHaveBeenCalledOnce()
  })

  it('has an accessible label', () => {
    render(<UnreadBanner count={3} onJump={vi.fn()} />)
    expect(screen.getByLabelText('3 new messages - click to jump')).toBeInTheDocument()
  })
})
