import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import WorkspaceAllPages from './WorkspaceAllPages'
import { useWorkspaceStore } from '../stores/useWorkspaceStore'

const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('WorkspaceAllPages', () => {
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
          updatedAt: '2026-02-01T00:00:00Z',
          isFavorite: false,
          lastViewedAt: null,
          trashedAt: null,
          properties: {},
        },
        'page-2': {
          id: 'page-2',
          title: 'Meeting Notes',
          icon: '📋',
          coverUrl: '',
          parentId: null,
          blockIds: [],
          createdAt: '2026-01-01T00:00:00Z',
          updatedAt: '2026-01-15T00:00:00Z',
          isFavorite: false,
          lastViewedAt: null,
          trashedAt: null,
          properties: {},
        },
        'page-trashed': {
          id: 'page-trashed',
          title: 'Trashed',
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
    })
  })

  it('renders All Pages heading', () => {
    render(
      <BrowserRouter>
        <WorkspaceAllPages />
      </BrowserRouter>
    )
    expect(screen.getByText('All Pages')).toBeInTheDocument()
  })

  it('renders New Page button', () => {
    render(
      <BrowserRouter>
        <WorkspaceAllPages />
      </BrowserRouter>
    )
    expect(screen.getByText('New Page')).toBeInTheDocument()
  })

  it('shows non-trashed pages', () => {
    render(
      <BrowserRouter>
        <WorkspaceAllPages />
      </BrowserRouter>
    )
    expect(screen.getByText('Getting Started')).toBeInTheDocument()
    expect(screen.getByText('Meeting Notes')).toBeInTheDocument()
  })

  it('does not show trashed pages', () => {
    render(
      <BrowserRouter>
        <WorkspaceAllPages />
      </BrowserRouter>
    )
    expect(screen.queryByText('Trashed')).not.toBeInTheDocument()
  })

  it('navigates to page on card click', async () => {
    const user = userEvent.setup()
    render(
      <BrowserRouter>
        <WorkspaceAllPages />
      </BrowserRouter>
    )
    await user.click(screen.getByText('Getting Started'))
    expect(mockNavigate).toHaveBeenCalledWith('/pages/page-1')
  })

  it('navigates to new page on New Page button click', async () => {
    const user = userEvent.setup()
    render(
      <BrowserRouter>
        <WorkspaceAllPages />
      </BrowserRouter>
    )
    await user.click(screen.getByText('New Page'))
    expect(mockNavigate).toHaveBeenCalledWith('/pages/new')
  })

  it('shows empty state when no pages', () => {
    useWorkspaceStore.setState({
      ...useWorkspaceStore.getInitialState(),
      pages: {},
    })
    render(
      <BrowserRouter>
        <WorkspaceAllPages />
      </BrowserRouter>
    )
    expect(screen.getByText('Create your first page')).toBeInTheDocument()
  })

  it('shows page icons', () => {
    render(
      <BrowserRouter>
        <WorkspaceAllPages />
      </BrowserRouter>
    )
    expect(screen.getByText('🚀')).toBeInTheDocument()
    expect(screen.getByText('📋')).toBeInTheDocument()
  })
})
