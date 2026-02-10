import { render, screen } from '@testing-library/react'
import Avatar from './Avatar'

describe('Avatar', () => {
  it('renders an image when src is provided', () => {
    render(<Avatar src="https://example.com/photo.jpg" alt="User" />)
    const img = screen.getByRole('img')
    expect(img).toHaveAttribute('src', 'https://example.com/photo.jpg')
    expect(img).toHaveAttribute('alt', 'User')
  })

  it('renders initials when name is provided but no src', () => {
    const { container } = render(<Avatar name="John Doe" />)
    const initials = container.querySelector('.avatar__initials')
    expect(initials).toBeInTheDocument()
    expect(initials).toHaveTextContent('JD')
  })

  it('renders single-word name initials (first 2 chars)', () => {
    const { container } = render(<Avatar name="Admin" />)
    const initials = container.querySelector('.avatar__initials')
    expect(initials).toHaveTextContent('AD')
  })

  it('renders placeholder when no src and no name', () => {
    const { container } = render(<Avatar />)
    expect(container.querySelector('.avatar__placeholder')).toBeInTheDocument()
  })

  it('uses name as alt text for img when alt not provided', () => {
    render(<Avatar src="photo.jpg" name="Jane" />)
    expect(screen.getByRole('img')).toHaveAttribute('alt', 'Jane')
  })

  it('applies size class', () => {
    const { container } = render(<Avatar size="lg" name="Big" />)
    expect(container.querySelector('.avatar')).toHaveClass('avatar--lg')
  })

  it('applies default md size', () => {
    const { container } = render(<Avatar name="Default" />)
    expect(container.querySelector('.avatar')).toHaveClass('avatar--md')
  })

  it('renders status indicator when status is provided', () => {
    const { container } = render(<Avatar name="User" status="online" />)
    const status = container.querySelector('.avatar__status')
    expect(status).toBeInTheDocument()
    expect(status).toHaveClass('avatar__status--online')
  })

  it('does not render status indicator by default', () => {
    const { container } = render(<Avatar name="User" />)
    expect(container.querySelector('.avatar__status')).not.toBeInTheDocument()
  })

  it('renders all status types', () => {
    const statuses = ['online', 'away', 'busy', 'offline'] as const
    for (const status of statuses) {
      const { container, unmount } = render(<Avatar name="Test" status={status} />)
      expect(container.querySelector('.avatar__status')).toHaveClass(`avatar__status--${status}`)
      unmount()
    }
  })

  it('appends custom className', () => {
    const { container } = render(<Avatar className="custom" name="Test" />)
    expect(container.querySelector('.avatar')).toHaveClass('custom')
  })

  it('sets background color from name on initials', () => {
    const { container } = render(<Avatar name="Alice Smith" />)
    const initials = container.querySelector('.avatar__initials') as HTMLElement
    expect(initials.style.backgroundColor).toBeTruthy()
  })

  it('sets title attribute on initials', () => {
    const { container } = render(<Avatar name="Alice Smith" />)
    const initials = container.querySelector('.avatar__initials')
    expect(initials).toHaveAttribute('title', 'Alice Smith')
  })
})
