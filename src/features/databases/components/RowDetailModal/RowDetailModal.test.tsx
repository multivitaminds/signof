import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import RowDetailModal from './RowDetailModal'
import type { DbTable, DbRow } from '../../types'
import { DbFieldType, ViewType } from '../../types'

function makeTable(overrides?: Partial<DbTable>): DbTable {
  return {
    id: 'tbl-1',
    name: 'Test Table',
    icon: '📋',
    fields: [
      { id: 'f-title', name: 'Title', type: DbFieldType.Text, width: 280 },
      { id: 'f-amount', name: 'Amount', type: DbFieldType.Number, width: 120 },
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
      { id: 'f-due', name: 'Due Date', type: DbFieldType.Date, width: 140 },
      { id: 'f-done', name: 'Done', type: DbFieldType.Checkbox, width: 80 },
      { id: 'f-email', name: 'Email', type: DbFieldType.Email, width: 200 },
    ],
    rows: [],
    views: [
      {
        id: 'v1',
        name: 'Grid',
        type: ViewType.Grid,
        tableId: 'tbl-1',
        filters: [],
        sorts: [],
        hiddenFields: [],
        fieldOrder: ['f-title', 'f-amount', 'f-status', 'f-due', 'f-done', 'f-email'],
      },
    ],
    ...overrides,
  }
}

function makeRow(overrides?: Partial<DbRow>): DbRow {
  return {
    id: 'r1',
    cells: {
      'f-title': 'Test Record',
      'f-amount': 42,
      'f-status': 'In Progress',
      'f-due': '2026-03-15',
      'f-done': false,
      'f-email': 'test@example.com',
    },
    createdAt: '2026-01-15T10:00:00Z',
    updatedAt: '2026-02-01T14:30:00Z',
    ...overrides,
  }
}

const defaultProps = () => ({
  table: makeTable(),
  tables: {} as Record<string, DbTable>,
  row: makeRow(),
  rowIndex: 0,
  totalRows: 3,
  onClose: vi.fn(),
  onUpdateCell: vi.fn(),
  onDeleteRow: vi.fn(),
  onNavigate: vi.fn(),
})

