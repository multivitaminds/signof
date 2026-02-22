import { render, screen } from '@testing-library/react'
import LoadingSpinner from './LoadingSpinner'

describe('LoadingSpinner', () => {
  it('renders with status role', () => {
    render(<LoadingSpinner />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('has accessible aria-label', () => {
    render(<LoadingSpinner />)
    expect(screen.getByLabelText('Loading')).toBeInTheDocument()
  })

  it('renders loading text', () => {
    render(<LoadingSpinner />)
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('renders the gradient progress bar', () => {
    const { container } = render(<LoadingSpinner />)
    expect(container.querySelector('.loading-spinner__bar')).toBeInTheDocument()
    expect(container.querySelector('.loading-spinner__bar-fill')).toBeInTheDocument()
  })

  it('renders the animated logo', () => {
    const { container } = render(<LoadingSpinner />)
    expect(container.querySelector('.loading-spinner__logo')).toBeInTheDocument()
    expect(container.querySelector('.loading-spinner__logo-s')).toHaveTextContent('a')
  })

  it('marks decorative elements as aria-hidden', () => {
    const { container } = render(<LoadingSpinner />)
    const bar = container.querySelector('.loading-spinner__bar')
    expect(bar).toHaveAttribute('aria-hidden', 'true')
    const logo = container.querySelector('.loading-spinner__logo')
    expect(logo).toHaveAttribute('aria-hidden', 'true')
  })

  it('renders the root loading-spinner class', () => {
    const { container } = render(<LoadingSpinner />)
    expect(container.querySelector('.loading-spinner')).toBeInTheDocument()
  })
})
