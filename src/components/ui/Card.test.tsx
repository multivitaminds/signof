import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Card from './Card'

describe('Card', () => {
  it('renders children', () => {
    render(<Card><Card.Body>Content</Card.Body></Card>)
    expect(screen.getByText('Content')).toBeInTheDocument()
  })

  it('applies variant class', () => {
    const { container } = render(<Card variant="interactive">Hello</Card>)
    expect(container.firstChild).toHaveClass('card--interactive')
  })

  it('applies elevated variant by default', () => {
    const { container } = render(<Card>Hello</Card>)
    expect(container.firstChild).toHaveClass('card--elevated')
  })

  it('renders compound sub-components', () => {
    render(
      <Card>
        <Card.Header>
          <Card.Title>Test Title</Card.Title>
          <Card.Badge variant="success">Active</Card.Badge>
        </Card.Header>
        <Card.Body>Body content</Card.Body>
        <Card.Footer>Footer content</Card.Footer>
      </Card>
    )
    expect(screen.getByText('Test Title')).toBeInTheDocument()
    expect(screen.getByText('Active')).toBeInTheDocument()
    expect(screen.getByText('Body content')).toBeInTheDocument()
    expect(screen.getByText('Footer content')).toBeInTheDocument()
  })

  it('passes through HTML attributes', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(<Card variant="interactive" onClick={onClick}>Click me</Card>)
    await user.click(screen.getByText('Click me'))
    expect(onClick).toHaveBeenCalledOnce()
  })
})
