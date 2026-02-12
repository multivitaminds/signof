import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { MemoryEntry } from '../../types'
import { useMemoryStore } from '../../stores/useMemoryStore'

vi.mock('../../stores/useMemoryStore')

// Import component after mock
import MemoryExplorer from './MemoryExplorer'

const makeEntry = (id: string, overrides: Partial<MemoryEntry> = {}): MemoryEntry => ({
  id,
  title: `Entry ${id}`,
  content: `Content for entry ${id}`,
  category: 'facts',
  tags: ['test'],
  scope: 'workspace',
  tokenCount: 100,
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
  pinned: false,
  sourceType: null,
  sourceRef: null,
  lastAccessedAt: '2025-01-01T00:00:00.000Z',
  accessCount: 0,
  ...overrides,
})

function mockStore(overrides: Partial<ReturnType<typeof useMemoryStore>> = {}) {
  const defaults = {
    entries: [] as MemoryEntry[],
    isHydrated: true,
    searchQuery: '',
    filterScope: null,
    filterCategory: null,
    filterTags: [],
    sortOrder: 'recent' as const,
    expandedEntryId: null,
    pinnedIds: [] as string[],
    viewMode: 'grid' as const,
    activeTab: 'all' as const,
    hydrate: vi.fn(),
    setSearchQuery: vi.fn(),
    setFilterScope: vi.fn(),
    setFilterCategory: vi.fn(),
    setFilterTags: vi.fn(),
    setSortOrder: vi.fn(),
    setExpandedEntryId: vi.fn(),
    togglePin: vi.fn(),
    setViewMode: vi.fn(),
    setActiveTab: vi.fn(),
    addEntry: vi.fn(),
    updateEntry: vi.fn(),
    deleteEntry: vi.fn(),
    clearAll: vi.fn(),
    addFromTemplate: vi.fn(),
    exportEntries: vi.fn(async () => []),
    importEntries: vi.fn(),
  }
  vi.mocked(useMemoryStore).mockReturnValue({ ...defaults, ...overrides })
  return { ...defaults, ...overrides }
}

