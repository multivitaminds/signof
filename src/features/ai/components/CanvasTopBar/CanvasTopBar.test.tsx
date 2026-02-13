import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import useCanvasStore from '../../stores/useCanvasStore'
import { AgentType, NodeStatus } from '../../types'
import CanvasTopBar from './CanvasTopBar'

describe('CanvasTopBar', () => {
  const onExecute = vi.fn()
  const onSave = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    useCanvasStore.setState({
      nodes: [
        { id: 'n1', agentType: AgentType.Planner, task: '', x: 0, y: 0, status: NodeStatus.Idle, output: null },
      ],
      workflowName: 'My Workflow',
    })
  })

  function renderBar(isExecuting = false) {
    return render(
      <CanvasTopBar onExecute={onExecute} onSave={onSave} isExecuting={isExecuting} />
    )
  }

  it('renders the workflow name', () => {
    renderBar()
    expect(screen.getByText('My Workflow')).toBeInTheDocument()
  })

  it('renders node count', () => {
    renderBar()
    expect(screen.getByText('1 node')).toBeInTheDocument()
  })

  it('renders Execute Workflow button', () => {
    renderBar()
    expect(screen.getByLabelText('Execute workflow')).toBeInTheDocument()
    expect(screen.getByText('Execute Workflow')).toBeInTheDocument()
  })

  it('renders Save button', () => {
    renderBar()
    expect(screen.getByLabelText('Save workflow')).toBeInTheDocument()
  })

  it('shows Running... when executing', () => {
    renderBar(true)
    expect(screen.getByText('Running...')).toBeInTheDocument()
  })

  it('disables execute when no nodes', () => {
    useCanvasStore.setState({ nodes: [] })
    renderBar()
    expect(screen.getByLabelText('Execute workflow')).toBeDisabled()
  })

  it('calls onExecute when button is clicked', async () => {
    const user = userEvent.setup()
    renderBar()
    await user.click(screen.getByLabelText('Execute workflow'))
    expect(onExecute).toHaveBeenCalled()
  })

  it('calls onSave when save is clicked', async () => {
    const user = userEvent.setup()
    renderBar()
    await user.click(screen.getByLabelText('Save workflow'))
    expect(onSave).toHaveBeenCalled()
  })

  it('allows editing the workflow name', async () => {
    const user = userEvent.setup()
    renderBar()

    await user.click(screen.getByLabelText('Edit workflow name'))
    const input = screen.getByLabelText('Workflow name')
    expect(input).toHaveValue('My Workflow')

    await user.clear(input)
    await user.type(input, 'New Name{Enter}')

    expect(screen.getByText('New Name')).toBeInTheDocument()
  })

  it('shows plural nodes when count > 1', () => {
    useCanvasStore.setState({
      nodes: [
        { id: 'n1', agentType: AgentType.Planner, task: '', x: 0, y: 0, status: NodeStatus.Idle, output: null },
        { id: 'n2', agentType: AgentType.Writer, task: '', x: 0, y: 0, status: NodeStatus.Idle, output: null },
      ],
    })
    renderBar()
    expect(screen.getByText('2 nodes')).toBeInTheDocument()
  })
})
