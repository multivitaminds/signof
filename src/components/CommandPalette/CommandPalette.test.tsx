import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import CommandPalette from './CommandPalette'
import { useAppStore } from '../../stores/useAppStore'

vi.mock('../../features/workspace/stores/useWorkspaceStore', () => ({
  useWorkspaceStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({ pages: {} }),
}))

vi.mock('../../features/tax/stores/useTaxDocumentStore', () => ({
  useTaxDocumentStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({
      documents: [
        { id: 'td1', fileName: 'W-2_AcmeCorp_2025.pdf', formType: 'W2', taxYear: '2025', employerName: 'Acme Corporation', uploadDate: '2025-03-01', status: 'verified', fileSize: 1024, issueNote: '' },
      ],
    }),
}))

vi.mock('../../features/tax/stores/useTaxFilingStore', () => ({
  useTaxFilingStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({
      filings: [
        { id: 'f1', taxYear: '2025', state: 'filed', filingStatus: 'Single', firstName: 'Alex', lastName: 'Johnson', ssn: '***-**-4589', email: 'alex@test.com', phone: '', address: {}, wages: 85000, otherIncome: 0, totalIncome: 85000, useStandardDeduction: true, standardDeduction: 14600, itemizedDeductions: 0, effectiveDeduction: 14600, taxableIncome: 70400, federalTax: 10000, estimatedPayments: 0, withheld: 12000, refundOrOwed: -2000, createdAt: '2025-01-01', updatedAt: '2025-01-01', filedAt: '2025-04-01' },
      ],
    }),
}))

vi.mock('../../features/accounting/stores/useInvoiceStore', () => ({
  useInvoiceStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({
      invoices: [
        { id: 'inv1', invoiceNumber: 'INV-0001', customerId: 'c1', customerName: 'Acme Corp', issueDate: '2026-02-01', dueDate: '2026-03-03', paymentTerms: 'Net30', status: 'draft', lineItems: [], subtotal: 1200, taxRate: 0, taxAmount: 0, discount: 0, total: 1200, amountPaid: 0, balance: 1200, notes: '', createdAt: '2026-02-01' },
      ],
    }),
}))

vi.mock('../../features/ai/stores/useAIAgentStore', () => ({
  __esModule: true,
  default: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({
      runs: [
        { id: 'run1', agentType: 'researcher', task: 'Research Q4 metrics', steps: [], status: 'completed', startedAt: '2026-01-01', completedAt: '2026-01-02', lastRunAt: '2026-01-02' },
      ],
    }),
}))

function renderPalette() {
  return render(
    <MemoryRouter>
      <CommandPalette />
    </MemoryRouter>
  )
}

// scrollIntoView is not available in jsdom
beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn()
})

const PLACEHOLDER = 'Type a command or search... (> for commands)'

