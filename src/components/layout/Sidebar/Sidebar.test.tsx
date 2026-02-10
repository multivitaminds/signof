import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import Sidebar from './Sidebar'
import { useAppStore } from '../../../stores/useAppStore'

vi.mock('../../../features/workspace/stores/useWorkspaceStore', () => ({
  useWorkspaceStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({ pages: {}, blocks: {} }),
}))

vi.mock('../../../features/workspace/components/PageTree/PageTree', () => ({
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
  })

  it('renders the brand logo', () => {
    renderSidebar()
    expect(screen.getByText('SignOf')).toBeInTheDocument()
  })

  it('renders navigation items', () => {
    renderSidebar()
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('Documents')).toBeInTheDocument()
    expect(screen.getByText('Projects')).toBeInTheDocument()
    expect(screen.getByText('AI')).toBeInTheDocument()
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

  it('toggles sidebar on collapse button click', async () => {
    const user = userEvent.setup()
    renderSidebar()

    await user.click(screen.getByLabelText('Collapse sidebar'))
    expect(useAppStore.getState().sidebarExpanded).toBe(false)
  })
})
