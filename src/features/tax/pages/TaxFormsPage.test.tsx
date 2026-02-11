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
  TAX_FORM_DEFINITIONS: [
    { id: 'f1040', name: 'Form 1040', fullName: 'U.S. Individual Income Tax Return', description: 'The main federal income tax form.', category: 'Primary' },
    { id: 'schedule_a', name: 'Schedule A', fullName: 'Itemized Deductions', description: 'Itemized deductions form.', category: 'Schedules' },
  ],
  WIZARD_STEPS: ['Personal Info', 'Income', 'Deductions', 'Credits', 'Review'],
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
    expect(screen.getByText('Primary')).toBeInTheDocument()
    expect(screen.getByText('Schedules')).toBeInTheDocument()
  })

  it('renders form cards with names', () => {
    render(<TaxFormsPage />)
    expect(screen.getByText('Form 1040')).toBeInTheDocument()
    expect(screen.getByText('Schedule A')).toBeInTheDocument()
  })

  it('renders form descriptions', () => {
    render(<TaxFormsPage />)
    expect(screen.getByText('The main federal income tax form.')).toBeInTheDocument()
    expect(screen.getByText('Itemized deductions form.')).toBeInTheDocument()
  })

  it('renders Start buttons for unstarted forms', () => {
    render(<TaxFormsPage />)
    const startButtons = screen.getAllByText('Start')
    expect(startButtons.length).toBeGreaterThanOrEqual(2)
  })

  it('renders full names of forms', () => {
    render(<TaxFormsPage />)
    expect(screen.getByText('U.S. Individual Income Tax Return')).toBeInTheDocument()
    expect(screen.getByText('Itemized Deductions')).toBeInTheDocument()
  })
})
