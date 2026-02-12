import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { MemoryEntry } from '../../types'
import MemoryEntryCard from './MemoryEntryCard'

const makeEntry = (overrides: Partial<MemoryEntry> = {}): MemoryEntry => ({
  id: 'test-1',
  title: 'Test Memory Entry',
  content: 'This is the content of the memory entry for testing purposes.',
  category: 'facts',
  tags: ['react', 'testing'],
  scope: 'workspace',
  tokenCount: 250,
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T12:00:00.000Z',
  pinned: false,
  sourceType: null,
  sourceRef: null,
  lastAccessedAt: '2025-01-01T00:00:00.000Z',
  accessCount: 0,
  ...overrides,
})

describe('MemoryEntryCard', () => {
  const onEdit = vi.fn()
  const onDelete = vi.fn()
  const onToggleExpand = vi.fn()
  const onTogglePin = vi.fn()

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

  it('renders category badge', () => {
    render(<MemoryEntryCard entry={makeEntry({ category: 'decisions' })} onEdit={onEdit} onDelete={onDelete} />)
    expect(screen.getByText('decisions')).toBeInTheDocument()
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

  it('shows expand button', () => {
    render(
      <MemoryEntryCard
        entry={makeEntry({ content: 'a'.repeat(200) })}
        onEdit={onEdit}
        onDelete={onDelete}
        onToggleExpand={onToggleExpand}
      />
    )
    expect(screen.getByRole('button', { name: /expand entry/i })).toBeInTheDocument()
  })

  it('fires onToggleExpand when expand button is clicked', async () => {
    const user = userEvent.setup()
    render(
      <MemoryEntryCard
        entry={makeEntry({ content: 'a'.repeat(200) })}
        onEdit={onEdit}
        onDelete={onDelete}
        onToggleExpand={onToggleExpand}
      />
    )
    await user.click(screen.getByRole('button', { name: /expand entry/i }))
    expect(onToggleExpand).toHaveBeenCalledWith('test-1')
  })

  it('shows full content when expanded', () => {
    const longContent = 'a'.repeat(200)
    render(
      <MemoryEntryCard
        entry={makeEntry({ content: longContent })}
        expanded={true}
        onEdit={onEdit}
        onDelete={onDelete}
        onToggleExpand={onToggleExpand}
      />
    )
    // The full content (200 chars, no truncation with ...)
    expect(screen.getByText(longContent)).toBeInTheDocument()
    // Collapse button shown instead of expand
    expect(screen.getByRole('button', { name: /collapse entry/i })).toBeInTheDocument()
  })

  it('renders created date', () => {
    render(<MemoryEntryCard entry={makeEntry()} onEdit={onEdit} onDelete={onDelete} />)
    // The createdAt is formatted as a locale date string
    const dateStr = new Date('2025-01-01T00:00:00.000Z').toLocaleDateString()
    expect(screen.getByText(dateStr)).toBeInTheDocument()
  })

  // --- New tests for enhanced features ---

  it('renders pin button when onTogglePin is provided', () => {
    render(
      <MemoryEntryCard
        entry={makeEntry()}
        onEdit={onEdit}
        onDelete={onDelete}
        onTogglePin={onTogglePin}
      />
    )
    expect(screen.getByRole('button', { name: /pin entry/i })).toBeInTheDocument()
  })

  it('pin button shows active state when isPinned is true', () => {
    const { container } = render(
      <MemoryEntryCard
        entry={makeEntry()}
        isPinned={true}
        onEdit={onEdit}
        onDelete={onDelete}
        onTogglePin={onTogglePin}
      />
    )
    expect(container.querySelector('.memory-card__pin--active')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /unpin entry/i })).toBeInTheDocument()
  })

  it('clicking pin button calls onTogglePin with entry id', async () => {
    const user = userEvent.setup()
    render(
      <MemoryEntryCard
        entry={makeEntry()}
        onEdit={onEdit}
        onDelete={onDelete}
        onTogglePin={onTogglePin}
      />
    )
    await user.click(screen.getByRole('button', { name: /pin entry/i }))
    expect(onTogglePin).toHaveBeenCalledWith('test-1')
  })

  it('shows category-colored left border', () => {
    const { container } = render(
      <MemoryEntryCard
        entry={makeEntry({ category: 'decisions' })}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    )
    const card = container.querySelector('.memory-card')
    expect(card).toHaveStyle({ borderLeft: '3px solid #6366F1' })
  })

  it('shows source badge when sourceType is present', () => {
    render(
      <MemoryEntryCard
        entry={makeEntry({ sourceType: 'manual' })}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    )
    expect(screen.getByText('Manual')).toBeInTheDocument()
  })

  it('shows source badge as Auto-captured for auto source types', () => {
    render(
      <MemoryEntryCard
        entry={makeEntry({ sourceType: 'auto-document' })}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    )
    // There is an Auto-captured badge from the auto-badge and the source badge
    const badges = screen.getAllByText('Auto-captured')
    expect(badges.length).toBeGreaterThan(0)
  })

  it('shows source badge as Template for template source type', () => {
    render(
      <MemoryEntryCard
        entry={makeEntry({ sourceType: 'template' })}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    )
    expect(screen.getByText('Template')).toBeInTheDocument()
  })

  it('shows "Accessed N times" when accessCount > 0', () => {
    render(
      <MemoryEntryCard
        entry={makeEntry({ accessCount: 5 })}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    )
    expect(screen.getByText('Accessed 5 times')).toBeInTheDocument()
  })

  it('does not show access count when accessCount is 0', () => {
    render(
      <MemoryEntryCard
        entry={makeEntry({ accessCount: 0 })}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    )
    expect(screen.queryByText(/Accessed/)).not.toBeInTheDocument()
  })
})
