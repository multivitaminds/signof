import { render, screen } from '@testing-library/react'
import DateDivider from './DateDivider'

vi.mock('../../lib/chorusFormatters', () => ({
  formatDateDivider: (ts: string) => {
    if (ts.includes('2026-02-19')) return 'Today'
    if (ts.includes('2026-02-18')) return 'Yesterday'
    return 'Monday, February 17'
  },
}))

describe('DateDivider', () => {
  it('renders the formatted date label', () => {
    render(<DateDivider timestamp="2026-02-19T10:00:00Z" />)
    expect(screen.getByText('Today')).toBeInTheDocument()
  })

  it('renders with separator role', () => {
    render(<DateDivider timestamp="2026-02-19T10:00:00Z" />)
    expect(screen.getByLabelText('Today')).toBeInTheDocument()
  })

  it('has an accessible label', () => {
    render(<DateDivider timestamp="2026-02-18T10:00:00Z" />)
    expect(screen.getByLabelText('Yesterday')).toBeInTheDocument()
  })

  it('renders a past date', () => {
    render(<DateDivider timestamp="2026-02-17T10:00:00Z" />)
    expect(screen.getByText('Monday, February 17')).toBeInTheDocument()
  })
})
