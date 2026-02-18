import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import DeveloperLayout from './DeveloperLayout'

vi.mock('../../../components/ui/ModuleHeader', () => ({
  default: ({ title, subtitle }: { title: string; subtitle?: string }) => (
    <div data-testid="module-header"><h1>{title}</h1>{subtitle && <p>{subtitle}</p>}</div>
  ),
}))

vi.mock('./ApiDocsPage', () => ({ default: () => <div data-testid="page-api-docs">ApiDocsPage</div> }))
vi.mock('./CliDocsPage', () => ({ default: () => <div data-testid="page-cli">CliDocsPage</div> }))
vi.mock('./WebhooksPage', () => ({ default: () => <div data-testid="page-webhooks">WebhooksPage</div> }))
vi.mock('./SdkPage', () => ({ default: () => <div data-testid="page-sdks">SdkPage</div> }))
vi.mock('./SandboxPage', () => ({ default: () => <div data-testid="page-sandbox">SandboxPage</div> }))
vi.mock('./ApiKeysPage', () => ({ default: () => <div data-testid="page-api-keys">ApiKeysPage</div> }))

describe('DeveloperLayout', () => {
  it('renders ModuleHeader with Developer title', () => {
    render(<DeveloperLayout />)
    expect(screen.getByText('Developer')).toBeInTheDocument()
  })

  it('renders all 6 navigation items', () => {
    render(<DeveloperLayout />)
    expect(screen.getByText('API Reference')).toBeInTheDocument()
    expect(screen.getByText('CLI')).toBeInTheDocument()
    expect(screen.getByText('Webhooks')).toBeInTheDocument()
    expect(screen.getByText('SDKs')).toBeInTheDocument()
    expect(screen.getByText('Sandbox')).toBeInTheDocument()
    expect(screen.getByText('API Keys')).toBeInTheDocument()
  })

  it('shows API Docs page by default', () => {
    render(<DeveloperLayout />)
    expect(screen.getByTestId('page-api-docs')).toBeInTheDocument()
  })

  it('sets aria-current on active tab', () => {
    render(<DeveloperLayout />)
    expect(screen.getByText('API Reference').closest('button')).toHaveAttribute('aria-current', 'page')
    expect(screen.getByText('CLI').closest('button')).not.toHaveAttribute('aria-current')
  })

  it('switches to CLI page when clicking CLI tab', async () => {
    const user = userEvent.setup()
    render(<DeveloperLayout />)
    await user.click(screen.getByText('CLI'))
    expect(screen.getByTestId('page-cli')).toBeInTheDocument()
    expect(screen.queryByTestId('page-api-docs')).not.toBeInTheDocument()
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

  it('renders external documentation links', () => {
    render(<DeveloperLayout />)
    const docsLink = screen.getByText('Full Documentation')
    expect(docsLink).toHaveAttribute('href', 'https://docs.orchestree.io')
    expect(docsLink).toHaveAttribute('target', '_blank')
    const statusLink = screen.getByText('API Status')
    expect(statusLink).toHaveAttribute('href', 'https://status.orchestree.io')
  })

})
