import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import TaxLayout from './TaxLayout'

const mockSetActiveTaxYear = vi.fn()

vi.mock('../stores/useTaxStore', () => ({
  useTaxStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({
      activeTaxYear: '2025',
      setActiveTaxYear: mockSetActiveTaxYear,
    }),
}))

vi.mock('../../../components/ui/ModuleHeader', () => ({
  default: ({ title, subtitle }: { title: string; subtitle?: string }) => (
    <div data-testid="module-header"><h1>{title}</h1>{subtitle && <p>{subtitle}</p>}</div>
  ),
}))

vi.mock('../../../components/ui/DemoVideo', () => ({
  DemoVideoSection: () => <div data-testid="demo-videos">DemoVideos</div>,
}))

describe('TaxLayout', () => {
  beforeEach(() => {
    mockSetActiveTaxYear.mockClear()
  })

  it('renders ModuleHeader with title Tax', () => {
    render(<MemoryRouter><TaxLayout /></MemoryRouter>)
    expect(screen.getByText('Tax')).toBeInTheDocument()
  })

  it('renders year dropdown with 3 options', () => {
    render(<MemoryRouter><TaxLayout /></MemoryRouter>)
    const select = screen.getByLabelText('Select tax year')
    expect(select).toBeInTheDocument()
    expect(select.querySelectorAll('option')).toHaveLength(3)
  })

  it('calls setActiveTaxYear when year changes', async () => {
    const user = userEvent.setup()
    render(<MemoryRouter><TaxLayout /></MemoryRouter>)
    const select = screen.getByLabelText('Select tax year')
    await user.selectOptions(select, '2024')
    expect(mockSetActiveTaxYear).toHaveBeenCalledWith('2024')
  })

  it('renders 5 navigation tabs', () => {
    render(<MemoryRouter><TaxLayout /></MemoryRouter>)
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Documents')).toBeInTheDocument()
    expect(screen.getByText('Forms')).toBeInTheDocument()
    expect(screen.getByText('E-File')).toBeInTheDocument()
    expect(screen.getByText('Pricing')).toBeInTheDocument()
  })

  it('renders DemoVideoSection', () => {
    render(<MemoryRouter><TaxLayout /></MemoryRouter>)
    expect(screen.getByTestId('demo-videos')).toBeInTheDocument()
  })
})
