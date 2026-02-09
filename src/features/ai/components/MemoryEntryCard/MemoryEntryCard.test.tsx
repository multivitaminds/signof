import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { MemoryEntry } from '../../types'
import MemoryEntryCard from './MemoryEntryCard'

const makeEntry = (overrides: Partial<MemoryEntry> = {}): MemoryEntry => ({
  id: 'test-1',
  title: 'Test Memory Entry',
  content: 'This is the content of the memory entry for testing purposes.',
  tags: ['react', 'testing'],
  scope: 'workspace',
  tokenCount: 250,
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T12:00:00.000Z',
  ...overrides,
})

describe('MemoryEntryCard', () => {
  const onEdit = vi.fn()
  const onDelete = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the title', () => {
    render(<MemoryEntryCard entry={makeEntry()} onEdit={onEdit} onDelete={onDelete} />)
    expect(screen.getByText('Test Memory Entry')).toBeInTheDocument()
  })

  it('renders content preview', () => {
    render(<MemoryEntryCard entry={makeEntry()} onEdit={onEdit} onDelete={onDelete} />)
    expect(screen.getByText(/This is the content/)).toBeInTheDocument()
  })

  it('truncates long content at 150 chars', () => {
    const longContent = 'a'.repeat(200)
    render(<MemoryEntryCard entry={makeEntry({ content: longContent })} onEdit={onEdit} onDelete={onDelete} />)
    expect(screen.getByText(/\.\.\.$/)).toBeInTheDocument()
  })

  it('renders tags as badges', () => {
    render(<MemoryEntryCard entry={makeEntry()} onEdit={onEdit} onDelete={onDelete} />)
    expect(screen.getByText('react')).toBeInTheDocument()
    expect(screen.getByText('testing')).toBeInTheDocument()
  })

  it('renders scope badge', () => {
    render(<MemoryEntryCard entry={makeEntry({ scope: 'personal' })} onEdit={onEdit} onDelete={onDelete} />)
    expect(screen.getByText('personal')).toBeInTheDocument()
  })

  it('renders formatted token count', () => {
    render(<MemoryEntryCard entry={makeEntry({ tokenCount: 1500 })} onEdit={onEdit} onDelete={onDelete} />)
    expect(screen.getByText('1.5K tokens')).toBeInTheDocument()
  })

  it('shows edit and delete buttons', () => {
    render(<MemoryEntryCard entry={makeEntry()} onEdit={onEdit} onDelete={onDelete} />)
    expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument()
  })

  it('fires onEdit with entry id when edit is clicked', async () => {
    const user = userEvent.setup()
    render(<MemoryEntryCard entry={makeEntry()} onEdit={onEdit} onDelete={onDelete} />)
    await user.click(screen.getByRole('button', { name: /edit/i }))
    expect(onEdit).toHaveBeenCalledWith('test-1')
  })

  it('fires onDelete with entry id when delete is clicked', async () => {
    const user = userEvent.setup()
    render(<MemoryEntryCard entry={makeEntry()} onEdit={onEdit} onDelete={onDelete} />)
    await user.click(screen.getByRole('button', { name: /delete/i }))
    expect(onDelete).toHaveBeenCalledWith('test-1')
  })

  it('does not render tags section when tags are empty', () => {
    const { container } = render(
      <MemoryEntryCard entry={makeEntry({ tags: [] })} onEdit={onEdit} onDelete={onDelete} />
    )
    expect(container.querySelector('.memory-card__tags')).not.toBeInTheDocument()
  })
})
