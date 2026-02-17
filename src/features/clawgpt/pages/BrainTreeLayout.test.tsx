import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import BrainTreeLayout from './BrainTreeLayout'

describe('BrainTreeLayout', () => {
  function renderWithRouter(initialEntry = '/brain/dashboard') {
    return render(
      <MemoryRouter initialEntries={[initialEntry]}>
        <BrainTreeLayout />
      </MemoryRouter>
    )
  }

  it('renders header with Command Center title', () => {
    renderWithRouter()
    expect(screen.getByText('Command Center')).toBeInTheDocument()
  })

  it('renders subtitle text', () => {
    renderWithRouter()
    expect(
      screen.getByText('Manage your messaging channels, AI skills, and automations in one place')
    ).toBeInTheDocument()
  })

  it('renders Overview tab link', () => {
    renderWithRouter()
    const tab = screen.getByRole('link', { name: 'Overview' })
    expect(tab).toBeInTheDocument()
    expect(tab).toHaveAttribute('href', '/brain/dashboard')
  })

  it('renders Channels tab link', () => {
    renderWithRouter()
    const tab = screen.getByRole('link', { name: 'Channels' })
    expect(tab).toBeInTheDocument()
    expect(tab).toHaveAttribute('href', '/brain/channels')
  })

  it('renders Inbox tab link', () => {
    renderWithRouter()
    const tab = screen.getByRole('link', { name: 'Inbox' })
    expect(tab).toBeInTheDocument()
    expect(tab).toHaveAttribute('href', '/brain/inbox')
  })

  it('renders Skills tab link', () => {
    renderWithRouter()
    const tab = screen.getByRole('link', { name: 'Skills' })
    expect(tab).toBeInTheDocument()
    expect(tab).toHaveAttribute('href', '/brain/skills')
  })

  it('renders Personality tab link', () => {
    renderWithRouter()
    const tab = screen.getByRole('link', { name: 'Personality' })
    expect(tab).toBeInTheDocument()
    expect(tab).toHaveAttribute('href', '/brain/soul')
  })

  it('renders Devices tab link', () => {
    renderWithRouter()
    const tab = screen.getByRole('link', { name: 'Devices' })
    expect(tab).toBeInTheDocument()
    expect(tab).toHaveAttribute('href', '/brain/devices')
  })

  it('highlights the active tab', () => {
    renderWithRouter('/brain/dashboard')
    const tab = screen.getByRole('link', { name: 'Overview' })
    expect(tab.className).toContain('clawgpt-layout__tab--active')
  })

  it('renders all 6 tab links', () => {
    renderWithRouter()
    const links = screen.getAllByRole('link')
    const tabLinks = links.filter((link) =>
      link.className.includes('clawgpt-layout__tab')
    )
    expect(tabLinks).toHaveLength(6)
  })
})
