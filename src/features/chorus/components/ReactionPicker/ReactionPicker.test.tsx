import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ReactionPicker from './ReactionPicker'

describe('ReactionPicker', () => {
  it('does not render when closed', () => {
    const { container } = render(
      <ReactionPicker isOpen={false} onClose={vi.fn()} onSelect={vi.fn()} />
    )
    expect(container.querySelector('.reaction-picker')).not.toBeInTheDocument()
  })

  it('renders emoji grid when open', () => {
    render(
      <ReactionPicker isOpen={true} onClose={vi.fn()} onSelect={vi.fn()} />
    )
    expect(screen.getByRole('dialog', { name: 'Pick a reaction' })).toBeInTheDocument()
    // Should have 32 emojis
    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBe(32)
  })

  it('calls onSelect and onClose when emoji clicked', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    const onClose = vi.fn()
    render(
      <ReactionPicker isOpen={true} onClose={onClose} onSelect={onSelect} />
    )

    const thumbsUp = screen.getByLabelText(/React with \uD83D\uDC4D/)
    await user.click(thumbsUp)
    expect(onSelect).toHaveBeenCalledWith('\uD83D\uDC4D')
    expect(onClose).toHaveBeenCalled()
  })

  it('closes on Escape key', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(
      <ReactionPicker isOpen={true} onClose={onClose} onSelect={vi.fn()} />
    )

    await user.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalled()
  })
})
