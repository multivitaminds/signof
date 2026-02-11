import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import FieldChecklist from './FieldChecklist'
import { FieldType } from '../../../../types'
import type { DocumentField } from '../../../../types'

const makeField = (overrides?: Partial<DocumentField>): DocumentField => ({
  id: 'f1',
  type: FieldType.Signature,
  recipientId: 's1',
  page: 1,
  x: 100,
  y: 200,
  width: 200,
  height: 60,
  required: true,
  label: 'Signature',
  ...overrides,
})

const defaultFields: DocumentField[] = [
  makeField({ id: 'f1', type: FieldType.Signature, label: 'Signature', required: true }),
  makeField({ id: 'f2', type: FieldType.DateSigned, label: 'Date Signed', required: false }),
  makeField({ id: 'f3', type: FieldType.Text, label: 'Full Name', required: true }),
  makeField({ id: 'f4', type: FieldType.Checkbox, label: 'I Agree', required: false }),
]

describe('FieldChecklist', () => {
  it('renders all fields with correct labels', () => {
    render(
      <FieldChecklist
        fields={defaultFields}
        currentFieldIndex={0}
        fieldValues={{}}
        onFieldSelect={vi.fn()}
      />
    )

    expect(screen.getByText('Signature')).toBeInTheDocument()
    expect(screen.getByText('Date Signed')).toBeInTheDocument()
    expect(screen.getByText('Full Name')).toBeInTheDocument()
    expect(screen.getByText('I Agree')).toBeInTheDocument()
  })

  it('shows "Required" badge on required fields', () => {
    render(
      <FieldChecklist
        fields={defaultFields}
        currentFieldIndex={0}
        fieldValues={{}}
        onFieldSelect={vi.fn()}
      />
    )

    const requiredBadges = screen.getAllByText('Required')
    // fields f1 (Signature) and f3 (Full Name) are required
    expect(requiredBadges).toHaveLength(2)
  })

  it('active field has active class', () => {
    const { container } = render(
      <FieldChecklist
        fields={defaultFields}
        currentFieldIndex={1}
        fieldValues={{}}
        onFieldSelect={vi.fn()}
      />
    )

    const items = container.querySelectorAll('.field-checklist__item')
    expect(items[1]).toHaveClass('field-checklist__item--active')
    expect(items[0]).not.toHaveClass('field-checklist__item--active')
  })

  it('completed fields show checkmark', () => {
    const { container } = render(
      <FieldChecklist
        fields={defaultFields}
        currentFieldIndex={2}
        fieldValues={{ f1: 'data:image/png;base64,test' }}
        onFieldSelect={vi.fn()}
      />
    )

    // f1 has a value and is not active (currentFieldIndex=2), so it should show a checkmark
    const checks = container.querySelectorAll('.field-checklist__check')
    // f1 (completed, not active) and f2 (DateSigned always completed, not active) = 2 checks
    expect(checks.length).toBe(2)
  })

  it('clicking a field calls onFieldSelect with correct index', async () => {
    const user = userEvent.setup()
    const onFieldSelect = vi.fn()

    render(
      <FieldChecklist
        fields={defaultFields}
        currentFieldIndex={0}
        fieldValues={{}}
        onFieldSelect={onFieldSelect}
      />
    )

    await user.click(screen.getByText('Full Name'))
    expect(onFieldSelect).toHaveBeenCalledWith(2)
  })

  it('DateSigned fields show as completed', () => {
    const { container } = render(
      <FieldChecklist
        fields={defaultFields}
        currentFieldIndex={0}
        fieldValues={{}}
        onFieldSelect={vi.fn()}
      />
    )

    // DateSigned is field index 1, not active (currentFieldIndex=0)
    // It should have completed class since DateSigned is always completed
    const items = container.querySelectorAll('.field-checklist__item')
    expect(items[1]).toHaveClass('field-checklist__item--completed')
  })

  it('uses getFieldLabel fallback when field has no label', () => {
    const fieldsWithNoLabel: DocumentField[] = [
      makeField({ id: 'f1', type: FieldType.Dropdown, label: undefined }),
    ]

    render(
      <FieldChecklist
        fields={fieldsWithNoLabel}
        currentFieldIndex={0}
        fieldValues={{}}
        onFieldSelect={vi.fn()}
      />
    )

    expect(screen.getByText('Dropdown')).toBeInTheDocument()
  })

  it('shows completion count in header', () => {
    render(
      <FieldChecklist
        fields={defaultFields}
        currentFieldIndex={0}
        fieldValues={{ f1: 'some-value', f3: 'Jane Doe' }}
        onFieldSelect={vi.fn()}
      />
    )

    // f1 completed, f2 (DateSigned) always completed, f3 completed = 3/4
    expect(screen.getByText('3/4')).toBeInTheDocument()
  })

  it('supports keyboard navigation with Enter key', async () => {
    const user = userEvent.setup()
    const onFieldSelect = vi.fn()

    render(
      <FieldChecklist
        fields={defaultFields}
        currentFieldIndex={0}
        fieldValues={{}}
        onFieldSelect={onFieldSelect}
      />
    )

    // Tab to the third item and press Enter
    const items = screen.getAllByRole('button')
    const thirdItem = items[2]
    if (!thirdItem) throw new Error('Expected at least 3 items')
    thirdItem.focus()
    await user.keyboard('{Enter}')

    expect(onFieldSelect).toHaveBeenCalledWith(2)
  })

  it('has navigation aria-label', () => {
    render(
      <FieldChecklist
        fields={defaultFields}
        currentFieldIndex={0}
        fieldValues={{}}
        onFieldSelect={vi.fn()}
      />
    )

    expect(screen.getByRole('navigation', { name: 'Field checklist' })).toBeInTheDocument()
  })

  it('active field shows number indicator instead of checkmark even when completed', () => {
    const { container } = render(
      <FieldChecklist
        fields={defaultFields}
        currentFieldIndex={1}
        fieldValues={{ f1: 'some-value' }}
        onFieldSelect={vi.fn()}
      />
    )

    // Field index 1 is DateSigned which is always completed, but it's active
    // So it should show a number, not a checkmark
    const activeItem = container.querySelector('.field-checklist__item--active')
    expect(activeItem).toBeInTheDocument()
    const numberInActive = activeItem?.querySelector('.field-checklist__number')
    expect(numberInActive).toBeInTheDocument()
    expect(numberInActive).toHaveTextContent('2')
  })
})
