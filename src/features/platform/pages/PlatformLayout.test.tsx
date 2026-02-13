import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PlatformLayout from './PlatformLayout'

// Mock ModuleHeader
vi.mock('../../../components/ui/ModuleHeader', () => ({
  default: ({ title, subtitle }: { title: string; subtitle?: string }) => (
    <div data-testid="module-header">
      <h2>{title}</h2>
      {subtitle && <p>{subtitle}</p>}
    </div>
  ),
}))

describe('PlatformLayout', () => {
  it('renders the module header with title', () => {
    render(<PlatformLayout />)
    expect(screen.getByText('Platform')).toBeInTheDocument()
  })

  it('renders all navigation tabs', () => {
    render(<PlatformLayout />)
    // Use role queries to target nav buttons specifically
    const navButtons = screen.getAllByRole('button')
    const navLabels = navButtons.map(btn => btn.textContent)
    expect(navLabels).toContain('Overview')
    expect(navLabels).toContain('Agent Catalog')
    expect(navLabels).toContain('Integrations')
    expect(navLabels).toContain('Business')
    expect(navLabels).toContain('Roadmap')
  })

  it('starts with Overview tab active', () => {
    render(<PlatformLayout />)
    const overviewBtn = screen.getByText('Overview').closest('button')
    expect(overviewBtn).toHaveAttribute('aria-current', 'page')
  })

  it('switches tabs when clicked', async () => {
    const user = userEvent.setup()
    render(<PlatformLayout />)

    const agentTab = screen.getByText('Agent Catalog').closest('button')!
    await user.click(agentTab)

    expect(agentTab).toHaveAttribute('aria-current', 'page')

    // Overview tab should no longer be active
    const overviewBtn = screen.getByText('Overview').closest('button')
    expect(overviewBtn).not.toHaveAttribute('aria-current', 'page')
  })

  it('renders sidebar footer stats', () => {
    render(<PlatformLayout />)
    // Values may appear in both sidebar stats and page content
    expect(screen.getAllByText('185').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('739+').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('500+').length).toBeGreaterThanOrEqual(1)
  })
})
