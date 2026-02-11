import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import RowColorSettings from './RowColorSettings'
import type { DbField, RowColorRule } from '../../types'
import { DbFieldType, RowColorOperator, ROW_COLOR_PALETTE } from '../../types'

const fields: DbField[] = [
  { id: 'f-title', name: 'Title', type: DbFieldType.Text, width: 200 },
  { id: 'f-amount', name: 'Amount', type: DbFieldType.Number, width: 120 },
  {
    id: 'f-status',
    name: 'Status',
    type: DbFieldType.Select,
    width: 140,
    options: {
      choices: [
        { id: 's1', name: 'Active', color: '#22C55E' },
        { id: 's2', name: 'Inactive', color: '#94A3B8' },
      ],
    },
  },
]

const defaultProps = () => ({
  fields,
  rules: [] as RowColorRule[],
  onRulesChange: vi.fn(),
  onClose: vi.fn(),
})

describe('RowColorSettings', () => {
  it('renders the dialog', () => {
    render(<RowColorSettings {...defaultProps()} />)
    expect(screen.getByRole('dialog', { name: 'Row Color Settings' })).toBeInTheDocument()
  })

  it('displays the title', () => {
    render(<RowColorSettings {...defaultProps()} />)
    expect(screen.getByText('Row Color Rules')).toBeInTheDocument()
  })

  it('shows empty state when no rules exist', () => {
    render(<RowColorSettings {...defaultProps()} />)
    expect(screen.getByText('No color rules yet.')).toBeInTheDocument()
    expect(screen.getByText(/Add rules to highlight/)).toBeInTheDocument()
  })

  it('shows Add Rule button', () => {
    render(<RowColorSettings {...defaultProps()} />)
    expect(screen.getByText('Add Rule')).toBeInTheDocument()
  })

  it('calls onRulesChange with a new rule when Add Rule is clicked', async () => {
    const user = userEvent.setup()
    const onRulesChange = vi.fn()
    render(<RowColorSettings {...defaultProps()} onRulesChange={onRulesChange} />)
    await user.click(screen.getByText('Add Rule'))
    expect(onRulesChange).toHaveBeenCalledTimes(1)
    const newRules = onRulesChange.mock.calls[0]![0] as RowColorRule[]
    expect(newRules.length).toBe(1)
    expect(newRules[0]!.fieldId).toBe('f-title')
    expect(newRules[0]!.operator).toBe(RowColorOperator.Equals)
    expect(newRules[0]!.color).toBe(ROW_COLOR_PALETTE[0])
  })

  it('renders existing rules with field, operator, and value', () => {
    const rules: RowColorRule[] = [
      {
        id: 'rule-1',
        fieldId: 'f-status',
        operator: RowColorOperator.Equals,
        value: 'Active',
        color: '#FEE2E2',
      },
    ]
    render(<RowColorSettings {...defaultProps()} rules={rules} />)
    // Should show the rule fields
    const fieldSelect = screen.getByLabelText('Field') as HTMLSelectElement
    expect(fieldSelect.value).toBe('f-status')
    const operatorSelect = screen.getByLabelText('Operator') as HTMLSelectElement
    expect(operatorSelect.value).toBe('equals')
    const valueInput = screen.getByLabelText('Value') as HTMLInputElement
    expect(valueInput.value).toBe('Active')
  })

  it('hides value input for "is empty" operator', () => {
    const rules: RowColorRule[] = [
      {
        id: 'rule-1',
        fieldId: 'f-title',
        operator: RowColorOperator.IsEmpty,
        value: '',
        color: '#FEE2E2',
      },
    ]
    render(<RowColorSettings {...defaultProps()} rules={rules} />)
    expect(screen.queryByLabelText('Value')).not.toBeInTheDocument()
  })

  it('hides value input for "is not empty" operator', () => {
    const rules: RowColorRule[] = [
      {
        id: 'rule-1',
        fieldId: 'f-title',
        operator: RowColorOperator.IsNotEmpty,
        value: '',
        color: '#FEE2E2',
      },
    ]
    render(<RowColorSettings {...defaultProps()} rules={rules} />)
    expect(screen.queryByLabelText('Value')).not.toBeInTheDocument()
  })

  it('calls onRulesChange when field is changed', async () => {
    const user = userEvent.setup()
    const onRulesChange = vi.fn()
    const rules: RowColorRule[] = [
      { id: 'rule-1', fieldId: 'f-title', operator: RowColorOperator.Equals, value: 'test', color: '#FEE2E2' },
    ]
    render(<RowColorSettings {...defaultProps()} rules={rules} onRulesChange={onRulesChange} />)
    const fieldSelect = screen.getByLabelText('Field')
    await user.selectOptions(fieldSelect, 'f-amount')
    expect(onRulesChange).toHaveBeenCalledTimes(1)
    const updated = onRulesChange.mock.calls[0]![0] as RowColorRule[]
    expect(updated[0]!.fieldId).toBe('f-amount')
  })

  it('calls onRulesChange when operator is changed', async () => {
    const user = userEvent.setup()
    const onRulesChange = vi.fn()
    const rules: RowColorRule[] = [
      { id: 'rule-1', fieldId: 'f-title', operator: RowColorOperator.Equals, value: 'test', color: '#FEE2E2' },
    ]
    render(<RowColorSettings {...defaultProps()} rules={rules} onRulesChange={onRulesChange} />)
    const operatorSelect = screen.getByLabelText('Operator')
    await user.selectOptions(operatorSelect, 'contains')
    expect(onRulesChange).toHaveBeenCalledTimes(1)
    const updated = onRulesChange.mock.calls[0]![0] as RowColorRule[]
    expect(updated[0]!.operator).toBe(RowColorOperator.Contains)
  })

  it('calls onRulesChange when delete button is clicked', async () => {
    const user = userEvent.setup()
    const onRulesChange = vi.fn()
    const rules: RowColorRule[] = [
      { id: 'rule-1', fieldId: 'f-title', operator: RowColorOperator.Equals, value: 'test', color: '#FEE2E2' },
    ]
    render(<RowColorSettings {...defaultProps()} rules={rules} onRulesChange={onRulesChange} />)
    await user.click(screen.getByLabelText('Delete rule'))
    expect(onRulesChange).toHaveBeenCalledWith([])
  })

  it('opens color picker when color preview is clicked', async () => {
    const user = userEvent.setup()
    const rules: RowColorRule[] = [
      { id: 'rule-1', fieldId: 'f-title', operator: RowColorOperator.Equals, value: 'test', color: '#FEE2E2' },
    ]
    render(<RowColorSettings {...defaultProps()} rules={rules} />)
    await user.click(screen.getByLabelText('Pick color'))
    // Palette should be visible with all colors
    const swatches = document.querySelectorAll('.row-color-settings__color-swatch')
    expect(swatches.length).toBe(ROW_COLOR_PALETTE.length)
  })

  it('updates color when a swatch is clicked', async () => {
    const user = userEvent.setup()
    const onRulesChange = vi.fn()
    const rules: RowColorRule[] = [
      { id: 'rule-1', fieldId: 'f-title', operator: RowColorOperator.Equals, value: 'test', color: '#FEE2E2' },
    ]
    render(<RowColorSettings {...defaultProps()} rules={rules} onRulesChange={onRulesChange} />)
    await user.click(screen.getByLabelText('Pick color'))
    const targetColor = ROW_COLOR_PALETTE[3]!
    await user.click(screen.getByLabelText(`Color ${targetColor}`))
    expect(onRulesChange).toHaveBeenCalledTimes(1)
    const updated = onRulesChange.mock.calls[0]![0] as RowColorRule[]
    expect(updated[0]!.color).toBe(targetColor)
  })

  it('calls onClose when close button is clicked', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(<RowColorSettings {...defaultProps()} onClose={onClose} />)
    await user.click(screen.getByLabelText('Close'))
    expect(onClose).toHaveBeenCalled()
  })

  it('calls onClose when clicking overlay', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(<RowColorSettings {...defaultProps()} onClose={onClose} />)
    const overlay = document.querySelector('.modal-overlay')!
    await user.click(overlay)
    expect(onClose).toHaveBeenCalled()
  })

  it('renders "When" label for each rule', () => {
    const rules: RowColorRule[] = [
      { id: 'rule-1', fieldId: 'f-title', operator: RowColorOperator.Equals, value: 'test', color: '#FEE2E2' },
      { id: 'rule-2', fieldId: 'f-amount', operator: RowColorOperator.Gt, value: '100', color: '#DBEAFE' },
    ]
    render(<RowColorSettings {...defaultProps()} rules={rules} />)
    const labels = screen.getAllByText('When')
    expect(labels.length).toBe(2)
  })

  it('renders all field options in field select', () => {
    const rules: RowColorRule[] = [
      { id: 'rule-1', fieldId: 'f-title', operator: RowColorOperator.Equals, value: '', color: '#FEE2E2' },
    ]
    render(<RowColorSettings {...defaultProps()} rules={rules} />)
    const fieldSelect = screen.getByLabelText('Field')
    const options = fieldSelect.querySelectorAll('option')
    expect(options.length).toBe(3) // Title, Amount, Status
  })
})
