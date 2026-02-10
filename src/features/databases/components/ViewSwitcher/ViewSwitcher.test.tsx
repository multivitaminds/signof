import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ViewSwitcher from './ViewSwitcher'
import type { DbView, DbField } from '../../types'
import { ViewType, DbFieldType } from '../../types'

const views: DbView[] = [
  {
    id: 'v-grid',
    name: 'All Tasks',
    type: ViewType.Grid,
    tableId: 'tbl-1',
    filters: [],
    sorts: [],
    hiddenFields: [],
    fieldOrder: [],
  },
  {
    id: 'v-kanban',
    name: 'Board',
    type: ViewType.Kanban,
    tableId: 'tbl-1',
    filters: [],
    sorts: [],
    groupBy: 'f-status',
    hiddenFields: [],
    fieldOrder: [],
  },
  {
    id: 'v-calendar',
    name: 'Timeline',
    type: ViewType.Calendar,
    tableId: 'tbl-1',
    filters: [],
    sorts: [],
    hiddenFields: [],
    fieldOrder: [],
  },
  {
    id: 'v-gallery',
    name: 'Cards',
    type: ViewType.Gallery,
    tableId: 'tbl-1',
    filters: [],
    sorts: [],
    hiddenFields: [],
    fieldOrder: [],
  },
]

const fields: DbField[] = [
  { id: 'f-title', name: 'Title', type: DbFieldType.Text, width: 280 },
  {
    id: 'f-status',
    name: 'Status',
    type: DbFieldType.Select,
    width: 140,
    options: {
      choices: [
        { id: 's1', name: 'Backlog', color: '#94A3B8' },
        { id: 's2', name: 'In Progress', color: '#3B82F6' },
      ],
    },
  },
  {
    id: 'f-priority',
    name: 'Priority',
    type: DbFieldType.Select,
    width: 120,
    options: {
      choices: [
        { id: 'p1', name: 'Low', color: '#94A3B8' },
        { id: 'p2', name: 'High', color: '#EF4444' },
      ],
    },
  },
  { id: 'f-due', name: 'Due Date', type: DbFieldType.Date, width: 140 },
]

const defaultProps = () => ({
  views,
  activeViewId: 'v-grid',
  onSelectView: vi.fn(),
  onAddView: vi.fn(),
  fields,
  kanbanFieldId: 'f-status',
  calendarFieldId: 'f-due',
  onKanbanFieldChange: vi.fn(),
  onCalendarFieldChange: vi.fn(),
})

describe('ViewSwitcher', () => {
  it('renders tabs for each view', () => {
    render(<ViewSwitcher {...defaultProps()} />)
    expect(screen.getByText('All Tasks')).toBeInTheDocument()
    expect(screen.getByText('Board')).toBeInTheDocument()
    expect(screen.getByText('Timeline')).toBeInTheDocument()
    expect(screen.getByText('Cards')).toBeInTheDocument()
  })

  it('marks active view tab', () => {
    render(<ViewSwitcher {...defaultProps()} />)
    const activeTab = screen.getByRole('tab', { name: 'All Tasks' })
    expect(activeTab).toHaveAttribute('aria-selected', 'true')
    const inactiveTab = screen.getByRole('tab', { name: 'Board' })
    expect(inactiveTab).toHaveAttribute('aria-selected', 'false')
  })

  it('calls onSelectView when clicking a tab', async () => {
    const user = userEvent.setup()
    const onSelectView = vi.fn()
    render(<ViewSwitcher {...defaultProps()} onSelectView={onSelectView} />)
    await user.click(screen.getByText('Board'))
    expect(onSelectView).toHaveBeenCalledWith('v-kanban')
  })

  it('shows add view button', () => {
    render(<ViewSwitcher {...defaultProps()} />)
    expect(screen.getByLabelText('Add view')).toBeInTheDocument()
  })

  it('opens add view menu with all view types', async () => {
    const user = userEvent.setup()
    render(<ViewSwitcher {...defaultProps()} />)
    await user.click(screen.getByLabelText('Add view'))
    // "Grid" and "Board" may also appear as existing view tab names,
    // so use getAllByText to accept duplicates
    expect(screen.getAllByText('Grid').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Board').length).toBeGreaterThanOrEqual(2) // tab + menu item
    expect(screen.getAllByText('Calendar').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Gallery').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('Form')).toBeInTheDocument()
  })

  it('calls onAddView when selecting a view type from menu', async () => {
    const user = userEvent.setup()
    const onAddView = vi.fn()
    render(<ViewSwitcher {...defaultProps()} onAddView={onAddView} />)
    await user.click(screen.getByLabelText('Add view'))
    await user.click(screen.getByText('Gallery'))
    expect(onAddView).toHaveBeenCalledWith(ViewType.Gallery)
  })

  it('shows kanban field picker when kanban view is active', () => {
    render(<ViewSwitcher {...defaultProps()} activeViewId="v-kanban" />)
    expect(screen.getByLabelText('Select group field')).toBeInTheDocument()
    expect(screen.getByText('Group by: Status')).toBeInTheDocument()
  })

  it('does not show kanban field picker when grid view is active', () => {
    render(<ViewSwitcher {...defaultProps()} activeViewId="v-grid" />)
    expect(screen.queryByLabelText('Select group field')).not.toBeInTheDocument()
  })

  it('opens kanban field picker dropdown', async () => {
    const user = userEvent.setup()
    render(<ViewSwitcher {...defaultProps()} activeViewId="v-kanban" />)
    await user.click(screen.getByLabelText('Select group field'))
    // Dropdown should show Status and Priority options
    const fieldOptions = document.querySelectorAll('.view-switcher__field-option')
    expect(fieldOptions.length).toBe(2) // Status and Priority
    expect(screen.getByText('Priority')).toBeInTheDocument()
  })

  it('calls onKanbanFieldChange when selecting a field', async () => {
    const user = userEvent.setup()
    const onKanbanFieldChange = vi.fn()
    render(<ViewSwitcher {...defaultProps()} activeViewId="v-kanban" onKanbanFieldChange={onKanbanFieldChange} />)
    await user.click(screen.getByLabelText('Select group field'))
    await user.click(screen.getByText('Priority'))
    expect(onKanbanFieldChange).toHaveBeenCalledWith('f-priority')
  })

  it('shows calendar field picker when calendar view is active', () => {
    render(<ViewSwitcher {...defaultProps()} activeViewId="v-calendar" />)
    expect(screen.getByLabelText('Select date field')).toBeInTheDocument()
  })

  it('calls onCalendarFieldChange when selecting a date field', async () => {
    const user = userEvent.setup()
    const onCalendarFieldChange = vi.fn()
    render(<ViewSwitcher {...defaultProps()} activeViewId="v-calendar" onCalendarFieldChange={onCalendarFieldChange} />)
    await user.click(screen.getByLabelText('Select date field'))
    await user.click(screen.getByText('Due Date'))
    expect(onCalendarFieldChange).toHaveBeenCalledWith('f-due')
  })

  it('renders tablist role', () => {
    render(<ViewSwitcher {...defaultProps()} />)
    expect(screen.getByRole('tablist', { name: 'View tabs' })).toBeInTheDocument()
  })
})
