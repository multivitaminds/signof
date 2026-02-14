import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import BulkImportModal from './BulkImportModal'
import type { ImportConfig } from '../../lib/importConfigs'

// Minimal test config
interface TestEntity {
  name: string
  email: string
  amount: number
}

function createTestConfig(): ImportConfig<TestEntity> {
  return {
    entityName: 'Contact',
    fields: [
      { key: 'name', label: 'Name', required: true, type: 'string', aliases: ['full name', 'contact name'] },
      { key: 'email', label: 'Email', required: true, type: 'string', aliases: ['email address', 'e-mail'] },
      { key: 'amount', label: 'Amount', required: false, type: 'number', defaultValue: 0, aliases: ['total', 'balance'] },
    ],
    validate: (row: Record<string, string>) => {
      const errors: string[] = []
      const data: Partial<TestEntity> = {}

      if (!row.name?.trim()) errors.push('Name is required')
      else data.name = row.name.trim()

      if (!row.email?.trim()) errors.push('Email is required')
      else data.email = row.email.trim()

      if (row.amount?.trim()) {
        const num = parseFloat(row.amount)
        if (isNaN(num)) errors.push('Amount must be a valid number')
        else data.amount = num
      } else {
        data.amount = 0
      }

      return { valid: errors.length === 0, errors, data }
    },
    sampleCsv: 'name,email,amount\nJane,jane@test.com,100\nBob,bob@test.com,200',
  }
}

function createCsvFile(content: string, name = 'test.csv'): File {
  return new File([content], name, { type: 'text/csv' })
}

// Helper to advance from step 1 to step 2 by uploading a CSV
async function uploadCsvAndAdvance(content: string, name = 'test.csv') {
  const file = createCsvFile(content, name)
  const input = screen.getByLabelText('CSV file input')
  fireEvent.change(input, { target: { files: [file] } })
  // Wait for FileReader to complete and step 2 to render (select dropdowns)
  await waitFor(() => {
    expect(screen.getByLabelText('Map Name')).toBeInTheDocument()
  })
}

