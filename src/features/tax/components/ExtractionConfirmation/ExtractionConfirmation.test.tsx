import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ExtractionConfirmation from './ExtractionConfirmation'
import { ExtractionConfidence, TaxFormType } from '../../types'
import type { ExtractionResult, ExtractionField } from '../../types'

describe('ExtractionConfirmation', () => {
  const fields: ExtractionField[] = [
    { key: 'Employee Name', value: 'John Doe', confidence: ExtractionConfidence.High, confirmed: false },
    { key: 'SSN', value: '***-**-1234', confidence: ExtractionConfidence.Medium, confirmed: false },
    { key: 'Wages', value: '50000', confidence: ExtractionConfidence.Low, confirmed: false },
  ]

  const result: ExtractionResult = {
    fields,
    overallConfidence: 0.85,
    formType: TaxFormType.W2,
    warnings: [],
    extractedAt: '2025-01-15T10:00:00Z',
  }

  const defaultProps = {
    result,
    onConfirm: vi.fn(),
    onEdit: vi.fn(),
    onReject: vi.fn(),
  }

  beforeEach(() => {
    defaultProps.onConfirm.mockClear()
    defaultProps.onEdit.mockClear()
    defaultProps.onReject.mockClear()
  })

  it('renders the title', () => {
    render(<ExtractionConfirmation {...defaultProps} />)
    expect(screen.getByText('Review Extracted Data')).toBeInTheDocument()
  })

  it('displays the form type badge', () => {
    render(<ExtractionConfirmation {...defaultProps} />)
    expect(screen.getByText('W-2')).toBeInTheDocument()
  })

  it('displays overall confidence percentage', () => {
    render(<ExtractionConfirmation {...defaultProps} />)
    expect(screen.getByText('85% confidence')).toBeInTheDocument()
  })

  it('renders all field names in the table', () => {
    render(<ExtractionConfirmation {...defaultProps} />)
    expect(screen.getByText('Employee Name')).toBeInTheDocument()
    expect(screen.getByText('SSN')).toBeInTheDocument()
    expect(screen.getByText('Wages')).toBeInTheDocument()
  })

  it('renders field values as editable inputs', () => {
    render(<ExtractionConfirmation {...defaultProps} />)
    expect(screen.getByLabelText('Value for Employee Name')).toHaveValue('John Doe')
    expect(screen.getByLabelText('Value for SSN')).toHaveValue('***-**-1234')
    expect(screen.getByLabelText('Value for Wages')).toHaveValue('50000')
  })

  it('displays confidence labels for each field', () => {
    render(<ExtractionConfirmation {...defaultProps} />)
    expect(screen.getByText('High')).toBeInTheDocument()
    expect(screen.getByText('Medium')).toBeInTheDocument()
    expect(screen.getByText('Low')).toBeInTheDocument()
  })

  it('calls onEdit when a field value is changed', async () => {
    const user = userEvent.setup()
    render(<ExtractionConfirmation {...defaultProps} />)
    const input = screen.getByLabelText('Value for Employee Name')
    await user.clear(input)
    await user.type(input, 'Jane Doe')
    expect(defaultProps.onEdit).toHaveBeenCalledWith(0, 'Jane Doe')
  })

  it('toggles field confirm state when confirm button is clicked', async () => {
    const user = userEvent.setup()
    render(<ExtractionConfirmation {...defaultProps} />)
    const confirmButton = screen.getByLabelText('Confirm Employee Name')
    await user.click(confirmButton)
    expect(confirmButton).toHaveClass('extraction-confirmation__check--active')
    await user.click(confirmButton)
    expect(confirmButton).not.toHaveClass('extraction-confirmation__check--active')
  })

  it('calls onConfirm with all fields marked confirmed when Confirm All is clicked', async () => {
    const user = userEvent.setup()
    render(<ExtractionConfirmation {...defaultProps} />)
    await user.click(screen.getByRole('button', { name: /confirm all/i }))
    expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1)
    const confirmedFields = defaultProps.onConfirm.mock.calls[0]![0] as ExtractionField[]
    expect(confirmedFields).toHaveLength(3)
    confirmedFields.forEach((f: ExtractionField) => {
      expect(f.confirmed).toBe(true)
    })
  })

  it('calls onReject when Re-extract button is clicked', async () => {
    const user = userEvent.setup()
    render(<ExtractionConfirmation {...defaultProps} />)
    await user.click(screen.getByRole('button', { name: /re-extract/i }))
    expect(defaultProps.onReject).toHaveBeenCalledTimes(1)
  })

  it('renders warnings when present', () => {
    const resultWithWarnings: ExtractionResult = {
      ...result,
      warnings: ['SSN may be incorrect', 'Missing employer EIN'],
    }
    render(
      <ExtractionConfirmation {...defaultProps} result={resultWithWarnings} />
    )
    expect(screen.getByText('SSN may be incorrect')).toBeInTheDocument()
    expect(screen.getByText('Missing employer EIN')).toBeInTheDocument()
  })

  it('does not render warnings section when no warnings', () => {
    render(<ExtractionConfirmation {...defaultProps} />)
    expect(screen.queryByText('SSN may be incorrect')).not.toBeInTheDocument()
  })

  it('renders a grid table with role="grid"', () => {
    render(<ExtractionConfirmation {...defaultProps} />)
    expect(screen.getByRole('grid')).toBeInTheDocument()
  })

  it('rounds confidence percentage correctly', () => {
    const resultLowConf: ExtractionResult = {
      ...result,
      overallConfidence: 0.6789,
    }
    render(<ExtractionConfirmation {...defaultProps} result={resultLowConf} />)
    expect(screen.getByText('68% confidence')).toBeInTheDocument()
  })
})
