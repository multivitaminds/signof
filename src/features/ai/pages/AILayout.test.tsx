import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import AILayout from './AILayout'

describe('AILayout', () => {
  function renderWithRouter(initialEntry = '/ai/memory') {
    return render(
      <MemoryRouter initialEntries={[initialEntry]}>
        <AILayout />
      </MemoryRouter>
    )
  }

  it('renders header with Intelligence text', () => {
    renderWithRouter()
    expect(screen.getByText('Intelligence')).toBeInTheDocument()
  })

  it('renders Context Memory tab link', () => {
    renderWithRouter()
    const memoryTab = screen.getByRole('link', { name: 'Context Memory' })
    expect(memoryTab).toBeInTheDocument()
    expect(memoryTab).toHaveAttribute('href', '/ai/memory')
  })

  it('renders Agent Marketplace tab link', () => {
    renderWithRouter()
    const agentsTab = screen.getByRole('link', { name: 'Agent Marketplace' })
    expect(agentsTab).toBeInTheDocument()
    expect(agentsTab).toHaveAttribute('href', '/ai/agents')
  })

  it('highlights the active tab', () => {
    renderWithRouter('/ai/memory')
    const memoryTab = screen.getByRole('link', { name: 'Context Memory' })
    expect(memoryTab.className).toContain('ai-layout__tab--active')
  })
})
