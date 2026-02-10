import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PageTree from './PageTree'
import type { Page } from '../../types'

const mockPages: Page[] = [
  {
    id: 'p1',
    title: 'Root Page',
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
  },
  {
    id: 'p2',
    title: 'Another Page',
    icon: '',
    coverUrl: '',
    parentId: null,
    blockIds: [],
    createdAt: '2026-01-02T00:00:00Z',
    updatedAt: '2026-01-02T00:00:00Z',
    isFavorite: false,
    lastViewedAt: null,
    trashedAt: null,
    properties: {},
  },
  {
    id: 'p3',
    title: 'Child Page',
    icon: '🔥',
    coverUrl: '',
    parentId: 'p1',
    blockIds: [],
    createdAt: '2026-01-03T00:00:00Z',
    updatedAt: '2026-01-03T00:00:00Z',
    isFavorite: false,
    lastViewedAt: null,
    trashedAt: null,
    properties: {},
  },
]

describe('PageTree', () => {
  it('renders root pages', () => {
    render(
      <PageTree
        pages={mockPages}
        onSelectPage={vi.fn()}
      />
    )
    expect(screen.getByText('Root Page')).toBeInTheDocument()
    expect(screen.getByText('Another Page')).toBeInTheDocument()
  })

  it('does not render child pages initially', () => {
    render(
      <PageTree
        pages={mockPages}
        onSelectPage={vi.fn()}
      />
    )
    expect(screen.queryByText('Child Page')).not.toBeInTheDocument()
  })

  it('expands to show children when chevron clicked', async () => {
    const user = userEvent.setup()
    render(
      <PageTree
        pages={mockPages}
        onSelectPage={vi.fn()}
      />
    )
    const expandBtn = screen.getByLabelText('Expand')
    await user.click(expandBtn)
    expect(screen.getByText('Child Page')).toBeInTheDocument()
  })

  it('calls onSelectPage when page clicked', async () => {
    const onSelectPage = vi.fn()
    const user = userEvent.setup()
    render(
      <PageTree
        pages={mockPages}
        onSelectPage={onSelectPage}
      />
    )
    await user.click(screen.getByText('Another Page'))
    expect(onSelectPage).toHaveBeenCalledWith('p2')
  })

  it('limits items with maxItems', () => {
    render(
      <PageTree
        pages={mockPages}
        onSelectPage={vi.fn()}
        maxItems={1}
      />
    )
    expect(screen.getByText('Root Page')).toBeInTheDocument()
    expect(screen.queryByText('Another Page')).not.toBeInTheDocument()
    expect(screen.getByText(/View all/)).toBeInTheDocument()
  })

  it('shows empty state when no pages', () => {
    render(
      <PageTree
        pages={[]}
        onSelectPage={vi.fn()}
      />
    )
    expect(screen.getByText('No pages yet')).toBeInTheDocument()
  })
})
