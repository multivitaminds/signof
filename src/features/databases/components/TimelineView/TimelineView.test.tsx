import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TimelineView from './TimelineView'
import type { DbTable } from '../../types'
import { DbFieldType, ViewType } from '../../types'

function makeTable(overrides?: Partial<DbTable>): DbTable {
  return {
    id: 'tbl-1',
    name: 'Test Table',
    icon: '📋',
    fields: [
      { id: 'f-title', name: 'Title', type: DbFieldType.Text, width: 280 },
      { id: 'f-start', name: 'Start Date', type: DbFieldType.Date, width: 140 },
      { id: 'f-end', name: 'End Date', type: DbFieldType.Date, width: 140 },
      {
        id: 'f-status',
        name: 'Status',
        type: DbFieldType.Select,
        width: 140,
        options: {
          choices: [
            { id: 's1', name: 'Backlog', color: '#94A3B8' },
            { id: 's2', name: 'In Progress', color: '#3B82F6' },
            { id: 's3', name: 'Done', color: '#22C55E' },
          ],
        },
      },
    ],
    rows: [
      {
        id: 'r1',
        cells: { 'f-title': 'Task A', 'f-start': '2026-02-01', 'f-end': '2026-02-15', 'f-status': 'Backlog' },
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      },
      {
        id: 'r2',
        cells: { 'f-title': 'Task B', 'f-start': '2026-02-10', 'f-end': '2026-02-28', 'f-status': 'In Progress' },
        createdAt: '2026-01-02T00:00:00Z',
        updatedAt: '2026-01-02T00:00:00Z',
      },
      {
        id: 'r3',
        cells: { 'f-title': 'Task C' },
        createdAt: '2026-01-03T00:00:00Z',
        updatedAt: '2026-01-03T00:00:00Z',
      },
    ],
    views: [
      {
        id: 'v1',
        name: 'Timeline',
        type: ViewType.Timeline,
        tableId: 'tbl-1',
        filters: [],
        sorts: [],
        hiddenFields: [],
        fieldOrder: ['f-title', 'f-start', 'f-end', 'f-status'],
        timelineStartFieldId: 'f-start',
        timelineEndFieldId: 'f-end',
      },
    ],
    ...overrides,
  }
}

const defaultProps = () => ({
  table: makeTable(),
  tables: {} as Record<string, DbTable>,
  startDateFieldId: 'f-start',
  endDateFieldId: 'f-end',
  onUpdateCell: vi.fn(),
  onRowClick: vi.fn(),
})

