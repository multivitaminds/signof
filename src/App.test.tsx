import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'
import HomePage from './pages/HomePage'

function renderWithRouter(initialEntries = ['/']) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<HomePage />} />
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
})
