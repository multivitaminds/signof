import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import NotFoundPage from './NotFoundPage'

const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

function renderNotFound() {
  return render(
    <MemoryRouter initialEntries={['/nonexistent']}>
      <NotFoundPage />
    </MemoryRouter>
  )
}

describe('NotFoundPage', () => {
  beforeEach(() => {
    mockNavigate.mockClear()
  })

  it('renders 404 error code', () => {
    renderNotFound()
    expect(screen.getByText('404')).toBeInTheDocument()
  })

  it('renders page not found title', () => {
    renderNotFound()
    expect(screen.getByText('Page not found')).toBeInTheDocument()
  })

  it('renders description text', () => {
    renderNotFound()
    expect(screen.getByText(/doesn't exist or has been moved/)).toBeInTheDocument()
  })

  it('renders Go Home link', () => {
    renderNotFound()
    const homeLink = screen.getByText('Go Home')
    expect(homeLink).toBeInTheDocument()
    expect(homeLink.closest('a')).toHaveAttribute('href', '/')
  })

  it('renders Go Back button that navigates back', async () => {
    const user = userEvent.setup()
    renderNotFound()

    const backButton = screen.getByText('Go Back')
    await user.click(backButton)
    expect(mockNavigate).toHaveBeenCalledWith(-1)
  })

  it('renders quick links section', () => {
    renderNotFound()
    expect(screen.getByText('Or jump to a section')).toBeInTheDocument()
  })

  it('renders all four quick link cards', () => {
    renderNotFound()
    expect(screen.getByText('Pages')).toBeInTheDocument()
    expect(screen.getByText('Projects')).toBeInTheDocument()
    expect(screen.getByText('Documents')).toBeInTheDocument()
    expect(screen.getByText('Calendar')).toBeInTheDocument()
  })

  it('quick links have correct href attributes', () => {
    renderNotFound()
    const pagesLink = screen.getByText('Pages').closest('a')
    expect(pagesLink).toHaveAttribute('href', '/pages')
    const projectsLink = screen.getByText('Projects').closest('a')
    expect(projectsLink).toHaveAttribute('href', '/projects')
    const documentsLink = screen.getByText('Documents').closest('a')
    expect(documentsLink).toHaveAttribute('href', '/documents')
    const calendarLink = screen.getByText('Calendar').closest('a')
    expect(calendarLink).toHaveAttribute('href', '/calendar')
  })

  it('renders the floating illustration', () => {
    const { container } = renderNotFound()
    const illustration = container.querySelector('.not-found__illustration')
    expect(illustration).toBeInTheDocument()
    expect(illustration).toHaveAttribute('aria-hidden', 'true')
  })
})
