import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import RecentsList from './RecentsList'
import { useFavoritesStore } from '../../../../stores/useFavoritesStore'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

function renderRecentsList() {
  return render(
    <MemoryRouter>
      <RecentsList />
    </MemoryRouter>
  )
}

describe('RecentsList', () => {
  beforeEach(() => {
    useFavoritesStore.setState({ favorites: [], recents: [] })
    mockNavigate.mockClear()
  })

  it('renders nothing when there are no recents', () => {
    const { container } = renderRecentsList()
    expect(container.firstChild).toBeNull()
  })

  it('renders recent items', () => {
    useFavoritesStore.setState({
      recents: [
        {
          id: 'doc-1',
          type: 'document',
          moduleId: 'documents',
          title: 'My Document',
          path: '/documents/doc-1',
          icon: 'file',
          accessedAt: new Date().toISOString(),
          accessCount: 1,
        },
      ],
    })

    renderRecentsList()
    expect(screen.getByText('Recent')).toBeInTheDocument()
    expect(screen.getByText('My Document')).toBeInTheDocument()
  })

  it('navigates on click', async () => {
    const user = userEvent.setup()
    useFavoritesStore.setState({
      recents: [
        {
          id: 'doc-1',
          type: 'document',
          moduleId: 'documents',
          title: 'My Document',
          path: '/documents/doc-1',
          icon: 'file',
          accessedAt: new Date().toISOString(),
          accessCount: 1,
        },
      ],
    })

    renderRecentsList()
    await user.click(screen.getByText('My Document'))
    expect(mockNavigate).toHaveBeenCalledWith('/documents/doc-1')
  })

  it('clears recents on Clear click', async () => {
    const user = userEvent.setup()
    useFavoritesStore.setState({
      recents: [
        {
          id: 'doc-1',
          type: 'document',
          moduleId: 'documents',
          title: 'My Document',
          path: '/documents/doc-1',
          icon: 'file',
          accessedAt: new Date().toISOString(),
          accessCount: 1,
        },
      ],
    })

    renderRecentsList()
    await user.click(screen.getByLabelText('Clear recent items'))
    expect(useFavoritesStore.getState().recents).toHaveLength(0)
  })

  it('shows at most 8 items', () => {
    const recents = Array.from({ length: 12 }, (_, i) => ({
      id: `item-${i}`,
      type: 'document' as const,
      moduleId: 'documents',
      title: `Item ${i}`,
      path: `/items/${i}`,
      icon: 'file',
      accessedAt: new Date().toISOString(),
      accessCount: 1,
    }))
    useFavoritesStore.setState({ recents })

    renderRecentsList()
    const items = screen.getAllByRole('listitem')
    expect(items).toHaveLength(8)
  })

  it('displays relative time', () => {
    useFavoritesStore.setState({
      recents: [
        {
          id: 'doc-1',
          type: 'document',
          moduleId: 'documents',
          title: 'My Document',
          path: '/documents/doc-1',
          icon: 'file',
          accessedAt: new Date().toISOString(),
          accessCount: 1,
        },
      ],
    })

    renderRecentsList()
    expect(screen.getByText('just now')).toBeInTheDocument()
  })
})
