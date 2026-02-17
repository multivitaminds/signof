import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TourTooltip from './TourTooltip'

const defaultProps = {
  title: 'Navigation',
  description: 'Use the sidebar to switch between modules',
  stepIndex: 0,
  totalSteps: 5,
  placement: 'right' as const,
  position: { top: 100, left: 200 },
  onNext: vi.fn(),
  onPrev: vi.fn(),
  onSkip: vi.fn(),
}

describe('TourTooltip', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the title and description', () => {
    render(<TourTooltip {...defaultProps} />)
    expect(screen.getByText('Navigation')).toBeInTheDocument()
    expect(screen.getByText('Use the sidebar to switch between modules')).toBeInTheDocument()
  })

  it('renders the step counter', () => {
    render(<TourTooltip {...defaultProps} />)
    expect(screen.getByText('Step 1 of 5')).toBeInTheDocument()
  })

  it('shows Next button on non-last steps', () => {
    render(<TourTooltip {...defaultProps} />)
    expect(screen.getByText('Next')).toBeInTheDocument()
  })

  it('shows Done button on last step', () => {
    render(<TourTooltip {...defaultProps} stepIndex={4} />)
    expect(screen.getByText('Done')).toBeInTheDocument()
  })

  it('hides Back button on first step', () => {
    render(<TourTooltip {...defaultProps} />)
    expect(screen.queryByText('Back')).not.toBeInTheDocument()
  })

  it('shows Back button on non-first steps', () => {
    render(<TourTooltip {...defaultProps} stepIndex={2} />)
    expect(screen.getByText('Back')).toBeInTheDocument()
  })

  it('calls onNext when Next is clicked', async () => {
    const user = userEvent.setup()
    render(<TourTooltip {...defaultProps} />)
    await user.click(screen.getByText('Next'))
    expect(defaultProps.onNext).toHaveBeenCalledTimes(1)
  })

  it('calls onPrev when Back is clicked', async () => {
    const user = userEvent.setup()
    render(<TourTooltip {...defaultProps} stepIndex={1} />)
    await user.click(screen.getByText('Back'))
    expect(defaultProps.onPrev).toHaveBeenCalledTimes(1)
  })

  it('calls onSkip when close button is clicked', async () => {
    const user = userEvent.setup()
    render(<TourTooltip {...defaultProps} />)
    await user.click(screen.getByLabelText('Skip tour'))
    expect(defaultProps.onSkip).toHaveBeenCalledTimes(1)
  })

  it('renders with correct dialog role', () => {
    render(<TourTooltip {...defaultProps} />)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('updates step counter for different steps', () => {
    render(<TourTooltip {...defaultProps} stepIndex={3} totalSteps={5} />)
    expect(screen.getByText('Step 4 of 5')).toBeInTheDocument()
  })
})
