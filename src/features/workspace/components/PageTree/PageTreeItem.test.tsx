import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PageTreeItem from './PageTreeItem'
import type { Page } from '../../types'

function makePage(overrides: Partial<Page> = {}): Page {
  return {
    id: 'page-1',
    title: 'Test Page',
    icon: '📄',
    coverUrl: '',
    parentId: null,
    blockIds: [],
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    isFavorite: false,
    lastViewedAt: null,
    trashedAt: null,
    properties: {},
    ...overrides,
  }
}

describe('PageTreeItem', () => {
  const baseProps = {
    page: makePage(),
    allPages: [makePage()],
    level: 0,
    onSelectPage: vi.fn(),
    onNewPage: vi.fn(),
    onToggleFavorite: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders page title', () => {
    render(<PageTreeItem {...baseProps} />)
    expect(screen.getByText('Test Page')).toBeInTheDocument()
  })

  it('renders page icon', () => {
    render(<PageTreeItem {...baseProps} />)
    expect(screen.getByText('📄')).toBeInTheDocument()
  })

  it('renders "Untitled" when title is empty', () => {
    render(
      <PageTreeItem {...baseProps} page={makePage({ title: '' })} />
    )
    expect(screen.getByText('Untitled')).toBeInTheDocument()
  })

  it('calls onSelectPage when clicked', async () => {
    const user = userEvent.setup()
    const onSelectPage = vi.fn()
    render(<PageTreeItem {...baseProps} onSelectPage={onSelectPage} />)
    await user.click(screen.getByText('Test Page'))
    expect(onSelectPage).toHaveBeenCalledWith('page-1')
  })

  it('applies active class when selected', () => {
    const { container } = render(
      <PageTreeItem {...baseProps} selectedPageId="page-1" />
    )
    expect(container.querySelector('.page-tree-item--active')).toBeInTheDocument()
  })

  it('does not apply active class when not selected', () => {
    const { container } = render(
      <PageTreeItem {...baseProps} selectedPageId="other-page" />
    )
    expect(container.querySelector('.page-tree-item--active')).not.toBeInTheDocument()
  })

  it('renders treeitem role', () => {
    render(<PageTreeItem {...baseProps} />)
    expect(screen.getByRole('treeitem')).toBeInTheDocument()
  })

  it('has aria-selected when active', () => {
    render(<PageTreeItem {...baseProps} selectedPageId="page-1" />)
    expect(screen.getByRole('treeitem')).toHaveAttribute('aria-selected', 'true')
  })

  it('renders expand chevron when page has children', () => {
    const childPage = makePage({ id: 'child-1', parentId: 'page-1', title: 'Child' })
    render(
      <PageTreeItem
        {...baseProps}
        allPages={[makePage(), childPage]}
      />
    )
    expect(screen.getByLabelText('Expand')).toBeInTheDocument()
  })

  it('does not render chevron when page has no children', () => {
    render(<PageTreeItem {...baseProps} />)
    expect(screen.queryByLabelText('Expand')).not.toBeInTheDocument()
  })

  it('expands children on chevron click', async () => {
    const user = userEvent.setup()
    const childPage = makePage({ id: 'child-1', parentId: 'page-1', title: 'Child Page' })
    render(
      <PageTreeItem
        {...baseProps}
        allPages={[makePage(), childPage]}
      />
    )
    await user.click(screen.getByLabelText('Expand'))
    expect(screen.getByText('Child Page')).toBeInTheDocument()
    expect(screen.getByLabelText('Collapse')).toBeInTheDocument()
  })

  it('renders add sub-page button', () => {
    render(<PageTreeItem {...baseProps} />)
    expect(screen.getByLabelText('Add sub-page to Test Page')).toBeInTheDocument()
  })

  it('calls onNewPage with parent id on add click', async () => {
    const user = userEvent.setup()
    const onNewPage = vi.fn()
    render(<PageTreeItem {...baseProps} onNewPage={onNewPage} />)
    await user.click(screen.getByLabelText('Add sub-page to Test Page'))
    expect(onNewPage).toHaveBeenCalledWith('page-1')
  })

  it('renders favorite toggle button', () => {
    render(<PageTreeItem {...baseProps} />)
    expect(screen.getByLabelText('Add Test Page to favorites')).toBeInTheDocument()
  })

  it('shows correct aria-label for already-favorited page', () => {
    render(
      <PageTreeItem
        {...baseProps}
        page={makePage({ isFavorite: true })}
      />
    )
    expect(screen.getByLabelText('Remove Test Page from favorites')).toBeInTheDocument()
  })

  it('calls onToggleFavorite on favorite click', async () => {
    const user = userEvent.setup()
    const onToggleFavorite = vi.fn()
    render(<PageTreeItem {...baseProps} onToggleFavorite={onToggleFavorite} />)
    await user.click(screen.getByLabelText('Add Test Page to favorites'))
    expect(onToggleFavorite).toHaveBeenCalledWith('page-1')
  })

  it('hides add and favorite buttons in compact mode', () => {
    render(<PageTreeItem {...baseProps} compact />)
    expect(screen.queryByLabelText('Add sub-page to Test Page')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Add Test Page to favorites')).not.toBeInTheDocument()
  })

  it('applies indentation based on level', () => {
    const { container } = render(
      <PageTreeItem {...baseProps} level={2} />
    )
    const item = container.querySelector('.page-tree-item')
    expect(item).toHaveStyle({ paddingLeft: '44px' }) // 2 * 20 + 4
  })
})
