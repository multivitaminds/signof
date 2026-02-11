import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TrashPage from './TrashPage'
import { useWorkspaceStore } from '../stores/useWorkspaceStore'

describe('TrashPage', () => {
  beforeEach(() => {
    useWorkspaceStore.setState({
      ...useWorkspaceStore.getInitialState(),
      pages: {
        'page-1': {
          id: 'page-1',
          title: 'Deleted Doc',
          icon: '📝',
          coverUrl: '',
          parentId: null,
          blockIds: [],
          createdAt: '2026-01-01T00:00:00Z',
          updatedAt: '2026-01-01T00:00:00Z',
          isFavorite: false,
          lastViewedAt: null,
          trashedAt: '2026-02-01T00:00:00Z',
          properties: {},
        },
        'page-2': {
          id: 'page-2',
          title: 'Active Page',
          icon: '',
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
        'page-3': {
          id: 'page-3',
          title: 'Another Deleted',
          icon: '🗑️',
          coverUrl: '',
          parentId: null,
          blockIds: [],
          createdAt: '2026-01-01T00:00:00Z',
          updatedAt: '2026-01-01T00:00:00Z',
          isFavorite: false,
          lastViewedAt: null,
          trashedAt: '2026-01-15T00:00:00Z',
          properties: {},
        },
      },
    })
  })

  it('renders Trash heading', () => {
    render(<TrashPage />)
    expect(screen.getByText('Trash')).toBeInTheDocument()
  })

  it('shows trashed pages', () => {
    render(<TrashPage />)
    expect(screen.getByText('Deleted Doc')).toBeInTheDocument()
    expect(screen.getByText('Another Deleted')).toBeInTheDocument()
  })

  it('does not show active (non-trashed) pages', () => {
    render(<TrashPage />)
    expect(screen.queryByText('Active Page')).not.toBeInTheDocument()
  })

  it('renders Restore buttons for trashed pages', () => {
    render(<TrashPage />)
    const restoreButtons = screen.getAllByText('Restore')
    expect(restoreButtons).toHaveLength(2)
  })

  it('renders Delete buttons for trashed pages', () => {
    render(<TrashPage />)
    const deleteButtons = screen.getAllByText('Delete')
    expect(deleteButtons).toHaveLength(2)
  })

  it('shows empty state when no trashed pages', () => {
    useWorkspaceStore.setState({
      ...useWorkspaceStore.getInitialState(),
      pages: {
        'page-2': {
          id: 'page-2',
          title: 'Active',
          icon: '',
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
      },
    })
    render(<TrashPage />)
    expect(screen.getByText('Trash is empty')).toBeInTheDocument()
  })

  it('has correct aria-labels on restore buttons', () => {
    render(<TrashPage />)
    expect(screen.getByLabelText('Restore Deleted Doc')).toBeInTheDocument()
    expect(screen.getByLabelText('Restore Another Deleted')).toBeInTheDocument()
  })

  it('has correct aria-labels on delete buttons', () => {
    render(<TrashPage />)
    expect(screen.getByLabelText('Permanently delete Deleted Doc')).toBeInTheDocument()
    expect(screen.getByLabelText('Permanently delete Another Deleted')).toBeInTheDocument()
  })

  it('calls restorePage when Restore is clicked', async () => {
    const user = userEvent.setup()
    const restoreSpy = vi.fn()
    useWorkspaceStore.setState({ restorePage: restoreSpy })

    render(<TrashPage />)
    await user.click(screen.getByLabelText('Restore Deleted Doc'))
    expect(restoreSpy).toHaveBeenCalledWith('page-1')
  })

  it('calls permanentlyDeletePage when Delete is clicked', async () => {
    const user = userEvent.setup()
    const deleteSpy = vi.fn()
    useWorkspaceStore.setState({ permanentlyDeletePage: deleteSpy })

    render(<TrashPage />)
    await user.click(screen.getByLabelText('Permanently delete Deleted Doc'))
    expect(deleteSpy).toHaveBeenCalledWith('page-1')
  })
})
