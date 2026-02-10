import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import FieldProperties from './FieldProperties'
import { FieldType, type DocumentField } from '../../../../types'

const signatureField: DocumentField = {
  id: 'f1',
  type: FieldType.Signature,
  recipientId: 'r1',
  page: 1,
  x: 100,
  y: 100,
  width: 200,
  height: 60,
  required: true,
  label: 'Sign Here',
  placeholder: 'Place signature',
}

const dropdownField: DocumentField = {
  id: 'f2',
  type: FieldType.Dropdown,
  recipientId: 'r1',
  page: 1,
  x: 100,
  y: 200,
  width: 200,
  height: 30,
  required: true,
  label: 'Payment Terms',
  options: ['Net 30', 'Net 60'],
}

describe('FieldProperties', () => {
  it('shows empty state when no field is selected', () => {
    render(
      <FieldProperties field={null} onUpdate={vi.fn()} onDelete={vi.fn()} />
    )
    expect(screen.getByText('Select a field to edit properties')).toBeInTheDocument()
  })

  it('shows field type as read-only', () => {
    render(
      <FieldProperties field={signatureField} onUpdate={vi.fn()} onDelete={vi.fn()} />
    )
    expect(screen.getByText('Signature')).toBeInTheDocument()
  })

  it('shows label input with current value', () => {
    render(
      <FieldProperties field={signatureField} onUpdate={vi.fn()} onDelete={vi.fn()} />
    )
    const input = screen.getByLabelText('Label')
    expect(input).toHaveValue('Sign Here')
  })

  it('calls onUpdate when label changes', async () => {
    const user = userEvent.setup()
    const onUpdate = vi.fn()

    render(
      <FieldProperties field={signatureField} onUpdate={onUpdate} onDelete={vi.fn()} />
    )

    const input = screen.getByLabelText('Label')
    await user.clear(input)
    await user.type(input, 'New Label')
    expect(onUpdate).toHaveBeenCalled()
  })

  it('calls onUpdate when required checkbox is toggled', async () => {
    const user = userEvent.setup()
    const onUpdate = vi.fn()

    render(
      <FieldProperties field={signatureField} onUpdate={onUpdate} onDelete={vi.fn()} />
    )

    const checkbox = screen.getByRole('checkbox', { name: /required/i })
    await user.click(checkbox)
    expect(onUpdate).toHaveBeenCalledWith({ required: false })
  })

  it('calls onDelete when delete button is clicked', async () => {
    const user = userEvent.setup()
    const onDelete = vi.fn()

    render(
      <FieldProperties field={signatureField} onUpdate={vi.fn()} onDelete={onDelete} />
    )

    await user.click(screen.getByText('Delete Field'))
    expect(onDelete).toHaveBeenCalled()
  })

  it('shows dropdown options for dropdown type', () => {
    render(
      <FieldProperties field={dropdownField} onUpdate={vi.fn()} onDelete={vi.fn()} />
    )
    expect(screen.getByDisplayValue('Net 30')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Net 60')).toBeInTheDocument()
    expect(screen.getByText('Add Option')).toBeInTheDocument()
  })

  it('adds a new option for dropdown type', async () => {
    const user = userEvent.setup()
    const onUpdate = vi.fn()

    render(
      <FieldProperties field={dropdownField} onUpdate={onUpdate} onDelete={vi.fn()} />
    )

    await user.click(screen.getByText('Add Option'))
    expect(onUpdate).toHaveBeenCalledWith({
      options: ['Net 30', 'Net 60', 'Option 3'],
    })
  })

  it('removes an option for dropdown type', async () => {
    const user = userEvent.setup()
    const onUpdate = vi.fn()

    render(
      <FieldProperties field={dropdownField} onUpdate={onUpdate} onDelete={vi.fn()} />
    )

    const removeButtons = screen.getAllByRole('button', { name: /Remove option/ })
    await user.click(removeButtons[0]!)
    expect(onUpdate).toHaveBeenCalledWith({ options: ['Net 60'] })
  })
})
