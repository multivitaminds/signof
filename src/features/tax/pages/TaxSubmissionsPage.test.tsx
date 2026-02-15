import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import TaxSubmissionsPage from './TaxSubmissionsPage'
import type { TaxBanditSubmission } from '../types'

// ─── Mocks ───────────────────────────────────────────────────────────────

let mockSubmissions: TaxBanditSubmission[] = []

vi.mock('../stores/useTaxFilingStore', () => ({
  useTaxFilingStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({
      submissions: mockSubmissions,
    }),
}))

vi.mock('../stores/useTaxStore', () => ({
  useTaxStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({
      activeTaxYear: '2025',
    }),
}))

vi.mock('../components/SubmissionStatusTracker/SubmissionStatusTracker', () => ({
  default: ({ submission }: { submission: TaxBanditSubmission }) => (
    <div data-testid="submission-tracker">{submission.formType} - {submission.state}</div>
  ),
}))

// ─── Helpers ─────────────────────────────────────────────────────────────

function createSubmission(overrides: Partial<TaxBanditSubmission> = {}): TaxBanditSubmission {
  return {
    id: 'sub-1',
    formType: 'w2' as TaxBanditSubmission['formType'],
    taxYear: '2025',
    taxBanditSubmissionId: null,
    taxBanditRecordId: null,
    businessId: null,
    state: 'in_progress' as TaxBanditSubmission['state'],
    payload: {},
    validationErrors: [],
    irsErrors: [],
    pdfUrl: null,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    filedAt: null,
    ...overrides,
  }
}

// ─── Tests ───────────────────────────────────────────────────────────────

describe('TaxSubmissionsPage', () => {
  beforeEach(() => {
    mockSubmissions = []
  })

  it('renders empty state when there are no submissions', () => {
    render(
      <MemoryRouter>
        <TaxSubmissionsPage />
      </MemoryRouter>
    )

    expect(screen.getByText('No Submissions Yet')).toBeInTheDocument()
    expect(screen.getByText(/When you e-file tax forms/)).toBeInTheDocument()
  })

  it('renders submissions grouped by form type', () => {
    mockSubmissions = [
      createSubmission({ id: 'sub-1', formType: 'w2' as TaxBanditSubmission['formType'] }),
      createSubmission({ id: 'sub-2', formType: 'w2' as TaxBanditSubmission['formType'] }),
      createSubmission({ id: 'sub-3', formType: '1099_nec' as TaxBanditSubmission['formType'] }),
    ]

    render(
      <MemoryRouter>
        <TaxSubmissionsPage />
      </MemoryRouter>
    )

    expect(screen.getByText('Submissions')).toBeInTheDocument()
    expect(screen.getByText(/3 submissions for/)).toBeInTheDocument()
  })

  it('displays form type labels for each group', () => {
    mockSubmissions = [
      createSubmission({ id: 'sub-1', formType: '1099_nec' as TaxBanditSubmission['formType'] }),
    ]

    render(
      <MemoryRouter>
        <TaxSubmissionsPage />
      </MemoryRouter>
    )

    expect(screen.getByText('1099-NEC')).toBeInTheDocument()
  })

  it('renders SubmissionStatusTracker for each submission', () => {
    mockSubmissions = [
      createSubmission({ id: 'sub-1', formType: 'w2' as TaxBanditSubmission['formType'] }),
      createSubmission({ id: 'sub-2', formType: '941' as TaxBanditSubmission['formType'] }),
    ]

    render(
      <MemoryRouter>
        <TaxSubmissionsPage />
      </MemoryRouter>
    )

    const trackers = screen.getAllByTestId('submission-tracker')
    expect(trackers).toHaveLength(2)
  })

  it('filters submissions by active tax year', () => {
    mockSubmissions = [
      createSubmission({ id: 'sub-1', taxYear: '2025' }),
      createSubmission({ id: 'sub-2', taxYear: '2024' }),
    ]

    render(
      <MemoryRouter>
        <TaxSubmissionsPage />
      </MemoryRouter>
    )

    // Active year is 2025, so only 1 submission should show
    expect(screen.getByText(/1 submission for/)).toBeInTheDocument()
    const trackers = screen.getAllByTestId('submission-tracker')
    expect(trackers).toHaveLength(1)
  })

  it('shows group count badge for each form type', () => {
    mockSubmissions = [
      createSubmission({ id: 'sub-1', formType: 'w2' as TaxBanditSubmission['formType'] }),
      createSubmission({ id: 'sub-2', formType: 'w2' as TaxBanditSubmission['formType'] }),
      createSubmission({ id: 'sub-3', formType: 'w2' as TaxBanditSubmission['formType'] }),
    ]

    render(
      <MemoryRouter>
        <TaxSubmissionsPage />
      </MemoryRouter>
    )

    // The group count "3" should appear
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('shows empty state when all submissions are from a different tax year', () => {
    mockSubmissions = [
      createSubmission({ id: 'sub-1', taxYear: '2024' }),
      createSubmission({ id: 'sub-2', taxYear: '2023' }),
    ]

    render(
      <MemoryRouter>
        <TaxSubmissionsPage />
      </MemoryRouter>
    )

    expect(screen.getByText('No Submissions Yet')).toBeInTheDocument()
  })
})
