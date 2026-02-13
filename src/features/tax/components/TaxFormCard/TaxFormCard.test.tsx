import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TaxFormCard from './TaxFormCard'

describe('TaxFormCard', () => {
  const defaultProps = {
    formType: 'w2' as const,
    documentCount: 3,
    onClick: vi.fn(),
  }

  beforeEach(() => {
    defaultProps.onClick.mockClear()
  })

  it('renders form label', () => {
    render(<TaxFormCard {...defaultProps} />)
    expect(screen.getByText('W-2')).toBeInTheDocument()
  })

  it('renders form description', () => {
    render(<TaxFormCard {...defaultProps} />)
    expect(screen.getByText('Wage and Tax Statement from your employer')).toBeInTheDocument()
  })

  it('shows badge when documentCount > 0', () => {
    render(<TaxFormCard {...defaultProps} documentCount={3} />)
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('hides badge when documentCount is 0', () => {
    render(<TaxFormCard {...defaultProps} documentCount={0} />)
    expect(screen.queryByText('0')).not.toBeInTheDocument()
  })

  it('calls onClick with formType on click', async () => {
    const user = userEvent.setup()
    render(<TaxFormCard {...defaultProps} />)
    await user.click(screen.getByRole('button'))
    expect(defaultProps.onClick).toHaveBeenCalledWith('w2')
  })

  it('calls onClick on Enter key', async () => {
    const user = userEvent.setup()
    render(<TaxFormCard {...defaultProps} />)
    const card = screen.getByRole('button')
    card.focus()
    await user.keyboard('{Enter}')
    expect(defaultProps.onClick).toHaveBeenCalledWith('w2')
  })

  it('calls onClick on Space key', async () => {
    const user = userEvent.setup()
    render(<TaxFormCard {...defaultProps} />)
    const card = screen.getByRole('button')
    card.focus()
    await user.keyboard(' ')
    expect(defaultProps.onClick).toHaveBeenCalledWith('w2')
  })

  it('has correct aria-label', () => {
    render(<TaxFormCard {...defaultProps} />)
    expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'W-2 - 3 documents')
  })

  it('renders different form types', () => {
    render(<TaxFormCard {...defaultProps} formType="1099_nec" />)
    expect(screen.getByText('1099-NEC')).toBeInTheDocument()
  })
})
