import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
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
      extractDocument: vi.fn().mockResolvedValue(undefined),
      extractionResults: {},
      setExtractionConfirmed: vi.fn(),
      updateExtractionField: vi.fn(),
      setFieldConfirmed: vi.fn(),
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
  setFileBlob: vi.fn(),
}))

describe('TaxDocumentsPage', () => {
  it('renders the Tax Documents title', () => {
    render(<MemoryRouter><TaxDocumentsPage /></MemoryRouter>)
    expect(screen.getByText('Tax Documents')).toBeInTheDocument()
  })

  it('renders the subtitle', () => {
    render(<MemoryRouter><TaxDocumentsPage /></MemoryRouter>)
    expect(screen.getByText(/Upload your tax forms/)).toBeInTheDocument()
  })

  it('renders the Add Document button', () => {
    render(<MemoryRouter><TaxDocumentsPage /></MemoryRouter>)
    expect(screen.getByText('Add Document')).toBeInTheDocument()
  })

  it('renders summary cards', () => {
    render(<MemoryRouter><TaxDocumentsPage /></MemoryRouter>)
    expect(screen.getByText('Uploaded')).toBeInTheDocument()
    expect(screen.getByText('Extracted')).toBeInTheDocument()
    expect(screen.getByText('Confirmed')).toBeInTheDocument()
    expect(screen.getByText('Issues')).toBeInTheDocument()
  })

  it('renders flow step indicator', () => {
    render(<MemoryRouter><TaxDocumentsPage /></MemoryRouter>)
    expect(screen.getByText('Upload Documents')).toBeInTheDocument()
    expect(screen.getByText('Extract Data')).toBeInTheDocument()
    expect(screen.getByText('Confirm & Review')).toBeInTheDocument()
    expect(screen.getByText('File Taxes')).toBeInTheDocument()
  })

  it('renders the drop zone', () => {
    render(<MemoryRouter><TaxDocumentsPage /></MemoryRouter>)
    expect(
      screen.getByText(/Drag & drop tax forms here/)
    ).toBeInTheDocument()
  })

  it('renders document list with file name', () => {
    render(<MemoryRouter><TaxDocumentsPage /></MemoryRouter>)
    expect(screen.getByText('Acme W-2.pdf')).toBeInTheDocument()
  })

  it('renders document employer name', () => {
    render(<MemoryRouter><TaxDocumentsPage /></MemoryRouter>)
    expect(screen.getByText('Acme Corp')).toBeInTheDocument()
  })

  it('renders document list column headers', () => {
    render(<MemoryRouter><TaxDocumentsPage /></MemoryRouter>)
    expect(screen.getByText('Document')).toBeInTheDocument()
    expect(screen.getByText('Form Type')).toBeInTheDocument()
    expect(screen.getByText('Employer / Institution')).toBeInTheDocument()
    expect(screen.getByText('Extraction')).toBeInTheDocument()
  })

  it('shows upload form when Add Document is clicked', async () => {
    const user = userEvent.setup()
    render(<MemoryRouter><TaxDocumentsPage /></MemoryRouter>)
    await user.click(screen.getByText('Add Document'))
    expect(screen.getByText('Add Tax Document Manually')).toBeInTheDocument()
    expect(screen.getByLabelText('Document Name')).toBeInTheDocument()
    expect(screen.getByLabelText('Form Type')).toBeInTheDocument()
  })

  it('renders Extract All button when documents exist', () => {
    render(<MemoryRouter><TaxDocumentsPage /></MemoryRouter>)
    expect(screen.getByText('Extract All')).toBeInTheDocument()
  })
})
