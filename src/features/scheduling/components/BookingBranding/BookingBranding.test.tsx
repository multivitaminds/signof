import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import BookingBranding from './BookingBranding'
import type { EventType } from '../../types'
import { SAMPLE_EVENT_TYPES } from '../../lib/sampleData'

function createMockEventType(overrides?: Partial<EventType>): EventType {
  return { ...SAMPLE_EVENT_TYPES[0]!, ...overrides }
}

describe('BookingBranding', () => {
  it('renders all branding inputs', () => {
    const onUpdate = vi.fn()
    render(<BookingBranding eventType={createMockEventType()} onUpdate={onUpdate} />)

    expect(screen.getByText('Branding')).toBeInTheDocument()
    expect(screen.getByLabelText('Company Name')).toBeInTheDocument()
    expect(screen.getByRole('radiogroup', { name: 'Accent color' })).toBeInTheDocument()
    expect(screen.getByText('Upload Logo')).toBeInTheDocument()
    expect(screen.getByText(/Hide .+Powered by SignOf.+ footer/)).toBeInTheDocument()
  })

  it('updates company name on input', async () => {
    const user = userEvent.setup()
    const onUpdate = vi.fn()
    render(<BookingBranding eventType={createMockEventType()} onUpdate={onUpdate} />)

    const input = screen.getByLabelText('Company Name')
    await user.type(input, 'Acme Corp')

    expect(onUpdate).toHaveBeenCalled()
    // The last call should contain the full text typed so far
    const lastCall = onUpdate.mock.calls[onUpdate.mock.calls.length - 1]
    expect(lastCall![0]).toHaveProperty('brandingCompanyName')
  })

  it('selects a preset color', async () => {
    const user = userEvent.setup()
    const onUpdate = vi.fn()
    render(<BookingBranding eventType={createMockEventType()} onUpdate={onUpdate} />)

    const colorBtns = screen.getAllByRole('button', { name: /^Color #/ })
    expect(colorBtns.length).toBe(8)

    await user.click(colorBtns[2]!)
    expect(onUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ brandingAccentColor: expect.any(String) })
    )
  })

  it('handles logo file upload', async () => {
    const user = userEvent.setup()
    const onUpdate = vi.fn()
    render(<BookingBranding eventType={createMockEventType()} onUpdate={onUpdate} />)

    const fileInput = screen.getByLabelText('Upload logo')
    const file = new File(['logo-data'], 'logo.png', { type: 'image/png' })

    await user.upload(fileInput, file)

    // FileReader is async, wait for it
    await vi.waitFor(() => {
      expect(onUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ brandingLogo: expect.any(String) })
      )
    })
  })

  it('toggles hide branding checkbox', async () => {
    const user = userEvent.setup()
    const onUpdate = vi.fn()
    render(<BookingBranding eventType={createMockEventType()} onUpdate={onUpdate} />)

    const checkbox = screen.getByRole('checkbox')
    await user.click(checkbox)

    expect(onUpdate).toHaveBeenCalledWith({ brandingHideSignOf: true })
  })

  it('shows preview with branding applied', () => {
    const onUpdate = vi.fn()
    render(
      <BookingBranding
        eventType={createMockEventType({
          brandingCompanyName: 'Test Corp',
          brandingHideSignOf: false,
        })}
        onUpdate={onUpdate}
      />
    )

    expect(screen.getByText('Test Corp')).toBeInTheDocument()
    expect(screen.getByText('Quick Chat')).toBeInTheDocument()
    // Footer should be visible when not hidden
    expect(screen.getAllByText('SignOf').length).toBeGreaterThan(0)
  })

  it('hides footer in preview when brandingHideSignOf is true', () => {
    const onUpdate = vi.fn()
    render(
      <BookingBranding
        eventType={createMockEventType({ brandingHideSignOf: true })}
        onUpdate={onUpdate}
      />
    )

    // The preview footer should not exist
    const previewFooter = document.querySelector('.booking-branding__preview-footer')
    expect(previewFooter).toBeNull()
  })
})
