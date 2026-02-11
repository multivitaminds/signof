import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import FieldStats from './FieldStats'
import type { DbField, DbRow } from '../../types'
import { DbFieldType } from '../../types'

const fields: DbField[] = [
  { id: 'f-title', name: 'Title', type: DbFieldType.Text, width: 200 },
  { id: 'f-amount', name: 'Amount', type: DbFieldType.Number, width: 120 },
  {
    id: 'f-status',
    name: 'Status',
    type: DbFieldType.Select,
    width: 140,
    options: {
      choices: [
        { id: 's1', name: 'Active', color: '#22C55E' },
        { id: 's2', name: 'Inactive', color: '#94A3B8' },
      ],
    },
  },
  { id: 'f-date', name: 'Date', type: DbFieldType.Date, width: 140 },
  { id: 'f-check', name: 'Done', type: DbFieldType.Checkbox, width: 80 },
]

const rows: DbRow[] = [
  {
    id: 'r1',
    cells: { 'f-title': 'Alpha', 'f-amount': 100, 'f-status': 'Active', 'f-date': '2026-01-15', 'f-check': true },
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'r2',
    cells: { 'f-title': 'Beta', 'f-amount': 200, 'f-status': 'Active', 'f-date': '2026-02-20', 'f-check': false },
    createdAt: '2026-01-02T00:00:00Z',
    updatedAt: '2026-01-02T00:00:00Z',
  },
  {
    id: 'r3',
    cells: { 'f-title': '', 'f-amount': 50, 'f-status': 'Inactive', 'f-date': '2026-03-10', 'f-check': true },
    createdAt: '2026-01-03T00:00:00Z',
    updatedAt: '2026-01-03T00:00:00Z',
  },
  {
    id: 'r4',
    cells: { 'f-title': 'Delta', 'f-amount': null, 'f-status': null },
    createdAt: '2026-01-04T00:00:00Z',
    updatedAt: '2026-01-04T00:00:00Z',
  },
]

const defaultProps = () => ({
  fields,
  rows,
  hiddenFields: [] as string[],
  fieldOrder: ['f-title', 'f-amount', 'f-status', 'f-date', 'f-check'],
})

describe('FieldStats', () => {
  it('renders the toggle button when hidden', () => {
    render(<FieldStats {...defaultProps()} />)
    expect(screen.getByText('Show stats')).toBeInTheDocument()
  })

  it('shows stats row when toggle is clicked', async () => {
    const user = userEvent.setup()
    render(<FieldStats {...defaultProps()} />)
    await user.click(screen.getByText('Show stats'))
    expect(screen.getByText('Hide stats')).toBeInTheDocument()
  })

  it('hides stats row when hide is clicked', async () => {
    const user = userEvent.setup()
    render(<FieldStats {...defaultProps()} />)
    await user.click(screen.getByText('Show stats'))
    await user.click(screen.getByText('Hide stats'))
    expect(screen.getByText('Show stats')).toBeInTheDocument()
  })

  it('displays count stat for text fields by default', async () => {
    const user = userEvent.setup()
    render(<FieldStats {...defaultProps()} />)
    await user.click(screen.getByText('Show stats'))
    // Multiple fields default to Count (Text, Select, Date, Checkbox)
    const countLabels = screen.getAllByText('Count')
    expect(countLabels.length).toBeGreaterThanOrEqual(1)
  })

  it('displays sum stat for number fields by default', async () => {
    const user = userEvent.setup()
    render(<FieldStats {...defaultProps()} />)
    await user.click(screen.getByText('Show stats'))
    // Number field default stat is Sum
    expect(screen.getByText('Sum')).toBeInTheDocument()
    // Sum of 100 + 200 + 50 = 350
    expect(screen.getByText('350')).toBeInTheDocument()
  })

  it('cycles stat type when clicking a stat cell', async () => {
    const user = userEvent.setup()
    render(<FieldStats {...defaultProps()} />)
    await user.click(screen.getByText('Show stats'))
    // Click the number field stat to cycle: Sum -> Avg
    const sumBtn = screen.getByText('Sum').closest('button')!
    await user.click(sumBtn)
    expect(screen.getByText('Average')).toBeInTheDocument()
    // Average of 100 + 200 + 50 = 116.67
    expect(screen.getByText('116.67')).toBeInTheDocument()
  })

  it('displays count for all rows', async () => {
    const user = userEvent.setup()
    render(<FieldStats {...defaultProps()} />)
    await user.click(screen.getByText('Show stats'))
    // Count should be 4 for multiple fields (Text, Select, Date, Checkbox)
    const fours = screen.getAllByText('4')
    expect(fours.length).toBeGreaterThanOrEqual(1)
  })

  it('respects hidden fields', async () => {
    const user = userEvent.setup()
    render(<FieldStats {...defaultProps()} hiddenFields={['f-amount']} />)
    await user.click(screen.getByText('Show stats'))
    // Amount field should not be visible so no Sum stat
    expect(screen.queryByText('Sum')).not.toBeInTheDocument()
  })

  it('has aria-label on stat buttons', async () => {
    const user = userEvent.setup()
    render(<FieldStats {...defaultProps()} />)
    await user.click(screen.getByText('Show stats'))
    // Check that stat buttons have aria-labels
    const statBtns = document.querySelectorAll('.field-stats__stat-btn')
    expect(statBtns.length).toBeGreaterThan(0)
    for (const btn of statBtns) {
      expect(btn.getAttribute('aria-label')).toBeTruthy()
    }
  })

  it('shows distribution for select fields', async () => {
    const user = userEvent.setup()
    render(<FieldStats {...defaultProps()} />)
    await user.click(screen.getByText('Show stats'))
    // Find the status column stat button (default is Count for Select)
    // Click it to go to Distribution
    const statBtns = document.querySelectorAll('.field-stats__stat-btn')
    // Status field is 3rd visible field (index 2)
    const statusBtn = statBtns[2]!
    await user.click(statusBtn) // Count -> Distribution
    expect(screen.getByText('Distribution')).toBeInTheDocument()
  })

  it('shows toggle button with correct aria-label', () => {
    render(<FieldStats {...defaultProps()} />)
    expect(screen.getByLabelText('Show field statistics')).toBeInTheDocument()
  })

  it('shows hide button with correct aria-label when visible', async () => {
    const user = userEvent.setup()
    render(<FieldStats {...defaultProps()} />)
    await user.click(screen.getByText('Show stats'))
    expect(screen.getByLabelText('Hide field statistics')).toBeInTheDocument()
  })
})
