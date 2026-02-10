import { render, screen } from '@testing-library/react'
import Badge from './Badge'

describe('Badge', () => {
  it('renders children text', () => {
    render(<Badge>Active</Badge>)
    expect(screen.getByText('Active')).toBeInTheDocument()
  })

  it('applies default variant and size classes', () => {
    const { container } = render(<Badge>Default</Badge>)
    const badge = container.querySelector('.badge')
    expect(badge).toHaveClass('badge--default')
    expect(badge).toHaveClass('badge--md')
  })

  it('applies custom variant class', () => {
    const { container } = render(<Badge variant="success">Done</Badge>)
    const badge = container.querySelector('.badge')
    expect(badge).toHaveClass('badge--success')
  })

  it('applies custom size class', () => {
    const { container } = render(<Badge size="sm">Small</Badge>)
    const badge = container.querySelector('.badge')
    expect(badge).toHaveClass('badge--sm')
  })

  it('renders dot element when dot prop is true', () => {
    const { container } = render(<Badge dot>Status</Badge>)
    expect(container.querySelector('.badge__dot')).toBeInTheDocument()
    expect(container.querySelector('.badge')).toHaveClass('badge--dot')
  })

  it('does not render dot element by default', () => {
    const { container } = render(<Badge>No dot</Badge>)
    expect(container.querySelector('.badge__dot')).not.toBeInTheDocument()
  })

  it('wraps children in badge__label span', () => {
    const { container } = render(<Badge>Label</Badge>)
    const label = container.querySelector('.badge__label')
    expect(label).toBeInTheDocument()
    expect(label).toHaveTextContent('Label')
  })

  it('does not render label span when no children', () => {
    const { container } = render(<Badge dot />)
    expect(container.querySelector('.badge__label')).not.toBeInTheDocument()
  })

  it('appends custom className', () => {
    const { container } = render(<Badge className="my-custom">Test</Badge>)
    const badge = container.querySelector('.badge')
    expect(badge).toHaveClass('my-custom')
  })

  it('renders all variant types', () => {
    const variants = ['default', 'primary', 'success', 'warning', 'danger', 'info', 'draft', 'pending', 'completed'] as const
    for (const variant of variants) {
      const { container, unmount } = render(<Badge variant={variant}>{variant}</Badge>)
      expect(container.querySelector('.badge')).toHaveClass(`badge--${variant}`)
      unmount()
    }
  })
})
