import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import DurationSelect from './DurationSelect'

describe('DurationSelect', () => {
  const defaultProps = {
    value: 30,
    onChange: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders duration options', () => {
    render(<DurationSelect {...defaultProps} />)
    expect(screen.getByText('15 min')).toBeInTheDocument()
    expect(screen.getByText('30 min')).toBeInTheDocument()
    expect(screen.getByText('60 min')).toBeInTheDocument()
    expect(screen.getByText('120 min')).toBeInTheDocument()
  })

  it('highlights the active option', () => {
    render(<DurationSelect {...defaultProps} />)
    const btn = screen.getByText('30 min')
    expect(btn).toHaveAttribute('aria-pressed', 'true')
  })

  it('calls onChange when clicking an option', async () => {
    const user = userEvent.setup()
    render(<DurationSelect {...defaultProps} />)
    await user.click(screen.getByText('60 min'))
    expect(defaultProps.onChange).toHaveBeenCalledWith(60)
  })

  it('shows custom input when clicking Custom', async () => {
    const user = userEvent.setup()
    render(<DurationSelect {...defaultProps} />)
    await user.click(screen.getByText('Custom'))
    expect(screen.getByLabelText('Custom duration in minutes')).toBeInTheDocument()
  })

  it('calls onChange with custom value', async () => {
    const user = userEvent.setup()
    render(<DurationSelect {...defaultProps} />)
    await user.click(screen.getByText('Custom'))
    const input = screen.getByLabelText('Custom duration in minutes')
    await user.type(input, '25')
    expect(defaultProps.onChange).toHaveBeenCalledWith(25)
  })

  it('renders custom options when provided', () => {
    render(<DurationSelect {...defaultProps} options={[10, 20]} />)
    expect(screen.getByText('10 min')).toBeInTheDocument()
    expect(screen.getByText('20 min')).toBeInTheDocument()
    expect(screen.queryByText('15 min')).not.toBeInTheDocument()
  })
})
