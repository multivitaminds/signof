import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import FileUploadParser from './FileUploadParser'
import { DbFieldType } from '../../types'
import type { DbField } from '../../types'

describe('FileUploadParser', () => {
  const mockFields: DbField[] = [
    { id: 'f1', name: 'Name', type: DbFieldType.Text, width: 200 },
    { id: 'f2', name: 'Email', type: DbFieldType.Email, width: 200 },
  ]

  const defaultProps = {
    databaseId: 'db1',
    onCreateTable: vi.fn(),
    onImportToTable: vi.fn(),
    existingTables: [{ id: 'tbl1', name: 'Contacts', fields: mockFields }],
    onClose: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders dropzone when no file is selected', () => {
    render(<FileUploadParser {...defaultProps} />)

    expect(screen.getByText(/drag & drop a file here/i)).toBeInTheDocument()
    expect(screen.getByText(/supports csv and pdf files/i)).toBeInTheDocument()
  })

  it('renders the modal with Upload File title', () => {
    render(<FileUploadParser {...defaultProps} />)

    expect(screen.getByText('Upload File')).toBeInTheDocument()
  })

  it('calls onClose when cancel/close is clicked', async () => {
    const user = userEvent.setup()
    render(<FileUploadParser {...defaultProps} />)

    const closeBtn = screen.getByRole('button', { name: /close/i })
    await user.click(closeBtn)

    expect(defaultProps.onClose).toHaveBeenCalled()
  })

  it('renders file input that accepts CSV and PDF', () => {
    render(<FileUploadParser {...defaultProps} />)

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    expect(fileInput).toBeInTheDocument()
    expect(fileInput.accept).toBe('.csv,.pdf')
  })

  it('renders with no existing tables and still shows dropzone', () => {
    render(<FileUploadParser {...defaultProps} existingTables={[]} />)

    expect(screen.getByText(/drag & drop a file here/i)).toBeInTheDocument()
  })

  it('has an accessible dialog role', () => {
    render(<FileUploadParser {...defaultProps} />)

    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })
})
