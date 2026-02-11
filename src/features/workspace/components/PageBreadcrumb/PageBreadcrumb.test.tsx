import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import PageBreadcrumb from './PageBreadcrumb'
import { useWorkspaceStore } from '../../stores/useWorkspaceStore'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

function renderWithRouter(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>)
}

describe('PageBreadcrumb', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useWorkspaceStore.setState({
      pages: {
        'page-root': {
          id: 'page-root',
          title: 'Root Page',
          icon: '📁',
          coverUrl: '',
          parentId: null,
          blockIds: [],
          createdAt: '2026-01-01T00:00:00Z',
          updatedAt: '2026-01-01T00:00:00Z',
          isFavorite: false,
          lastViewedAt: null,
          trashedAt: null,
          properties: {},
        },
        'page-child': {
          id: 'page-child',
          title: 'Child Page',
          icon: '📝',
          coverUrl: '',
          parentId: 'page-root',
          blockIds: [],
          createdAt: '2026-01-02T00:00:00Z',
          updatedAt: '2026-01-02T00:00:00Z',
          isFavorite: false,
          lastViewedAt: null,
          trashedAt: null,
          properties: {},
        },
        'page-grandchild': {
          id: 'page-grandchild',
          title: 'Grandchild Page',
          icon: '',
          coverUrl: '',
          parentId: 'page-child',
          blockIds: [],
          createdAt: '2026-01-03T00:00:00Z',
          updatedAt: '2026-01-03T00:00:00Z',
          isFavorite: false,
          lastViewedAt: null,
          trashedAt: null,
          properties: {},
        },
      },
      blocks: {},
    })
  })

  it('renders workspace root link', () => {
    renderWithRouter(<PageBreadcrumb pageId="page-root" />)
    expect(screen.getByText('Workspace')).toBeInTheDocument()
  })

  it('renders single page breadcrumb', () => {
    renderWithRouter(<PageBreadcrumb pageId="page-root" />)
    expect(screen.getByText('Root Page')).toBeInTheDocument()
  })

  it('renders full hierarchy for nested page', () => {
    renderWithRouter(<PageBreadcrumb pageId="page-grandchild" />)
    expect(screen.getByText('Workspace')).toBeInTheDocument()
    expect(screen.getByText('Root Page')).toBeInTheDocument()
    expect(screen.getByText('Child Page')).toBeInTheDocument()
    expect(screen.getByText('Grandchild Page')).toBeInTheDocument()
  })

  it('shows page icon in breadcrumb', () => {
    renderWithRouter(<PageBreadcrumb pageId="page-child" />)
    // Check for emoji icon
    const icons = screen.getAllByText('📝')
    expect(icons.length).toBeGreaterThan(0)
  })

  it('navigates when clicking parent crumb', async () => {
    const user = userEvent.setup()
    renderWithRouter(<PageBreadcrumb pageId="page-grandchild" />)

    // Click on "Root Page" (which is a parent, not current)
    const rootLink = screen.getByText('Root Page')
    await user.click(rootLink)
    expect(mockNavigate).toHaveBeenCalledWith('/pages/page-root')
  })

  it('navigates to workspace when clicking workspace link', async () => {
    const user = userEvent.setup()
    renderWithRouter(<PageBreadcrumb pageId="page-root" />)

    await user.click(screen.getByText('Workspace'))
    expect(mockNavigate).toHaveBeenCalledWith('/pages')
  })

  it('marks current page with aria-current', () => {
    renderWithRouter(<PageBreadcrumb pageId="page-grandchild" />)
    const currentCrumb = screen.getByText('Grandchild Page').closest('[aria-current]')
    expect(currentCrumb).toHaveAttribute('aria-current', 'page')
  })

  it('renders nothing for non-existent page', () => {
    const { container } = renderWithRouter(<PageBreadcrumb pageId="nonexistent" />)
    expect(container.querySelector('.page-breadcrumb')).toBeNull()
  })
})
