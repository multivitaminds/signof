import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import FilingWizard from './FilingWizard'

const mockSteps = [
  { label: 'Personal Info' },
  { label: 'Income', shortLabel: 'Income' },
  { label: 'Review & Submit' },
]

describe('FilingWizard', () => {
  const defaultProps = {
    steps: mockSteps,
    currentStep: 0,
    onStepChange: vi.fn(),
    onSubmit: vi.fn(),
    children: <div>Step content</div>,
  }

  beforeEach(() => {
    defaultProps.onStepChange.mockClear()
    defaultProps.onSubmit.mockClear()
  })

  it('renders step labels', () => {
    render(<FilingWizard {...defaultProps} />)
    expect(screen.getByText('Personal Info')).toBeInTheDocument()
    expect(screen.getByText('Income')).toBeInTheDocument()
    expect(screen.getByText('Review & Submit')).toBeInTheDocument()
  })

  it('renders children content', () => {
    render(<FilingWizard {...defaultProps} />)
    expect(screen.getByText('Step content')).toBeInTheDocument()
  })

  it('disables Back button on first step', () => {
    render(<FilingWizard {...defaultProps} currentStep={0} />)
    expect(screen.getByLabelText('Go to previous step')).toBeDisabled()
  })

  it('enables Back button on non-first step', () => {
    render(<FilingWizard {...defaultProps} currentStep={1} />)
    expect(screen.getByLabelText('Go to previous step')).toBeEnabled()
  })

  it('calls onStepChange with previous step when clicking Back', async () => {
    const user = userEvent.setup()
    render(<FilingWizard {...defaultProps} currentStep={1} />)
    await user.click(screen.getByLabelText('Go to previous step'))
    expect(defaultProps.onStepChange).toHaveBeenCalledWith(0)
  })

  it('shows Next button on non-last step', () => {
    render(<FilingWizard {...defaultProps} currentStep={0} />)
    expect(screen.getByLabelText('Go to next step')).toBeInTheDocument()
  })

  it('calls onStepChange with next step when clicking Next', async () => {
    const user = userEvent.setup()
    render(<FilingWizard {...defaultProps} currentStep={0} />)
    await user.click(screen.getByLabelText('Go to next step'))
    expect(defaultProps.onStepChange).toHaveBeenCalledWith(1)
  })

  it('shows Submit Filing button on last step', () => {
    render(<FilingWizard {...defaultProps} currentStep={2} />)
    expect(screen.getByLabelText('Submit filing')).toBeInTheDocument()
    expect(screen.getByText('Submit Filing')).toBeInTheDocument()
  })

  it('calls onSubmit when clicking Submit', async () => {
    const user = userEvent.setup()
    render(<FilingWizard {...defaultProps} currentStep={2} />)
    await user.click(screen.getByLabelText('Submit filing'))
    expect(defaultProps.onSubmit).toHaveBeenCalled()
  })

  it('disables Next when canProceed is false', () => {
    render(<FilingWizard {...defaultProps} currentStep={0} canProceed={false} />)
    expect(screen.getByLabelText('Go to next step')).toBeDisabled()
  })

  it('disables Submit when isSubmitting is true', () => {
    render(<FilingWizard {...defaultProps} currentStep={2} isSubmitting />)
    expect(screen.getByLabelText('Submit filing')).toBeDisabled()
    expect(screen.getByText('Submitting...')).toBeInTheDocument()
  })

  it('allows clicking completed steps', async () => {
    const user = userEvent.setup()
    render(<FilingWizard {...defaultProps} currentStep={2} />)
    await user.click(screen.getByLabelText('Step 1: Personal Info'))
    expect(defaultProps.onStepChange).toHaveBeenCalledWith(0)
  })

  it('disables future steps', () => {
    render(<FilingWizard {...defaultProps} currentStep={0} />)
    expect(screen.getByLabelText('Step 2: Income')).toBeDisabled()
    expect(screen.getByLabelText('Step 3: Review & Submit')).toBeDisabled()
  })
})
