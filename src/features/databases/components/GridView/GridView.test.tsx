import { render, screen } from '@testing-library/react'
import GridView from './GridView'
import { DbFieldType } from '../../types'
import type { DbField, DbRow } from '../../types'

vi.mock('../RelationFieldEditor/RelationFieldEditor', () => ({
  default: () => <div data-testid="relation-editor" />,
}))

vi.mock('../FieldConfigPopover/FieldConfigPopover', () => ({
  default: () => <div data-testid="field-config" />,
}))

vi.mock('../../lib/relationResolver', () => ({
  resolveRelation: () => null,
}))

vi.mock('../../lib/formulaEngine', () => ({
  evaluateFormula: () => null,
}))

const mockFields: DbField[] = [
  { id: 'f-name', name: 'Name', type: DbFieldType.Text, width: 200 },
  { id: 'f-age', name: 'Age', type: DbFieldType.Number, width: 100 },
  { id: 'f-active', name: 'Active', type: DbFieldType.Checkbox, width: 80 },
]

const mockRows: DbRow[] = [
  {
    id: 'r1',
    cells: { 'f-name': 'Alice', 'f-age': 30, 'f-active': true },
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'r2',
    cells: { 'f-name': 'Bob', 'f-age': 25, 'f-active': false },
    createdAt: '2025-01-02T00:00:00Z',
    updatedAt: '2025-01-02T00:00:00Z',
  },
]

describe('GridView', () => {
  const defaultProps = {
    fields: mockFields,
    rows: mockRows,
    hiddenFields: [] as string[],
    fieldOrder: ['f-name', 'f-age', 'f-active'],
    onCellChange: vi.fn(),
    onAddRow: vi.fn(),
    onAddField: vi.fn(),
    onDeleteRow: vi.fn(),
  }

  it('renders the grid with correct role', () => {
    render(<GridView {...defaultProps} />)
    expect(screen.getByRole('grid', { name: 'Data table' })).toBeInTheDocument()
  })

  it('renders column headers', () => {
    render(<GridView {...defaultProps} />)
    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('Age')).toBeInTheDocument()
    expect(screen.getByText('Active')).toBeInTheDocument()
  })

  it('renders row numbers', () => {
    render(<GridView {...defaultProps} />)
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('renders cell values', () => {
    render(<GridView {...defaultProps} />)
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()
  })

  it('renders checkbox fields as checkboxes', () => {
    render(<GridView {...defaultProps} />)
    const checkboxes = screen.getAllByRole('checkbox')
    expect(checkboxes.length).toBeGreaterThanOrEqual(2)
  })

  it('renders New row button', () => {
    render(<GridView {...defaultProps} />)
    expect(screen.getByText('New row')).toBeInTheDocument()
  })

  it('calls onAddRow when New row button is clicked', async () => {
    const onAddRow = vi.fn()
    render(<GridView {...defaultProps} onAddRow={onAddRow} />)
    screen.getByText('New row').click()
    expect(onAddRow).toHaveBeenCalled()
  })

  it('hides fields in hiddenFields list', () => {
    render(<GridView {...defaultProps} hiddenFields={['f-age']} />)
    expect(screen.queryByText('Age')).not.toBeInTheDocument()
  })

  it('renders gridcell roles', () => {
    render(<GridView {...defaultProps} />)
    const cells = screen.getAllByRole('gridcell')
    expect(cells.length).toBeGreaterThan(0)
  })
})
