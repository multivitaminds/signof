import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NodeStatus, AgentType } from '../../types'
import type { CanvasNode } from '../../types'
import useCanvasStore from '../../stores/useCanvasStore'
import NodeConfigPanel from './NodeConfigPanel'

const mockNode: CanvasNode = {
  id: 'node-1',
  agentType: AgentType.Planner,
  task: 'Plan the project',
  x: 100,
  y: 200,
  status: NodeStatus.Idle,
  output: null,
}

describe('NodeConfigPanel', () => {
  const onClose = vi.fn()
  const onTestStep = vi.fn()
  const onRemove = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    useCanvasStore.setState({
      nodes: [mockNode],
      connections: [],
      viewport: { x: 0, y: 0, zoom: 1 },
      selectedNodeId: null,
    })
  })

  function renderPanel(node: CanvasNode = mockNode) {
    return render(
      <NodeConfigPanel
        node={node}
        onClose={onClose}
        onTestStep={onTestStep}
        onRemove={onRemove}
      />
    )
  }

  it('renders the agent name', () => {
    renderPanel()
    expect(screen.getByText('Planner Agent')).toBeInTheDocument()
  })

  it('renders configuration tabs', () => {
    renderPanel()
    expect(screen.getByRole('tab', { name: 'Configuration' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Output' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Run History' })).toBeInTheDocument()
  })

  it('shows task textarea with current task', () => {
    renderPanel()
    expect(screen.getByLabelText('Task Description')).toHaveValue('Plan the project')
  })

  it('shows capabilities', () => {
    renderPanel()
    expect(screen.getByText('Task decomposition')).toBeInTheDocument()
  })

  it('shows use cases', () => {
    renderPanel()
    expect(screen.getByText('Break a product launch into phases')).toBeInTheDocument()
  })

  it('switches to output tab', async () => {
    const user = userEvent.setup()
    renderPanel()

    await user.click(screen.getByRole('tab', { name: 'Output' }))
    expect(screen.getByText('No output yet. Execute the workflow to see results.')).toBeInTheDocument()
  })

  it('shows output when node has output', async () => {
    const user = userEvent.setup()
    renderPanel({ ...mockNode, output: 'Task completed successfully' })

    await user.click(screen.getByRole('tab', { name: 'Output' }))
    expect(screen.getByText('Task completed successfully')).toBeInTheDocument()
  })

  it('switches to run history tab', async () => {
    const user = userEvent.setup()
    renderPanel()

    await user.click(screen.getByRole('tab', { name: 'Run History' }))
    expect(screen.getByText('No run history for this node.')).toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', async () => {
    const user = userEvent.setup()
    renderPanel()

    await user.click(screen.getByLabelText('Close configuration'))
    expect(onClose).toHaveBeenCalled()
  })

  it('calls onTestStep when Test Step is clicked', async () => {
    const user = userEvent.setup()
    renderPanel()

    await user.click(screen.getByLabelText('Test this step'))
    expect(onTestStep).toHaveBeenCalledWith('node-1')
  })

  it('calls onRemove when Remove is clicked', async () => {
    const user = userEvent.setup()
    renderPanel()

    await user.click(screen.getByLabelText('Remove this node'))
    expect(onRemove).toHaveBeenCalledWith('node-1')
  })
})