describe('CommandPalette', () => {
  beforeEach(() => {
    // Reset store state
    useAppStore.setState({
      commandPaletteOpen: false,
      recentItems: [],
      shortcutHelpOpen: false,
    })
  })

  it('renders nothing when closed', () => {
    renderPalette()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders the dialog when open', () => {
    useAppStore.setState({ commandPaletteOpen: true })
    renderPalette()
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByPlaceholderText(PLACEHOLDER)).toBeInTheDocument()
  })

  it('renders without errors with voice input integration', () => {
    useAppStore.setState({ commandPaletteOpen: true })
    renderPalette()
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByPlaceholderText(PLACEHOLDER)).toBeInTheDocument()
  })

  it('shows navigation commands by default', () => {
    useAppStore.setState({ commandPaletteOpen: true })
    renderPalette()
    expect(screen.getByText('Go to Home')).toBeInTheDocument()
    expect(screen.getByText('Go to Documents')).toBeInTheDocument()
    expect(screen.getByText('Go to Settings')).toBeInTheDocument()
  })

  it('shows action commands by default', () => {
    useAppStore.setState({ commandPaletteOpen: true })
    renderPalette()
    expect(screen.getByText('Create new page')).toBeInTheDocument()
    expect(screen.getByText('Toggle theme')).toBeInTheDocument()
    expect(screen.getByText('Keyboard shortcuts')).toBeInTheDocument()
  })

  it('filters commands on query input', async () => {
    const user = userEvent.setup()
    useAppStore.setState({ commandPaletteOpen: true })
    renderPalette()

    const input = screen.getByPlaceholderText(PLACEHOLDER)
    await user.type(input, 'home')

    expect(screen.getByText(/Home/)).toBeInTheDocument()
    // Non-matching items should be filtered
    expect(screen.queryByText('Go to Calendar')).not.toBeInTheDocument()
  })

  it('shows empty state with hint for no results', async () => {
    const user = userEvent.setup()
    useAppStore.setState({ commandPaletteOpen: true })
    renderPalette()

    const input = screen.getByPlaceholderText(PLACEHOLDER)
    await user.type(input, 'xyznonexistent')

    expect(screen.getByText(/No results found/)).toBeInTheDocument()
    expect(screen.getByText('Try searching for pages, documents, or commands')).toBeInTheDocument()
  })

  it('shows shortcut hints for navigation commands', () => {
    useAppStore.setState({ commandPaletteOpen: true })
    renderPalette()
    expect(screen.getByText('G H')).toBeInTheDocument()
    expect(screen.getByText('G D')).toBeInTheDocument()
  })

  it('closes on Escape key', async () => {
    const user = userEvent.setup()
    useAppStore.setState({ commandPaletteOpen: true })
    renderPalette()

    const input = screen.getByPlaceholderText(PLACEHOLDER)
    await user.type(input, '{Escape}')

    expect(useAppStore.getState().commandPaletteOpen).toBe(false)
  })

  it('closes on overlay click', async () => {
    const user = userEvent.setup()
    useAppStore.setState({ commandPaletteOpen: true })
    renderPalette()

    const overlay = screen.getByRole('dialog').parentElement!
    await user.click(overlay)

    expect(useAppStore.getState().commandPaletteOpen).toBe(false)
  })

  it('shows recent items when query is empty and recents exist', () => {
    useAppStore.setState({
      commandPaletteOpen: true,
      recentItems: [
        { path: '/pages', label: 'Pages', timestamp: Date.now() },
        { path: '/settings', label: 'Settings', timestamp: Date.now() - 1000 },
      ],
    })
    renderPalette()
    expect(screen.getByText('Recent')).toBeInTheDocument()
  })

  it('shows keyboard footer hints including > hint', () => {
    useAppStore.setState({ commandPaletteOpen: true })
    renderPalette()
    expect(screen.getByText('to navigate')).toBeInTheDocument()
    expect(screen.getByText('to select')).toBeInTheDocument()
    expect(screen.getByText('to close')).toBeInTheDocument()
    expect(screen.getByText('commands only')).toBeInTheDocument()
  })

  it('> prefix filters to commands only, hiding content results', async () => {
    const user = userEvent.setup()
    useAppStore.setState({ commandPaletteOpen: true })
    renderPalette()

    const input = screen.getByPlaceholderText(PLACEHOLDER)
    await user.type(input, '>home')

    // Navigation commands should still show
    expect(screen.getByText(/Home/)).toBeInTheDocument()
    // Content results (tax docs, invoices, etc.) should NOT appear
    expect(screen.queryByText('Tax')).not.toBeInTheDocument()
    expect(screen.queryByText('Invoices')).not.toBeInTheDocument()
    expect(screen.queryByText('Agent Runs')).not.toBeInTheDocument()
  })

  it('Cmd+K opens the command palette', () => {
    renderPalette()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))

    expect(useAppStore.getState().commandPaletteOpen).toBe(true)
  })

  it('shows tax document results when searching', async () => {
    const user = userEvent.setup()
    useAppStore.setState({ commandPaletteOpen: true })
    renderPalette()

    const input = screen.getByPlaceholderText(PLACEHOLDER)
    await user.type(input, 'AcmeCorp')

    // The description confirms the tax document result was found
    expect(screen.getByText(/W2 · Acme Corporation · 2025/)).toBeInTheDocument()
  })

  it('shows invoice results when searching', async () => {
    const user = userEvent.setup()
    useAppStore.setState({ commandPaletteOpen: true })
    renderPalette()

    const input = screen.getByPlaceholderText(PLACEHOLDER)
    await user.type(input, 'INV-0001')

    expect(screen.getByText(/INV-0001/)).toBeInTheDocument()
  })

  it('shows agent run results when searching', async () => {
    const user = userEvent.setup()
    useAppStore.setState({ commandPaletteOpen: true })
    renderPalette()

    const input = screen.getByPlaceholderText(PLACEHOLDER)
    await user.type(input, 'researcher')

    // Description contains agent type, confirming the result was found
    expect(screen.getByText('researcher agent · completed')).toBeInTheDocument()
  })

  it('shows type badges on content results', async () => {
    const user = userEvent.setup()
    useAppStore.setState({ commandPaletteOpen: true })
    renderPalette()

    const input = screen.getByPlaceholderText(PLACEHOLDER)
    await user.type(input, 'Acme')

    // Should show badge labels for content results
    const badges = document.querySelectorAll('.command-palette__badge')
    expect(badges.length).toBeGreaterThan(0)
  })
})
