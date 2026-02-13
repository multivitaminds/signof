import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import DigestPreview from './DigestPreview'

const mockSetDigestFrequency = vi.fn()

const sampleNotifications = [
  {
    id: 'n1',
    type: 'document_signed',
    category: 'documents',
    title: 'Document signed',
    message: 'Doc was signed',
    read: false,
    archived: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    link: '/documents',
    actorName: 'Alex',
    actorAvatar: null,
    actionUrl: '/documents',
    actionLabel: 'View Document',
    sourceId: null,
  },
  {
    id: 'n2',
    type: 'booking',
    category: 'scheduling',
    title: 'New booking',
    message: 'Booking received',
    read: false,
    archived: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    link: '/scheduling',
    actorName: 'Maria',
    actorAvatar: null,
    actionUrl: '/scheduling',
    actionLabel: 'View Booking',
    sourceId: null,
  },
  {
    id: 'n3',
    type: 'status_change',
    category: 'projects',
    title: 'Issue completed',
    message: 'Issue moved to Done',
    read: true,
    archived: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    link: '/projects',
    actorName: 'Mike',
    actorAvatar: null,
    actionUrl: '/projects',
    actionLabel: 'View Issue',
    sourceId: null,
  },
  {
    id: 'n4',
    type: 'comment',
    category: 'workspace',
    title: 'New comment',
    message: 'A comment was left',
    read: true,
    archived: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    link: '/pages',
    actorName: 'Sarah',
    actorAvatar: null,
    actionUrl: null,
    actionLabel: null,
    sourceId: null,
  },
]

vi.mock('../../stores/useInboxStore', () => ({
  useInboxStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({
      notifications: sampleNotifications,
      digestFrequency: 'weekly',
      setDigestFrequency: mockSetDigestFrequency,
    }),
}))

describe('DigestPreview', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the digest preview header', () => {
    render(<DigestPreview />)
    expect(screen.getByText('Email Digest Preview')).toBeInTheDocument()
  })

  it('renders frequency selector with Daily, Weekly, Never options', () => {
    render(<DigestPreview />)
    expect(screen.getByText('Digest Frequency')).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'Daily' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'Weekly' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'Never' })).toBeInTheDocument()
  })

  it('shows Weekly as the active frequency', () => {
    render(<DigestPreview />)
    const weeklyBtn = screen.getByRole('radio', { name: 'Weekly' })
    expect(weeklyBtn).toHaveAttribute('aria-checked', 'true')
  })

  it('calls setDigestFrequency when a frequency option is clicked', async () => {
    const user = userEvent.setup()
    render(<DigestPreview />)

    await user.click(screen.getByRole('radio', { name: 'Daily' }))
    expect(mockSetDigestFrequency).toHaveBeenCalledWith('daily')
  })

  it('renders summary stats section', () => {
    render(<DigestPreview />)
    expect(screen.getByText('This Week at a Glance')).toBeInTheDocument()
    expect(screen.getByText('Documents Signed')).toBeInTheDocument()
    expect(screen.getByText('Bookings This Week')).toBeInTheDocument()
    expect(screen.getByText('Issues Completed')).toBeInTheDocument()
  })

  it('renders email header with From and Subject', () => {
    render(<DigestPreview />)
    expect(screen.getByText(/notifications@orchestree\.app/)).toBeInTheDocument()
    expect(screen.getByText(/Weekly Orchestree Digest/)).toBeInTheDocument()
  })

  it('renders all category sections', () => {
    render(<DigestPreview />)
    expect(screen.getByText('Documents')).toBeInTheDocument()
    expect(screen.getByText('Projects')).toBeInTheDocument()
    expect(screen.getByText('Scheduling')).toBeInTheDocument()
    expect(screen.getByText('Workspace')).toBeInTheDocument()
    expect(screen.getByText('System')).toBeInTheDocument()
  })

  it('renders the Send Test Digest button', () => {
    render(<DigestPreview />)
    expect(screen.getByText('Send Test Digest')).toBeInTheDocument()
  })

  it('toggles category expansion on click', async () => {
    const user = userEvent.setup()
    render(<DigestPreview />)

    // Click on Documents category header to expand
    const documentsHeader = screen.getByText('Documents').closest('button')
    expect(documentsHeader).toBeInTheDocument()
    if (!documentsHeader) return

    await user.click(documentsHeader)

    // After expanding, we should see the document notification title
    expect(screen.getByText('Document signed')).toBeInTheDocument()
  })

  it('simulates sending a test digest', async () => {
    const user = userEvent.setup()
    render(<DigestPreview />)

    const sendBtn = screen.getByText('Send Test Digest').closest('button')!
    await user.click(sendBtn)

    expect(screen.getByText('Sending...')).toBeInTheDocument()
  })
})
