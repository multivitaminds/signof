import { render, screen } from '@testing-library/react'
import UsageMeter from './UsageMeter'

describe('UsageMeter', () => {
  it('renders token counts', () => {
    render(<UsageMeter usedTokens={50_000} />)
    expect(screen.getByText(/50\.0K/)).toBeInTheDocument()
    expect(screen.getByText(/1\.0M/)).toBeInTheDocument()
  })

  it('renders "Context Memory" label', () => {
    render(<UsageMeter usedTokens={0} />)
    expect(screen.getByText('Context Memory')).toBeInTheDocument()
  })

  it('renders progressbar with correct aria attributes', () => {
    render(<UsageMeter usedTokens={250_000} budget={1_000_000} />)
    const bar = screen.getByRole('progressbar')
    expect(bar).toHaveAttribute('aria-valuenow', '250000')
    expect(bar).toHaveAttribute('aria-valuemin', '0')
    expect(bar).toHaveAttribute('aria-valuemax', '1000000')
  })

  it('applies success variant when usage is low', () => {
    const { container } = render(<UsageMeter usedTokens={100_000} />)
    const fill = container.querySelector('.usage-meter__fill')
    expect(fill).toHaveClass('usage-meter__fill--success')
  })

  it('applies warning variant when usage is between 50-80%', () => {
    const { container } = render(<UsageMeter usedTokens={600_000} />)
    const fill = container.querySelector('.usage-meter__fill')
    expect(fill).toHaveClass('usage-meter__fill--warning')
  })

  it('applies danger variant when usage is 80% or above', () => {
    const { container } = render(<UsageMeter usedTokens={900_000} />)
    const fill = container.querySelector('.usage-meter__fill')
    expect(fill).toHaveClass('usage-meter__fill--danger')
  })

  it('caps percentage at 100%', () => {
    const { container } = render(<UsageMeter usedTokens={2_000_000} />)
    const fill = container.querySelector('.usage-meter__fill') as HTMLElement
    expect(fill.style.width).toBe('100%')
  })

  it('accepts custom budget', () => {
    render(<UsageMeter usedTokens={500} budget={1000} />)
    expect(screen.getByText(/500/)).toBeInTheDocument()
    expect(screen.getByText(/1\.0K/)).toBeInTheDocument()
  })
})
