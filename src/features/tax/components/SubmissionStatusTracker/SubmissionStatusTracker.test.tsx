import { render, screen } from '@testing-library/react'
import SubmissionStatusTracker from './SubmissionStatusTracker'
import { FilingState, TaxFormType } from '../../types'
import type { TaxBanditSubmission } from '../../types'

const makeSubmission = (overrides?: Partial<TaxBanditSubmission>): TaxBanditSubmission => ({
  id: 'sub-1',
  formType: TaxFormType.W2,
  taxYear: '2025',
  taxBanditSubmissionId: null,
  taxBanditRecordId: null,
  businessId: null,
  state: FilingState.NotStarted,
  payload: {},
  validationErrors: [],
  irsErrors: [],
  pdfUrl: null,
  createdAt: '2025-01-15T00:00:00Z',
  updatedAt: '2025-01-15T00:00:00Z',
  filedAt: null,
  ...overrides,
})

describe('SubmissionStatusTracker', () => {
  it('renders the form type badge with correct label', () => {
    render(<SubmissionStatusTracker submission={makeSubmission()} />)
    expect(screen.getByText('W-2')).toBeInTheDocument()
  })

  it('renders the tax year', () => {
    render(<SubmissionStatusTracker submission={makeSubmission({ taxYear: '2024' })} />)
    expect(screen.getByText('Tax Year 2024')).toBeInTheDocument()
  })

  it('renders all five step labels in the timeline', () => {
    render(<SubmissionStatusTracker submission={makeSubmission()} />)
    expect(screen.getByText('Created')).toBeInTheDocument()
    expect(screen.getByText('Validated')).toBeInTheDocument()
    expect(screen.getByText('Transmitted')).toBeInTheDocument()
    expect(screen.getByText('Pending')).toBeInTheDocument()
    expect(screen.getByText('Accepted')).toBeInTheDocument()
  })

  it('does not render download link when pdfUrl is null', () => {
    render(<SubmissionStatusTracker submission={makeSubmission({ pdfUrl: null })} />)
    expect(screen.queryByLabelText('Download PDF')).not.toBeInTheDocument()
  })

  it('renders download link when pdfUrl is provided', () => {
    render(
      <SubmissionStatusTracker
        submission={makeSubmission({ pdfUrl: 'https://example.com/file.pdf' })}
      />
    )
    const link = screen.getByLabelText('Download PDF')
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', 'https://example.com/file.pdf')
    expect(link).toHaveAttribute('download')
  })

  it('marks the first step as active for NotStarted state', () => {
    render(<SubmissionStatusTracker submission={makeSubmission({ state: FilingState.NotStarted })} />)
    const timeline = screen.getByRole('list', { name: 'Submission status' })
    const steps = timeline.querySelectorAll('[role="listitem"]')
    expect(steps[0]!.className).toContain('submission-tracker__step--active')
    expect(steps[1]!.className).toContain('submission-tracker__step--future')
  })

  it('marks previous steps as complete and current as active for Filed state', () => {
    render(<SubmissionStatusTracker submission={makeSubmission({ state: FilingState.Filed })} />)
    const timeline = screen.getByRole('list', { name: 'Submission status' })
    const steps = timeline.querySelectorAll('[role="listitem"]')
    // Filed has STATE_ORDER 3, so stepIndex 0,1,2 < 3 are complete, stepIndex 3 === 3 is active
    expect(steps[0]!.className).toContain('submission-tracker__step--complete')
    expect(steps[1]!.className).toContain('submission-tracker__step--complete')
    expect(steps[2]!.className).toContain('submission-tracker__step--complete')
    expect(steps[3]!.className).toContain('submission-tracker__step--active')
    expect(steps[4]!.className).toContain('submission-tracker__step--future')
  })

  it('shows "Rejected" label on last step when state is Rejected', () => {
    render(<SubmissionStatusTracker submission={makeSubmission({ state: FilingState.Rejected })} />)
    expect(screen.getByText('Rejected')).toBeInTheDocument()
    expect(screen.queryByText('Accepted')).not.toBeInTheDocument()
  })

  it('marks last step as rejected when state is Rejected', () => {
    render(<SubmissionStatusTracker submission={makeSubmission({ state: FilingState.Rejected })} />)
    const timeline = screen.getByRole('list', { name: 'Submission status' })
    const steps = timeline.querySelectorAll('[role="listitem"]')
    expect(steps[4]!.className).toContain('submission-tracker__step--rejected')
  })

  it('renders IRS errors when state is Rejected and errors exist', () => {
    const submission = makeSubmission({
      state: FilingState.Rejected,
      irsErrors: [
        { code: 'ERR-001', message: 'Invalid SSN format' },
        { code: 'ERR-002', message: 'Missing employer EIN' },
      ],
    })
    render(<SubmissionStatusTracker submission={submission} />)
    expect(screen.getByText('ERR-001:')).toBeInTheDocument()
    expect(screen.getByText('Invalid SSN format')).toBeInTheDocument()
    expect(screen.getByText('ERR-002:')).toBeInTheDocument()
    expect(screen.getByText('Missing employer EIN')).toBeInTheDocument()
  })

  it('does not render errors section when state is not Rejected', () => {
    const submission = makeSubmission({
      state: FilingState.Accepted,
      irsErrors: [{ code: 'ERR-001', message: 'Invalid SSN format' }],
    })
    render(<SubmissionStatusTracker submission={submission} />)
    expect(screen.queryByText('ERR-001:')).not.toBeInTheDocument()
  })

  it('renders a different form type label', () => {
    render(
      <SubmissionStatusTracker
        submission={makeSubmission({ formType: TaxFormType.NEC1099 })}
      />
    )
    expect(screen.getByText('1099-NEC')).toBeInTheDocument()
  })
})
