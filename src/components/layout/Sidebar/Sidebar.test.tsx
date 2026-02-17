import { render, screen, fireEvent, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import Sidebar from './Sidebar'
import { useAppStore } from '../../../stores/useAppStore'
import { useFavoritesStore } from '../../../stores/useFavoritesStore'

vi.mock('../../../features/workspace/stores/useWorkspaceStore', () => ({
  useWorkspaceStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({ pages: {}, blocks: {} }),
}))

vi.mock('../../../features/workspace/components/PageTree/PageTree', () => ({
  default: () => null,
}))

vi.mock('../../../features/home/components/RecentsList/RecentsList', () => ({
  default: () => <div data-testid="recents-list">Recents Mock</div>,
}))

vi.mock('../../../features/notifications/stores/useNotificationStore', () => ({
  useNotificationStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({ notifications: [], getUnreadCount: () => 0 }),
}))

vi.mock('../../../features/notifications/components/NotificationBadge/NotificationBadge', () => ({
  default: () => null,
}))

vi.mock('../../../features/notifications/components/NotificationCenter/NotificationCenter', () => ({
  default: () => null,
}))

function renderSidebar() {
  return render(
    <MemoryRouter>
      <Sidebar />
    </MemoryRouter>
  )
}

describe('Sidebar', () => {
  beforeEach(() => {
    useAppStore.setState({
      sidebarExpanded: true,
      sidebarWidth: 240,
      mobileSidebarOpen: false,
      favorites: [],
    })
    useFavoritesStore.setState({ favorites: [], recents: [] })
  })

  it('renders the brand logo', () => {
    renderSidebar()
    expect(screen.getByText('Orchestree')).toBeInTheDocument()
  })

  it('renders navigation items', () => {
    renderSidebar()
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('Documents')).toBeInTheDocument()
    expect(screen.getByText('Projects')).toBeInTheDocument()
    expect(screen.getByText('Copilot')).toBeInTheDocument()
  })

  it('renders the Workspace section label when expanded', () => {
    renderSidebar()
    expect(screen.getByText('Workspace')).toBeInTheDocument()
  })

  it('renders the search button', () => {
    renderSidebar()
    expect(screen.getByLabelText('Search or run command')).toBeInTheDocument()
  })

  it('renders the New button', () => {
    renderSidebar()
    expect(screen.getByLabelText('Create new')).toBeInTheDocument()
  })

  it('opens the new menu on click', async () => {
    const user = userEvent.setup()
    renderSidebar()

    await user.click(screen.getByLabelText('Create new'))
    expect(screen.getByText('New Page')).toBeInTheDocument()
    expect(screen.getByText('New Project')).toBeInTheDocument()
    expect(screen.getByText('New Document')).toBeInTheDocument()
    expect(screen.getByText('New Event')).toBeInTheDocument()
    expect(screen.getByText('New Database')).toBeInTheDocument()
  })

  it('renders favorites section when favorites exist', () => {
    useAppStore.setState({
      favorites: [
        { id: '1', path: '/pages/test', label: 'Test Page', icon: 'file' },
      ],
    })
    renderSidebar()
    expect(screen.getByText('Favorites')).toBeInTheDocument()
    expect(screen.getByText('Test Page')).toBeInTheDocument()
  })

  it('renders favorites section with empty state when no favorites', () => {
    renderSidebar()
    expect(screen.getByText('Favorites')).toBeInTheDocument()
    expect(screen.getByText('No favorites yet')).toBeInTheDocument()
  })

  it('removes a favorite on X click', async () => {
    const user = userEvent.setup()
    useAppStore.setState({
      favorites: [
        { id: '1', path: '/pages/test', label: 'Test Page', icon: 'file' },
      ],
    })
    renderSidebar()

    const removeBtn = screen.getByLabelText('Remove Test Page from favorites')
    await user.click(removeBtn)

    expect(useAppStore.getState().favorites).toEqual([])
  })

  it('shows badge on inbox nav item', () => {
    renderSidebar()
    // The Inbox shows a badge for unread notifications from sample data
    expect(screen.getByText('6')).toBeInTheDocument()
  })

  it('renders resize handle when expanded', () => {
    renderSidebar()
    expect(screen.getByLabelText('Resize sidebar')).toBeInTheDocument()
  })

  it('hides resize handle when collapsed', () => {
    useAppStore.setState({ sidebarExpanded: false })
    renderSidebar()
    expect(screen.queryByLabelText('Resize sidebar')).not.toBeInTheDocument()
  })

  it('toggles sidebar on pin/unpin button click', async () => {
    const user = userEvent.setup()
    renderSidebar()

    await user.click(screen.getByLabelText('Unpin sidebar'))
    expect(useAppStore.getState().sidebarExpanded).toBe(false)
  })

  it('expands on hover when unpinned', () => {
    vi.useFakeTimers()
    useAppStore.setState({ sidebarExpanded: false })
    renderSidebar()

    // Sidebar should be collapsed
    expect(screen.queryByText('Workspace')).not.toBeInTheDocument()

    // Hover to expand
    const sidebar = screen.getByRole('complementary')
    fireEvent.mouseEnter(sidebar)

    // Should now show expanded content
    expect(screen.getByText('Workspace')).toBeInTheDocument()
    expect(screen.getByText('Orchestree')).toBeInTheDocument()

    vi.useRealTimers()
  })

  it('collapses after mouse leave when unpinned (300ms delay)', () => {
    vi.useFakeTimers()
    useAppStore.setState({ sidebarExpanded: false })
    renderSidebar()

    const sidebar = screen.getByRole('complementary')

    // Hover to expand
    fireEvent.mouseEnter(sidebar)
    expect(screen.getByText('Workspace')).toBeInTheDocument()

    // Mouse leave triggers delayed collapse
    fireEvent.mouseLeave(sidebar)

    // Still expanded immediately (300ms delay hasn't elapsed)
    expect(screen.getByText('Workspace')).toBeInTheDocument()

    // Advance past the 300ms delay
    act(() => { vi.advanceTimersByTime(350) })

    // Now collapsed
    expect(screen.queryByText('Workspace')).not.toBeInTheDocument()

    vi.useRealTimers()
  })

  it('does not collapse on mouse leave when pinned', () => {
    vi.useFakeTimers()
    useAppStore.setState({ sidebarExpanded: true })
    renderSidebar()

    const sidebar = screen.getByRole('complementary')
    fireEvent.mouseLeave(sidebar)

    act(() => { vi.advanceTimersByTime(500) })

    // Still expanded because sidebar is pinned
    expect(screen.getByText('Workspace')).toBeInTheDocument()

    vi.useRealTimers()
  })
})