describe('MemoryExplorer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders empty state with "Your memory is empty"', () => {
    mockStore()
    render(<MemoryExplorer />)
    expect(screen.getByText('Your memory is empty')).toBeInTheDocument()
    expect(screen.getByText(/start building/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /get started/i })).toBeInTheDocument()
  })

  it('renders entry cards when entries exist', () => {
    mockStore({ entries: [makeEntry('1'), makeEntry('2')] })
    render(<MemoryExplorer />)
    expect(screen.getByText('Entry 1')).toBeInTheDocument()
    expect(screen.getByText('Entry 2')).toBeInTheDocument()
  })

  it('does NOT render UsageMeter', () => {
    mockStore({
      entries: [
        makeEntry('1', { tokenCount: 500 }),
        makeEntry('2', { tokenCount: 300 }),
      ],
    })
    render(<MemoryExplorer />)
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
  })

  it('does NOT render scope filter dropdown', () => {
    mockStore()
    render(<MemoryExplorer />)
    expect(screen.queryByRole('combobox', { name: /filter by scope/i })).not.toBeInTheDocument()
  })

  it('does NOT render category filter dropdown', () => {
    mockStore()
    render(<MemoryExplorer />)
    expect(screen.queryByRole('combobox', { name: /filter by category/i })).not.toBeInTheDocument()
  })

  it('calls setSearchQuery when typing in search', async () => {
    const user = userEvent.setup()
    const store = mockStore()
    render(<MemoryExplorer />)

    const searchInput = screen.getByPlaceholderText('Search entries...')
    await user.type(searchInput, 'hello')

    expect(store.setSearchQuery).toHaveBeenCalled()
  })

  it('shows loading state before hydration', () => {
    mockStore({ isHydrated: false })
    render(<MemoryExplorer />)
    expect(screen.getByText('Loading memory...')).toBeInTheDocument()
  })

  it('calls hydrate on mount', () => {
    const store = mockStore()
    render(<MemoryExplorer />)
    expect(store.hydrate).toHaveBeenCalled()
  })

  it('opens add modal when Add Memory button is clicked', async () => {
    const user = userEvent.setup()
    mockStore()
    render(<MemoryExplorer />)

    // Click Get Started button in empty state
    await user.click(screen.getByRole('button', { name: /get started/i }))

    // Modal should appear
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Add Entry' })).toBeInTheDocument()
  })

  it('renders sort dropdown', () => {
    mockStore()
    render(<MemoryExplorer />)
    expect(screen.getByRole('combobox', { name: /sort entries/i })).toBeInTheDocument()
  })

  it('calls setSortOrder when sort dropdown changes', async () => {
    const user = userEvent.setup()
    const store = mockStore()
    render(<MemoryExplorer />)

    const sortSelect = screen.getByRole('combobox', { name: /sort entries/i })
    await user.selectOptions(sortSelect, 'oldest')

    expect(store.setSortOrder).toHaveBeenCalledWith('oldest')
  })

  it('renders export and import buttons', () => {
    mockStore()
    render(<MemoryExplorer />)
    expect(screen.getByRole('button', { name: /export/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /import/i })).toBeInTheDocument()
  })

  it('calls deleteEntry when delete is clicked on a card', async () => {
    const user = userEvent.setup()
    const store = mockStore({ entries: [makeEntry('del1')] })
    render(<MemoryExplorer />)

    await user.click(screen.getByRole('button', { name: /delete/i }))
    expect(store.deleteEntry).toHaveBeenCalledWith('del1')
  })

  // --- New tests for enhanced features ---

  it('view toggle buttons render (Grid and List)', () => {
    mockStore()
    render(<MemoryExplorer />)
    expect(screen.getByRole('button', { name: /grid view/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /list view/i })).toBeInTheDocument()
  })

  it('clicking List view toggle calls setViewMode with list', async () => {
    const user = userEvent.setup()
    const store = mockStore()
    render(<MemoryExplorer />)

    await user.click(screen.getByRole('button', { name: /list view/i }))
    expect(store.setViewMode).toHaveBeenCalledWith('list')
  })

  it('clicking Grid view toggle calls setViewMode with grid', async () => {
    const user = userEvent.setup()
    const store = mockStore()
    render(<MemoryExplorer />)

    await user.click(screen.getByRole('button', { name: /grid view/i }))
    expect(store.setViewMode).toHaveBeenCalledWith('grid')
  })

  it('pinned section renders when entries are pinned', () => {
    mockStore({
      entries: [makeEntry('p1'), makeEntry('p2')],
      pinnedIds: ['p1'],
    })
    render(<MemoryExplorer />)
    expect(screen.getByText('Pinned')).toBeInTheDocument()
    expect(screen.getByText('All Entries')).toBeInTheDocument()
  })

  it('list view renders table-like rows when viewMode is list', () => {
    mockStore({
      entries: [makeEntry('l1'), makeEntry('l2')],
      viewMode: 'list',
    })
    const { container } = render(<MemoryExplorer />)
    expect(container.querySelector('.memory-explorer__list')).toBeInTheDocument()
    expect(container.querySelectorAll('.memory-explorer__list-row').length).toBe(2)
  })

  it('empty state shows Get Started button', () => {
    mockStore()
    render(<MemoryExplorer />)
    expect(screen.getByRole('button', { name: /get started/i })).toBeInTheDocument()
  })

  it('empty state calls onShowTemplates when provided', async () => {
    const user = userEvent.setup()
    const onShowTemplates = vi.fn()
    mockStore()
    render(<MemoryExplorer onShowTemplates={onShowTemplates} />)

    await user.click(screen.getByRole('button', { name: /get started/i }))
    expect(onShowTemplates).toHaveBeenCalled()
  })
})
