import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ChannelDigest from './ChannelDigest'

const mockSummarizeChannel = vi.fn()
const mockOnClose = vi.fn()

let mockStoreState = {
  isAnalyzing: false,
  lastAnalysis: null as { type: string; summary: string; items: string[]; timestamp: string } | null,
  summarizeChannel: mockSummarizeChannel,
}

vi.mock('../../stores/useChorusCopilotStore', () => ({
  useChorusCopilotStore: (selector: (s: typeof mockStoreState) => unknown) =>
    selector(mockStoreState),
}))

describe('ChannelDigest', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockStoreState = {
      isAnalyzing: false,
      lastAnalysis: null,
      summarizeChannel: mockSummarizeChannel,
    }
  })

  it('calls summarizeChannel on mount', () => {
    render(
      <ChannelDigest channelId="ch-1" channelName="general" onClose={mockOnClose} />
    )
    expect(mockSummarizeChannel).toHaveBeenCalledWith('ch-1')
  })

  it('shows channel name in title', () => {
    render(
      <ChannelDigest channelId="ch-1" channelName="general" onClose={mockOnClose} />
    )
    expect(screen.getByText('Channel Digest — #general')).toBeInTheDocument()
  })

  it('shows loading state when analyzing', () => {
    mockStoreState.isAnalyzing = true
    render(
      <ChannelDigest channelId="ch-1" channelName="general" onClose={mockOnClose} />
    )
    expect(screen.getByText('Analyzing channel activity...')).toBeInTheDocument()
  })

  it('shows empty state when no analysis', () => {
    render(
      <ChannelDigest channelId="ch-1" channelName="general" onClose={mockOnClose} />
    )
    expect(screen.getByText(/No digest available/)).toBeInTheDocument()
  })

  it('shows summary when channel_summary analysis exists', () => {
    mockStoreState.lastAnalysis = {
      type: 'channel_summary',
      summary: '10 messages from 3 participants.',
      items: ['5 questions raised', '2 active threads'],
      timestamp: '2026-01-01T00:00:00Z',
    }
    render(
      <ChannelDigest channelId="ch-1" channelName="general" onClose={mockOnClose} />
    )
    expect(screen.getByText('10 messages from 3 participants.')).toBeInTheDocument()
    expect(screen.getByText('5 questions raised')).toBeInTheDocument()
    expect(screen.getByText('2 active threads')).toBeInTheDocument()
  })

  it('calls onClose when close button clicked', async () => {
    const user = userEvent.setup()
    render(
      <ChannelDigest channelId="ch-1" channelName="general" onClose={mockOnClose} />
    )
    await user.click(screen.getByLabelText('Close digest'))
    expect(mockOnClose).toHaveBeenCalledOnce()
  })

  it('calls summarizeChannel on Regenerate click', async () => {
    const user = userEvent.setup()
    render(
      <ChannelDigest channelId="ch-1" channelName="general" onClose={mockOnClose} />
    )
    await user.click(screen.getByText('Regenerate'))
    // Called once on mount + once on click
    expect(mockSummarizeChannel).toHaveBeenCalledTimes(2)
  })

  it('has dialog role and aria-modal', () => {
    render(
      <ChannelDigest channelId="ch-1" channelName="general" onClose={mockOnClose} />
    )
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true')
  })
})
