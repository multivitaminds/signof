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

  it('renders "Home › Pages" for /pages', () => {
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

  it('renders "Home › AI › Memory" for /ai/memory', () => {
    renderWithRouter('/ai/memory')
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('AI')).toBeInTheDocument()
    expect(screen.getByText('Memory')).toBeInTheDocument()
    // Home and AI should be links
    expect(screen.getByText('Home').closest('a')).toHaveAttribute('href', '/')
    expect(screen.getByText('AI').closest('a')).toHaveAttribute('href', '/ai')
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
})
