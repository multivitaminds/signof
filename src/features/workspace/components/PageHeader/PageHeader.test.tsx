import { render, screen } from '@testing-library/react'
import PageHeader from './PageHeader'
import type { Page } from '../../types'

const mockPage: Page = {
  id: 'test-page',
  title: 'Test Page',
  icon: '📄',
  coverUrl: '',
  parentId: null,
  blockIds: [],
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
  isFavorite: false,
  lastViewedAt: null,
}

describe('PageHeader', () => {
  it('renders page title', () => {
    render(
      <PageHeader
        page={mockPage}
        onTitleChange={vi.fn()}
        onIconChange={vi.fn()}
      />
    )
    expect(screen.getByText('Test Page')).toBeInTheDocument()
  })

  it('renders page icon', () => {
    render(
      <PageHeader
        page={mockPage}
        onTitleChange={vi.fn()}
        onIconChange={vi.fn()}
      />
    )
    expect(screen.getByText('📄')).toBeInTheDocument()
  })

  it('shows change icon button', () => {
    render(
      <PageHeader
        page={mockPage}
        onTitleChange={vi.fn()}
        onIconChange={vi.fn()}
      />
    )
    expect(screen.getByLabelText('Change icon')).toBeInTheDocument()
  })
})
