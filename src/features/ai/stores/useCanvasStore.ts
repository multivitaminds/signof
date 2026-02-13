import { create } from 'zustand'
import { CanvasMode, NodeStatus } from '../types'
import type { AgentType, CanvasNode, CanvasConnection, CanvasViewport } from '../types'
import type { WorkflowTemplate } from '../lib/workflowTemplates'

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

export interface CanvasState {
  nodes: CanvasNode[]
  connections: CanvasConnection[]
  viewport: CanvasViewport
  mode: CanvasMode
  selectedNodeId: string | null
  connectingFromId: string | null
  workflowName: string

  addNode: (agentType: AgentType, x: number, y: number, task?: string) => string
  removeNode: (id: string) => void
  updateNodePosition: (id: string, x: number, y: number) => void
  updateNodeTask: (id: string, task: string) => void
  updateNodeStatus: (id: string, status: NodeStatus, output?: string) => void
  selectNode: (id: string | null) => void
  setMode: (mode: CanvasMode) => void
  startConnecting: (nodeId: string) => void
  completeConnection: (targetNodeId: string) => void
  cancelConnecting: () => void
  addConnection: (sourceNodeId: string, targetNodeId: string) => void
  removeConnection: (id: string) => void
  updateConnectionStatus: (id: string, status: NodeStatus) => void
  setViewport: (viewport: Partial<CanvasViewport>) => void
  zoomIn: () => void
  zoomOut: () => void
  fitToScreen: () => void
  setWorkflowName: (name: string) => void
  loadFromTemplate: (template: WorkflowTemplate) => void
  clearCanvas: () => void
  resetExecution: () => void
  toPipelineStages: () => Array<{ agentType: AgentType; task: string }>
}

const DEFAULT_VIEWPORT: CanvasViewport = { x: 0, y: 0, zoom: 1 }

