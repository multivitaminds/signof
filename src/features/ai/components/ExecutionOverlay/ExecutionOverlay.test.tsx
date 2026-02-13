import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NodeStatus, AgentType } from '../../types'
import type { CanvasNode } from '../../types'
import ExecutionOverlay from './ExecutionOverlay'

const idleNode: CanvasNode = {
  id: 'n1',
  agentType: AgentType.Planner,
  task: 'Plan',
  x: 0,
  y: 0,
  status: NodeStatus.Idle,
  output: null,
}

const runningNode: CanvasNode = {
  ...idleNode,
  status: NodeStatus.Running,
}

const completedNode: CanvasNode = {
  ...idleNode,
  status: NodeStatus.Completed,
  output: 'Plan ready',
}

const errorNode: CanvasNode = {
  ...idleNode,
  id: 'n2',
  agentType: AgentType.Writer,
  status: NodeStatus.Error,
  output: 'Failed to write',
}

describe('ExecutionOverlay', () => {
  const onClear = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders nothing when all nodes are idle', () => {
    const { container } = render(
      <ExecutionOverlay nodes={[idleNode]} onClear={onClear} />
    )
    expect(container.firstChild).toBeNull()
  })

  it('shows Executing... when a node is running', () => {
    render(<ExecutionOverlay nodes={[runningNode]} onClear={onClear} />)
    expect(screen.getByText('Executing...')).toBeInTheDocument()
  })

  it('shows Execution Complete when all done', () => {
    render(<ExecutionOverlay nodes={[completedNode]} onClear={onClear} />)
    expect(screen.getByText('Execution Complete')).toBeInTheDocument()
  })

  it('shows Execution Failed when there is an error', () => {
    render(<ExecutionOverlay nodes={[errorNode]} onClear={onClear} />)
    expect(screen.getByText('Execution Failed')).toBeInTheDocument()
  })

  it('shows step progress count', () => {
    render(<ExecutionOverlay nodes={[completedNode, runningNode]} onClear={onClear} />)
    expect(screen.getByText('1/2 steps')).toBeInTheDocument()
  })

  it('shows step output text', () => {
    render(<ExecutionOverlay nodes={[completedNode]} onClear={onClear} />)
    expect(screen.getByText('Plan ready')).toBeInTheDocument()
  })

  it('shows Clear button when execution is complete', () => {
    render(<ExecutionOverlay nodes={[completedNode]} onClear={onClear} />)
    expect(screen.getByLabelText('Clear execution')).toBeInTheDocument()
  })

  it('does not show Clear button while running', () => {
    render(<ExecutionOverlay nodes={[runningNode]} onClear={onClear} />)
    expect(screen.queryByLabelText('Clear execution')).not.toBeInTheDocument()
  })

  it('calls onClear when Clear is clicked', async () => {
    const user = userEvent.setup()
    render(<ExecutionOverlay nodes={[completedNode]} onClear={onClear} />)

    await user.click(screen.getByLabelText('Clear execution'))
    expect(onClear).toHaveBeenCalled()
  })

  it('shows agent labels in steps', () => {
    render(<ExecutionOverlay nodes={[completedNode]} onClear={onClear} />)
    expect(screen.getByText('Planner')).toBeInTheDocument()
  })
})
