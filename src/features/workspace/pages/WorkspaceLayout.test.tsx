import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import WorkspaceLayout from './WorkspaceLayout'
import { useWorkspaceStore } from '../stores/useWorkspaceStore'

const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ pageId: undefined }),
    Outlet: () => <div data-testid="outlet">Outlet content</div>,
  }
})

describe('WorkspaceLayout', () => {
  beforeEach(() => {
    mockNavigate.mockClear()
    useWorkspaceStore.setState({
      ...useWorkspaceStore.getInitialState(),
      pages: {
        'page-1': {
          id: 'page-1',
          title: 'Getting Started',
          icon: '🚀',
          coverUrl: '',
          parentId: null,
          blockIds: [],
          createdAt: '2026-01-01T00:00:00Z',
          updatedAt: '2026-01-01T00:00:00Z',
          isFavorite: true,
          lastViewedAt: '2026-02-01T00:00:00Z',
          trashedAt: null,
          properties: {},
        },
        'page-2': {
          id: 'page-2',
          title: 'Notes',
          icon: '📝',
          coverUrl: '',
          parentId: null,
          blockIds: [],
          createdAt: '2026-01-01T00:00:00Z',
          updatedAt: '2026-01-01T00:00:00Z',
          isFavorite: false,
          lastViewedAt: '2026-01-15T00:00:00Z',
          trashedAt: null,
          properties: {},
        },
      },
    })
  })

  it('renders sidebar and outlet', () => {
    render(
      <MemoryRouter>
        <WorkspaceLayout />
      </MemoryRouter>
    )
    expect(screen.getByTestId('outlet')).toBeInTheDocument()
  })

  it('renders page tree with pages', () => {
    render(
      <MemoryRouter>
        <WorkspaceLayout />
      </MemoryRouter>
    )
    // "Getting Started" appears in both Favorites and PageTree, so use getAllByText
    const gettingStartedEls = screen.getAllByText('Getting Started')
    expect(gettingStartedEls.length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('Notes')).toBeInTheDocument()
  })

  it('renders Favorites section when favorites exist', () => {
    render(
      <MemoryRouter>
        <WorkspaceLayout />
      </MemoryRouter>
    )
    expect(screen.getByText('Favorites')).toBeInTheDocument()
  })

  it('renders Recently Viewed section when recent pages exist', () => {
    useWorkspaceStore.setState({
      recentPageIds: ['page-1', 'page-2'],
    })
    render(
      <MemoryRouter>
        <WorkspaceLayout />
      </MemoryRouter>
    )
    expect(screen.getByText('Recently Viewed')).toBeInTheDocument()
  })

  it('does not show trashed pages in sidebar', () => {
    useWorkspaceStore.setState((state) => ({
      pages: {
        ...state.pages,
        'page-trashed': {
          id: 'page-trashed',
          title: 'Trashed Page',
          icon: '',
          coverUrl: '',
          parentId: null,
          blockIds: [],
          createdAt: '2026-01-01T00:00:00Z',
          updatedAt: '2026-01-01T00:00:00Z',
          isFavorite: false,
          lastViewedAt: null,
          trashedAt: '2026-01-20T00:00:00Z',
          properties: {},
        },
      },
    }))
    render(
      <MemoryRouter>
        <WorkspaceLayout />
      </MemoryRouter>
    )
    expect(screen.queryByText('Trashed Page')).not.toBeInTheDocument()
  })

  it('has sidebar and content areas', () => {
    const { container } = render(
      <MemoryRouter>
        <WorkspaceLayout />
      </MemoryRouter>
    )
    expect(container.querySelector('.workspace-layout__sidebar')).toBeInTheDocument()
    expect(container.querySelector('.workspace-layout__content')).toBeInTheDocument()
  })
})
