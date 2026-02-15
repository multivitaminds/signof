import { NodeStatus } from '../types'
import useWorkflowStore from './useWorkflowStore'

describe('useWorkflowStore', () => {
  beforeEach(() => {
    useWorkflowStore.setState({
      workflows: [],
      activeWorkflowId: null,
    })
  })

  describe('createWorkflow', () => {
    it('creates a workflow with defaults', () => {
      const id = useWorkflowStore.getState().createWorkflow()
      expect(id).toBeTruthy()
      expect(useWorkflowStore.getState().workflows).toHaveLength(1)
      const wf = useWorkflowStore.getState().workflows[0]!
      expect(wf.name).toBe('Untitled Workflow')
      expect(wf.status).toBe('draft')
      expect(wf.nodes).toEqual([])
      expect(wf.connections).toEqual([])
      expect(wf.runCount).toBe(0)
      expect(wf.lastRunAt).toBeNull()
    })

    it('creates a workflow with custom name and description', () => {
      useWorkflowStore.getState().createWorkflow('My Workflow', 'Does things')
      const wf = useWorkflowStore.getState().workflows[0]!
      expect(wf.name).toBe('My Workflow')
      expect(wf.description).toBe('Does things')
    })

    it('sets the created workflow as active', () => {
      const id = useWorkflowStore.getState().createWorkflow()
      expect(useWorkflowStore.getState().activeWorkflowId).toBe(id)
    })
  })

  describe('deleteWorkflow', () => {
    it('removes a workflow', () => {
      const id = useWorkflowStore.getState().createWorkflow('Delete me')
      useWorkflowStore.getState().deleteWorkflow(id)
      expect(useWorkflowStore.getState().workflows).toHaveLength(0)
    })

    it('clears active if deleted workflow was active', () => {
      const id = useWorkflowStore.getState().createWorkflow()
      expect(useWorkflowStore.getState().activeWorkflowId).toBe(id)
      useWorkflowStore.getState().deleteWorkflow(id)
      expect(useWorkflowStore.getState().activeWorkflowId).toBeNull()
    })
  })

  describe('duplicateWorkflow', () => {
    it('creates a copy with "(copy)" suffix', () => {
      const id = useWorkflowStore.getState().createWorkflow('Original')
      useWorkflowStore.getState().addNode(id, 'manual_trigger', 'Start', 100, 100)
      const copyId = useWorkflowStore.getState().duplicateWorkflow(id)
      expect(copyId).toBeTruthy()
      expect(useWorkflowStore.getState().workflows).toHaveLength(2)
      const copy = useWorkflowStore.getState().workflows.find((w) => w.id === copyId)!
      expect(copy.name).toBe('Original (copy)')
      expect(copy.status).toBe('draft')
      expect(copy.runCount).toBe(0)
      expect(copy.nodes).toHaveLength(1)
    })

    it('returns null for non-existent workflow', () => {
      expect(useWorkflowStore.getState().duplicateWorkflow('fake')).toBeNull()
    })
  })

  describe('node operations', () => {
    let workflowId: string

    beforeEach(() => {
      workflowId = useWorkflowStore.getState().createWorkflow('Test WF')
    })

    it('adds a node', () => {
      const nodeId = useWorkflowStore.getState().addNode(workflowId, 'manual_trigger', 'Start', 50, 50)
      expect(nodeId).toBeTruthy()
      const wf = useWorkflowStore.getState().workflows[0]!
      expect(wf.nodes).toHaveLength(1)
      expect(wf.nodes[0]!.type).toBe('manual_trigger')
      expect(wf.nodes[0]!.x).toBe(50)
      expect(wf.nodes[0]!.y).toBe(50)
      expect(wf.nodes[0]!.status).toBe(NodeStatus.Idle)
    })

    it('removes a node and its connections', () => {
      const n1 = useWorkflowStore.getState().addNode(workflowId, 'manual_trigger', 'Start', 0, 0)
      const n2 = useWorkflowStore.getState().addNode(workflowId, 'tool_action', 'Action', 200, 0)
      useWorkflowStore.getState().addConnection(workflowId, {
        sourceNodeId: n1, sourcePortId: 'out', targetNodeId: n2, targetPortId: 'in',
      })
      useWorkflowStore.getState().removeNode(workflowId, n1)
      const wf = useWorkflowStore.getState().workflows[0]!
      expect(wf.nodes).toHaveLength(1)
      expect(wf.connections).toHaveLength(0) // Connection removed with node
    })

    it('updates node data', () => {
      const nodeId = useWorkflowStore.getState().addNode(workflowId, 'tool_action', 'Action', 0, 0)
      useWorkflowStore.getState().updateNodeData(workflowId, nodeId, { toolName: 'send_email' })
      const node = useWorkflowStore.getState().workflows[0]!.nodes[0]!
      expect(node.data.toolName).toBe('send_email')
    })

    it('merges node data instead of replacing', () => {
      const nodeId = useWorkflowStore.getState().addNode(workflowId, 'tool_action', 'Action', 0, 0, { existing: true })
      useWorkflowStore.getState().updateNodeData(workflowId, nodeId, { toolName: 'test' })
      const node = useWorkflowStore.getState().workflows[0]!.nodes[0]!
      expect(node.data.existing).toBe(true)
      expect(node.data.toolName).toBe('test')
    })

    it('moves a node', () => {
      const nodeId = useWorkflowStore.getState().addNode(workflowId, 'manual_trigger', 'Start', 0, 0)
      useWorkflowStore.getState().moveNode(workflowId, nodeId, 300, 150)
      const node = useWorkflowStore.getState().workflows[0]!.nodes[0]!
      expect(node.x).toBe(300)
      expect(node.y).toBe(150)
    })

    it('updates node execution status', () => {
      const nodeId = useWorkflowStore.getState().addNode(workflowId, 'manual_trigger', 'Start', 0, 0)
      useWorkflowStore.getState().updateNodeExecution(workflowId, nodeId, NodeStatus.Running)
      expect(useWorkflowStore.getState().workflows[0]!.nodes[0]!.status).toBe(NodeStatus.Running)
      useWorkflowStore.getState().updateNodeExecution(workflowId, nodeId, NodeStatus.Completed, { result: 'done' })
      const node = useWorkflowStore.getState().workflows[0]!.nodes[0]!
      expect(node.status).toBe(NodeStatus.Completed)
      expect(node.output).toEqual({ result: 'done' })
    })
  })

  describe('connection operations', () => {
    let workflowId: string

    beforeEach(() => {
      workflowId = useWorkflowStore.getState().createWorkflow('Test WF')
    })

    it('adds a connection', () => {
      const n1 = useWorkflowStore.getState().addNode(workflowId, 'manual_trigger', 'Start', 0, 0)
      const n2 = useWorkflowStore.getState().addNode(workflowId, 'tool_action', 'Action', 200, 0)
      const connId = useWorkflowStore.getState().addConnection(workflowId, {
        sourceNodeId: n1, sourcePortId: 'out', targetNodeId: n2, targetPortId: 'in',
      })
      expect(connId).toBeTruthy()
      const wf = useWorkflowStore.getState().workflows[0]!
      expect(wf.connections).toHaveLength(1)
      expect(wf.connections[0]!.sourceNodeId).toBe(n1)
      expect(wf.connections[0]!.targetNodeId).toBe(n2)
      expect(wf.connections[0]!.status).toBe(NodeStatus.Idle)
    })

    it('removes a connection', () => {
      const n1 = useWorkflowStore.getState().addNode(workflowId, 'manual_trigger', 'Start', 0, 0)
      const n2 = useWorkflowStore.getState().addNode(workflowId, 'tool_action', 'Action', 200, 0)
      const connId = useWorkflowStore.getState().addConnection(workflowId, {
        sourceNodeId: n1, sourcePortId: 'out', targetNodeId: n2, targetPortId: 'in',
      })
      useWorkflowStore.getState().removeConnection(workflowId, connId)
      expect(useWorkflowStore.getState().workflows[0]!.connections).toHaveLength(0)
    })

    it('updates connection status', () => {
      const n1 = useWorkflowStore.getState().addNode(workflowId, 'manual_trigger', 'Start', 0, 0)
      const n2 = useWorkflowStore.getState().addNode(workflowId, 'tool_action', 'Action', 200, 0)
      const connId = useWorkflowStore.getState().addConnection(workflowId, {
        sourceNodeId: n1, sourcePortId: 'out', targetNodeId: n2, targetPortId: 'in',
      })
      useWorkflowStore.getState().updateConnectionStatus(workflowId, connId, NodeStatus.Running)
      expect(useWorkflowStore.getState().workflows[0]!.connections[0]!.status).toBe(NodeStatus.Running)
    })
  })

  describe('workflow metadata', () => {
    let workflowId: string

    beforeEach(() => {
      workflowId = useWorkflowStore.getState().createWorkflow('Test WF')
    })

    it('sets workflow status', () => {
      useWorkflowStore.getState().setWorkflowStatus(workflowId, 'active')
      expect(useWorkflowStore.getState().workflows[0]!.status).toBe('active')
    })

    it('sets workflow name', () => {
      useWorkflowStore.getState().setWorkflowName(workflowId, 'Renamed')
      expect(useWorkflowStore.getState().workflows[0]!.name).toBe('Renamed')
    })

    it('sets viewport', () => {
      useWorkflowStore.getState().setViewport(workflowId, { x: 100, y: 200, zoom: 1.5 })
      expect(useWorkflowStore.getState().workflows[0]!.viewport).toEqual({ x: 100, y: 200, zoom: 1.5 })
    })

    it('increments run count and updates lastRunAt', () => {
      useWorkflowStore.getState().incrementRunCount(workflowId)
      const wf = useWorkflowStore.getState().workflows[0]!
      expect(wf.runCount).toBe(1)
      expect(wf.lastRunAt).toBeTruthy()
    })

    it('resets execution state', () => {
      const n1 = useWorkflowStore.getState().addNode(workflowId, 'manual_trigger', 'Start', 0, 0)
      useWorkflowStore.getState().updateNodeExecution(workflowId, n1, NodeStatus.Completed, { done: true })
      useWorkflowStore.getState().resetExecution(workflowId)
      const node = useWorkflowStore.getState().workflows[0]!.nodes[0]!
      expect(node.status).toBe(NodeStatus.Idle)
      expect(node.output).toBeNull()
    })
  })

  describe('active workflow', () => {
    it('gets active workflow', () => {
      const id = useWorkflowStore.getState().createWorkflow('Active One')
      const active = useWorkflowStore.getState().getActiveWorkflow()
      expect(active).toBeDefined()
      expect(active!.id).toBe(id)
    })

    it('returns undefined when no active workflow', () => {
      expect(useWorkflowStore.getState().getActiveWorkflow()).toBeUndefined()
    })

    it('sets active workflow', () => {
      const id1 = useWorkflowStore.getState().createWorkflow('First')
      useWorkflowStore.getState().createWorkflow('Second')
      useWorkflowStore.getState().setActiveWorkflow(id1)
      expect(useWorkflowStore.getState().activeWorkflowId).toBe(id1)
      expect(useWorkflowStore.getState().getActiveWorkflow()!.name).toBe('First')
    })
  })
})
