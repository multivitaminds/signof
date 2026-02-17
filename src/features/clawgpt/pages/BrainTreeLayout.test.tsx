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

  it('renders header with ClawGPT title', () => {
    renderWithRouter()
    expect(screen.getByText('ClawGPT')).toBeInTheDocument()
  })

  it('renders subtitle text', () => {
    renderWithRouter()
    expect(
      screen.getByText('Central intelligence hub — route messages, manage skills, define your brain\'s personality')
    ).toBeInTheDocument()
  })

  it('renders Dashboard tab link', () => {
    renderWithRouter()
    const tab = screen.getByRole('link', { name: 'Dashboard' })
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

  it('renders Soul tab link', () => {
    renderWithRouter()
    const tab = screen.getByRole('link', { name: 'Soul' })
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
    const tab = screen.getByRole('link', { name: 'Dashboard' })
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
