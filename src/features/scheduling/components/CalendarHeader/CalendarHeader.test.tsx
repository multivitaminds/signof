import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CalendarHeader from './CalendarHeader'
import { CalendarView } from '../../types'

describe('CalendarHeader', () => {
  const defaultProps = {
    title: 'February 2026',
    view: CalendarView.Month as CalendarView,
    onViewChange: vi.fn(),
    onPrev: vi.fn(),
    onNext: vi.fn(),
    onToday: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the title', () => {
    render(<CalendarHeader {...defaultProps} />)
    expect(screen.getByText('February 2026')).toBeInTheDocument()
  })

  it('renders navigation buttons', () => {
    render(<CalendarHeader {...defaultProps} />)
    expect(screen.getByLabelText('Previous')).toBeInTheDocument()
    expect(screen.getByLabelText('Next')).toBeInTheDocument()
    expect(screen.getByText('Today')).toBeInTheDocument()
  })

  it('renders view toggle buttons', () => {
    render(<CalendarHeader {...defaultProps} />)
    expect(screen.getByText('Month')).toBeInTheDocument()
    expect(screen.getByText('Week')).toBeInTheDocument()
  })

  it('calls onPrev when clicking previous', async () => {
    const user = userEvent.setup()
    render(<CalendarHeader {...defaultProps} />)
    await user.click(screen.getByLabelText('Previous'))
    expect(defaultProps.onPrev).toHaveBeenCalledOnce()
  })

  it('calls onNext when clicking next', async () => {
    const user = userEvent.setup()
    render(<CalendarHeader {...defaultProps} />)
    await user.click(screen.getByLabelText('Next'))
    expect(defaultProps.onNext).toHaveBeenCalledOnce()
  })

  it('calls onToday when clicking today', async () => {
    const user = userEvent.setup()
    render(<CalendarHeader {...defaultProps} />)
    await user.click(screen.getByText('Today'))
    expect(defaultProps.onToday).toHaveBeenCalledOnce()
  })

  it('calls onViewChange when toggling view', async () => {
    const user = userEvent.setup()
    render(<CalendarHeader {...defaultProps} />)
    await user.click(screen.getByText('Week'))
    expect(defaultProps.onViewChange).toHaveBeenCalledWith(CalendarView.Week)
  })

  it('highlights the active view', () => {
    render(<CalendarHeader {...defaultProps} view={CalendarView.Month} />)
    const monthBtn = screen.getByText('Month')
    expect(monthBtn).toHaveAttribute('aria-pressed', 'true')
    const weekBtn = screen.getByText('Week')
    expect(weekBtn).toHaveAttribute('aria-pressed', 'false')
  })
})
