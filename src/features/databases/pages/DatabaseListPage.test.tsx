import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import DatabaseListPage from './DatabaseListPage'

const mockNavigate = vi.fn()
const mockAddDatabase = vi.fn().mockReturnValue('new-db-id')
const mockAddField = vi.fn()
const mockDeleteDatabase = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

const sampleDatabase = {
  id: 'db-1',
  name: 'Product Roadmap',
  icon: '\u{1F680}',
  description: 'Track features and bugs',
  tables: ['tbl-1'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

const sampleTable = {
  id: 'tbl-1',
  name: 'Table 1',
  icon: '\u{1F4CB}',
  fields: [],
  rows: [
    { id: 'r1', cells: {}, createdAt: '', updatedAt: '' },
    { id: 'r2', cells: {}, createdAt: '', updatedAt: '' },
  ],
  views: [],
}

vi.mock('../stores/useDatabaseStore', () => ({
  useDatabaseStore: Object.assign(
    (selector: (s: Record<string, unknown>) => unknown) =>
      selector({
        databases: { 'db-1': sampleDatabase },
        tables: { 'tbl-1': sampleTable },
        addDatabase: mockAddDatabase,
        addField: mockAddField,
        deleteDatabase: mockDeleteDatabase,
      }),
    {
      getState: () => ({
        databases: {
          'new-db-id': { ...sampleDatabase, id: 'new-db-id', tables: ['tbl-new'] },
        },
      }),
    }
  ),
}))

function renderDatabaseList() {
  return render(
    <MemoryRouter>
      <DatabaseListPage />
    </MemoryRouter>
  )
}

describe('DatabaseListPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the page title', () => {
    renderDatabaseList()
    expect(screen.getByText('Databases')).toBeInTheDocument()
  })

  it('renders the database count', () => {
    renderDatabaseList()
    expect(screen.getByText('1 database')).toBeInTheDocument()
  })

  it('renders database cards with name and description', () => {
    renderDatabaseList()
    expect(screen.getByText('Product Roadmap')).toBeInTheDocument()
    expect(screen.getByText('Track features and bugs')).toBeInTheDocument()
  })

  it('renders the template gallery', () => {
    renderDatabaseList()
    expect(screen.getByText('Start from template')).toBeInTheDocument()
    expect(screen.getByText('CRM')).toBeInTheDocument()
    expect(screen.getByText('Project Tracker')).toBeInTheDocument()
    expect(screen.getByText('Content Calendar')).toBeInTheDocument()
    expect(screen.getByText('Inventory')).toBeInTheDocument()
  })

  it('renders the New Database button in hero', () => {
    renderDatabaseList()
    expect(screen.getByText('New Database')).toBeInTheDocument()
  })

  it('renders the search bar', () => {
    renderDatabaseList()
    expect(screen.getByLabelText('Search databases')).toBeInTheDocument()
  })

  it('renders table and row count badges', () => {
    renderDatabaseList()
    expect(screen.getByText('1 table')).toBeInTheDocument()
    expect(screen.getByText('2 rows')).toBeInTheDocument()
  })

  it('renders the Recent section header', () => {
    renderDatabaseList()
    expect(screen.getByText('Recent')).toBeInTheDocument()
  })
})
