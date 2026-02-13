import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Circle } from 'lucide-react'
import { NodeStatus, AgentType, AgentCategory } from '../../types'
import type { CanvasNode as CanvasNodeType, AgentTypeDefinition } from '../../types'
import CanvasNode from './CanvasNode'

const mockDefinition: AgentTypeDefinition = {
  type: AgentType.Planner,
  label: 'Planner',
  description: 'Plans tasks',
  icon: 'ClipboardList',
  color: '#4F46E5',
  category: AgentCategory.Core,
  useCases: [],
  capabilities: [],
  defaultSteps: [],
}

const mockNode: CanvasNodeType = {
  id: 'node-1',
  agentType: AgentType.Planner,
  task: 'Plan the project',
  x: 100,
  y: 200,
  status: NodeStatus.Idle,
  output: null,
}

function renderNode(overrides?: Partial<CanvasNodeType>, isSelected = false) {
  const node = { ...mockNode, ...overrides }
  return render(
    <CanvasNode
      node={node}
      definition={mockDefinition}
      icon={Circle}
      isSelected={isSelected}
      onSelect={vi.fn()}
      onDragEnd={vi.fn()}
      onOutputClick={vi.fn()}
      onInputClick={vi.fn()}
    />
  )
}

describe('CanvasNode', () => {
  it('renders the agent label', () => {
    renderNode()
    expect(screen.getByText('Planner')).toBeInTheDocument()
  })

  it('renders the task text', () => {
    renderNode()
    expect(screen.getByText('Plan the project')).toBeInTheDocument()
  })

  it('shows "No task set" when task is empty', () => {
    renderNode({ task: '' })
    expect(screen.getByText('No task set')).toBeInTheDocument()
  })

  it('renders input and output ports', () => {
    renderNode()
    expect(screen.getByLabelText('Planner input port')).toBeInTheDocument()
    expect(screen.getByLabelText('Planner output port')).toBeInTheDocument()
  })

  it('has selected class when isSelected is true', () => {
    renderNode(undefined, true)
    const nodeEl = screen.getByRole('button', { name: /planner agent node/i })
    expect(nodeEl).toHaveClass('canvas-node--selected')
  })

  it('has running class when status is running', () => {
    renderNode({ status: NodeStatus.Running })
    const nodeEl = screen.getByRole('button', { name: /planner agent node/i })
    expect(nodeEl).toHaveClass('canvas-node--running')
  })

  it('has completed class when status is completed', () => {
    renderNode({ status: NodeStatus.Completed })
    const nodeEl = screen.getByRole('button', { name: /planner agent node/i })
    expect(nodeEl).toHaveClass('canvas-node--completed')
  })

  it('calls onSelect when clicked', async () => {
    const onSelect = vi.fn()
    const node = { ...mockNode }
    render(
      <CanvasNode
        node={node}
        definition={mockDefinition}
        icon={Circle}
        isSelected={false}
        onSelect={onSelect}
        onDragEnd={vi.fn()}
        onOutputClick={vi.fn()}
        onInputClick={vi.fn()}
      />
    )
    await userEvent.click(screen.getByRole('button', { name: /planner agent node/i }))
    expect(onSelect).toHaveBeenCalledWith('node-1')
  })

  it('calls onOutputClick when output port is clicked', async () => {
    const onOutputClick = vi.fn()
    render(
      <CanvasNode
        node={mockNode}
        definition={mockDefinition}
        icon={Circle}
        isSelected={false}
        onSelect={vi.fn()}
        onDragEnd={vi.fn()}
        onOutputClick={onOutputClick}
        onInputClick={vi.fn()}
      />
    )
    await userEvent.click(screen.getByLabelText('Planner output port'))
    expect(onOutputClick).toHaveBeenCalledWith('node-1')
  })
})
