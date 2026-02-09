import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { MemoryEntry } from '../../types'
import MemoryEntryModal from './MemoryEntryModal'

const makeEntry = (): MemoryEntry => ({
  id: 'edit-1',
  title: 'Existing Entry',
  content: 'Existing content for editing.',
  tags: ['tag1', 'tag2'],
  scope: 'personal',
  tokenCount: 7,
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
})

describe('MemoryEntryModal', () => {
  const onSave = vi.fn()
  const onCancel = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders in add mode with empty fields', () => {
    render(<MemoryEntryModal onSave={onSave} onCancel={onCancel} />)
    expect(screen.getByRole('heading', { name: 'Add Entry' })).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Memory entry title')).toHaveValue('')
    expect(screen.getByPlaceholderText(/Enter the content/)).toHaveValue('')
  })

  it('renders in edit mode with pre-filled fields', () => {
    const entry = makeEntry()
    render(<MemoryEntryModal entry={entry} onSave={onSave} onCancel={onCancel} />)
    expect(screen.getByText('Edit Entry')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Existing Entry')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Existing content for editing.')).toBeInTheDocument()
    expect(screen.getByText('tag1')).toBeInTheDocument()
    expect(screen.getByText('tag2')).toBeInTheDocument()
  })

  it('shows scope radio buttons with correct default for add mode', () => {
    render(<MemoryEntryModal onSave={onSave} onCancel={onCancel} />)
    const workspaceRadio = screen.getByRole('radio', { name: 'Workspace' })
    expect(workspaceRadio).toBeChecked()
  })

  it('shows scope radio buttons with correct value for edit mode', () => {
    render(<MemoryEntryModal entry={makeEntry()} onSave={onSave} onCancel={onCancel} />)
    const personalRadio = screen.getByRole('radio', { name: 'Personal' })
    expect(personalRadio).toBeChecked()
  })

  it('calls onSave with correct values', async () => {
    const user = userEvent.setup()
    render(<MemoryEntryModal onSave={onSave} onCancel={onCancel} />)

    await user.type(screen.getByPlaceholderText('Memory entry title'), 'My Title')
    await user.type(screen.getByPlaceholderText(/Enter the content/), 'Some content')
    await user.click(screen.getByRole('button', { name: /add entry/i }))

    expect(onSave).toHaveBeenCalledWith('My Title', 'Some content', [], 'workspace')
  })

  it('calls onCancel when cancel is clicked', async () => {
    const user = userEvent.setup()
    render(<MemoryEntryModal onSave={onSave} onCancel={onCancel} />)
    await user.click(screen.getByRole('button', { name: /cancel/i }))
    expect(onCancel).toHaveBeenCalledOnce()
  })

  it('calls onCancel when close button is clicked', async () => {
    const user = userEvent.setup()
    render(<MemoryEntryModal onSave={onSave} onCancel={onCancel} />)
    await user.click(screen.getByRole('button', { name: /close/i }))
    expect(onCancel).toHaveBeenCalledOnce()
  })

  it('disables save when title is empty', () => {
    render(<MemoryEntryModal onSave={onSave} onCancel={onCancel} />)
    const addBtn = screen.getByRole('button', { name: /add entry/i })
    expect(addBtn).toBeDisabled()
  })

  it('adds tags on Enter key', async () => {
    const user = userEvent.setup()
    render(<MemoryEntryModal onSave={onSave} onCancel={onCancel} />)

    const tagInput = screen.getByPlaceholderText(/type a tag/i)
    await user.type(tagInput, 'newtag{Enter}')

    expect(screen.getByText('newtag')).toBeInTheDocument()
  })

  it('removes tags when X is clicked', async () => {
    const user = userEvent.setup()
    render(<MemoryEntryModal entry={makeEntry()} onSave={onSave} onCancel={onCancel} />)

    const chip = screen.getByText('tag1').closest('.memory-modal__tag-chip')!
    const removeBtn = within(chip as HTMLElement).getByRole('button', { name: /remove tag tag1/i })
    await user.click(removeBtn)

    expect(screen.queryByText('tag1')).not.toBeInTheDocument()
    expect(screen.getByText('tag2')).toBeInTheDocument()
  })

  it('shows live token count for content', async () => {
    const user = userEvent.setup()
    render(<MemoryEntryModal onSave={onSave} onCancel={onCancel} />)

    await user.type(screen.getByPlaceholderText(/Enter the content/), 'a'.repeat(100))

    // 100 chars / 4 = 25 tokens
    expect(screen.getByText('25 tokens')).toBeInTheDocument()
  })

  it('changes scope when radio is selected', async () => {
    const user = userEvent.setup()
    render(<MemoryEntryModal onSave={onSave} onCancel={onCancel} />)

    await user.type(screen.getByPlaceholderText('Memory entry title'), 'Title')
    await user.type(screen.getByPlaceholderText(/Enter the content/), 'Content')
    await user.click(screen.getByRole('radio', { name: 'Team' }))
    await user.click(screen.getByRole('button', { name: /add entry/i }))

    expect(onSave).toHaveBeenCalledWith('Title', 'Content', [], 'team')
  })
})
