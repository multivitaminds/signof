import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TemplateBuilder from './TemplateBuilder'

describe('TemplateBuilder', () => {
  it('renders form fields', () => {
    render(<TemplateBuilder onSave={vi.fn()} onCancel={vi.fn()} />)

    expect(screen.getByLabelText('Template Name')).toBeInTheDocument()
    expect(screen.getByLabelText('Description')).toBeInTheDocument()
    expect(screen.getByLabelText('Document Name')).toBeInTheDocument()
  })

  it('renders with initial template values', () => {
    render(
      <TemplateBuilder
        template={{
          id: 't1',
          name: 'Test Template',
          description: 'A description',
          documentName: 'Test Doc',
          fields: [],
          recipientRoles: [{ id: 'r1', label: 'Signer', order: 1 }],
          createdAt: '2026-01-01T00:00:00Z',
          updatedAt: '2026-01-01T00:00:00Z',
        }}
        onSave={vi.fn()}
        onCancel={vi.fn()}
      />
    )

    expect(screen.getByLabelText('Template Name')).toHaveValue('Test Template')
    expect(screen.getByLabelText('Description')).toHaveValue('A description')
    expect(screen.getByLabelText('Document Name')).toHaveValue('Test Doc')
  })

  it('calls onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup()
    const onCancel = vi.fn()

    render(<TemplateBuilder onSave={vi.fn()} onCancel={onCancel} />)

    await user.click(screen.getByText('Cancel'))
    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it('calls onSave with template data when save is clicked', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn()

    render(<TemplateBuilder onSave={onSave} onCancel={vi.fn()} />)

    await user.type(screen.getByLabelText('Template Name'), 'My Template')
    await user.click(screen.getByText('Save Template'))

    expect(onSave).toHaveBeenCalledTimes(1)
    const savedTemplate = onSave.mock.calls[0]![0]
    expect(savedTemplate.name).toBe('My Template')
    expect(savedTemplate.recipientRoles).toHaveLength(1)
  })

  it('renders recipient roles section', () => {
    render(<TemplateBuilder onSave={vi.fn()} onCancel={vi.fn()} />)

    expect(screen.getByText('Recipient Roles')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Signer 1')).toBeInTheDocument()
    expect(screen.getByText('Add Role')).toBeInTheDocument()
  })

  it('adds a new role when Add Role is clicked', async () => {
    const user = userEvent.setup()

    render(<TemplateBuilder onSave={vi.fn()} onCancel={vi.fn()} />)

    await user.click(screen.getByText('Add Role'))
    expect(screen.getByDisplayValue('Signer 2')).toBeInTheDocument()
  })

  it('renders field palette and properties panel', () => {
    render(<TemplateBuilder onSave={vi.fn()} onCancel={vi.fn()} />)

    expect(screen.getByText('Fields')).toBeInTheDocument()
    expect(screen.getByText('Select a field to edit properties')).toBeInTheDocument()
  })
})
