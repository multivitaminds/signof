import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TemplateCard from './TemplateCard'
import { FieldType, type Template } from '../../../../types'

const mockTemplate: Template = {
  id: 'tmpl-1',
  name: 'Employment Agreement',
  description: 'Standard employment agreement template.',
  documentName: 'Employment Agreement',
  fields: [
    {
      id: 'f1',
      type: FieldType.Signature,
      recipientId: 'r1',
      page: 1,
      x: 100,
      y: 700,
      width: 200,
      height: 60,
      required: true,
    },
    {
      id: 'f2',
      type: FieldType.DateSigned,
      recipientId: 'r1',
      page: 1,
      x: 350,
      y: 710,
      width: 150,
      height: 30,
      required: true,
    },
  ],
  recipientRoles: [
    { id: 'r1', label: 'Employee', order: 1 },
    { id: 'r2', label: 'Employer', order: 2 },
  ],
  createdAt: '2026-01-15T10:00:00Z',
  updatedAt: '2026-01-15T10:00:00Z',
}

describe('TemplateCard', () => {
  it('renders template name and description', () => {
    render(<TemplateCard template={mockTemplate} onClick={vi.fn()} />)

    expect(screen.getByText('Employment Agreement')).toBeInTheDocument()
    expect(screen.getByText('Standard employment agreement template.')).toBeInTheDocument()
  })

  it('renders field count and role count', () => {
    render(<TemplateCard template={mockTemplate} onClick={vi.fn()} />)

    expect(screen.getByText('2 fields')).toBeInTheDocument()
    expect(screen.getByText('2 roles')).toBeInTheDocument()
  })

  it('calls onClick when card is clicked', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()

    render(<TemplateCard template={mockTemplate} onClick={onClick} />)

    await user.click(screen.getByRole('button', { name: /Template: Employment Agreement/ }))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('calls onDuplicate when duplicate button is clicked', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    const onDuplicate = vi.fn()

    render(
      <TemplateCard
        template={mockTemplate}
        onClick={onClick}
        onDuplicate={onDuplicate}
      />
    )

    await user.click(screen.getByLabelText('Duplicate Employment Agreement'))
    expect(onDuplicate).toHaveBeenCalledTimes(1)
    expect(onClick).not.toHaveBeenCalled()
  })

  it('calls onDelete when delete button is clicked', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    const onDelete = vi.fn()

    render(
      <TemplateCard
        template={mockTemplate}
        onClick={onClick}
        onDelete={onDelete}
      />
    )

    await user.click(screen.getByLabelText('Delete Employment Agreement'))
    expect(onDelete).toHaveBeenCalledTimes(1)
    expect(onClick).not.toHaveBeenCalled()
  })

  it('renders singular field/role text for 1 item', () => {
    const singleTemplate: Template = {
      ...mockTemplate,
      fields: [mockTemplate.fields[0]!],
      recipientRoles: [mockTemplate.recipientRoles[0]!],
    }
    render(<TemplateCard template={singleTemplate} onClick={vi.fn()} />)

    expect(screen.getByText('1 field')).toBeInTheDocument()
    expect(screen.getByText('1 role')).toBeInTheDocument()
  })
})
