import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ImportExportModal from './ImportExportModal'
import type { DbField, DbRow } from '../../types'
import { DbFieldType } from '../../types'

vi.mock('../../lib/importExport', () => ({
  exportToCSV: () => 'Name,Age\nAlice,30\nBob,25',
  exportToJSON: () => JSON.stringify([{ Name: 'Alice', Age: 30 }], null, 2),
  parseCSV: (_text: string) => ({ headers: ['Name', 'Age'], rows: [['Alice', '30'], ['Bob', '25']] }),
  importFromCSV: () => ({ records: [{ cells: { 'f-name': 'Alice' } }], errors: [] }),
  downloadFile: vi.fn(),
}))

const mockFields: DbField[] = [
  { id: 'f-name', name: 'Name', type: DbFieldType.Text, width: 200 },
  { id: 'f-age', name: 'Age', type: DbFieldType.Number, width: 100 },
]

const mockRows: DbRow[] = [
  {
    id: 'r1',
    cells: { 'f-name': 'Alice', 'f-age': 30 },
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
]

describe('ImportExportModal', () => {
  const defaultProps = {
    fields: mockFields,
    rows: mockRows,
    databaseId: 'db-1',
    tableName: 'Test Table',
    onImport: vi.fn(),
    onClose: vi.fn(),
  }

  it('renders the modal with Import / Export title', () => {
    render(<ImportExportModal {...defaultProps} />)
    expect(screen.getByText('Import / Export')).toBeInTheDocument()
  })

  it('renders Export and Import tabs', () => {
    render(<ImportExportModal {...defaultProps} />)
    expect(screen.getByText('Export')).toBeInTheDocument()
    expect(screen.getByText('Import')).toBeInTheDocument()
  })

  it('shows export tab by default', () => {
    render(<ImportExportModal {...defaultProps} />)
    expect(screen.getByText('Format')).toBeInTheDocument()
    expect(screen.getByText('CSV')).toBeInTheDocument()
    expect(screen.getByText('JSON')).toBeInTheDocument()
  })

  it('renders Download CSV button', () => {
    render(<ImportExportModal {...defaultProps} />)
    expect(screen.getByText('Download CSV')).toBeInTheDocument()
  })

  it('switches to import tab', async () => {
    const user = userEvent.setup()
    render(<ImportExportModal {...defaultProps} />)
    await user.click(screen.getByText('Import'))
    expect(screen.getByText(/Drag & drop a CSV file here/)).toBeInTheDocument()
  })

  it('renders close button', () => {
    render(<ImportExportModal {...defaultProps} />)
    expect(screen.getByLabelText('Close')).toBeInTheDocument()
  })

  it('renders preview section', () => {
    render(<ImportExportModal {...defaultProps} />)
    expect(screen.getByText(/Preview/)).toBeInTheDocument()
  })
})
