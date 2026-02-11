import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import DatabaseDetailPage from './DatabaseDetailPage'
import { DbFieldType, ViewType } from '../types'

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useParams: () => ({ databaseId: 'db-1' }),
    useNavigate: () => vi.fn(),
  }
})

vi.mock('../../../hooks/useDebouncedValue', () => ({
  useDebouncedValue: (val: string) => val,
}))

const mockTable = {
  id: 'tbl-1',
  name: 'Contacts',
  icon: '📋',
  fields: [
    { id: 'f-name', name: 'Name', type: DbFieldType.Text, width: 200 },
    { id: 'f-status', name: 'Status', type: DbFieldType.Select, width: 140, options: { choices: [{ id: 'c1', name: 'Active', color: '#22C55E' }] } },
    { id: 'f-date', name: 'Due', type: DbFieldType.Date, width: 140 },
  ],
  rows: [
    { id: 'r1', cells: { 'f-name': 'Alice', 'f-status': 'Active' }, createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
  ],
  views: [
    { id: 'v1', name: 'Grid', type: ViewType.Grid, tableId: 'tbl-1', filters: [], sorts: [], hiddenFields: [], fieldOrder: ['f-name', 'f-status', 'f-date'], rowColorRules: [] },
  ],
}

vi.mock('../stores/useDatabaseStore', () => ({
  useDatabaseStore: Object.assign(
    (selector: (s: Record<string, unknown>) => unknown) =>
      selector({
        databases: {
          'db-1': {
            id: 'db-1',
            name: 'My Database',
            description: 'Test database',
            icon: '📊',
            tables: ['tbl-1'],
          },
        },
        tables: { 'tbl-1': mockTable },
        updateDatabase: vi.fn(),
        addTable: vi.fn(),
        addTableWithData: vi.fn(),
        addRow: vi.fn(),
        updateCell: vi.fn(),
        deleteRow: vi.fn(),
        addField: vi.fn(),
        updateField: vi.fn(),
        addView: vi.fn(),
        updateView: vi.fn(),
        getFilteredRows: () => mockTable.rows,
      }),
    { getState: () => ({ tables: { 'tbl-1': mockTable } }) }
  ),
}))

describe('DatabaseDetailPage', () => {
  it('renders database name', () => {
    render(
      <MemoryRouter>
        <DatabaseDetailPage />
      </MemoryRouter>
    )
    expect(screen.getByText('My Database')).toBeInTheDocument()
  })

  it('renders table tabs', () => {
    render(
      <MemoryRouter>
        <DatabaseDetailPage />
      </MemoryRouter>
    )
    expect(screen.getByText('Contacts')).toBeInTheDocument()
  })

  it('renders New Table button', () => {
    render(
      <MemoryRouter>
        <DatabaseDetailPage />
      </MemoryRouter>
    )
    expect(screen.getByLabelText('New Table')).toBeInTheDocument()
  })

  it('renders Upload File button', () => {
    render(
      <MemoryRouter>
        <DatabaseDetailPage />
      </MemoryRouter>
    )
    expect(screen.getByLabelText('Upload File')).toBeInTheDocument()
  })

  it('renders Automations button', () => {
    render(
      <MemoryRouter>
        <DatabaseDetailPage />
      </MemoryRouter>
    )
    expect(screen.getByLabelText('Automations')).toBeInTheDocument()
  })
})
