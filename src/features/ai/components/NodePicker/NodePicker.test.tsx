import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import NodePicker from './NodePicker'

describe('NodePicker', () => {
  const onClose = vi.fn()
  const onAddNode = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <NodePicker isOpen={false} onClose={onClose} onAddNode={onAddNode} />
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders the panel when isOpen is true', () => {
    render(<NodePicker isOpen={true} onClose={onClose} onAddNode={onAddNode} />)
    expect(screen.getByText('Add Node')).toBeInTheDocument()
  })

  it('renders search input', () => {
    render(<NodePicker isOpen={true} onClose={onClose} onAddNode={onAddNode} />)
    expect(screen.getByLabelText('Search agents')).toBeInTheDocument()
  })

  it('renders category groups', () => {
    render(<NodePicker isOpen={true} onClose={onClose} onAddNode={onAddNode} />)
    expect(screen.getByText('Core')).toBeInTheDocument()
    expect(screen.getByText('Creative')).toBeInTheDocument()
    expect(screen.getByText('Technical')).toBeInTheDocument()
  })

  it('renders agent items', () => {
    render(<NodePicker isOpen={true} onClose={onClose} onAddNode={onAddNode} />)
    expect(screen.getByText('Planner')).toBeInTheDocument()
    expect(screen.getByText('Researcher')).toBeInTheDocument()
    expect(screen.getByText('Writer')).toBeInTheDocument()
  })

  it('filters agents by search query', async () => {
    const user = userEvent.setup()
    render(<NodePicker isOpen={true} onClose={onClose} onAddNode={onAddNode} />)

    await user.type(screen.getByLabelText('Search agents'), 'security')

    expect(screen.getByText('Security')).toBeInTheDocument()
    expect(screen.queryByText('Planner')).not.toBeInTheDocument()
  })

  it('shows empty state when no agents match', async () => {
    const user = userEvent.setup()
    render(<NodePicker isOpen={true} onClose={onClose} onAddNode={onAddNode} />)

    await user.type(screen.getByLabelText('Search agents'), 'xyznonexistent')

    expect(screen.getByText('No agents match your search.')).toBeInTheDocument()
  })

  it('calls onAddNode when an agent is clicked', async () => {
    const user = userEvent.setup()
    render(<NodePicker isOpen={true} onClose={onClose} onAddNode={onAddNode} />)

    await user.click(screen.getByLabelText('Add Planner agent'))
    expect(onAddNode).toHaveBeenCalledWith('planner')
  })

  it('calls onClose when close button is clicked', async () => {
    const user = userEvent.setup()
    render(<NodePicker isOpen={true} onClose={onClose} onAddNode={onAddNode} />)

    await user.click(screen.getByLabelText('Close node picker'))
    expect(onClose).toHaveBeenCalled()
  })
})
