import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ApiDocsPage from './ApiDocsPage'

vi.mock('../stores/useDeveloperStore', () => ({
  default: () => ({
    apiKeys: [
      {
        id: 'key_1',
        name: 'Production API Key',
        keyPrefix: 'sk_live_Ab',
        keyHash: 'hash_prod_a1b2c3',
        permissions: ['read', 'write', 'admin'],
        createdAt: '2025-11-15T10:30:00Z',
        lastUsedAt: '2026-02-08T14:22:00Z',
        expiresAt: null,
        status: 'active',
      },
    ],
  }),
}))

vi.mock('../components/EndpointCard/EndpointCard', () => ({
  default: ({ endpoint, expanded, onToggle }: { endpoint: { id: string; method: string; path: string; description: string }; expanded: boolean; onToggle: () => void }) => (
    <div data-testid={`endpoint-${endpoint.id}`}>
      <button onClick={onToggle}>
        {endpoint.method} {endpoint.path}
      </button>
      <span>{endpoint.description}</span>
      {expanded && <div data-testid="endpoint-expanded">Expanded</div>}
    </div>
  ),
}))

vi.mock('../components/CodeBlock/CodeBlock', () => ({
  default: ({ code }: { code: string }) => <pre data-testid="code-block">{code}</pre>,
}))

describe('ApiDocsPage', () => {
  it('renders the API Reference title', () => {
    render(<ApiDocsPage />)
    expect(screen.getByText('API Reference')).toBeInTheDocument()
  })

  it('renders the base URL', () => {
    render(<ApiDocsPage />)
    expect(screen.getByText('https://api.signof.io')).toBeInTheDocument()
  })

  it('renders category filter buttons', () => {
    render(<ApiDocsPage />)
    expect(screen.getByText(/All \(\d+\)/)).toBeInTheDocument()
    expect(screen.getByText(/Documents \(\d+\)/)).toBeInTheDocument()
    expect(screen.getByText(/Signers \(\d+\)/)).toBeInTheDocument()
    expect(screen.getByText(/Bookings \(\d+\)/)).toBeInTheDocument()
    expect(screen.getByText(/Databases \(\d+\)/)).toBeInTheDocument()
  })

  it('renders endpoint cards', () => {
    render(<ApiDocsPage />)
    expect(screen.getByText('List all documents')).toBeInTheDocument()
    expect(screen.getByText('Create a new document')).toBeInTheDocument()
  })

  it('filters endpoints by category', async () => {
    const user = userEvent.setup()
    render(<ApiDocsPage />)
    await user.click(screen.getByText(/Signers \(\d+\)/))
    expect(screen.getByText('Add a signer to a document')).toBeInTheDocument()
    expect(screen.getByText('List signers for a document')).toBeInTheDocument()
  })

  it('toggles endpoint expansion', async () => {
    const user = userEvent.setup()
    render(<ApiDocsPage />)
    const firstEndpoint = screen.getByText('GET /api/v1/documents')
    await user.click(firstEndpoint)
    expect(screen.getByTestId('endpoint-expanded')).toBeInTheDocument()
  })

  it('renders the authentication description', () => {
    render(<ApiDocsPage />)
    expect(
      screen.getByText(/require authentication via Bearer token/)
    ).toBeInTheDocument()
  })
})
