import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CompleteCheck from './CompleteCheck'
import { InterviewSectionStatus } from '../../types'
import type { InterviewSection, InterviewAnswer } from '../../types'

describe('CompleteCheck', () => {
  const completedSection: InterviewSection = {
    id: 'personal_info',
    title: 'Personal Information',
    description: 'Your name, SSN, and address',
    icon: 'user',
    status: InterviewSectionStatus.Completed,
  }

  const incompleteSection: InterviewSection = {
    id: 'income_w2',
    title: 'W-2 Income',
    description: 'Wages from employers',
    icon: 'briefcase',
    status: InterviewSectionStatus.InProgress,
  }

  const skippedSection: InterviewSection = {
    id: 'dependents',
    title: 'Dependents',
    description: 'Children and qualifying relatives',
    icon: 'users',
    status: InterviewSectionStatus.Skipped,
  }

  const notStartedSection: InterviewSection = {
    id: 'credits',
    title: 'Credits',
    description: 'Tax credits you may qualify for',
    icon: 'star',
    status: InterviewSectionStatus.NotStarted,
  }

  const answers: Record<string, InterviewAnswer> = {
    q1: { questionId: 'q1', value: 'John', confirmedAt: '2025-01-01' },
    q2: { questionId: 'q2', value: 'Doe', confirmedAt: '2025-01-01' },
    q3: { questionId: 'q3', value: 50000, confirmedAt: '2025-01-01' },
  }

  const defaultProps = {
    sections: [completedSection, incompleteSection, skippedSection],
    answers,
    onEditSection: vi.fn(),
    onSubmit: vi.fn(),
    isSubmitting: false,
  }

  beforeEach(() => {
    defaultProps.onEditSection.mockClear()
    defaultProps.onSubmit.mockClear()
  })

  it('renders all section titles', () => {
    render(<CompleteCheck {...defaultProps} />)
    expect(screen.getByText('Personal Information')).toBeInTheDocument()
    expect(screen.getByText('W-2 Income')).toBeInTheDocument()
    expect(screen.getByText('Dependents')).toBeInTheDocument()
  })

  it('shows "Everything looks good" when no issues', () => {
    render(
      <CompleteCheck
        {...defaultProps}
        sections={[completedSection, skippedSection]}
      />
    )
    expect(screen.getByText('Everything looks good')).toBeInTheDocument()
  })

  it('shows issue count when incomplete sections exist', () => {
    render(<CompleteCheck {...defaultProps} />)
    expect(screen.getByText('1 issue found')).toBeInTheDocument()
  })

  it('pluralizes issues correctly for multiple incomplete sections', () => {
    render(
      <CompleteCheck
        {...defaultProps}
        sections={[completedSection, incompleteSection, notStartedSection]}
      />
    )
    expect(screen.getByText('2 issues found')).toBeInTheDocument()
  })

  it('displays answer count and completed section count', () => {
    render(<CompleteCheck {...defaultProps} />)
    expect(
      screen.getByText(/3 questions answered across 1 section/)
    ).toBeInTheDocument()
  })

  it('shows Incomplete badge for non-completed non-skipped sections', () => {
    render(<CompleteCheck {...defaultProps} />)
    expect(screen.getByText('Incomplete')).toBeInTheDocument()
  })

  it('shows Skipped badge for skipped sections', () => {
    render(<CompleteCheck {...defaultProps} />)
    expect(screen.getByText('Skipped')).toBeInTheDocument()
  })

  it('calls onEditSection when Edit button is clicked', async () => {
    const user = userEvent.setup()
    render(<CompleteCheck {...defaultProps} />)
    const editButtons = screen.getAllByRole('button', { name: /edit/i })
    await user.click(editButtons[0]!)
    expect(defaultProps.onEditSection).toHaveBeenCalledWith('personal_info')
  })

  it('calls onEditSection with correct id for different sections', async () => {
    const user = userEvent.setup()
    render(<CompleteCheck {...defaultProps} />)
    const editButtons = screen.getAllByRole('button', { name: /edit/i })
    await user.click(editButtons[1]!)
    expect(defaultProps.onEditSection).toHaveBeenCalledWith('income_w2')
  })

  it('disables submit button when there are issues', () => {
    render(<CompleteCheck {...defaultProps} />)
    const submitButton = screen.getByRole('button', { name: /file my taxes/i })
    expect(submitButton).toBeDisabled()
  })

  it('enables submit button when no issues', () => {
    render(
      <CompleteCheck
        {...defaultProps}
        sections={[completedSection, skippedSection]}
      />
    )
    const submitButton = screen.getByRole('button', { name: /file my taxes/i })
    expect(submitButton).toBeEnabled()
  })

  it('calls onSubmit when submit button is clicked', async () => {
    const user = userEvent.setup()
    render(
      <CompleteCheck
        {...defaultProps}
        sections={[completedSection, skippedSection]}
      />
    )
    const submitButton = screen.getByRole('button', { name: /file my taxes/i })
    await user.click(submitButton)
    expect(defaultProps.onSubmit).toHaveBeenCalledTimes(1)
  })

  it('disables submit button and shows spinner when isSubmitting', () => {
    render(
      <CompleteCheck
        {...defaultProps}
        sections={[completedSection]}
        isSubmitting={true}
      />
    )
    const submitButton = screen.getByRole('button', { name: /submitting/i })
    expect(submitButton).toBeDisabled()
    expect(screen.getByText('Submitting...')).toBeInTheDocument()
  })

  it('renders section descriptions', () => {
    render(<CompleteCheck {...defaultProps} />)
    expect(screen.getByText('Your name, SSN, and address')).toBeInTheDocument()
    expect(screen.getByText('Wages from employers')).toBeInTheDocument()
  })

  it('pluralizes questions correctly for single answer', () => {
    render(
      <CompleteCheck
        {...defaultProps}
        answers={{ q1: { questionId: 'q1', value: 'Test', confirmedAt: '2025-01-01' } }}
      />
    )
    expect(
      screen.getByText(/1 question answered/)
    ).toBeInTheDocument()
  })
})
