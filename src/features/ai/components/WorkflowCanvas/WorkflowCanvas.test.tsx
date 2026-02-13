import { render, screen } from '@testing-library/react'
import useCanvasStore from '../../stores/useCanvasStore'
import { AgentType, NodeStatus } from '../../types'
import WorkflowCanvas from './WorkflowCanvas'

describe('WorkflowCanvas', () => {
  beforeEach(() => {
    useCanvasStore.setState({
      nodes: [],
      connections: [],
      viewport: { x: 0, y: 0, zoom: 1 },
      selectedNodeId: null,
      connectingFromId: null,
    })
  })

  it('renders the canvas container', () => {
    render(<WorkflowCanvas />)
    expect(screen.getByTestId('workflow-canvas')).toBeInTheDocument()
  })

  it('shows empty state when no nodes exist', () => {
    render(<WorkflowCanvas />)
    expect(screen.getByText('Build your workflow')).toBeInTheDocument()
    expect(screen.getByText('Add agents from the panel, connect them, then execute')).toBeInTheDocument()
  })

  it('renders nodes when they exist in the store', () => {
    useCanvasStore.setState({
      nodes: [
        { id: 'n1', agentType: AgentType.Planner, task: 'Plan it', x: 100, y: 100, status: NodeStatus.Idle, output: null },
        { id: 'n2', agentType: AgentType.Writer, task: 'Write it', x: 350, y: 100, status: NodeStatus.Idle, output: null },
      ],
    })

    render(<WorkflowCanvas />)
    expect(screen.getByText('Planner')).toBeInTheDocument()
    expect(screen.getByText('Writer')).toBeInTheDocument()
  })

  it('does not show empty state when nodes exist', () => {
    useCanvasStore.setState({
      nodes: [
        { id: 'n1', agentType: AgentType.Planner, task: 'Test', x: 100, y: 100, status: NodeStatus.Idle, output: null },
      ],
    })

    render(<WorkflowCanvas />)
    expect(screen.queryByText('Build your workflow')).not.toBeInTheDocument()
  })

  it('has application role with label', () => {
    render(<WorkflowCanvas />)
    expect(screen.getByRole('application', { name: 'Workflow canvas' })).toBeInTheDocument()
  })

  it('renders connections as SVG paths', () => {
    useCanvasStore.setState({
      nodes: [
        { id: 'n1', agentType: AgentType.Planner, task: 'Plan', x: 100, y: 100, status: NodeStatus.Idle, output: null },
        { id: 'n2', agentType: AgentType.Writer, task: 'Write', x: 350, y: 100, status: NodeStatus.Idle, output: null },
      ],
      connections: [
        { id: 'c1', sourceNodeId: 'n1', targetNodeId: 'n2', status: NodeStatus.Idle },
      ],
    })

    const { container } = render(<WorkflowCanvas />)
    const paths = container.querySelectorAll('.connection-line')
    expect(paths).toHaveLength(1)
  })
})
