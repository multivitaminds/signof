import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Button from './Button'

describe('Button', () => {
  it('renders children text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument()
  })

  it('applies default variant and size classes', () => {
    render(<Button>Default</Button>)
    const btn = screen.getByRole('button')
    expect(btn).toHaveClass('btn--primary')
    expect(btn).toHaveClass('btn--md')
  })

  it('applies custom variant class', () => {
    render(<Button variant="danger">Delete</Button>)
    expect(screen.getByRole('button')).toHaveClass('btn--danger')
  })

  it('applies custom size class', () => {
    render(<Button size="lg">Large</Button>)
    expect(screen.getByRole('button')).toHaveClass('btn--lg')
  })

  it('handles click events', async () => {
    const handleClick = vi.fn()
    const user = userEvent.setup()
    render(<Button onClick={handleClick}>Click</Button>)

    await user.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledOnce()
  })

  it('disables button when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('disables button when loading is true', () => {
    render(<Button loading>Loading</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('shows spinner when loading', () => {
    const { container } = render(<Button loading>Saving</Button>)
    expect(container.querySelector('.btn__spinner')).toBeInTheDocument()
    expect(container.querySelector('.btn')).toHaveClass('btn--loading')
  })

  it('renders icon on the left by default', () => {
    const { container } = render(
      <Button icon={<span data-testid="icon">+</span>}>Add</Button>
    )
    const leftIcon = container.querySelector('.btn__icon--left')
    expect(leftIcon).toBeInTheDocument()
  })

  it('renders icon on the right when iconPosition is right', () => {
    const { container } = render(
      <Button icon={<span>arrow</span>} iconPosition="right">Next</Button>
    )
    const rightIcon = container.querySelector('.btn__icon--right')
    expect(rightIcon).toBeInTheDocument()
  })

  it('hides icon when loading', () => {
    const { container } = render(
      <Button icon={<span>icon</span>} loading>Loading</Button>
    )
    expect(container.querySelector('.btn__icon--left')).not.toBeInTheDocument()
  })

  it('applies fullWidth class', () => {
    render(<Button fullWidth>Full</Button>)
    expect(screen.getByRole('button')).toHaveClass('btn--full-width')
  })

  it('applies icon-only class when icon but no children', () => {
    const { container } = render(
      <Button icon={<span>x</span>} aria-label="Close" />
    )
    expect(container.querySelector('.btn')).toHaveClass('btn--icon-only')
  })

  it('appends custom className', () => {
    render(<Button className="my-class">Test</Button>)
    expect(screen.getByRole('button')).toHaveClass('my-class')
  })

  it('forwards ref', () => {
    const ref = { current: null as HTMLButtonElement | null }
    render(<Button ref={ref}>Ref</Button>)
    expect(ref.current).toBeInstanceOf(HTMLButtonElement)
  })
})
