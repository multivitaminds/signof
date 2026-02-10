import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ViewToggle from './ViewToggle'
import { ViewType } from '../../types'

describe('ViewToggle', () => {
  const defaultProps = {
    value: ViewType.Board as ViewType,
    onChange: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders Board and List options', () => {
    render(<ViewToggle {...defaultProps} />)
    expect(screen.getByText('Board')).toBeInTheDocument()
    expect(screen.getByText('List')).toBeInTheDocument()
  })

  it('marks active option with aria-checked', () => {
    render(<ViewToggle {...defaultProps} value={ViewType.Board} />)
    expect(screen.getByRole('radio', { name: 'Board' })).toHaveAttribute('aria-checked', 'true')
    expect(screen.getByRole('radio', { name: 'List' })).toHaveAttribute('aria-checked', 'false')
  })

  it('calls onChange with List when List clicked', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<ViewToggle {...defaultProps} onChange={onChange} />)

    await user.click(screen.getByText('List'))
    expect(onChange).toHaveBeenCalledWith(ViewType.List)
  })

  it('calls onChange with Board when Board clicked', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<ViewToggle {...defaultProps} value={ViewType.List} onChange={onChange} />)

    await user.click(screen.getByText('Board'))
    expect(onChange).toHaveBeenCalledWith(ViewType.Board)
  })

  it('has radiogroup role on container', () => {
    render(<ViewToggle {...defaultProps} />)
    expect(screen.getByRole('radiogroup')).toBeInTheDocument()
  })

  it('switches active styling when value changes', () => {
    const { rerender } = render(<ViewToggle {...defaultProps} value={ViewType.Board} />)

    const boardBtn = screen.getByRole('radio', { name: 'Board' })
    const listBtn = screen.getByRole('radio', { name: 'List' })

    expect(boardBtn).toHaveAttribute('aria-checked', 'true')
    expect(listBtn).toHaveAttribute('aria-checked', 'false')

    rerender(<ViewToggle {...defaultProps} value={ViewType.List} />)

    expect(boardBtn).toHaveAttribute('aria-checked', 'false')
    expect(listBtn).toHaveAttribute('aria-checked', 'true')
  })
})
