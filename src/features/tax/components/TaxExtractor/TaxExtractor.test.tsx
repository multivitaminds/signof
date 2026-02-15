import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TaxExtractor from './TaxExtractor'
import type { TaxDocument } from '../../types'

const baseMockDoc: TaxDocument = {
  id: 'doc-1',
  name: 'Test W-2',
  type: 'w2',
  taxYear: '2025',
  uploadedAt: '2026-01-15T10:00:00Z',
  extractionStatus: 'pending',
  extractedData: [],
}

describe('TaxExtractor', () => {
  const defaultProps = {
    document: baseMockDoc,
    onExtract: vi.fn(),
    onSave: vi.fn(),
  }

  beforeEach(() => {
    defaultProps.onExtract.mockClear()
    defaultProps.onSave.mockClear()
  })

  it('renders document name and type', () => {
    render(<TaxExtractor {...defaultProps} />)
    expect(screen.getByText('Test W-2')).toBeInTheDocument()
    expect(screen.getByText('W-2')).toBeInTheDocument()
  })

  it('shows Not Extracted status for pending', () => {
    render(<TaxExtractor {...defaultProps} />)
    expect(screen.getByText('Not Extracted')).toBeInTheDocument()
  })

  it('shows Extract Data button for pending status', () => {
    render(<TaxExtractor {...defaultProps} />)
    expect(screen.getByText('Extract Data')).toBeInTheDocument()
  })

  it('calls onExtract when clicking Extract Data', async () => {
    const user = userEvent.setup()
    render(<TaxExtractor {...defaultProps} />)
    await user.click(screen.getByText('Extract Data'))
    expect(defaultProps.onExtract).toHaveBeenCalledWith('doc-1')
  })

  it('shows Extracting... status', () => {
    const doc = { ...baseMockDoc, extractionStatus: 'extracting' as const }
    render(<TaxExtractor {...defaultProps} document={doc} />)
    expect(screen.getByText('Extracting...')).toBeInTheDocument()
    expect(screen.getByText('Analyzing document format...')).toBeInTheDocument()
  })

  it('shows Extracted status with data table for completed', () => {
    const doc: TaxDocument = {
      ...baseMockDoc,
      extractionStatus: 'completed',
      extractedData: [
        { key: 'Wages', value: '85000' },
        { key: 'Tax Withheld', value: '14500' },
      ],
    }
    render(<TaxExtractor {...defaultProps} document={doc} />)
    expect(screen.getByText('Extracted')).toBeInTheDocument()
    expect(screen.getByRole('grid')).toBeInTheDocument()
  })

  it('shows Failed status with Extract Data button', () => {
    const doc = { ...baseMockDoc, extractionStatus: 'failed' as const }
    render(<TaxExtractor {...defaultProps} document={doc} />)
    expect(screen.getByText('Failed')).toBeInTheDocument()
    expect(screen.getByText('Extract Data')).toBeInTheDocument()
  })

  it('shows Save button after editing a field', async () => {
    const user = userEvent.setup()
    const doc: TaxDocument = {
      ...baseMockDoc,
      extractionStatus: 'completed',
      extractedData: [
        { key: 'Wages', value: '85000' },
      ],
    }
    render(<TaxExtractor {...defaultProps} document={doc} />)
    const valueInput = screen.getByLabelText('Field value for Wages')
    await user.clear(valueInput)
    await user.type(valueInput, '90000')
    expect(screen.getByText('Save Changes')).toBeInTheDocument()
  })

  it('calls onSave with edited data', async () => {
    const user = userEvent.setup()
    const doc: TaxDocument = {
      ...baseMockDoc,
      extractionStatus: 'completed',
      extractedData: [
        { key: 'Wages', value: '85000' },
      ],
    }
    render(<TaxExtractor {...defaultProps} document={doc} />)
    const valueInput = screen.getByLabelText('Field value for Wages')
    await user.clear(valueInput)
    await user.type(valueInput, '90000')
    await user.click(screen.getByText('Save Changes'))
    expect(defaultProps.onSave).toHaveBeenCalledWith('doc-1', [{ key: 'Wages', value: '90000' }])
  })
})
