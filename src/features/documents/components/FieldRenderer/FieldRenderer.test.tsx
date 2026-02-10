import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import FieldRenderer from './FieldRenderer'
import { FieldType } from '../../../../types'
import type { DocumentField } from '../../../../types'

function createField(overrides: Partial<DocumentField> = {}): DocumentField {
  return {
    id: 'f1',
    type: FieldType.Text,
    recipientId: 'r1',
    page: 1,
    x: 0,
    y: 0,
    width: 200,
    height: 30,
    required: true,
    label: 'Test Field',
    placeholder: 'Enter text',
    ...overrides,
  }
}

describe('FieldRenderer', () => {
  it('renders a text field with placeholder', () => {
    render(
      <FieldRenderer
        field={createField()}
        recipientColor="#4F46E5"
        isCurrentSigner={true}
      />
    )
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument()
  })

  it('renders a signature field with sign here text', () => {
    render(
      <FieldRenderer
        field={createField({ type: FieldType.Signature, label: 'Signature' })}
        recipientColor="#4F46E5"
        isCurrentSigner={true}
      />
    )
    expect(screen.getByText('Sign here')).toBeInTheDocument()
  })

  it('renders a signature image when value is set', () => {
    render(
      <FieldRenderer
        field={createField({
          type: FieldType.Signature,
          value: 'data:image/png;base64,abc',
          label: 'Signature',
        })}
        recipientColor="#4F46E5"
        isCurrentSigner={true}
      />
    )
    expect(screen.getByAltText('Signature')).toBeInTheDocument()
  })

  it('renders an initial field', () => {
    render(
      <FieldRenderer
        field={createField({ type: FieldType.Initial, label: 'Initials' })}
        recipientColor="#4F46E5"
        isCurrentSigner={true}
      />
    )
    expect(screen.getByText('Initial')).toBeInTheDocument()
  })

  it('renders a date_signed field with current date', () => {
    render(
      <FieldRenderer
        field={createField({ type: FieldType.DateSigned, label: 'Date' })}
        recipientColor="#4F46E5"
        isCurrentSigner={true}
      />
    )
    const today = new Date().toLocaleDateString()
    expect(screen.getByText(today)).toBeInTheDocument()
  })

  it('renders a checkbox field', () => {
    render(
      <FieldRenderer
        field={createField({ type: FieldType.Checkbox, label: 'Accept' })}
        recipientColor="#4F46E5"
        isCurrentSigner={true}
      />
    )
    expect(screen.getByRole('checkbox', { name: 'Accept' })).toBeInTheDocument()
  })

  it('renders a dropdown field with options', () => {
    render(
      <FieldRenderer
        field={createField({
          type: FieldType.Dropdown,
          label: 'Terms',
          options: ['Net 30', 'Net 60'],
        })}
        recipientColor="#4F46E5"
        isCurrentSigner={true}
      />
    )
    expect(screen.getByRole('combobox', { name: 'Terms' })).toBeInTheDocument()
    expect(screen.getByText('Net 30')).toBeInTheDocument()
    expect(screen.getByText('Net 60')).toBeInTheDocument()
  })

  it('renders an attachment field', () => {
    render(
      <FieldRenderer
        field={createField({ type: FieldType.Attachment, label: 'File' })}
        recipientColor="#4F46E5"
        isCurrentSigner={true}
      />
    )
    expect(screen.getByText('Attach file')).toBeInTheDocument()
  })

  it('calls onValueChange when text input changes', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(
      <FieldRenderer
        field={createField()}
        recipientColor="#4F46E5"
        isCurrentSigner={true}
        onValueChange={onChange}
      />
    )
    await user.type(screen.getByPlaceholderText('Enter text'), 'hello')
    expect(onChange).toHaveBeenCalled()
  })

  it('applies readonly class when readOnly is true', () => {
    const { container } = render(
      <FieldRenderer
        field={createField()}
        recipientColor="#4F46E5"
        isCurrentSigner={true}
        readOnly={true}
      />
    )
    expect(container.querySelector('.field-renderer--readonly')).toBeInTheDocument()
  })

  it('applies focused class when focused is true', () => {
    const { container } = render(
      <FieldRenderer
        field={createField()}
        recipientColor="#4F46E5"
        isCurrentSigner={true}
        focused={true}
      />
    )
    expect(container.querySelector('.field-renderer--focused')).toBeInTheDocument()
  })

  it('applies completed class when field has a value', () => {
    const { container } = render(
      <FieldRenderer
        field={createField({ value: 'filled' })}
        recipientColor="#4F46E5"
        isCurrentSigner={true}
      />
    )
    expect(container.querySelector('.field-renderer--completed')).toBeInTheDocument()
  })

  it('disables interaction when not current signer', () => {
    render(
      <FieldRenderer
        field={createField()}
        recipientColor="#4F46E5"
        isCurrentSigner={false}
      />
    )
    expect(screen.getByRole('textbox')).toHaveAttribute('readonly')
  })

  it('renders field label', () => {
    render(
      <FieldRenderer
        field={createField({ label: 'My Label' })}
        recipientColor="#4F46E5"
        isCurrentSigner={true}
      />
    )
    expect(screen.getByText('My Label')).toBeInTheDocument()
  })
})
