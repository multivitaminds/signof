import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import DividerBlock from './DividerBlock'

describe('DividerBlock', () => {
  it('renders a separator', () => {
    render(<DividerBlock onBackspace={vi.fn()} />)
    // Both the wrapper div and the hr have role="separator", so use getAllByRole
    const separators = screen.getAllByRole('separator')
    expect(separators.length).toBeGreaterThanOrEqual(1)
  })

  it('renders an hr element', () => {
    const { container } = render(<DividerBlock onBackspace={vi.fn()} />)
    expect(container.querySelector('hr')).toBeInTheDocument()
  })

  it('has correct aria-label', () => {
    render(<DividerBlock onBackspace={vi.fn()} />)
    expect(screen.getByLabelText('Divider')).toBeInTheDocument()
  })

  it('is focusable with tabIndex', () => {
    render(<DividerBlock onBackspace={vi.fn()} />)
    const divider = screen.getByLabelText('Divider')
    expect(divider).toHaveAttribute('tabindex', '0')
  })

  it('calls onBackspace when Backspace is pressed', async () => {
    const user = userEvent.setup()
    const onBackspace = vi.fn()
    render(<DividerBlock onBackspace={onBackspace} />)

    const divider = screen.getByLabelText('Divider')
    divider.focus()
    await user.keyboard('{Backspace}')

    expect(onBackspace).toHaveBeenCalled()
  })

  it('calls onBackspace when Delete is pressed', async () => {
    const user = userEvent.setup()
    const onBackspace = vi.fn()
    render(<DividerBlock onBackspace={onBackspace} />)

    const divider = screen.getByLabelText('Divider')
    divider.focus()
    await user.keyboard('{Delete}')

    expect(onBackspace).toHaveBeenCalled()
  })

  it('has correct CSS class', () => {
    const { container } = render(<DividerBlock onBackspace={vi.fn()} />)
    expect(container.querySelector('.block-divider')).toBeInTheDocument()
    expect(container.querySelector('.block-divider__line')).toBeInTheDocument()
  })
})
