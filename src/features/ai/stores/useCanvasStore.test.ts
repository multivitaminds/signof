import useCanvasStore from './useCanvasStore'
import { AgentType, CanvasMode, NodeStatus } from '../types'
import type { WorkflowTemplate } from '../lib/workflowTemplates'

describe('useCanvasStore', () => {
  beforeEach(() => {
    useCanvasStore.getState().clearCanvas()
  })

  describe('initial state', () => {
    it('starts with empty canvas', () => {
      const state = useCanvasStore.getState()
      expect(state.nodes).toEqual([])
      expect(state.connections).toEqual([])
      expect(state.selectedNodeId).toBeNull()
      expect(state.connectingFromId).toBeNull()
      expect(state.workflowName).toBe('Untitled Workflow')
      expect(state.mode).toBe(CanvasMode.Select)
      expect(state.viewport).toEqual({ x: 0, y: 0, zoom: 1 })
    })
  })

  describe('addNode', () => {
    it('adds a node and returns its id', () => {
      const id = useCanvasStore.getState().addNode(AgentType.Researcher, 100, 200)
      expect(id).toBeTruthy()
      const nodes = useCanvasStore.getState().nodes
      expect(nodes).toHaveLength(1)
      expect(nodes[0]!.agentType).toBe(AgentType.Researcher)
      expect(nodes[0]!.x).toBe(100)
      expect(nodes[0]!.y).toBe(200)
      expect(nodes[0]!.status).toBe(NodeStatus.Idle)
      expect(nodes[0]!.task).toBe('')
    })

    it('sets task when provided', () => {
      useCanvasStore.getState().addNode(AgentType.Writer, 0, 0, 'Write a blog post')
      expect(useCanvasStore.getState().nodes[0]!.task).toBe('Write a blog post')
    })
  })

  describe('removeNode', () => {
    it('removes the node by id', () => {
      const id = useCanvasStore.getState().addNode(AgentType.Planner, 0, 0)
      useCanvasStore.getState().removeNode(id)
      expect(useCanvasStore.getState().nodes).toHaveLength(0)
    })

    it('removes connections involving the node', () => {
      const id1 = useCanvasStore.getState().addNode(AgentType.Planner, 0, 0)
      const id2 = useCanvasStore.getState().addNode(AgentType.Writer, 200, 0)
      useCanvasStore.getState().addConnection(id1, id2)
      expect(useCanvasStore.getState().connections).toHaveLength(1)

      useCanvasStore.getState().removeNode(id1)
      expect(useCanvasStore.getState().connections).toHaveLength(0)
    })

    it('clears selectedNodeId if removed node was selected', () => {
      const id = useCanvasStore.getState().addNode(AgentType.Analyst, 0, 0)
      useCanvasStore.getState().selectNode(id)
      useCanvasStore.getState().removeNode(id)
      expect(useCanvasStore.getState().selectedNodeId).toBeNull()
    })
  })

  describe('updateNodePosition', () => {
    it('moves a node to new coordinates', () => {
      const id = useCanvasStore.getState().addNode(AgentType.Researcher, 0, 0)
      useCanvasStore.getState().updateNodePosition(id, 300, 400)
      const node = useCanvasStore.getState().nodes[0]!
      expect(node.x).toBe(300)
      expect(node.y).toBe(400)
    })
  })

  describe('updateNodeTask', () => {
    it('updates the task text', () => {
      const id = useCanvasStore.getState().addNode(AgentType.Writer, 0, 0)
      useCanvasStore.getState().updateNodeTask(id, 'New task description')
      expect(useCanvasStore.getState().nodes[0]!.task).toBe('New task description')
    })
  })

  describe('updateNodeStatus', () => {
    it('sets status on a node', () => {
      const id = useCanvasStore.getState().addNode(AgentType.Researcher, 0, 0)
      useCanvasStore.getState().updateNodeStatus(id, NodeStatus.Running)
      expect(useCanvasStore.getState().nodes[0]!.status).toBe(NodeStatus.Running)
    })

    it('sets output when provided', () => {
      const id = useCanvasStore.getState().addNode(AgentType.Researcher, 0, 0)
      useCanvasStore.getState().updateNodeStatus(id, NodeStatus.Completed, 'Result data')
      const node = useCanvasStore.getState().nodes[0]!
      expect(node.status).toBe(NodeStatus.Completed)
      expect(node.output).toBe('Result data')
    })
  })

  describe('selectNode', () => {
    it('selects a node by id', () => {
      const id = useCanvasStore.getState().addNode(AgentType.Planner, 0, 0)
      useCanvasStore.getState().selectNode(id)
      expect(useCanvasStore.getState().selectedNodeId).toBe(id)
    })

    it('deselects with null', () => {
      const id = useCanvasStore.getState().addNode(AgentType.Planner, 0, 0)
      useCanvasStore.getState().selectNode(id)
      useCanvasStore.getState().selectNode(null)
      expect(useCanvasStore.getState().selectedNodeId).toBeNull()
    })
  })

  describe('setMode', () => {
    it('changes canvas mode and clears connecting state', () => {
      const id = useCanvasStore.getState().addNode(AgentType.Planner, 0, 0)
      useCanvasStore.getState().startConnecting(id)
      useCanvasStore.getState().setMode(CanvasMode.Pan)
      expect(useCanvasStore.getState().mode).toBe(CanvasMode.Pan)
      expect(useCanvasStore.getState().connectingFromId).toBeNull()
    })
  })

  describe('connection flow', () => {
    it('creates a connection via startConnecting → completeConnection', () => {
      const id1 = useCanvasStore.getState().addNode(AgentType.Planner, 0, 0)
      const id2 = useCanvasStore.getState().addNode(AgentType.Writer, 200, 0)

      useCanvasStore.getState().startConnecting(id1)
      expect(useCanvasStore.getState().connectingFromId).toBe(id1)

      useCanvasStore.getState().completeConnection(id2)
      expect(useCanvasStore.getState().connections).toHaveLength(1)
      expect(useCanvasStore.getState().connectingFromId).toBeNull()
      const conn = useCanvasStore.getState().connections[0]!
      expect(conn.sourceNodeId).toBe(id1)
      expect(conn.targetNodeId).toBe(id2)
    })

    it('prevents self-connections', () => {
      const id = useCanvasStore.getState().addNode(AgentType.Planner, 0, 0)
      useCanvasStore.getState().startConnecting(id)
      useCanvasStore.getState().completeConnection(id)
      expect(useCanvasStore.getState().connections).toHaveLength(0)
    })

    it('prevents duplicate connections', () => {
      const id1 = useCanvasStore.getState().addNode(AgentType.Planner, 0, 0)
      const id2 = useCanvasStore.getState().addNode(AgentType.Writer, 200, 0)

      useCanvasStore.getState().addConnection(id1, id2)
      useCanvasStore.getState().startConnecting(id1)
      useCanvasStore.getState().completeConnection(id2)
      expect(useCanvasStore.getState().connections).toHaveLength(1)
    })

    it('cancelConnecting clears connecting state', () => {
      const id = useCanvasStore.getState().addNode(AgentType.Planner, 0, 0)
      useCanvasStore.getState().startConnecting(id)
      useCanvasStore.getState().cancelConnecting()
      expect(useCanvasStore.getState().connectingFromId).toBeNull()
    })
  })

  describe('addConnection', () => {
    it('adds a connection between two nodes', () => {
      const id1 = useCanvasStore.getState().addNode(AgentType.Researcher, 0, 0)
      const id2 = useCanvasStore.getState().addNode(AgentType.Writer, 200, 0)
      useCanvasStore.getState().addConnection(id1, id2)
      expect(useCanvasStore.getState().connections).toHaveLength(1)
    })

    it('prevents self-connections via addConnection', () => {
      const id = useCanvasStore.getState().addNode(AgentType.Researcher, 0, 0)
      useCanvasStore.getState().addConnection(id, id)
      expect(useCanvasStore.getState().connections).toHaveLength(0)
    })

    it('prevents duplicate connections via addConnection', () => {
      const id1 = useCanvasStore.getState().addNode(AgentType.Researcher, 0, 0)
      const id2 = useCanvasStore.getState().addNode(AgentType.Writer, 200, 0)
      useCanvasStore.getState().addConnection(id1, id2)
      useCanvasStore.getState().addConnection(id1, id2)
      expect(useCanvasStore.getState().connections).toHaveLength(1)
    })
  })

  describe('removeConnection', () => {
    it('removes a connection by id', () => {
      const id1 = useCanvasStore.getState().addNode(AgentType.Planner, 0, 0)
      const id2 = useCanvasStore.getState().addNode(AgentType.Writer, 200, 0)
      useCanvasStore.getState().addConnection(id1, id2)
      const connId = useCanvasStore.getState().connections[0]!.id
      useCanvasStore.getState().removeConnection(connId)
      expect(useCanvasStore.getState().connections).toHaveLength(0)
    })
  })

  describe('updateConnectionStatus', () => {
    it('updates a connection status', () => {
      const id1 = useCanvasStore.getState().addNode(AgentType.Planner, 0, 0)
      const id2 = useCanvasStore.getState().addNode(AgentType.Writer, 200, 0)
      useCanvasStore.getState().addConnection(id1, id2)
      const connId = useCanvasStore.getState().connections[0]!.id
      useCanvasStore.getState().updateConnectionStatus(connId, NodeStatus.Running)
      expect(useCanvasStore.getState().connections[0]!.status).toBe(NodeStatus.Running)
    })
  })

  describe('viewport', () => {
    it('updates viewport partially', () => {
      useCanvasStore.getState().setViewport({ x: 50, y: 100 })
      expect(useCanvasStore.getState().viewport).toEqual({ x: 50, y: 100, zoom: 1 })
    })

    it('zoomIn increases zoom', () => {
      useCanvasStore.getState().zoomIn()
      expect(useCanvasStore.getState().viewport.zoom).toBeCloseTo(1.1)
    })

    it('zoomOut decreases zoom', () => {
      useCanvasStore.getState().zoomOut()
      expect(useCanvasStore.getState().viewport.zoom).toBeCloseTo(0.9)
    })

    it('zoomIn caps at 2', () => {
      useCanvasStore.setState({ viewport: { x: 0, y: 0, zoom: 1.95 } })
      useCanvasStore.getState().zoomIn()
      expect(useCanvasStore.getState().viewport.zoom).toBe(2)
    })

    it('zoomOut caps at 0.25', () => {
      useCanvasStore.setState({ viewport: { x: 0, y: 0, zoom: 0.3 } })
      useCanvasStore.getState().zoomOut()
      expect(useCanvasStore.getState().viewport.zoom).toBeCloseTo(0.25)
    })

    it('fitToScreen resets viewport', () => {
      useCanvasStore.getState().setViewport({ x: 500, y: 300, zoom: 1.5 })
      useCanvasStore.getState().fitToScreen()
      expect(useCanvasStore.getState().viewport).toEqual({ x: 0, y: 0, zoom: 1 })
    })
  })

  describe('setWorkflowName', () => {
    it('sets the workflow name', () => {
      useCanvasStore.getState().setWorkflowName('My Pipeline')
      expect(useCanvasStore.getState().workflowName).toBe('My Pipeline')
    })
  })

  describe('loadFromTemplate', () => {
    it('loads nodes and connections from template', () => {
      const template: WorkflowTemplate = {
        id: 'test',
        name: 'Test Pipeline',
        description: 'A test',
        stages: [
          { agentType: AgentType.Researcher, defaultTask: 'Research' },
          { agentType: AgentType.Writer, defaultTask: 'Write' },
          { agentType: AgentType.Reviewer, defaultTask: 'Review' },
        ],
      }
      useCanvasStore.getState().loadFromTemplate(template)
      const state = useCanvasStore.getState()
      expect(state.nodes).toHaveLength(3)
      expect(state.connections).toHaveLength(2) // chain: R→W→Rev
      expect(state.workflowName).toBe('Test Pipeline')
      expect(state.nodes[0]!.task).toBe('Research')
      expect(state.nodes[1]!.task).toBe('Write')
      expect(state.connections[0]!.sourceNodeId).toBe(state.nodes[0]!.id)
      expect(state.connections[0]!.targetNodeId).toBe(state.nodes[1]!.id)
    })
  })

  describe('clearCanvas', () => {
    it('resets all state', () => {
      useCanvasStore.getState().addNode(AgentType.Planner, 0, 0)
      useCanvasStore.getState().setWorkflowName('Custom')
      useCanvasStore.getState().clearCanvas()
      const state = useCanvasStore.getState()
      expect(state.nodes).toHaveLength(0)
      expect(state.connections).toHaveLength(0)
      expect(state.workflowName).toBe('Untitled Workflow')
      expect(state.selectedNodeId).toBeNull()
    })
  })

  describe('resetExecution', () => {
    it('resets all nodes and connections to idle', () => {
      const id1 = useCanvasStore.getState().addNode(AgentType.Planner, 0, 0)
      const id2 = useCanvasStore.getState().addNode(AgentType.Writer, 200, 0)
      useCanvasStore.getState().addConnection(id1, id2)
      useCanvasStore.getState().updateNodeStatus(id1, NodeStatus.Completed, 'done')
      useCanvasStore.getState().updateNodeStatus(id2, NodeStatus.Error)
      const connId = useCanvasStore.getState().connections[0]!.id
      useCanvasStore.getState().updateConnectionStatus(connId, NodeStatus.Error)

      useCanvasStore.getState().resetExecution()
      const state = useCanvasStore.getState()
      expect(state.nodes.every((n) => n.status === NodeStatus.Idle)).toBe(true)
      expect(state.nodes.every((n) => n.output === null)).toBe(true)
      expect(state.connections.every((c) => c.status === NodeStatus.Idle)).toBe(true)
    })
  })

  describe('toPipelineStages', () => {
    it('returns empty array for empty canvas', () => {
      expect(useCanvasStore.getState().toPipelineStages()).toEqual([])
    })

    it('returns topologically sorted stages', () => {
      const id1 = useCanvasStore.getState().addNode(AgentType.Researcher, 0, 0, 'Research')
      const id2 = useCanvasStore.getState().addNode(AgentType.Writer, 200, 0, 'Write')
      const id3 = useCanvasStore.getState().addNode(AgentType.Reviewer, 400, 0, 'Review')
      useCanvasStore.getState().addConnection(id1, id2)
      useCanvasStore.getState().addConnection(id2, id3)

      const stages = useCanvasStore.getState().toPipelineStages()
      expect(stages).toHaveLength(3)
      expect(stages[0]!.agentType).toBe(AgentType.Researcher)
      expect(stages[1]!.agentType).toBe(AgentType.Writer)
      expect(stages[2]!.agentType).toBe(AgentType.Reviewer)
    })

    it('uses default task label for nodes without task', () => {
      useCanvasStore.getState().addNode(AgentType.Planner, 0, 0)
      const stages = useCanvasStore.getState().toPipelineStages()
      expect(stages[0]!.task).toBe('Run planner agent')
    })
  })
})
