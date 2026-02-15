import { render, screen, act, fireEvent } from '@testing-library/react'
import MilestoneCelebration from './MilestoneCelebration'

describe('MilestoneCelebration', () => {
  const defaultProps = {
    sectionTitle: 'Personal Information',
    onContinue: vi.fn(),
  }

  beforeEach(() => {
    defaultProps.onContinue.mockClear()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders the section title with "Complete!" suffix', () => {
    render(<MilestoneCelebration {...defaultProps} />)
    expect(screen.getByText('Personal Information Complete!')).toBeInTheDocument()
  })

  it('renders a Continue button', () => {
    render(<MilestoneCelebration {...defaultProps} />)
    expect(screen.getByRole('button', { name: 'Continue' })).toBeInTheDocument()
  })

  it('has role="alert" for accessibility', () => {
    render(<MilestoneCelebration {...defaultProps} />)
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('calls onContinue when Continue button is clicked', () => {
    render(<MilestoneCelebration {...defaultProps} />)
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
    expect(defaultProps.onContinue).toHaveBeenCalledTimes(1)
  })

  it('auto-continues after 3 seconds', () => {
    render(<MilestoneCelebration {...defaultProps} />)
    expect(defaultProps.onContinue).not.toHaveBeenCalled()
    act(() => {
      vi.advanceTimersByTime(3000)
    })
    expect(defaultProps.onContinue).toHaveBeenCalledTimes(1)
  })

  it('does not auto-continue before 3 seconds', () => {
    render(<MilestoneCelebration {...defaultProps} />)
    act(() => {
      vi.advanceTimersByTime(2999)
    })
    expect(defaultProps.onContinue).not.toHaveBeenCalled()
  })

  it('cleans up timer on unmount', () => {
    const { unmount } = render(<MilestoneCelebration {...defaultProps} />)
    unmount()
    act(() => {
      vi.advanceTimersByTime(3000)
    })
    expect(defaultProps.onContinue).not.toHaveBeenCalled()
  })

  it('renders with a different section title', () => {
    render(
      <MilestoneCelebration {...defaultProps} sectionTitle="W-2 Income" />
    )
    expect(screen.getByText('W-2 Income Complete!')).toBeInTheDocument()
  })

  it('renders the heading as an h2', () => {
    render(<MilestoneCelebration {...defaultProps} />)
    const heading = screen.getByRole('heading', { level: 2 })
    expect(heading).toHaveTextContent('Personal Information Complete!')
  })
})
