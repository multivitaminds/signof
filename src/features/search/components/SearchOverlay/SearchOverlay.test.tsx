import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import SearchOverlay from './SearchOverlay'
import { useSearchStore } from '../../stores/useSearchStore'

// Mock all external stores the search store depends on
vi.mock('../../../../stores/useDocumentStore', () => ({
  useDocumentStore: {
    getState: () => ({
      documents: [
        { id: '1', name: 'Employment Agreement', status: 'pending', createdAt: '2026-01-01', signers: [] },
      ],
    }),
  },
}))

vi.mock('../../../../features/projects/stores/useProjectStore', () => ({
  useProjectStore: {
    getState: () => ({
      issues: {},
      projects: {},
    }),
  },
}))

vi.mock('../../../../features/scheduling/stores/useSchedulingStore', () => ({
  useSchedulingStore: {
    getState: () => ({
      bookings: [],
    }),
  },
}))

vi.mock('../../../../features/workspace/stores/useWorkspaceStore', () => ({
  useWorkspaceStore: {
    getState: () => ({
      pages: {},
    }),
  },
}))

vi.mock('../../../../features/databases/stores/useDatabaseStore', () => ({
  useDatabaseStore: {
    getState: () => ({
      databases: {},
    }),
  },
}))

vi.mock('../../../../features/inbox/stores/useInboxStore', () => ({
  useInboxStore: {
    getState: () => ({
      notifications: [],
    }),
  },
}))

vi.mock('../../../../features/ai/stores/useAIAgentStore', () => ({
  __esModule: true,
  default: {
    getState: () => ({
      runs: [],
    }),
  },
}))

vi.mock('../../../../features/tax/stores/useTaxStore', () => ({
  useTaxStore: {
    getState: () => ({
      deadlines: [],
    }),
  },
}))

vi.mock('../../../../features/accounting/stores/useInvoiceStore', () => ({
  useInvoiceStore: {
    getState: () => ({
      invoices: [],
    }),
  },
}))

vi.mock('../../../../features/documents/stores/useContactStore', () => ({
  useContactStore: {
    getState: () => ({
      contacts: [],
    }),
  },
}))

function renderOverlay(isOpen = true, onClose = vi.fn()) {
  return render(
    <MemoryRouter>
      <SearchOverlay isOpen={isOpen} onClose={onClose} />
    </MemoryRouter>
  )
}

describe('SearchOverlay', () => {
  beforeEach(() => {
    const store = useSearchStore.getState()
    store.clearResults()
    store.clearRecentSearches()
  })

  it('renders nothing when closed', () => {
    const { container } = renderOverlay(false)
    expect(container.querySelector('.search-overlay')).toBeNull()
  })

  it('renders the search overlay when open', () => {
    renderOverlay()
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByLabelText('Search input')).toBeInTheDocument()
  })

  it('focuses the search input on open', async () => {
    renderOverlay()
    await vi.waitFor(() => {
      expect(screen.getByLabelText('Search input')).toHaveFocus()
    })
  })

  it('shows module filter chips', () => {
    renderOverlay()
    expect(screen.getByText('Documents')).toBeInTheDocument()
    expect(screen.getByText('Pages')).toBeInTheDocument()
    expect(screen.getByText('Issues')).toBeInTheDocument()
    expect(screen.getByText('Events')).toBeInTheDocument()
    expect(screen.getByText('Databases')).toBeInTheDocument()
    expect(screen.getByText('Contacts')).toBeInTheDocument()
    expect(screen.getByText('Invoices')).toBeInTheDocument()
    expect(screen.getByText('Agents')).toBeInTheDocument()
    expect(screen.getByText('Tax')).toBeInTheDocument()
  })

  it('toggles module filter chips on click', async () => {
    const user = userEvent.setup()
    renderOverlay()
    const docsChip = screen.getByText('Documents')
    await user.click(docsChip)
    expect(docsChip.className).toContain('search-overlay__filter-chip--active')
    await user.click(docsChip)
    expect(docsChip.className).not.toContain('search-overlay__filter-chip--active')
  })

  it('shows recent searches when query is empty', () => {
    useSearchStore.getState().addRecentSearch('previous search')
    renderOverlay()
    expect(screen.getByText('Recent Searches')).toBeInTheDocument()
    expect(screen.getByText('previous search')).toBeInTheDocument()
  })

  it('clears recent searches', async () => {
    const user = userEvent.setup()
    useSearchStore.getState().addRecentSearch('old query')
    renderOverlay()
    const clearBtn = screen.getByLabelText('Clear recent searches')
    await user.click(clearBtn)
    expect(screen.queryByText('old query')).not.toBeInTheDocument()
  })

  it('calls onClose when Escape is pressed', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    renderOverlay(true, onClose)
    const input = screen.getByLabelText('Search input')
    await user.type(input, '{Escape}')
    expect(onClose).toHaveBeenCalled()
  })

  it('calls onClose when close button is clicked', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    renderOverlay(true, onClose)
    const closeBtn = screen.getByLabelText('Close search')
    await user.click(closeBtn)
    expect(onClose).toHaveBeenCalled()
  })

  it('calls onClose when overlay backdrop is clicked', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    const { container } = renderOverlay(true, onClose)
    const overlay = container.querySelector('.search-overlay')!
    await user.click(overlay)
    expect(onClose).toHaveBeenCalled()
  })

  it('shows empty state for queries with no results', async () => {
    const user = userEvent.setup()
    renderOverlay()
    const input = screen.getByLabelText('Search input')
    await user.type(input, 'zzzznonexistent')
    await waitFor(() => {
      expect(screen.getByText('No results found')).toBeInTheDocument()
    })
  })

  it('shows search results after typing', async () => {
    const user = userEvent.setup()
    renderOverlay()
    const input = screen.getByLabelText('Search input')
    await user.type(input, 'Employment')
    // Results are highlighted with <mark> tags, so text is split across elements.
    // Check for the result badge or the containing button instead.
    await waitFor(() => {
      expect(screen.getByText('Document')).toBeInTheDocument()
    })
    // Verify a search result button is rendered
    const resultButtons = document.querySelectorAll('.search-result')
    expect(resultButtons.length).toBeGreaterThan(0)
  })

  it('renders footer with navigation hints', () => {
    renderOverlay()
    expect(screen.getByText('navigate')).toBeInTheDocument()
    expect(screen.getByText('open')).toBeInTheDocument()
    expect(screen.getByText('close')).toBeInTheDocument()
  })
})
