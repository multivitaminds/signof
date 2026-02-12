import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ShareBooking from './ShareBooking'
import { SAMPLE_EVENT_TYPES } from '../../lib/sampleData'
import type { EventType } from '../../types'

const mockEventType: EventType = { ...SAMPLE_EVENT_TYPES[0]! }

// Mock clipboard API — reset before each test so userEvent.setup() doesn't clobber it
const mockWriteText = vi.fn().mockResolvedValue(undefined)

function installClipboardMock() {
  Object.defineProperty(navigator, 'clipboard', {
    value: { writeText: mockWriteText },
    writable: true,
    configurable: true,
  })
}

describe('ShareBooking', () => {
  beforeEach(() => {
    mockWriteText.mockClear()
    installClipboardMock()
  })

  it('does not render when isOpen is false', () => {
    render(
      <ShareBooking eventType={mockEventType} isOpen={false} onClose={vi.fn()} />
    )
    expect(screen.queryByText('Share Booking Link')).not.toBeInTheDocument()
  })

  it('renders with all three tabs', () => {
    render(
      <ShareBooking eventType={mockEventType} isOpen={true} onClose={vi.fn()} />
    )
    expect(screen.getByText('Share Booking Link')).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /Link/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /Embed/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /Button/i })).toBeInTheDocument()
  })

  it('shows booking URL on the Link tab', () => {
    render(
      <ShareBooking eventType={mockEventType} isOpen={true} onClose={vi.fn()} />
    )
    const urlInput = screen.getByLabelText('Booking URL') as HTMLInputElement
    expect(urlInput.value).toContain(`/book/${mockEventType.slug}`)
  })

  it('copies booking URL when copy button is clicked', async () => {
    render(
      <ShareBooking eventType={mockEventType} isOpen={true} onClose={vi.fn()} />
    )

    // Use fireEvent to avoid userEvent clipboard interception
    fireEvent.click(screen.getByText('Copy'))

    await waitFor(() => {
      expect(mockWriteText).toHaveBeenCalledWith(
        expect.stringContaining(`/book/${mockEventType.slug}`)
      )
    })
    expect(screen.getByText('Copied!')).toBeInTheDocument()
  })

  it('shows embed code on the Embed tab', async () => {
    const user = userEvent.setup()
    render(
      <ShareBooking eventType={mockEventType} isOpen={true} onClose={vi.fn()} />
    )

    await user.click(screen.getByRole('tab', { name: /Embed/i }))

    const textarea = screen.getByLabelText('Embed code') as HTMLTextAreaElement
    expect(textarea.value).toContain('<iframe')
    expect(textarea.value).toContain(`/book/${mockEventType.slug}`)
    expect(textarea.value).toContain('height="700"')
  })

  it('copies embed code when button is clicked', async () => {
    const user = userEvent.setup()
    installClipboardMock() // Re-install after userEvent.setup()
    render(
      <ShareBooking eventType={mockEventType} isOpen={true} onClose={vi.fn()} />
    )

    await user.click(screen.getByRole('tab', { name: /Embed/i }))
    fireEvent.click(screen.getByText('Copy Embed Code'))

    await waitFor(() => {
      expect(mockWriteText).toHaveBeenCalledWith(
        expect.stringContaining('<iframe')
      )
    })
  })

  it('shows button HTML on the Button tab', async () => {
    const user = userEvent.setup()
    render(
      <ShareBooking eventType={mockEventType} isOpen={true} onClose={vi.fn()} />
    )

    await user.click(screen.getByRole('tab', { name: /Button/i }))

    const textarea = screen.getByLabelText('Button code') as HTMLTextAreaElement
    expect(textarea.value).toContain('<a href=')
    expect(textarea.value).toContain('Book a meeting')
    expect(textarea.value).toContain(`/book/${mockEventType.slug}`)
  })

  it('copies button code when button is clicked', async () => {
    const user = userEvent.setup()
    installClipboardMock() // Re-install after userEvent.setup()
    render(
      <ShareBooking eventType={mockEventType} isOpen={true} onClose={vi.fn()} />
    )

    await user.click(screen.getByRole('tab', { name: /Button/i }))
    fireEvent.click(screen.getByText('Copy Button Code'))

    await waitFor(() => {
      expect(mockWriteText).toHaveBeenCalledWith(
        expect.stringContaining('Book a meeting')
      )
    })
  })

  it('shows button preview with selected color', async () => {
    const user = userEvent.setup()
    render(
      <ShareBooking eventType={mockEventType} isOpen={true} onClose={vi.fn()} />
    )

    await user.click(screen.getByRole('tab', { name: /Button/i }))

    const preview = screen.getByText('Book a meeting')
    expect(preview).toBeInTheDocument()
    expect(preview).toHaveStyle({ backgroundColor: mockEventType.color })
  })

  it('calls onClose when overlay is clicked', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(
      <ShareBooking eventType={mockEventType} isOpen={true} onClose={onClose} />
    )

    // Click the overlay (modal-overlay)
    const overlay = document.querySelector('.modal-overlay')
    if (overlay) {
      await user.click(overlay)
    }
    expect(onClose).toHaveBeenCalled()
  })
})
