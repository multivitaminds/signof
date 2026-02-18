import { render, screen } from '@testing-library/react'
import TaxFilingPage from './TaxFilingPage'

vi.mock('../stores/useTaxStore', () => ({
  useTaxStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({
      activeTaxYear: '2025',
      documents: [],
    }),
}))

vi.mock('../stores/useTaxFilingStore', () => ({
  useTaxFilingStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({
      filings: [
        {
          id: 'filing-1',
          taxYear: '2025',
          state: 'in_progress',
          filingStatus: 'single',
          firstName: 'John',
          lastName: 'Doe',
          ssn: '***-**-1234',
          email: 'john@example.com',
          phone: '555-1234',
          address: { street: '123 Main St', apt: '', city: 'Springfield', state: 'IL', zip: '62701' },
          wages: 85000,
          otherIncome: 12000,
          totalIncome: 97000,
          useStandardDeduction: true,
          standardDeduction: 15000,
          itemizedDeductions: 0,
          effectiveDeduction: 15000,
          taxableIncome: 82000,
          federalTax: 13000,
          estimatedPayments: 0,
          withheld: 14500,
          refundOrOwed: -1500,
          createdAt: '2026-01-15T00:00:00Z',
          updatedAt: '2026-02-01T00:00:00Z',
          filedAt: null,
        },
      ],
      createFiling: vi.fn(),
      updateFiling: vi.fn(),
      calculateTax: vi.fn(),
      submitFiling: vi.fn(),
      checklist: [
        { id: 'personal_info', label: 'Personal Information', description: 'Name, SSN, filing status, and address are complete', completed: true },
        { id: 'all_w2s', label: 'All W-2s Uploaded', description: 'Upload W-2 forms from all employers', completed: false },
      ],
      toggleChecklistItem: vi.fn(),
      checklistProgress: () => 50,
      isChecklistComplete: () => false,
      confirmation: null,
      clearConfirmation: vi.fn(),
      isAmendmentMode: false,
      setAmendmentMode: vi.fn(),
      amendmentReason: '',
      setAmendmentReason: vi.fn(),
      submitAmendment: vi.fn(),
      // TaxBandit state
      taxBanditConfig: { clientId: '', clientSecret: '', userToken: '', useSandbox: true },
      setTaxBanditConfig: vi.fn(),
      authenticateWithTaxBandit: vi.fn().mockResolvedValue(false),
      isTaxBanditConnected: () => false,
      transmissionStatus: 'idle',
      transmissionError: null,
      validationErrors: [],
      submissionId: null,
      returnPdfUrl: null,
      downloadReturnPdf: vi.fn(),
    }),
}))

vi.mock('../components/FilingWizard/FilingWizard', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="filing-wizard">{children}</div>
  ),
}))

describe('TaxFilingPage', () => {
  it('renders the Pre-Filing Checklist', () => {
    render(<TaxFilingPage />)
    expect(screen.getByText('Pre-Filing Checklist')).toBeInTheDocument()
  })

  it('renders checklist items', () => {
    render(<TaxFilingPage />)
    // "Personal Information" appears in both checklist and step content
    const personalInfoElements = screen.getAllByText('Personal Information')
    expect(personalInfoElements.length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('All W-2s Uploaded')).toBeInTheDocument()
  })

  it('renders the filing wizard', () => {
    render(<TaxFilingPage />)
    expect(screen.getByTestId('filing-wizard')).toBeInTheDocument()
  })

  it('renders Personal Information step by default', () => {
    render(<TaxFilingPage />)
    // "Personal Information" appears in both the checklist label and the step title
    const personalInfoElements = screen.getAllByText('Personal Information')
    expect(personalInfoElements.length).toBeGreaterThanOrEqual(2)
  })

  it('renders filing status steps', () => {
    render(<TaxFilingPage />)
    expect(screen.getByText('Not Started')).toBeInTheDocument()
    expect(screen.getByText('In Progress')).toBeInTheDocument()
  })

  it('renders checklist progress', () => {
    render(<TaxFilingPage />)
    expect(screen.getByText('50%')).toBeInTheDocument()
  })

})
