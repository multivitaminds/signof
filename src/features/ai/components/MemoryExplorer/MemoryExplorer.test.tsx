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
  tags: ['test'],
  scope: 'workspace',
  tokenCount: 100,
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
  ...overrides,
})

function mockStore(overrides: Partial<ReturnType<typeof useMemoryStore>> = {}) {
  const defaults = {
    entries: [] as MemoryEntry[],
    isHydrated: true,
    searchQuery: '',
    filterScope: null,
    filterTags: [],
    hydrate: vi.fn(),
    setSearchQuery: vi.fn(),
    setFilterScope: vi.fn(),
    setFilterTags: vi.fn(),
    addEntry: vi.fn(),
    updateEntry: vi.fn(),
    deleteEntry: vi.fn(),
    clearAll: vi.fn(),
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

  it('renders empty state when no entries', () => {
    mockStore()
    render(<MemoryExplorer />)
    expect(
      screen.getByText(/no memory entries yet/i),
    ).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: /add entry/i }).length).toBeGreaterThan(0)
  })

  it('renders entry cards when entries exist', () => {
    mockStore({ entries: [makeEntry('1'), makeEntry('2')] })
    render(<MemoryExplorer />)
    expect(screen.getByText('Entry 1')).toBeInTheDocument()
    expect(screen.getByText('Entry 2')).toBeInTheDocument()
  })

  it('renders UsageMeter with total tokens', () => {
    mockStore({
      entries: [
        makeEntry('1', { tokenCount: 500 }),
        makeEntry('2', { tokenCount: 300 }),
      ],
    })
    render(<MemoryExplorer />)
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
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

  it('opens add modal when Add Entry button is clicked', async () => {
    const user = userEvent.setup()
    mockStore()
    render(<MemoryExplorer />)

    // Click the first Add Entry button (toolbar)
    const addButtons = screen.getAllByRole('button', { name: /add entry/i })
    await user.click(addButtons[0]!)

    // Modal should appear
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Add Entry' })).toBeInTheDocument()
  })

  it('renders scope filter dropdown', () => {
    mockStore()
    render(<MemoryExplorer />)
    expect(screen.getByRole('combobox', { name: /filter by scope/i })).toBeInTheDocument()
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

    await user.click(screen.getByRole('button', { name: /delete entry del1/i }))
    expect(store.deleteEntry).toHaveBeenCalledWith('del1')
  })
})
