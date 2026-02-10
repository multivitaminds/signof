import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Input from './Input'

describe('Input', () => {
  it('renders an input element', () => {
    render(<Input placeholder="Enter text" />)
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument()
  })

  it('renders label when provided', () => {
    render(<Input label="Email" />)
    expect(screen.getByText('Email')).toBeInTheDocument()
    // Label should be associated with the input via htmlFor
    const input = screen.getByLabelText('Email')
    expect(input).toBeInTheDocument()
  })

  it('renders error message when error is provided', () => {
    render(<Input label="Email" error="Email is required" />)
    expect(screen.getByText('Email is required')).toBeInTheDocument()
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('sets aria-invalid when error is present', () => {
    render(<Input label="Name" error="Required" />)
    expect(screen.getByLabelText('Name')).toHaveAttribute('aria-invalid', 'true')
  })

  it('renders hint text when provided and no error', () => {
    render(<Input label="Password" hint="At least 8 characters" />)
    expect(screen.getByText('At least 8 characters')).toBeInTheDocument()
  })

  it('does not render hint when error is present', () => {
    render(<Input label="Password" hint="At least 8 chars" error="Too short" />)
    expect(screen.queryByText('At least 8 chars')).not.toBeInTheDocument()
    expect(screen.getByText('Too short')).toBeInTheDocument()
  })

  it('applies size class', () => {
    const { container } = render(<Input size="lg" />)
    expect(container.querySelector('.input')).toHaveClass('input--lg')
  })

  it('applies default md size', () => {
    const { container } = render(<Input />)
    expect(container.querySelector('.input')).toHaveClass('input--md')
  })

  it('renders left icon', () => {
    const { container } = render(
      <Input leftIcon={<span data-testid="left-icon">search</span>} />
    )
    expect(screen.getByTestId('left-icon')).toBeInTheDocument()
    expect(container.querySelector('.input__icon--left')).toBeInTheDocument()
    expect(container.querySelector('.input')).toHaveClass('input--with-left-icon')
  })

  it('renders right icon', () => {
    const { container } = render(
      <Input rightIcon={<span data-testid="right-icon">x</span>} />
    )
    expect(screen.getByTestId('right-icon')).toBeInTheDocument()
    expect(container.querySelector('.input__icon--right')).toBeInTheDocument()
    expect(container.querySelector('.input')).toHaveClass('input--with-right-icon')
  })

  it('applies fullWidth class', () => {
    const { container } = render(<Input fullWidth />)
    expect(container.querySelector('.input-wrapper')).toHaveClass('input-wrapper--full-width')
  })

  it('handles user typing', async () => {
    const handleChange = vi.fn()
    const user = userEvent.setup()
    render(<Input label="Name" onChange={handleChange} />)

    await user.type(screen.getByLabelText('Name'), 'hello')
    expect(handleChange).toHaveBeenCalled()
  })

  it('forwards ref', () => {
    const ref = { current: null as HTMLInputElement | null }
    render(<Input ref={ref} />)
    expect(ref.current).toBeInstanceOf(HTMLInputElement)
  })

  it('appends custom className', () => {
    const { container } = render(<Input className="custom-input" />)
    expect(container.querySelector('.input-wrapper')).toHaveClass('custom-input')
  })

  it('uses provided id for label association', () => {
    render(<Input id="my-input" label="Custom ID" />)
    const input = screen.getByLabelText('Custom ID')
    expect(input).toHaveAttribute('id', 'my-input')
  })
})
