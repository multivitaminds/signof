import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import FilterBar from './FilterBar'
import type { Member, Label, SavedView, IssueFilters } from '../../types'
import { IssueStatus } from '../../types'

const mockMembers: Member[] = [
  { id: 'member-1', name: 'Alice', email: 'alice@example.com', avatarUrl: '' },
  { id: 'member-2', name: 'Bob', email: 'bob@example.com', avatarUrl: '' },
]

const mockLabels: Label[] = [
  { id: 'label-1', name: 'Bug', color: '#EF4444' },
  { id: 'label-2', name: 'Feature', color: '#3B82F6' },
]

describe('FilterBar', () => {
  const defaultProps = {
    filters: {} as IssueFilters,
    onFiltersChange: vi.fn(),
    members: mockMembers,
    labels: mockLabels,
    savedViews: [] as SavedView[],
    onSaveView: vi.fn(),
    onDeleteSavedView: vi.fn(),
    onLoadSavedView: vi.fn(),
    activeViewId: null,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders all filter dropdowns', () => {
    render(<FilterBar {...defaultProps} />)
    expect(screen.getByText('Status')).toBeInTheDocument()
    expect(screen.getByText('Priority')).toBeInTheDocument()
    expect(screen.getByText('Assignee')).toBeInTheDocument()
    expect(screen.getByText('Label')).toBeInTheDocument()
  })

  it('opens status dropdown and shows statuses', async () => {
    const user = userEvent.setup()
    render(<FilterBar {...defaultProps} />)

    await user.click(screen.getByLabelText('Filter by Status'))
    expect(screen.getByText('Backlog')).toBeInTheDocument()
    expect(screen.getByText('Todo')).toBeInTheDocument()
    expect(screen.getByText('In Progress')).toBeInTheDocument()
    expect(screen.getByText('Done')).toBeInTheDocument()
  })

  it('calls onFiltersChange when a status is selected', async () => {
    const user = userEvent.setup()
    const onFiltersChange = vi.fn()
    render(<FilterBar {...defaultProps} onFiltersChange={onFiltersChange} />)

    await user.click(screen.getByLabelText('Filter by Status'))
    // Click the checkbox for "Todo"
    const checkboxes = screen.getAllByRole('checkbox')
    const todoCheckbox = checkboxes.find(
      (cb) => cb.closest('label')?.textContent?.includes('Todo')
    )
    expect(todoCheckbox).toBeDefined()
    await user.click(todoCheckbox!)

    expect(onFiltersChange).toHaveBeenCalledWith({
      status: [IssueStatus.Todo],
    })
  })

  it('shows count badge when filters are active', () => {
    render(
      <FilterBar
        {...defaultProps}
        filters={{ status: [IssueStatus.Todo, IssueStatus.Done] }}
      />
    )
    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('shows clear all button when filters are active', () => {
    render(
      <FilterBar
        {...defaultProps}
        filters={{ status: [IssueStatus.Todo] }}
      />
    )
    expect(screen.getByText('Clear all')).toBeInTheDocument()
  })

  it('clears all filters when clear all is clicked', async () => {
    const user = userEvent.setup()
    const onFiltersChange = vi.fn()
    render(
      <FilterBar
        {...defaultProps}
        onFiltersChange={onFiltersChange}
        filters={{ status: [IssueStatus.Todo] }}
      />
    )

    await user.click(screen.getByText('Clear all'))
    expect(onFiltersChange).toHaveBeenCalledWith({})
  })

  it('shows save view button when filters are active', () => {
    render(
      <FilterBar
        {...defaultProps}
        filters={{ status: [IssueStatus.Todo] }}
      />
    )
    expect(screen.getByText('Save View')).toBeInTheDocument()
  })

  it('saves a view with a name', async () => {
    const user = userEvent.setup()
    const onSaveView = vi.fn()
    render(
      <FilterBar
        {...defaultProps}
        onSaveView={onSaveView}
        filters={{ status: [IssueStatus.Todo] }}
      />
    )

    await user.click(screen.getByText('Save View'))
    const input = screen.getByPlaceholderText('View name...')
    await user.type(input, 'My View{Enter}')

    expect(onSaveView).toHaveBeenCalledWith('My View')
  })

  it('renders saved view tabs', () => {
    const savedViews: SavedView[] = [
      {
        id: 'view-1',
        projectId: 'proj-1',
        name: 'Bugs Only',
        filters: { status: [IssueStatus.Todo] },
        createdAt: '2025-01-01T00:00:00.000Z',
      },
    ]
    render(<FilterBar {...defaultProps} savedViews={savedViews} />)
    expect(screen.getByText('Bugs Only')).toBeInTheDocument()
  })

  it('loads a saved view when tab is clicked', async () => {
    const user = userEvent.setup()
    const onLoadSavedView = vi.fn()
    const savedView: SavedView = {
      id: 'view-1',
      projectId: 'proj-1',
      name: 'Bugs Only',
      filters: { status: [IssueStatus.Todo] },
      createdAt: '2025-01-01T00:00:00.000Z',
    }
    render(
      <FilterBar
        {...defaultProps}
        onLoadSavedView={onLoadSavedView}
        savedViews={[savedView]}
      />
    )

    await user.click(screen.getByText('Bugs Only'))
    expect(onLoadSavedView).toHaveBeenCalledWith(savedView)
  })

  it('deletes a saved view', async () => {
    const user = userEvent.setup()
    const onDeleteSavedView = vi.fn()
    const savedViews: SavedView[] = [
      {
        id: 'view-1',
        projectId: 'proj-1',
        name: 'Bugs Only',
        filters: {},
        createdAt: '2025-01-01T00:00:00.000Z',
      },
    ]
    render(
      <FilterBar
        {...defaultProps}
        onDeleteSavedView={onDeleteSavedView}
        savedViews={savedViews}
      />
    )

    await user.click(screen.getByLabelText('Delete view Bugs Only'))
    expect(onDeleteSavedView).toHaveBeenCalledWith('view-1')
  })

  it('opens assignee dropdown and shows members', async () => {
    const user = userEvent.setup()
    render(<FilterBar {...defaultProps} />)

    await user.click(screen.getByLabelText('Filter by Assignee'))
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()
  })

  it('opens label dropdown and shows labels', async () => {
    const user = userEvent.setup()
    render(<FilterBar {...defaultProps} />)

    await user.click(screen.getByLabelText('Filter by Label'))
    expect(screen.getByText('Bug')).toBeInTheDocument()
    expect(screen.getByText('Feature')).toBeInTheDocument()
  })
})
