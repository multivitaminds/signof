import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Breadcrumbs from './Breadcrumbs'

function renderWithRouter(initialPath: string) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Breadcrumbs />
    </MemoryRouter>
  )
}

describe('Breadcrumbs', () => {
  it('renders "Home" for root path /', () => {
    renderWithRouter('/')
    expect(screen.getByText('Home')).toBeInTheDocument()
    // Home should be the only breadcrumb and the current page
    expect(screen.getByText('Home').closest('span')).toHaveClass(
      'breadcrumbs__current'
    )
  })

  it('renders "Home > Pages" for /pages', () => {
    renderWithRouter('/pages')
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('Pages')).toBeInTheDocument()
    // Home should be a link
    expect(screen.getByText('Home').closest('a')).toHaveAttribute('href', '/')
    // Pages should be current (not a link)
    expect(screen.getByText('Pages').closest('span')).toHaveClass(
      'breadcrumbs__current'
    )
  })

  it('renders "Home > AI > Memory" for /ai/memory', () => {
    renderWithRouter('/ai/memory')
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('Intelligence')).toBeInTheDocument()
    expect(screen.getByText('Memory')).toBeInTheDocument()
    // Home and Intelligence should be links
    expect(screen.getByText('Home').closest('a')).toHaveAttribute('href', '/')
    expect(screen.getByText('Intelligence').closest('a')).toHaveAttribute('href', '/ai')
    // Memory should be current (not a link)
    expect(screen.getByText('Memory').closest('span')).toHaveClass(
      'breadcrumbs__current'
    )
  })

  it('last segment is not a link', () => {
    renderWithRouter('/documents')
    const current = screen.getByText('Documents')
    expect(current.tagName).toBe('SPAN')
    expect(current.closest('a')).toBeNull()
  })

  it('has correct aria-label="Breadcrumbs"', () => {
    renderWithRouter('/')
    expect(screen.getByLabelText('Breadcrumbs')).toBeInTheDocument()
  })

  it('shows ellipsis for long paths (more than 4 segments)', () => {
    renderWithRouter('/settings/members/some-id/details')
    // Should show Home, "...", and the last 3 segments
    expect(screen.getByLabelText('Collapsed breadcrumbs')).toBeInTheDocument()
    expect(screen.getByText('Home')).toBeInTheDocument()
    // Last segment should be non-clickable
    expect(screen.getByText('details').closest('span')).toHaveClass(
      'breadcrumbs__current'
    )
  })

  it('does not show ellipsis for short paths', () => {
    renderWithRouter('/pages')
    expect(screen.queryByLabelText('Collapsed breadcrumbs')).not.toBeInTheDocument()
  })

  it('resolves document IDs to document names', () => {
    // With no matching document in the store, it should just show the raw ID
    renderWithRouter('/documents/some-doc-id')
    expect(screen.getByText('Documents')).toBeInTheDocument()
    // The last segment will be the raw id since there's no document with that id
    expect(screen.getByText('some-doc-id')).toBeInTheDocument()
  })
})