describe('RowDetailModal', () => {
  it('renders the modal dialog', () => {
    render(<RowDetailModal {...defaultProps()} />)
    expect(screen.getByRole('dialog', { name: 'Record: Test Record' })).toBeInTheDocument()
  })

  it('displays the record title', () => {
    render(<RowDetailModal {...defaultProps()} />)
    expect(screen.getByText('Test Record')).toBeInTheDocument()
  })

  it('displays row counter (1 of 3)', () => {
    render(<RowDetailModal {...defaultProps()} />)
    expect(screen.getByText('1 of 3')).toBeInTheDocument()
  })

  it('renders all field labels', () => {
    render(<RowDetailModal {...defaultProps()} />)
    expect(screen.getByText('Title')).toBeInTheDocument()
    expect(screen.getByText('Amount')).toBeInTheDocument()
    expect(screen.getByText('Status')).toBeInTheDocument()
    expect(screen.getByText('Due Date')).toBeInTheDocument()
  })

  it('renders text input with current value', () => {
    render(<RowDetailModal {...defaultProps()} />)
    const titleInput = screen.getByDisplayValue('Test Record')
    expect(titleInput).toBeInTheDocument()
    expect(titleInput).toHaveAttribute('type', 'text')
  })

  it('renders number input with current value', () => {
    render(<RowDetailModal {...defaultProps()} />)
    const amountInput = screen.getByDisplayValue('42')
    expect(amountInput).toBeInTheDocument()
    expect(amountInput).toHaveAttribute('type', 'number')
  })

  it('renders select dropdown with current value', () => {
    render(<RowDetailModal {...defaultProps()} />)
    const select = screen.getByDisplayValue('In Progress')
    expect(select).toBeInTheDocument()
  })

  it('renders date input with current value', () => {
    render(<RowDetailModal {...defaultProps()} />)
    const dateInput = screen.getByDisplayValue('2026-03-15')
    expect(dateInput).toBeInTheDocument()
  })

  it('renders checkbox with current value', () => {
    render(<RowDetailModal {...defaultProps()} />)
    const checkbox = document.querySelector('.row-detail__checkbox') as HTMLInputElement
    expect(checkbox).toBeInTheDocument()
    expect(checkbox.checked).toBe(false)
  })

  it('renders email input with current value', () => {
    render(<RowDetailModal {...defaultProps()} />)
    const emailInput = screen.getByDisplayValue('test@example.com')
    expect(emailInput).toBeInTheDocument()
    expect(emailInput).toHaveAttribute('type', 'email')
  })

  it('renders Activity section', () => {
    render(<RowDetailModal {...defaultProps()} />)
    expect(screen.getByText('Activity')).toBeInTheDocument()
    expect(screen.getByText('Created')).toBeInTheDocument()
    expect(screen.getByText('Last updated')).toBeInTheDocument()
  })

  it('calls onUpdateCell when changing a text input', async () => {
    const user = userEvent.setup()
    const onUpdateCell = vi.fn()
    render(<RowDetailModal {...defaultProps()} onUpdateCell={onUpdateCell} />)
    const titleInput = screen.getByDisplayValue('Test Record')
    await user.clear(titleInput)
    await user.type(titleInput, 'Updated')
    // onChange fires on each character, updating via handleCellChange
    expect(onUpdateCell).toHaveBeenCalled()
    const lastCall = onUpdateCell.mock.calls[onUpdateCell.mock.calls.length - 1]
    expect(lastCall![0]).toBe('r1')
    expect(lastCall![1]).toBe('f-title')
  })

  it('calls onUpdateCell when changing a select', async () => {
    const user = userEvent.setup()
    const onUpdateCell = vi.fn()
    render(<RowDetailModal {...defaultProps()} onUpdateCell={onUpdateCell} />)
    const select = screen.getByDisplayValue('In Progress')
    await user.selectOptions(select, 'Done')
    expect(onUpdateCell).toHaveBeenCalledWith('r1', 'f-status', 'Done')
  })

  it('calls onClose when close button is clicked', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(<RowDetailModal {...defaultProps()} onClose={onClose} />)
    await user.click(screen.getByLabelText('Close'))
    expect(onClose).toHaveBeenCalled()
  })

  it('calls onNavigate with "prev" when prev button is clicked', async () => {
    const user = userEvent.setup()
    const onNavigate = vi.fn()
    render(<RowDetailModal {...defaultProps()} onNavigate={onNavigate} rowIndex={1} />)
    await user.click(screen.getByLabelText('Previous row'))
    expect(onNavigate).toHaveBeenCalledWith('prev')
  })

  it('calls onNavigate with "next" when next button is clicked', async () => {
    const user = userEvent.setup()
    const onNavigate = vi.fn()
    render(<RowDetailModal {...defaultProps()} onNavigate={onNavigate} />)
    await user.click(screen.getByLabelText('Next row'))
    expect(onNavigate).toHaveBeenCalledWith('next')
  })

  it('disables prev button when rowIndex is 0', () => {
    render(<RowDetailModal {...defaultProps()} rowIndex={0} />)
    expect(screen.getByLabelText('Previous row')).toBeDisabled()
  })

  it('disables next button when rowIndex is last', () => {
    render(<RowDetailModal {...defaultProps()} rowIndex={2} totalRows={3} />)
    expect(screen.getByLabelText('Next row')).toBeDisabled()
  })

  it('shows Delete Record button', () => {
    render(<RowDetailModal {...defaultProps()} />)
    expect(screen.getByText('Delete Record')).toBeInTheDocument()
  })

  it('shows confirm delete on first click, deletes on second', async () => {
    const user = userEvent.setup()
    const onDeleteRow = vi.fn()
    const onClose = vi.fn()
    render(<RowDetailModal {...defaultProps()} onDeleteRow={onDeleteRow} onClose={onClose} />)
    // First click shows confirmation
    await user.click(screen.getByText('Delete Record'))
    expect(screen.getByText('Confirm Delete')).toBeInTheDocument()
    // Second click actually deletes
    await user.click(screen.getByText('Confirm Delete'))
    expect(onDeleteRow).toHaveBeenCalledWith('r1')
    expect(onClose).toHaveBeenCalled()
  })

  it('displays "Untitled" when primary field is empty', () => {
    const row = makeRow({ cells: { 'f-title': '' } })
    render(<RowDetailModal {...defaultProps()} row={row} />)
    expect(screen.getByText('Untitled')).toBeInTheDocument()
  })

  it('closes modal when clicking overlay', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(<RowDetailModal {...defaultProps()} onClose={onClose} />)
    // Click the overlay (modal-overlay), not the modal content
    const overlay = document.querySelector('.modal-overlay')!
    await user.click(overlay)
    expect(onClose).toHaveBeenCalled()
  })

  it('does not show "Last updated" when created and updated are the same', () => {
    const row = makeRow({
      createdAt: '2026-01-15T10:00:00Z',
      updatedAt: '2026-01-15T10:00:00Z',
    })
    render(<RowDetailModal {...defaultProps()} row={row} />)
    expect(screen.getByText('Created')).toBeInTheDocument()
    expect(screen.queryByText('Last updated')).not.toBeInTheDocument()
  })
})
