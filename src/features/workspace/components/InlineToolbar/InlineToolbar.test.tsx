import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import InlineToolbar from './InlineToolbar'
import { MarkType } from '../../types'

describe('InlineToolbar', () => {
  const defaultProps = {
    position: { x: 100, y: 200 },
    activeMarks: [] as MarkType[],
    onToggleMark: vi.fn(),
    onClose: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders formatting buttons', () => {
    render(<InlineToolbar {...defaultProps} />)
    expect(screen.getByLabelText('Bold')).toBeInTheDocument()
    expect(screen.getByLabelText('Italic')).toBeInTheDocument()
    expect(screen.getByLabelText('Underline')).toBeInTheDocument()
    expect(screen.getByLabelText('Code')).toBeInTheDocument()
  })

  it('shows active state for active marks', () => {
    render(<InlineToolbar {...defaultProps} activeMarks={[MarkType.Bold]} />)
    const boldBtn = screen.getByLabelText('Bold')
    expect(boldBtn).toHaveAttribute('aria-pressed', 'true')
  })

  it('calls onToggleMark when button clicked', async () => {
    const user = userEvent.setup()
    render(<InlineToolbar {...defaultProps} />)
    await user.click(screen.getByLabelText('Bold'))
    expect(defaultProps.onToggleMark).toHaveBeenCalledWith(MarkType.Bold)
  })
})
