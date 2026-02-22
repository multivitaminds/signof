import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import DocsHomePage from './DocsHomePage'

describe('DocsHomePage', () => {
  it('renders hero title and subtitle', () => {
    render(<DocsHomePage />)
    expect(screen.getByText('Build with OriginA')).toBeInTheDocument()
    expect(screen.getByText(/Everything you need to integrate/)).toBeInTheDocument()
  })

  it('renders all 4 quick start cards', () => {
    render(<DocsHomePage />)
    expect(screen.getByText('API Reference')).toBeInTheDocument()
    expect(screen.getByText('SDKs')).toBeInTheDocument()
    expect(screen.getByText('CLI & Shell')).toBeInTheDocument()
    expect(screen.getByText('Agent Toolkit')).toBeInTheDocument()
  })

  it('renders all 6 product API cards with endpoint counts', () => {
    render(<DocsHomePage />)
    expect(screen.getByText('Documents')).toBeInTheDocument()
    expect(screen.getByText('Projects')).toBeInTheDocument()
    expect(screen.getByText('Scheduling')).toBeInTheDocument()
    expect(screen.getByText('Databases')).toBeInTheDocument()
    expect(screen.getByText('AI Agents')).toBeInTheDocument()
    expect(screen.getByText('Tax & Accounting')).toBeInTheDocument()
    expect(screen.getByText('12 endpoints')).toBeInTheDocument()
    expect(screen.getByText('8 endpoints')).toBeInTheDocument()
  })

  it('renders all 4 getting started steps', () => {
    render(<DocsHomePage />)
    expect(screen.getByText('Get your API keys')).toBeInTheDocument()
    expect(screen.getByText('Install an SDK')).toBeInTheDocument()
    expect(screen.getByText('Make your first call')).toBeInTheDocument()
    expect(screen.getByText('Go live')).toBeInTheDocument()
  })

  it('renders all 4 resource links with correct hrefs', () => {
    render(<DocsHomePage />)
    const statusLink = screen.getByText('API Status').closest('a')
    expect(statusLink).toHaveAttribute('href', 'https://status.origina.io')
    const changelogLink = screen.getByText('Changelog').closest('a')
    expect(changelogLink).toHaveAttribute('href', 'https://origina.io/changelog')
  })

  it('calls onNavigate when clicking quick start card', async () => {
    const user = userEvent.setup()
    const onNavigate = vi.fn()
    render(<DocsHomePage onNavigate={onNavigate} />)
    await user.click(screen.getByText('API Reference').closest('[role="button"]')!)
    expect(onNavigate).toHaveBeenCalledWith('api-docs')
  })

  it('resource links open in new tab', () => {
    render(<DocsHomePage />)
    const links = screen.getAllByRole('link')
    links.forEach(link => {
      expect(link).toHaveAttribute('target', '_blank')
    })
  })
})
