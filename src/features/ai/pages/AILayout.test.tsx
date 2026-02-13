import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import AILayout from './AILayout'

describe('AILayout', () => {
  function renderWithRouter(initialEntry = '/copilot/memory') {
    return render(
      <MemoryRouter initialEntries={[initialEntry]}>
        <AILayout />
      </MemoryRouter>
    )
  }

  it('renders header with Copilot text', () => {
    renderWithRouter()
    expect(screen.getByText('Copilot')).toBeInTheDocument()
  })

  it('renders Context Memory tab link', () => {
    renderWithRouter()
    const memoryTab = screen.getByRole('link', { name: 'Context Memory' })
    expect(memoryTab).toBeInTheDocument()
    expect(memoryTab).toHaveAttribute('href', '/copilot/memory')
  })

  it('renders Agent Marketplace tab link', () => {
    renderWithRouter()
    const agentsTab = screen.getByRole('link', { name: 'Agent Marketplace' })
    expect(agentsTab).toBeInTheDocument()
    expect(agentsTab).toHaveAttribute('href', '/copilot/agents')
  })

  it('highlights the active tab', () => {
    renderWithRouter('/copilot/memory')
    const memoryTab = screen.getByRole('link', { name: 'Context Memory' })
    expect(memoryTab.className).toContain('ai-layout__tab--active')
  })
})
