import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'
import HomePage from './pages/HomePage'
import NotFoundPage from './pages/NotFoundPage'

function renderWithRouter(initialEntries = ['/']) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<HomePage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </MemoryRouter>
  )
}

describe('SignOf App', () => {
  it('renders the sidebar with brand', () => {
    renderWithRouter()
    expect(screen.getByText('SignOf')).toBeInTheDocument()
  })

  it('renders the home page welcome message', () => {
    renderWithRouter()
    expect(screen.getByText(/Welcome to SignOf/i)).toBeInTheDocument()
  })

  it('shows the command palette shortcut', () => {
    renderWithRouter()
    // Command palette trigger should be in the TopBar
    expect(screen.getByText(/⌘K/i)).toBeInTheDocument()
  })

  it('renders the 404 page for unknown routes', () => {
    renderWithRouter(['/nonexistent-route'])
    expect(screen.getByText('404')).toBeInTheDocument()
    expect(screen.getByText('Page not found')).toBeInTheDocument()
    expect(screen.getByText('Go home')).toBeInTheDocument()
    expect(screen.getByText('Go back')).toBeInTheDocument()
  })

  it('cycles theme on toggle button click', async () => {
    const user = userEvent.setup()
    renderWithRouter()

    // Default theme is 'system' → icon label = "System theme"
    const themeBtn = screen.getByLabelText('System theme')
    expect(themeBtn).toBeInTheDocument()

    // Cycle: system → light
    await user.click(themeBtn)
    expect(screen.getByLabelText('Light mode')).toBeInTheDocument()
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')

    // Cycle: light → dark
    await user.click(screen.getByLabelText('Light mode'))
    expect(screen.getByLabelText('Dark mode')).toBeInTheDocument()
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')

    // Cycle: dark → system
    await user.click(screen.getByLabelText('Dark mode'))
    expect(screen.getByLabelText('System theme')).toBeInTheDocument()
  })

  it('toggles sidebar with [ keyboard shortcut', () => {
    renderWithRouter()

    // Sidebar starts expanded — collapse button visible
    expect(screen.getByLabelText('Collapse sidebar')).toBeInTheDocument()

    // Press [ to toggle
    fireEvent.keyDown(document, { key: '[' })
    expect(screen.getByLabelText('Expand sidebar')).toBeInTheDocument()

    // Press [ again to re-expand
    fireEvent.keyDown(document, { key: '[' })
    expect(screen.getByLabelText('Collapse sidebar')).toBeInTheDocument()
  })

  it('has a hamburger menu button', () => {
    renderWithRouter()
    expect(screen.getByLabelText('Open menu')).toBeInTheDocument()
  })
})
