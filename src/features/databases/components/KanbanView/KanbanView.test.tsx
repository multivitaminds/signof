import { render, screen, fireEvent } from '@testing-library/react'
import KanbanView from './KanbanView'
import type { DbTable } from '../../types'
import { DbFieldType, ViewType } from '../../types'

function makeTable(overrides?: Partial<DbTable>): DbTable {
  return {
    id: 'tbl-1',
    name: 'Test Table',
    icon: '📋',
    fields: [
      { id: 'f-title', name: 'Title', type: DbFieldType.Text, width: 280 },
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
      {
        id: 'f-priority',
        name: 'Priority',
        type: DbFieldType.Select,
        width: 120,
        options: {
          choices: [
            { id: 'p1', name: 'Low', color: '#94A3B8' },
            { id: 'p2', name: 'High', color: '#EF4444' },
          ],
        },
      },
      { id: 'f-due', name: 'Due Date', type: DbFieldType.Date, width: 140 },
    ],
    rows: [
      {
        id: 'r1',
        cells: { 'f-title': 'Task A', 'f-status': 'Backlog', 'f-priority': 'High', 'f-due': '2026-02-15' },
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      },
      {
        id: 'r2',
        cells: { 'f-title': 'Task B', 'f-status': 'In Progress', 'f-priority': 'Low' },
        createdAt: '2026-01-02T00:00:00Z',
        updatedAt: '2026-01-02T00:00:00Z',
      },
      {
        id: 'r3',
        cells: { 'f-title': 'Task C', 'f-status': 'Done' },
        createdAt: '2026-01-03T00:00:00Z',
        updatedAt: '2026-01-03T00:00:00Z',
      },
      {
        id: 'r4',
        cells: { 'f-title': 'Uncategorized Task' },
        createdAt: '2026-01-04T00:00:00Z',
        updatedAt: '2026-01-04T00:00:00Z',
      },
    ],
    views: [
      {
        id: 'v1',
        name: 'Board',
        type: ViewType.Kanban,
        tableId: 'tbl-1',
        filters: [],
        sorts: [],
        groupBy: 'f-status',
        hiddenFields: [],
        fieldOrder: ['f-title', 'f-status', 'f-priority', 'f-due'],
      },
    ],
    ...overrides,
  }
}

const defaultProps = () => ({
  table: makeTable(),
  tables: {},
  groupFieldId: 'f-status',
  onUpdateCell: vi.fn(),
  onAddRow: vi.fn(),
  onDeleteRow: vi.fn(),
})

describe('KanbanView', () => {
  it('renders columns from select field choices', () => {
    render(<KanbanView {...defaultProps()} />)
    expect(screen.getByText('Backlog')).toBeInTheDocument()
    expect(screen.getByText('In Progress')).toBeInTheDocument()
    expect(screen.getByText('Done')).toBeInTheDocument()
  })

  it('shows card count in each column header', () => {
    render(<KanbanView {...defaultProps()} />)
    // Backlog has 1, In Progress has 1, Done has 1
    const counts = screen.getAllByText('1')
    expect(counts.length).toBeGreaterThanOrEqual(3)
  })

  it('renders card titles in the correct column', () => {
    render(<KanbanView {...defaultProps()} />)
    expect(screen.getByText('Task A')).toBeInTheDocument()
    expect(screen.getByText('Task B')).toBeInTheDocument()
    expect(screen.getByText('Task C')).toBeInTheDocument()
  })

  it('shows Uncategorized column for rows without group value', () => {
    render(<KanbanView {...defaultProps()} />)
    expect(screen.getByText('Uncategorized')).toBeInTheDocument()
    expect(screen.getByText('Uncategorized Task')).toBeInTheDocument()
  })

  it('shows preview fields on cards', () => {
    render(<KanbanView {...defaultProps()} />)
    // Priority field should show on cards
    expect(screen.getByText('High')).toBeInTheDocument()
    expect(screen.getByText('Low')).toBeInTheDocument()
  })

  it('shows empty state for columns with no cards', () => {
    const table = makeTable({
      rows: [
        {
          id: 'r1',
          cells: { 'f-title': 'Task A', 'f-status': 'Backlog' },
          createdAt: '2026-01-01T00:00:00Z',
          updatedAt: '2026-01-01T00:00:00Z',
        },
      ],
    })
    render(<KanbanView {...defaultProps()} table={table} />)
    // In Progress and Done columns are empty
    const empties = screen.getAllByText('No items')
    expect(empties.length).toBe(2)
  })

  it('calls onAddRow with pre-filled group value when clicking add button', async () => {
    const onAddRow = vi.fn()
    render(<KanbanView {...defaultProps()} onAddRow={onAddRow} />)
    // Click the first "New" button (should be in Backlog column)
    const addButtons = screen.getAllByText('New')
    addButtons[0]!.click()
    expect(onAddRow).toHaveBeenCalledWith({ 'f-status': 'Backlog' })
  })

  it('calls onDeleteRow when clicking delete button', () => {
    const onDeleteRow = vi.fn()
    render(<KanbanView {...defaultProps()} onDeleteRow={onDeleteRow} />)
    const deleteButtons = screen.getAllByLabelText(/^Delete/)
    deleteButtons[0]!.click()
    expect(onDeleteRow).toHaveBeenCalledWith('r1')
  })

  it('updates cell on drag-and-drop', () => {
    const onUpdateCell = vi.fn()
    render(<KanbanView {...defaultProps()} onUpdateCell={onUpdateCell} />)

    const cards = screen.getAllByText('Task A')
    const cardEl = cards[0]!.closest('[draggable]')!

    // Simulate drag start
    fireEvent.dragStart(cardEl, {
      dataTransfer: { effectAllowed: 'move', setData: vi.fn() },
    })

    // Find In Progress column and simulate drop
    const columns = document.querySelectorAll('.kanban-view__column')
    const inProgressCol = Array.from(columns).find((col) =>
      col.textContent?.includes('In Progress')
    )!

    fireEvent.dragOver(inProgressCol, {
      dataTransfer: { dropEffect: 'move' },
    })
    fireEvent.drop(inProgressCol, {
      dataTransfer: {},
    })

    expect(onUpdateCell).toHaveBeenCalledWith('r1', 'f-status', 'In Progress')
  })

  it('has draggable attribute on cards', () => {
    render(<KanbanView {...defaultProps()} />)
    const cards = document.querySelectorAll('[draggable="true"]')
    expect(cards.length).toBe(4) // 4 rows
  })

  it('renders the kanban board region', () => {
    render(<KanbanView {...defaultProps()} />)
    expect(screen.getByRole('region', { name: 'Kanban board' })).toBeInTheDocument()
  })
})