describe('BulkImportModal', () => {
  it('renders with correct title from config', () => {
    const config = createTestConfig()
    render(<BulkImportModal config={config} onImport={vi.fn()} onClose={vi.fn()} />)
    expect(screen.getByText('Import Contacts')).toBeInTheDocument()
  })

  it('shows upload dropzone on step 1', () => {
    const config = createTestConfig()
    render(<BulkImportModal config={config} onImport={vi.fn()} onClose={vi.fn()} />)
    expect(screen.getByText(/Drag and drop a CSV file here/)).toBeInTheDocument()
    expect(screen.getByText(/.csv files only/)).toBeInTheDocument()
  })

  it('accepts valid CSV file and advances to step 2', async () => {
    const config = createTestConfig()
    render(<BulkImportModal config={config} onImport={vi.fn()} onClose={vi.fn()} />)

    const csvContent = 'name,email,amount\nAlice,alice@test.com,100\nBob,bob@test.com,200'
    await uploadCsvAndAdvance(csvContent)

    // Step 2 should be visible — look for mapping selects
    expect(screen.getByLabelText('Map Name')).toBeInTheDocument()
    expect(screen.getByLabelText('Map Email')).toBeInTheDocument()
  })

  it('rejects non-CSV file', async () => {
    const config = createTestConfig()
    render(<BulkImportModal config={config} onImport={vi.fn()} onClose={vi.fn()} />)

    const file = new File(['hello'], 'readme.txt', { type: 'text/plain' })
    const input = screen.getByLabelText('CSV file input')
    fireEvent.change(input, { target: { files: [file] } })

    expect(screen.getByRole('alert')).toHaveTextContent('Please upload a CSV file')
  })

  it('shows mapping dropdowns on step 2', async () => {
    const config = createTestConfig()
    render(<BulkImportModal config={config} onImport={vi.fn()} onClose={vi.fn()} />)

    await uploadCsvAndAdvance('name,email,amount\nAlice,alice@test.com,50')

    const selects = screen.getAllByRole('combobox')
    expect(selects.length).toBe(3) // name, email, amount
  })

  it('auto-maps matching headers', async () => {
    const config = createTestConfig()
    render(<BulkImportModal config={config} onImport={vi.fn()} onClose={vi.fn()} />)

    await uploadCsvAndAdvance('name,email,amount\nAlice,alice@test.com,50')

    const nameSelect = screen.getByLabelText('Map Name') as HTMLSelectElement
    const emailSelect = screen.getByLabelText('Map Email') as HTMLSelectElement
    const amountSelect = screen.getByLabelText('Map Amount') as HTMLSelectElement

    expect(nameSelect.value).toBe('name')
    expect(emailSelect.value).toBe('email')
    expect(amountSelect.value).toBe('amount')
  })

  it('shows preview table on step 3', async () => {
    const user = userEvent.setup()
    const config = createTestConfig()
    render(<BulkImportModal config={config} onImport={vi.fn()} onClose={vi.fn()} />)

    await uploadCsvAndAdvance('name,email,amount\nAlice,alice@test.com,50\nBob,bob@test.com,100')

    await user.click(screen.getByRole('button', { name: 'Next' }))

    // Should show the table with data
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()
    expect(screen.getByText('2 valid')).toBeInTheDocument()
  })

  it('shows validation errors in preview', async () => {
    const user = userEvent.setup()
    const config = createTestConfig()
    render(<BulkImportModal config={config} onImport={vi.fn()} onClose={vi.fn()} />)

    // Second row has missing email
    await uploadCsvAndAdvance('name,email,amount\nAlice,alice@test.com,50\nBob,,100')

    await user.click(screen.getByRole('button', { name: 'Next' }))

    expect(screen.getByText('1 errors')).toBeInTheDocument()
    // The cell with the empty email should have error class
    const errorCells = document.querySelectorAll('.bulk-import__cell--error')
    expect(errorCells.length).toBeGreaterThan(0)
  })

  it('calls onImportComplete with correct count', async () => {
    const user = userEvent.setup()
    const onImportComplete = vi.fn()
    const config = createTestConfig()
    render(
      <BulkImportModal
        config={config}
        onImport={vi.fn()}
        onClose={vi.fn()}
        onImportComplete={onImportComplete}
      />
    )

    await uploadCsvAndAdvance('name,email,amount\nAlice,alice@test.com,50\nBob,bob@test.com,100')

    await user.click(screen.getByRole('button', { name: 'Next' }))
    await user.click(screen.getByRole('button', { name: 'Import' }))

    expect(onImportComplete).toHaveBeenCalledWith(2)
  })

  it('shows success message on step 4', async () => {
    const user = userEvent.setup()
    const config = createTestConfig()
    render(
      <BulkImportModal
        config={config}
        onImport={vi.fn()}
        onClose={vi.fn()}
        onImportComplete={vi.fn()}
      />
    )

    await uploadCsvAndAdvance('name,email\nAlice,alice@test.com')

    await user.click(screen.getByRole('button', { name: 'Next' }))
    await user.click(screen.getByRole('button', { name: 'Import' }))

    expect(screen.getByText('1 contact imported')).toBeInTheDocument()
    expect(screen.getByText('Your data has been imported successfully.')).toBeInTheDocument()
  })

  it('calls onClose when Done is clicked on step 4', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    const config = createTestConfig()
    render(
      <BulkImportModal
        config={config}
        onImport={vi.fn()}
        onClose={onClose}
        onImportComplete={vi.fn()}
      />
    )

    await uploadCsvAndAdvance('name,email\nAlice,alice@test.com')

    await user.click(screen.getByRole('button', { name: 'Next' }))
    await user.click(screen.getByRole('button', { name: 'Import' }))
    await user.click(screen.getByRole('button', { name: 'Done' }))

    expect(onClose).toHaveBeenCalledOnce()
  })

  it('has Download sample CSV link on step 2', async () => {
    const config = createTestConfig()
    render(<BulkImportModal config={config} onImport={vi.fn()} onClose={vi.fn()} />)

    await uploadCsvAndAdvance('name,email\nAlice,alice@test.com')

    const link = screen.getByText('Download sample CSV')
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('download', 'contact-sample.csv')
  })
})
