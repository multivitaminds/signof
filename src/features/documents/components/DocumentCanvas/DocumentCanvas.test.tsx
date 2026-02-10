import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import DocumentCanvas from './DocumentCanvas'
import { FieldType, type DocumentField } from '../../../../types'

const mockFields: DocumentField[] = [
  {
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
  },
  {
    id: 'f2',
    type: FieldType.Text,
    recipientId: 'r2',
    page: 1,
    x: 100,
    y: 200,
    width: 200,
    height: 30,
    required: true,
    label: 'Full Name',
  },
]

const recipientColors: Record<string, string> = {
  r1: '#4F46E5',
  r2: '#059669',
}

describe('DocumentCanvas', () => {
  it('renders all fields', () => {
    render(
      <DocumentCanvas
        fields={mockFields}
        selectedFieldId={null}
        onFieldSelect={vi.fn()}
        onFieldMove={vi.fn()}
        onFieldDrop={vi.fn()}
        recipientColors={recipientColors}
      />
    )

    expect(screen.getByText('Sign Here')).toBeInTheDocument()
    expect(screen.getByText('Full Name')).toBeInTheDocument()
  })

  it('renders the canvas region', () => {
    render(
      <DocumentCanvas
        fields={[]}
        selectedFieldId={null}
        onFieldSelect={vi.fn()}
        onFieldMove={vi.fn()}
        onFieldDrop={vi.fn()}
        recipientColors={{}}
      />
    )

    expect(screen.getByRole('region', { name: 'Document canvas' })).toBeInTheDocument()
  })

  it('calls onFieldSelect when a field is clicked', async () => {
    const user = userEvent.setup()
    const onFieldSelect = vi.fn()

    render(
      <DocumentCanvas
        fields={mockFields}
        selectedFieldId={null}
        onFieldSelect={onFieldSelect}
        onFieldMove={vi.fn()}
        onFieldDrop={vi.fn()}
        recipientColors={recipientColors}
      />
    )

    await user.click(screen.getByRole('button', { name: /Sign Here/ }))
    expect(onFieldSelect).toHaveBeenCalledWith('f1')
  })

  it('applies selected class to the selected field', () => {
    render(
      <DocumentCanvas
        fields={mockFields}
        selectedFieldId="f1"
        onFieldSelect={vi.fn()}
        onFieldMove={vi.fn()}
        onFieldDrop={vi.fn()}
        recipientColors={recipientColors}
      />
    )

    const signField = screen.getByRole('button', { name: /Sign Here/ })
    expect(signField.className).toContain('document-canvas__field--selected')
  })

  it('calls onFieldHover on mouse enter and leave', async () => {
    const user = userEvent.setup()
    const onFieldHover = vi.fn()

    render(
      <DocumentCanvas
        fields={mockFields}
        selectedFieldId={null}
        onFieldSelect={vi.fn()}
        onFieldMove={vi.fn()}
        onFieldDrop={vi.fn()}
        onFieldHover={onFieldHover}
        recipientColors={recipientColors}
      />
    )

    const field = screen.getByRole('button', { name: /Sign Here/ })
    await user.hover(field)
    expect(onFieldHover).toHaveBeenCalledWith('f1')

    await user.unhover(field)
    expect(onFieldHover).toHaveBeenCalledWith(null)
  })
})
