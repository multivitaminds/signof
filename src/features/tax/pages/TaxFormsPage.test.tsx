import { render, screen } from '@testing-library/react'
import TaxFormsPage from './TaxFormsPage'

vi.mock('../stores/useTaxStore', () => ({
  useTaxStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({
      activeTaxYear: '2025',
    }),
}))

vi.mock('../stores/useTaxFormStore', () => ({
  useTaxFormStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({
      entries: [],
      startForm: vi.fn(() => 'entry-1'),
      updateFormData: vi.fn(),
      setCurrentStep: vi.fn(),
      completeStep: vi.fn(),
      completeForm: vi.fn(),
      getFormStatus: () => 'not_started',
      getEntryByForm: () => null,
      getProgressPercent: () => 0,
    }),
  TAXBANDITS_FORM_DEFINITIONS: [
    { id: '1099_nec', name: '1099-NEC', fullName: 'Nonemployee Compensation', description: 'Report payments to independent contractors', category: '1099_series', taxBanditsPath: 'Form1099NEC' },
    { id: 'w2', name: 'W-2', fullName: 'Wage and Tax Statement', description: 'Report employee wages and tax withholdings', category: 'w2_employment', taxBanditsPath: 'FormW2' },
  ],
  FORM_CATEGORY_LABELS: {
    '1099_series': '1099 Series',
    'w2_employment': 'W-2 Employment',
  },
  WIZARD_STEPS: ['Payer Info', 'Recipient Info', 'Amounts', 'State Info', 'Review'],
  FormCompletionStatus: {
    NotStarted: 'not_started',
    InProgress: 'in_progress',
    Completed: 'completed',
  },
}))

describe('TaxFormsPage', () => {
  it('renders the Tax Forms title', () => {
    render(<TaxFormsPage />)
    expect(screen.getByText('Tax Forms')).toBeInTheDocument()
  })

  it('renders the subtitle with tax year', () => {
    render(<TaxFormsPage />)
    expect(
      screen.getByText(/Select a tax form to begin filling out for tax year 2025/)
    ).toBeInTheDocument()
  })

  it('renders form categories', () => {
    render(<TaxFormsPage />)
    expect(screen.getByText('1099 Series')).toBeInTheDocument()
    expect(screen.getByText('W-2 Employment')).toBeInTheDocument()
  })

  it('renders form cards with names', () => {
    render(<TaxFormsPage />)
    expect(screen.getByText('1099-NEC')).toBeInTheDocument()
    expect(screen.getByText('W-2')).toBeInTheDocument()
  })

  it('renders form descriptions', () => {
    render(<TaxFormsPage />)
    expect(screen.getByText('Report payments to independent contractors')).toBeInTheDocument()
    expect(screen.getByText('Report employee wages and tax withholdings')).toBeInTheDocument()
  })

  it('renders Start buttons for unstarted forms', () => {
    render(<TaxFormsPage />)
    const startButtons = screen.getAllByText('Start')
    expect(startButtons.length).toBeGreaterThanOrEqual(2)
  })

  it('renders full names of forms', () => {
    render(<TaxFormsPage />)
    expect(screen.getByText('Nonemployee Compensation')).toBeInTheDocument()
    expect(screen.getByText('Wage and Tax Statement')).toBeInTheDocument()
  })
})
