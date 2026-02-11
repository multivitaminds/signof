import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import TaxDashboard from './TaxDashboard'

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  }
})

vi.mock('../stores/useTaxStore', () => ({
  useTaxStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({
      activeTaxYear: '2025',
      documents: [],
      filings: [],
      deadlines: [
        { id: 'd1', title: 'File Taxes', description: 'File your return', date: '2026-04-15T00:00:00Z', completed: false, taxYear: '2025' },
        { id: 'd2', title: 'Extension Deadline', description: 'Extension due', date: '2026-10-15T00:00:00Z', completed: true, taxYear: '2025' },
      ],
      toggleDeadline: vi.fn(),
      createFiling: vi.fn(),
    }),
}))

vi.mock('../components/TaxTimeline/TaxTimeline', () => ({
  default: () => <div data-testid="tax-timeline">TaxTimeline</div>,
}))

describe('TaxDashboard', () => {
  it('renders Filing Status card', () => {
    render(
      <MemoryRouter>
        <TaxDashboard />
      </MemoryRouter>
    )
    expect(screen.getByText('Filing Status')).toBeInTheDocument()
    expect(screen.getByText('Not Started')).toBeInTheDocument()
  })

  it('renders estimated refund/owed card', () => {
    render(
      <MemoryRouter>
        <TaxDashboard />
      </MemoryRouter>
    )
    expect(screen.getByText('Estimated Tax Owed')).toBeInTheDocument()
  })

  it('renders Documents Uploaded card', () => {
    render(
      <MemoryRouter>
        <TaxDashboard />
      </MemoryRouter>
    )
    expect(screen.getByText('Documents Uploaded')).toBeInTheDocument()
    expect(screen.getByText('0')).toBeInTheDocument()
  })

  it('renders Deadlines card', () => {
    render(
      <MemoryRouter>
        <TaxDashboard />
      </MemoryRouter>
    )
    expect(screen.getByText('Deadlines')).toBeInTheDocument()
    expect(screen.getByText('1/2')).toBeInTheDocument()
  })

  it('renders Filing Progress section', () => {
    render(
      <MemoryRouter>
        <TaxDashboard />
      </MemoryRouter>
    )
    expect(screen.getByText('Filing Progress')).toBeInTheDocument()
    expect(screen.getByText('0 of 4 steps')).toBeInTheDocument()
    expect(screen.getByRole('progressbar', { name: 'Filing progress' })).toBeInTheDocument()
  })

  it('renders Upcoming Deadlines section', () => {
    render(
      <MemoryRouter>
        <TaxDashboard />
      </MemoryRouter>
    )
    expect(screen.getByText('Upcoming Deadlines')).toBeInTheDocument()
    expect(screen.getByTestId('tax-timeline')).toBeInTheDocument()
  })

  it('renders Quick Actions section', () => {
    render(
      <MemoryRouter>
        <TaxDashboard />
      </MemoryRouter>
    )
    expect(screen.getByText('Quick Actions')).toBeInTheDocument()
    expect(screen.getByText('Upload Document')).toBeInTheDocument()
    expect(screen.getByText('Start Filing')).toBeInTheDocument()
  })
})