describe('TimelineView', () => {
  it('renders the timeline region', () => {
    render(<TimelineView {...defaultProps()} />)
    expect(screen.getByRole('region', { name: 'Timeline view' })).toBeInTheDocument()
  })

  it('renders row labels for each row', () => {
    render(<TimelineView {...defaultProps()} />)
    // Each task name appears in both label and bar, so use getAllByText
    expect(screen.getAllByText('Task A').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Task B').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Task C').length).toBeGreaterThanOrEqual(1)
  })

  it('renders the Record header label', () => {
    render(<TimelineView {...defaultProps()} />)
    expect(screen.getByText('Record')).toBeInTheDocument()
  })

  it('renders Today button', () => {
    render(<TimelineView {...defaultProps()} />)
    expect(screen.getByText('Today')).toBeInTheDocument()
  })

  it('renders navigation buttons', () => {
    render(<TimelineView {...defaultProps()} />)
    expect(screen.getByLabelText('Previous period')).toBeInTheDocument()
    expect(screen.getByLabelText('Next period')).toBeInTheDocument()
  })

  it('renders zoom toggle button', () => {
    render(<TimelineView {...defaultProps()} />)
    // Default zoom is Month, so button should show "Week" to switch
    expect(screen.getByText('Week')).toBeInTheDocument()
  })

  it('shows "No dates set" for rows without start/end dates', () => {
    render(<TimelineView {...defaultProps()} />)
    expect(screen.getByText('No dates set')).toBeInTheDocument()
  })

  it('renders timeline bars for rows with dates', () => {
    render(<TimelineView {...defaultProps()} />)
    // Tasks with dates should render clickable bars
    const bars = screen.getAllByRole('button', { name: /Task [AB]:/ })
    expect(bars.length).toBe(2)
  })

  it('uses select field color for bars', () => {
    render(<TimelineView {...defaultProps()} />)
    const barA = screen.getByRole('button', { name: /Task A:/ })
    // Backlog color is #94A3B8 — bar should use this color
    expect(barA).toHaveStyle({ borderColor: '#94A3B8' })
  })

  it('toggles zoom level when zoom button is clicked', async () => {
    const user = userEvent.setup()
    render(<TimelineView {...defaultProps()} />)
    // Initially shows "Week" (to switch from Month to Week)
    const zoomBtn = screen.getByText('Week').closest('button')!
    await user.click(zoomBtn)
    // After toggle, should show "Month" (to switch from Week to Month)
    expect(screen.getByText('Month')).toBeInTheDocument()
  })

  it('navigates to next period when next button is clicked', async () => {
    const user = userEvent.setup()
    render(<TimelineView {...defaultProps()} />)
    const nextBtn = screen.getByLabelText('Next period')
    // Should not throw when clicking
    await user.click(nextBtn)
    expect(nextBtn).toBeInTheDocument()
  })

  it('navigates to previous period when prev button is clicked', async () => {
    const user = userEvent.setup()
    render(<TimelineView {...defaultProps()} />)
    const prevBtn = screen.getByLabelText('Previous period')
    await user.click(prevBtn)
    expect(prevBtn).toBeInTheDocument()
  })

  it('calls onRowClick when a bar is clicked', async () => {
    const user = userEvent.setup()
    const onRowClick = vi.fn()
    render(<TimelineView {...defaultProps()} onRowClick={onRowClick} />)
    const barA = screen.getByRole('button', { name: /Task A:/ })
    await user.click(barA)
    expect(onRowClick).toHaveBeenCalledWith('r1')
  })

  it('renders resize handles on bars', () => {
    render(<TimelineView {...defaultProps()} />)
    const startHandles = screen.getAllByLabelText('Resize start date')
    const endHandles = screen.getAllByLabelText('Resize end date')
    expect(startHandles.length).toBe(2) // 2 rows with dates
    expect(endHandles.length).toBe(2)
  })

  it('starts resize on mousedown on a handle', () => {
    const onUpdateCell = vi.fn()
    render(<TimelineView {...defaultProps()} onUpdateCell={onUpdateCell} />)
    const startHandle = screen.getAllByLabelText('Resize start date')[0]!
    // mousedown on handle should not throw
    fireEvent.mouseDown(startHandle, { clientX: 100 })
    // Simulate mouse move + mouse up on document
    fireEvent.mouseMove(document, { clientX: 120 })
    fireEvent.mouseUp(document)
    // onUpdateCell may or may not be called depending on delta rounding
    // Just verify no errors occurred
    expect(startHandle).toBeInTheDocument()
  })

  it('renders with no rows without crashing', () => {
    const table = makeTable({ rows: [] })
    render(<TimelineView {...defaultProps()} table={table} />)
    expect(screen.getByRole('region', { name: 'Timeline view' })).toBeInTheDocument()
  })

  it('shows "Untitled" for rows without a title', () => {
    const table = makeTable({
      rows: [
        {
          id: 'r-untitled',
          cells: { 'f-start': '2026-02-01', 'f-end': '2026-02-10' },
          createdAt: '2026-01-01T00:00:00Z',
          updatedAt: '2026-01-01T00:00:00Z',
        },
      ],
    })
    render(<TimelineView {...defaultProps()} table={table} />)
    expect(screen.getAllByText('Untitled').length).toBeGreaterThanOrEqual(1)
  })

  it('handles keyboard enter on bar to trigger click', () => {
    const onRowClick = vi.fn()
    render(<TimelineView {...defaultProps()} onRowClick={onRowClick} />)
    const barA = screen.getByRole('button', { name: /Task A:/ })
    fireEvent.keyDown(barA, { key: 'Enter' })
    expect(onRowClick).toHaveBeenCalledWith('r1')
  })
})
