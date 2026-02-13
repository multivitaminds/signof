import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AgentModeToggle from './AgentModeToggle'

describe('AgentModeToggle', () => {
  it('renders with Agent text', () => {
    render(<AgentModeToggle enabled={false} onToggle={vi.fn()} />)
    expect(screen.getByText('Agent')).toBeInTheDocument()
  })

  it('shows enabled state', () => {
    render(<AgentModeToggle enabled={true} onToggle={vi.fn()} />)
    expect(screen.getByRole('button')).toHaveClass('agent-mode-toggle--enabled')
  })

  it('calls onToggle on click', async () => {
    const onToggle = vi.fn()
    const user = userEvent.setup()
    render(<AgentModeToggle enabled={false} onToggle={onToggle} />)
    await user.click(screen.getByText('Agent'))
    expect(onToggle).toHaveBeenCalled()
  })
})
