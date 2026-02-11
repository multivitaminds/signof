import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TaxDocumentsPage from './TaxDocumentsPage'

vi.mock('../stores/useTaxDocumentStore', () => ({
  useTaxDocumentStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({
      documents: [
        {
          id: 'doc-1',
          fileName: 'Acme W-2.pdf',
          formType: 'w2',
          taxYear: '2025',
          employerName: 'Acme Corp',
          uploadDate: '2026-01-15T10:00:00Z',
          status: 'pending_review',
          fileSize: 150000,
          issueNote: '',
        },
      ],
      activeTaxYear: '2025',
      addDocument: vi.fn(),
      deleteDocument: vi.fn(),
      updateDocumentStatus: vi.fn(),
      isDragging: false,
      setDragging: vi.fn(),
      totalCount: () => 1,
      verifiedCount: () => 0,
      pendingCount: () => 1,
      issueCount: () => 0,
    }),
  DocReviewStatus: {
    PendingReview: 'pending_review',
    Verified: 'verified',
    IssueFound: 'issue_found',
  },
  DOC_REVIEW_LABELS: {
    pending_review: 'Pending Review',
    verified: 'Verified',
    issue_found: 'Issue Found',
  },
  detectFormType: () => 'w2',
}))

describe('TaxDocumentsPage', () => {
  it('renders the Tax Documents title', () => {
    render(<TaxDocumentsPage />)
    expect(screen.getByText('Tax Documents')).toBeInTheDocument()
  })

  it('renders the Add Document button', () => {
    render(<TaxDocumentsPage />)
    expect(screen.getByText('Add Document')).toBeInTheDocument()
  })

  it('renders summary cards', () => {
    render(<TaxDocumentsPage />)
    expect(screen.getByText('Total Uploaded')).toBeInTheDocument()
    expect(screen.getByText('Verified')).toBeInTheDocument()
    // "Pending Review" appears in summary card and in document status badge
    const pendingElements = screen.getAllByText('Pending Review')
    expect(pendingElements.length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('Issues Found')).toBeInTheDocument()
  })

  it('renders the drop zone', () => {
    render(<TaxDocumentsPage />)
    expect(
      screen.getByText(/Drag & drop tax forms here/)
    ).toBeInTheDocument()
  })

  it('renders document list with file name', () => {
    render(<TaxDocumentsPage />)
    expect(screen.getByText('Acme W-2.pdf')).toBeInTheDocument()
  })

  it('renders document employer name', () => {
    render(<TaxDocumentsPage />)
    expect(screen.getByText('Acme Corp')).toBeInTheDocument()
  })

  it('renders document list column headers', () => {
    render(<TaxDocumentsPage />)
    expect(screen.getByText('Document')).toBeInTheDocument()
    expect(screen.getByText('Form Type')).toBeInTheDocument()
    expect(screen.getByText('Employer / Institution')).toBeInTheDocument()
  })

  it('shows upload form when Add Document is clicked', async () => {
    const user = userEvent.setup()
    render(<TaxDocumentsPage />)
    await user.click(screen.getByText('Add Document'))
    expect(screen.getByText('Add Tax Document Manually')).toBeInTheDocument()
    expect(screen.getByLabelText('Document Name')).toBeInTheDocument()
    expect(screen.getByLabelText('Form Type')).toBeInTheDocument()
  })
})