const useCanvasStore = create<CanvasState>()((set, get) => ({
  nodes: [],
  connections: [],
  viewport: { ...DEFAULT_VIEWPORT },
  mode: CanvasMode.Select as CanvasMode,
  selectedNodeId: null,
  connectingFromId: null,
  workflowName: 'Untitled Workflow',

  addNode: (agentType, x, y, task) => {
    const id = generateId()
    const node: CanvasNode = {
      id,
      agentType,
      task: task ?? '',
      x,
      y,
      status: NodeStatus.Idle as NodeStatus,
      output: null,
    }
    set(state => ({ nodes: [...state.nodes, node] }))
    return id
  },

  removeNode: (id) => {
    set(state => ({
      nodes: state.nodes.filter(n => n.id !== id),
      connections: state.connections.filter(c => c.sourceNodeId !== id && c.targetNodeId !== id),
      selectedNodeId: state.selectedNodeId === id ? null : state.selectedNodeId,
    }))
  },

  updateNodePosition: (id, x, y) => {
    set(state => ({
      nodes: state.nodes.map(n => n.id === id ? { ...n, x, y } : n),
    }))
  },

  updateNodeTask: (id, task) => {
    set(state => ({
      nodes: state.nodes.map(n => n.id === id ? { ...n, task } : n),
    }))
  },

  updateNodeStatus: (id, status, output) => {
    set(state => ({
      nodes: state.nodes.map(n => n.id === id ? { ...n, status, output: output ?? n.output } : n),
    }))
  },

  selectNode: (id) => {
    set({ selectedNodeId: id })
  },

  setMode: (mode) => {
    set({ mode, connectingFromId: null })
  },

  startConnecting: (nodeId) => {
    set({ connectingFromId: nodeId })
  },

  completeConnection: (targetNodeId) => {
    const { connectingFromId, connections } = get()
    if (!connectingFromId || connectingFromId === targetNodeId) {
      set({ connectingFromId: null })
      return
    }
    const exists = connections.some(
      c => c.sourceNodeId === connectingFromId && c.targetNodeId === targetNodeId
    )
    if (!exists) {
      const conn: CanvasConnection = {
        id: generateId(),
        sourceNodeId: connectingFromId,
        targetNodeId,
        status: NodeStatus.Idle as NodeStatus,
      }
      set(state => ({
        connections: [...state.connections, conn],
        connectingFromId: null,
      }))
    } else {
      set({ connectingFromId: null })
    }
  },

  cancelConnecting: () => {
    set({ connectingFromId: null })
  },

  addConnection: (sourceNodeId, targetNodeId) => {
    if (sourceNodeId === targetNodeId) return
    const exists = get().connections.some(
      c => c.sourceNodeId === sourceNodeId && c.targetNodeId === targetNodeId
    )
    if (exists) return
    const conn: CanvasConnection = {
      id: generateId(),
      sourceNodeId,
      targetNodeId,
      status: NodeStatus.Idle as NodeStatus,
    }
    set(state => ({ connections: [...state.connections, conn] }))
  },

  removeConnection: (id) => {
    set(state => ({ connections: state.connections.filter(c => c.id !== id) }))
  },

  updateConnectionStatus: (id, status) => {
    set(state => ({
      connections: state.connections.map(c => c.id === id ? { ...c, status } : c),
    }))
  },

  setViewport: (viewport) => {
    set(state => ({ viewport: { ...state.viewport, ...viewport } }))
  },

  zoomIn: () => {
    set(state => ({
      viewport: { ...state.viewport, zoom: Math.min(state.viewport.zoom + 0.1, 2) },
    }))
  },

  zoomOut: () => {
    set(state => ({
      viewport: { ...state.viewport, zoom: Math.max(state.viewport.zoom - 0.1, 0.25) },
    }))
  },

  fitToScreen: () => {
    set({ viewport: { ...DEFAULT_VIEWPORT } })
  },

  setWorkflowName: (name) => {
    set({ workflowName: name })
  },

  loadFromTemplate: (template) => {
    const nodes: CanvasNode[] = template.stages.map((stage, i) => ({
      id: generateId(),
      agentType: stage.agentType,
      task: stage.defaultTask,
      x: 100 + i * 250,
      y: 200,
      status: NodeStatus.Idle as NodeStatus,
      output: null,
    }))

    const connections: CanvasConnection[] = []
    for (let i = 0; i < nodes.length - 1; i++) {
      connections.push({
        id: generateId(),
        sourceNodeId: nodes[i]!.id,
        targetNodeId: nodes[i + 1]!.id,
        status: NodeStatus.Idle as NodeStatus,
      })
    }

    set({
      nodes,
      connections,
      workflowName: template.name,
      selectedNodeId: null,
      viewport: { ...DEFAULT_VIEWPORT },
    })
  },

  clearCanvas: () => {
    set({
      nodes: [],
      connections: [],
      selectedNodeId: null,
      connectingFromId: null,
      workflowName: 'Untitled Workflow',
      viewport: { ...DEFAULT_VIEWPORT },
    })
  },

  resetExecution: () => {
    set(state => ({
      nodes: state.nodes.map(n => ({ ...n, status: NodeStatus.Idle as NodeStatus, output: null })),
      connections: state.connections.map(c => ({ ...c, status: NodeStatus.Idle as NodeStatus })),
    }))
  },

  toPipelineStages: () => {
    const { nodes, connections } = get()
    if (nodes.length === 0) return []

    // Topological sort using connections
    const inDegree = new Map<string, number>()
    const adj = new Map<string, string[]>()
    for (const node of nodes) {
      inDegree.set(node.id, 0)
      adj.set(node.id, [])
    }
    for (const conn of connections) {
      adj.get(conn.sourceNodeId)?.push(conn.targetNodeId)
      inDegree.set(conn.targetNodeId, (inDegree.get(conn.targetNodeId) ?? 0) + 1)
    }

    const queue: string[] = []
    for (const [id, deg] of inDegree) {
      if (deg === 0) queue.push(id)
    }

    const sorted: string[] = []
    while (queue.length > 0) {
      const id = queue.shift()!
      sorted.push(id)
      for (const next of adj.get(id) ?? []) {
        const newDeg = (inDegree.get(next) ?? 1) - 1
        inDegree.set(next, newDeg)
        if (newDeg === 0) queue.push(next)
      }
    }

    const nodeMap = new Map(nodes.map(n => [n.id, n]))
    return sorted.map(id => {
      const node = nodeMap.get(id)!
      return { agentType: node.agentType, task: node.task || `Run ${node.agentType} agent` }
    })
  },
}))

export default useCanvasStore
