import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ApiKeysPage from './ApiKeysPage'
import useDeveloperStore from '../stores/useDeveloperStore'
import { ApiKeyPermission } from '../types'

function resetStore() {
  useDeveloperStore.setState({
    apiKeys: [
      {
        id: 'key_test_1',
        name: 'Active Key',
        keyPrefix: 'sk_live_Ab',
        keyHash: 'hash_test_1',
        permissions: [ApiKeyPermission.Read as typeof ApiKeyPermission.Read, ApiKeyPermission.Write as typeof ApiKeyPermission.Write],
        createdAt: '2025-12-01T10:00:00Z',
        lastUsedAt: '2026-01-15T14:00:00Z',
        expiresAt: null,
        status: 'active',
      },
      {
        id: 'key_test_2',
        name: 'Revoked Key',
        keyPrefix: 'sk_live_Cd',
        keyHash: 'hash_test_2',
        permissions: [ApiKeyPermission.Read as typeof ApiKeyPermission.Read],
        createdAt: '2025-11-01T10:00:00Z',
        lastUsedAt: null,
        expiresAt: null,
        status: 'revoked',
      },
    ],
    webhooks: [],
    deliveries: [],
  })
}

describe('ApiKeysPage', () => {
  beforeEach(() => {
    resetStore()
  })

  it('renders API keys title and sample keys', () => {
    render(<ApiKeysPage />)

    expect(screen.getByText('API Keys')).toBeInTheDocument()
    expect(screen.getByText('Active Key')).toBeInTheDocument()
    expect(screen.getByText('Revoked Key')).toBeInTheDocument()
  })

  it('shows Active and Revoked status badges', () => {
    render(<ApiKeysPage />)

    expect(screen.getByText('Active')).toBeInTheDocument()
    expect(screen.getByText('Revoked')).toBeInTheDocument()
  })

  it('shows create key form when clicking Create Key', async () => {
    const user = userEvent.setup()
    render(<ApiKeysPage />)

    await user.click(screen.getByText('Create Key'))
    expect(screen.getByText('Create New API Key')).toBeInTheDocument()
    expect(screen.getByLabelText('Key Name')).toBeInTheDocument()
    expect(screen.getByLabelText('Expiration')).toBeInTheDocument()
  })

  it('creates a new API key and shows it in modal', async () => {
    const user = userEvent.setup()

    // Mock clipboard (navigator.clipboard is a getter in jsdom)
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
      writable: true,
      configurable: true,
    })

    render(<ApiKeysPage />)

    await user.click(screen.getByText('Create Key'))
    await user.type(screen.getByLabelText('Key Name'), 'New Production Key')
    await user.click(screen.getByText('Create API Key'))

    // Modal should show
    expect(screen.getByText('API Key Created')).toBeInTheDocument()
    expect(screen.getByText('This key will not be shown again. Copy it now and store it securely.')).toBeInTheDocument()
  })

  it('shows permission badges for keys', () => {
    render(<ApiKeysPage />)

    // Active Key has Read + Write permissions
    const readBadges = screen.getAllByText('Read')
    expect(readBadges.length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('Write')).toBeInTheDocument()
  })

  it('renders security best practices', () => {
    render(<ApiKeysPage />)

    expect(screen.getByText('Security Best Practices')).toBeInTheDocument()
    expect(screen.getByText('Never expose API keys in client-side code or version control.')).toBeInTheDocument()
  })
})
