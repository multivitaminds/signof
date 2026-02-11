import { render, screen } from '@testing-library/react'
import TableOfContentsBlock from './TableOfContentsBlock'
import { useWorkspaceStore } from '../../stores/useWorkspaceStore'

describe('TableOfContentsBlock', () => {
  beforeEach(() => {
    useWorkspaceStore.setState({
      pages: {
        'page-1': {
          id: 'page-1',
          title: 'Test Page',
          icon: '',
          coverUrl: '',
          parentId: null,
          blockIds: ['h1-block', 'p-block', 'h2-block', 'h3-block'],
          createdAt: '2026-01-01T00:00:00Z',
          updatedAt: '2026-01-01T00:00:00Z',
          isFavorite: false,
          lastViewedAt: null,
          trashedAt: null,
          properties: {},
        },
      },
      blocks: {
        'h1-block': { id: 'h1-block', type: 'heading1', content: 'Main Title', marks: [], children: [], properties: {} },
        'p-block': { id: 'p-block', type: 'paragraph', content: 'Some text', marks: [], children: [], properties: {} },
        'h2-block': { id: 'h2-block', type: 'heading2', content: 'Section A', marks: [], children: [], properties: {} },
        'h3-block': { id: 'h3-block', type: 'heading3', content: 'Subsection A.1', marks: [], children: [], properties: {} },
      },
    })
  })

  it('renders heading links from page blocks', () => {
    render(<TableOfContentsBlock pageId="page-1" />)
    expect(screen.getByText('Main Title')).toBeInTheDocument()
    expect(screen.getByText('Section A')).toBeInTheDocument()
    expect(screen.getByText('Subsection A.1')).toBeInTheDocument()
  })

  it('does not render non-heading blocks', () => {
    render(<TableOfContentsBlock pageId="page-1" />)
    expect(screen.queryByText('Some text')).not.toBeInTheDocument()
  })

  it('renders as nav with accessible label', () => {
    render(<TableOfContentsBlock pageId="page-1" />)
    expect(screen.getByRole('navigation', { name: 'Table of contents' })).toBeInTheDocument()
  })

  it('renders empty message when no headings exist', () => {
    useWorkspaceStore.setState({
      pages: {
        'page-2': {
          id: 'page-2',
          title: 'Empty',
          icon: '',
          coverUrl: '',
          parentId: null,
          blockIds: ['p-only'],
          createdAt: '2026-01-01T00:00:00Z',
          updatedAt: '2026-01-01T00:00:00Z',
          isFavorite: false,
          lastViewedAt: null,
          trashedAt: null,
          properties: {},
        },
      },
      blocks: {
        'p-only': { id: 'p-only', type: 'paragraph', content: 'Just text', marks: [], children: [], properties: {} },
      },
    })
    render(<TableOfContentsBlock pageId="page-2" />)
    expect(screen.getByText(/No headings found/)).toBeInTheDocument()
  })

  it('renders empty message for non-existent page', () => {
    render(<TableOfContentsBlock pageId="non-existent" />)
    expect(screen.getByText(/No headings found/)).toBeInTheDocument()
  })

  it('applies correct level classes', () => {
    const { container } = render(<TableOfContentsBlock pageId="page-1" />)
    expect(container.querySelector('.block-toc__item--level-1')).toBeInTheDocument()
    expect(container.querySelector('.block-toc__item--level-2')).toBeInTheDocument()
    expect(container.querySelector('.block-toc__item--level-3')).toBeInTheDocument()
  })

  it('renders heading links as buttons', () => {
    render(<TableOfContentsBlock pageId="page-1" />)
    const buttons = screen.getAllByRole('button')
    expect(buttons).toHaveLength(3)
  })
})
