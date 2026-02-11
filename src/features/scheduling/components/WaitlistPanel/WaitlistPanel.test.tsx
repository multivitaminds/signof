import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import WaitlistPanel from './WaitlistPanel'
import { useSchedulingStore } from '../../stores/useSchedulingStore'
import { SAMPLE_EVENT_TYPES } from '../../lib/sampleData'
import { WaitlistStatus } from '../../types'

function setupStoreEmpty() {
  useSchedulingStore.setState({
    eventTypes: [...SAMPLE_EVENT_TYPES],
    waitlist: [],
  })
}

function setupStoreWithEntries() {
  useSchedulingStore.setState({
    eventTypes: [...SAMPLE_EVENT_TYPES],
    waitlist: [
      {
        id: 'wl-1',
        eventTypeId: 'et-quick-chat',
        date: '2026-02-20',
        timeSlot: '10:00',
        name: 'Alice Waiting',
        email: 'alice@waitlist.com',
        status: WaitlistStatus.Waiting,
        createdAt: '2026-02-15T10:00:00Z',
      },
      {
        id: 'wl-2',
        eventTypeId: 'et-product-demo',
        date: '2026-02-20',
        timeSlot: '14:00',
        name: 'Bob Notified',
        email: 'bob@waitlist.com',
        status: WaitlistStatus.Notified,
        createdAt: '2026-02-15T11:00:00Z',
      },
      {
        id: 'wl-3',
        eventTypeId: 'et-quick-chat',
        date: '2026-02-21',
        timeSlot: '10:00',
        name: 'Carol Approved',
        email: 'carol@waitlist.com',
        status: WaitlistStatus.Approved,
        createdAt: '2026-02-14T10:00:00Z',
      },
      {
        id: 'wl-4',
        eventTypeId: 'et-quick-chat',
        date: '2026-02-21',
        timeSlot: '11:00',
        name: 'Dan Rejected',
        email: 'dan@waitlist.com',
        status: WaitlistStatus.Rejected,
        createdAt: '2026-02-14T11:00:00Z',
      },
    ],
  })
}

describe('WaitlistPanel', () => {
  it('shows empty state when no waitlist entries', () => {
    setupStoreEmpty()
    render(<WaitlistPanel />)

    expect(screen.getByText('No waitlist entries yet.')).toBeInTheDocument()
    expect(screen.getByText(/when event slots are full/i)).toBeInTheDocument()
  })

  it('renders the title with active count', () => {
    setupStoreWithEntries()
    render(<WaitlistPanel />)

    // 2 active entries (Waiting + Notified)
    expect(screen.getByText(/waitlist \(2 active\)/i)).toBeInTheDocument()
  })

  it('shows Active section header', () => {
    setupStoreWithEntries()
    render(<WaitlistPanel />)

    expect(screen.getByText('Active')).toBeInTheDocument()
  })

  it('shows Resolved section header', () => {
    setupStoreWithEntries()
    render(<WaitlistPanel />)

    expect(screen.getByText('Resolved')).toBeInTheDocument()
  })

  it('renders active entries with names and emails', () => {
    setupStoreWithEntries()
    render(<WaitlistPanel />)

    expect(screen.getByText('Alice Waiting')).toBeInTheDocument()
    expect(screen.getByText('alice@waitlist.com')).toBeInTheDocument()
    expect(screen.getByText('Bob Notified')).toBeInTheDocument()
    expect(screen.getByText('bob@waitlist.com')).toBeInTheDocument()
  })

  it('renders status labels for entries', () => {
    setupStoreWithEntries()
    render(<WaitlistPanel />)

    expect(screen.getByText('Waiting')).toBeInTheDocument()
    expect(screen.getByText('Notified')).toBeInTheDocument()
    expect(screen.getByText('Approved')).toBeInTheDocument()
    expect(screen.getByText('Rejected')).toBeInTheDocument()
  })

  it('renders Approve button for active entries', () => {
    setupStoreWithEntries()
    render(<WaitlistPanel />)

    expect(screen.getByRole('button', { name: /approve alice/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /approve bob/i })).toBeInTheDocument()
  })

  it('renders Reject button for active entries', () => {
    setupStoreWithEntries()
    render(<WaitlistPanel />)

    expect(screen.getByRole('button', { name: /reject alice/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /reject bob/i })).toBeInTheDocument()
  })

  it('approves a waitlist entry when Approve is clicked', async () => {
    const user = userEvent.setup()
    setupStoreWithEntries()
    render(<WaitlistPanel />)

    await user.click(screen.getByRole('button', { name: /approve alice/i }))

    const entry = useSchedulingStore.getState().waitlist.find(w => w.id === 'wl-1')
    expect(entry!.status).toBe(WaitlistStatus.Approved)
  })

  it('rejects a waitlist entry when Reject is clicked', async () => {
    const user = userEvent.setup()
    setupStoreWithEntries()
    render(<WaitlistPanel />)

    await user.click(screen.getByRole('button', { name: /reject alice/i }))

    const entry = useSchedulingStore.getState().waitlist.find(w => w.id === 'wl-1')
    expect(entry!.status).toBe(WaitlistStatus.Rejected)
  })

  it('removes a resolved entry when Remove is clicked', async () => {
    const user = userEvent.setup()
    setupStoreWithEntries()
    render(<WaitlistPanel />)

    await user.click(screen.getByRole('button', { name: /remove carol/i }))

    const entry = useSchedulingStore.getState().waitlist.find(w => w.id === 'wl-3')
    expect(entry).toBeUndefined()
  })

  it('shows event type names for entries', () => {
    setupStoreWithEntries()
    render(<WaitlistPanel />)

    expect(screen.getByText('Quick Chat')).toBeInTheDocument()
    expect(screen.getByText('Product Demo')).toBeInTheDocument()
  })
})
