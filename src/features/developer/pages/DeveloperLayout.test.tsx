import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import DeveloperLayout from './DeveloperLayout'

vi.mock('../../../components/ui/ModuleHeader', () => ({
  default: ({ title, subtitle }: { title: string; subtitle?: string }) => (
    <div data-testid="module-header"><h1>{title}</h1>{subtitle && <p>{subtitle}</p>}</div>
  ),
}))

vi.mock('../../../components/ui/DemoVideo', () => ({
  DemoVideoSection: () => <div data-testid="demo-videos">DemoVideos</div>,
}))

vi.mock('./ApiDocsPage', () => ({ default: () => <div data-testid="page-api-docs">ApiDocsPage</div> }))
vi.mock('./CliDocsPage', () => ({ default: () => <div data-testid="page-cli">CliDocsPage</div> }))
vi.mock('./WebhooksPage', () => ({ default: () => <div data-testid="page-webhooks">WebhooksPage</div> }))
vi.mock('./SdkPage', () => ({ default: () => <div data-testid="page-sdks">SdkPage</div> }))
vi.mock('./SandboxPage', () => ({ default: () => <div data-testid="page-sandbox">SandboxPage</div> }))
vi.mock('./ApiKeysPage', () => ({ default: () => <div data-testid="page-api-keys">ApiKeysPage</div> }))
vi.mock('./DocsHomePage', () => ({
  default: ({ onNavigate }: { onNavigate?: (tab: string) => void }) => (
    <div data-testid="page-overview">
      DocsHomePage
      <button onClick={() => onNavigate?.('api-docs')}>Go to API Docs</button>
    </div>
  ),
}))
vi.mock('./McpDocsPage', () => ({ default: () => <div data-testid="page-mcp">McpDocsPage</div> }))
vi.mock('./AgentToolkitPage', () => ({ default: () => <div data-testid="page-agent-toolkit">AgentToolkitPage</div> }))

describe('DeveloperLayout', () => {
  it('renders ModuleHeader with Developer title', () => {
    render(<DeveloperLayout />)
    expect(screen.getByText('Developer')).toBeInTheDocument()
  })

  it('renders all 9 navigation items', () => {
    render(<DeveloperLayout />)
    expect(screen.getByText('Overview')).toBeInTheDocument()
    expect(screen.getByText('API Reference')).toBeInTheDocument()
    expect(screen.getByText('SDKs')).toBeInTheDocument()
    expect(screen.getByText('CLI & Shell')).toBeInTheDocument()
    expect(screen.getByText('MCP')).toBeInTheDocument()
    expect(screen.getByText('Sandbox')).toBeInTheDocument()
    expect(screen.getByText('Webhooks')).toBeInTheDocument()
    expect(screen.getByText('API Keys')).toBeInTheDocument()
    expect(screen.getByText('Agent Toolkit')).toBeInTheDocument()
  })

  it('renders section headers', () => {
    render(<DeveloperLayout />)
    expect(screen.getByText('Getting Started')).toBeInTheDocument()
    expect(screen.getByText('Build')).toBeInTheDocument()
    expect(screen.getByText('Tools')).toBeInTheDocument()
    expect(screen.getByText('AI Platform')).toBeInTheDocument()
  })

  it('shows Overview page by default', () => {
    render(<DeveloperLayout />)
    expect(screen.getByTestId('page-overview')).toBeInTheDocument()
  })

  it('sets aria-current on active tab', () => {
    render(<DeveloperLayout />)
    expect(screen.getByText('Overview').closest('button')).toHaveAttribute('aria-current', 'page')
    expect(screen.getByText('API Reference').closest('button')).not.toHaveAttribute('aria-current')
  })

  it('switches to API Docs page when clicking API Reference tab', async () => {
    const user = userEvent.setup()
    render(<DeveloperLayout />)
    await user.click(screen.getByText('API Reference'))
    expect(screen.getByTestId('page-api-docs')).toBeInTheDocument()
    expect(screen.queryByTestId('page-overview')).not.toBeInTheDocument()
  })

  it('switches to CLI page when clicking CLI & Shell tab', async () => {
    const user = userEvent.setup()
    render(<DeveloperLayout />)
    await user.click(screen.getByText('CLI & Shell'))
    expect(screen.getByTestId('page-cli')).toBeInTheDocument()
  })

  it('switches to Webhooks page', async () => {
    const user = userEvent.setup()
    render(<DeveloperLayout />)
    await user.click(screen.getByText('Webhooks'))
    expect(screen.getByTestId('page-webhooks')).toBeInTheDocument()
  })

  it('switches to SDKs page', async () => {
    const user = userEvent.setup()
    render(<DeveloperLayout />)
    await user.click(screen.getByText('SDKs'))
    expect(screen.getByTestId('page-sdks')).toBeInTheDocument()
  })

  it('switches to Sandbox page', async () => {
    const user = userEvent.setup()
    render(<DeveloperLayout />)
    await user.click(screen.getByText('Sandbox'))
    expect(screen.getByTestId('page-sandbox')).toBeInTheDocument()
  })

  it('switches to API Keys page', async () => {
    const user = userEvent.setup()
    render(<DeveloperLayout />)
    await user.click(screen.getByText('API Keys'))
    expect(screen.getByTestId('page-api-keys')).toBeInTheDocument()
  })

  it('switches to MCP page', async () => {
    const user = userEvent.setup()
    render(<DeveloperLayout />)
    await user.click(screen.getByText('MCP'))
    expect(screen.getByTestId('page-mcp')).toBeInTheDocument()
  })

  it('switches to Agent Toolkit page', async () => {
    const user = userEvent.setup()
    render(<DeveloperLayout />)
    await user.click(screen.getByText('Agent Toolkit'))
    expect(screen.getByTestId('page-agent-toolkit')).toBeInTheDocument()
  })

  it('navigates from Overview via onNavigate callback', async () => {
    const user = userEvent.setup()
    render(<DeveloperLayout />)
    await user.click(screen.getByText('Go to API Docs'))
    expect(screen.getByTestId('page-api-docs')).toBeInTheDocument()
  })

  it('renders external documentation links', () => {
    render(<DeveloperLayout />)
    const docsLink = screen.getByText('Full Documentation')
    expect(docsLink).toHaveAttribute('href', 'https://docs.origina.io')
    expect(docsLink).toHaveAttribute('target', '_blank')
    const statusLink = screen.getByText('API Status')
    expect(statusLink).toHaveAttribute('href', 'https://status.origina.io')
  })

  it('renders DemoVideoSection', () => {
    render(<DeveloperLayout />)
    expect(screen.getByTestId('demo-videos')).toBeInTheDocument()
  })
})
