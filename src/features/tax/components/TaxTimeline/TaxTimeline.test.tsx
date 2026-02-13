import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TaxTimeline from './TaxTimeline'
import type { TaxDeadline } from '../../types'

const mockDeadlines: TaxDeadline[] = [
  { id: 'd1', title: 'Filing Deadline', description: 'File your return', date: '2099-04-15', completed: false, taxYear: '2025' },
  { id: 'd2', title: 'W-2 Due', description: 'Get W-2 forms', date: '2020-01-31', completed: false, taxYear: '2025' },
  { id: 'd3', title: 'Extension Filed', description: 'Extension was filed', date: '2025-10-15', completed: true, taxYear: '2025' },
]

describe('TaxTimeline', () => {
  const defaultProps = {
    deadlines: mockDeadlines,
    onToggle: vi.fn(),
  }

  beforeEach(() => {
    defaultProps.onToggle.mockClear()
  })

  it('renders all deadlines', () => {
    render(<TaxTimeline {...defaultProps} />)
    expect(screen.getByText('Filing Deadline')).toBeInTheDocument()
    expect(screen.getByText('W-2 Due')).toBeInTheDocument()
    expect(screen.getByText('Extension Filed')).toBeInTheDocument()
  })

  it('renders descriptions', () => {
    render(<TaxTimeline {...defaultProps} />)
    expect(screen.getByText('File your return')).toBeInTheDocument()
    expect(screen.getByText('Get W-2 forms')).toBeInTheDocument()
  })

  it('sorts deadlines by date', () => {
    render(<TaxTimeline {...defaultProps} />)
    const items = screen.getAllByRole('listitem')
    expect(items).toHaveLength(3)
    // d2 (2020-01-31) should be first, d3 (2025-10-15) second, d1 (2099-04-15) third
    expect(items[0]).toHaveTextContent('W-2 Due')
    expect(items[1]).toHaveTextContent('Extension Filed')
    expect(items[2]).toHaveTextContent('Filing Deadline')
  })

  it('shows empty state when no deadlines', () => {
    render(<TaxTimeline deadlines={[]} onToggle={vi.fn()} />)
    expect(screen.getByText('No deadlines to display.')).toBeInTheDocument()
  })

  it('calls onToggle when clicking toggle button for completed item', async () => {
    const user = userEvent.setup()
    render(<TaxTimeline {...defaultProps} />)
    await user.click(screen.getByLabelText('Mark "Extension Filed" as incomplete'))
    expect(defaultProps.onToggle).toHaveBeenCalledWith('d3')
  })

  it('calls onToggle for uncompleted item', async () => {
    const user = userEvent.setup()
    render(<TaxTimeline {...defaultProps} />)
    await user.click(screen.getByLabelText('Mark "Filing Deadline" as complete'))
    expect(defaultProps.onToggle).toHaveBeenCalledWith('d1')
  })

  it('has correct timeline role and label', () => {
    render(<TaxTimeline {...defaultProps} />)
    expect(screen.getByRole('list', { name: 'Tax deadlines timeline' })).toBeInTheDocument()
  })
})
