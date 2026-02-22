import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { NodeStatus } from '../types'
import type { Workflow, WorkflowNode, WorkflowConnection, CanvasViewport } from '../types'

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

export interface WorkflowState {
  workflows: Workflow[]
  activeWorkflowId: string | null

  createWorkflow: (name?: string, description?: string) => string
  deleteWorkflow: (id: string) => void
  duplicateWorkflow: (id: string) => string | null
  setActiveWorkflow: (id: string | null) => void
  getActiveWorkflow: () => Workflow | undefined

  addNode: (workflowId: string, nodeType: string, label: string, x: number, y: number, data?: Record<string, unknown>) => string
  removeNode: (workflowId: string, nodeId: string) => void
  updateNodeData: (workflowId: string, nodeId: string, data: Record<string, unknown>) => void
  moveNode: (workflowId: string, nodeId: string, x: number, y: number) => void
  updateNodeExecution: (workflowId: string, nodeId: string, status: NodeStatus, output?: unknown) => void

  addConnection: (workflowId: string, conn: Omit<WorkflowConnection, 'id' | 'status'>) => string
  removeConnection: (workflowId: string, connId: string) => void
  updateConnectionStatus: (workflowId: string, connId: string, status: NodeStatus) => void

  setWorkflowStatus: (workflowId: string, status: Workflow['status']) => void
  setWorkflowName: (workflowId: string, name: string) => void
  setViewport: (workflowId: string, viewport: CanvasViewport) => void
  incrementRunCount: (workflowId: string) => void
  resetExecution: (workflowId: string) => void
}

const useWorkflowStore = create<WorkflowState>()(
  persist(
    (set, get) => ({
      workflows: [],
      activeWorkflowId: null,

      createWorkflow: (name, description) => {
        const id = generateId()
        const workflow: Workflow = {
          id,
          name: name ?? 'Untitled Workflow',
          description: description ?? '',
          nodes: [],
          connections: [],
          status: 'draft',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          lastRunAt: null,
          runCount: 0,
          viewport: { x: 0, y: 0, zoom: 1 },
        }
        set((state) => ({
          workflows: [...state.workflows, workflow],
          activeWorkflowId: id,
        }))
        return id
      },

      deleteWorkflow: (id) => {
        set((state) => ({
          workflows: state.workflows.filter((w) => w.id !== id),
          activeWorkflowId: state.activeWorkflowId === id ? null : state.activeWorkflowId,
        }))
      },

      duplicateWorkflow: (id) => {
        const source = get().workflows.find((w) => w.id === id)
        if (!source) return null
        const newId = generateId()
        const now = new Date().toISOString()
        const duplicate: Workflow = {
          ...source,
          id: newId,
          name: `${source.name} (copy)`,
          status: 'draft',
          createdAt: now,
          updatedAt: now,
          lastRunAt: null,
          runCount: 0,
          nodes: source.nodes.map((n) => ({ ...n, status: NodeStatus.Idle, output: null })),
          connections: source.connections.map((c) => ({ ...c, id: generateId(), status: NodeStatus.Idle })),
        }
        set((state) => ({
          workflows: [...state.workflows, duplicate],
        }))
        return newId
      },

      setActiveWorkflow: (id) => {
        set({ activeWorkflowId: id })
      },

      getActiveWorkflow: () => {
        const { workflows, activeWorkflowId } = get()
        return workflows.find((w) => w.id === activeWorkflowId)
      },

      addNode: (workflowId, nodeType, label, x, y, data) => {
        const nodeId = generateId()
        const node: WorkflowNode = {
          id: nodeId,
          type: nodeType,
          label,
          x,
          y,
          data: data ?? {},
          status: NodeStatus.Idle,
          output: null,
        }
        set((state) => ({
          workflows: state.workflows.map((w) =>
            w.id === workflowId
              ? { ...w, nodes: [...w.nodes, node], updatedAt: new Date().toISOString() }
              : w,
          ),
        }))
        return nodeId
      },

      removeNode: (workflowId, nodeId) => {
        set((state) => ({
          workflows: state.workflows.map((w) =>
            w.id === workflowId
              ? {
                  ...w,
                  nodes: w.nodes.filter((n) => n.id !== nodeId),
                  connections: w.connections.filter(
                    (c) => c.sourceNodeId !== nodeId && c.targetNodeId !== nodeId,
                  ),
                  updatedAt: new Date().toISOString(),
                }
              : w,
          ),
        }))
      },

      updateNodeData: (workflowId, nodeId, data) => {
        set((state) => ({
          workflows: state.workflows.map((w) =>
            w.id === workflowId
              ? {
                  ...w,
                  nodes: w.nodes.map((n) =>
                    n.id === nodeId ? { ...n, data: { ...n.data, ...data } } : n,
                  ),
                  updatedAt: new Date().toISOString(),
                }
              : w,
          ),
        }))
      },

      moveNode: (workflowId, nodeId, x, y) => {
        set((state) => ({
          workflows: state.workflows.map((w) =>
            w.id === workflowId
              ? {
                  ...w,
                  nodes: w.nodes.map((n) => (n.id === nodeId ? { ...n, x, y } : n)),
                }
              : w,
          ),
        }))
      },

      updateNodeExecution: (workflowId, nodeId, status, output) => {
        set((state) => ({
          workflows: state.workflows.map((w) =>
            w.id === workflowId
              ? {
                  ...w,
                  nodes: w.nodes.map((n) =>
                    n.id === nodeId ? { ...n, status, output: output ?? n.output } : n,
                  ),
                }
              : w,
          ),
        }))
      },

      addConnection: (workflowId, conn) => {
        const connId = generateId()
        const connection: WorkflowConnection = {
          ...conn,
          id: connId,
          status: NodeStatus.Idle,
        }
        set((state) => ({
          workflows: state.workflows.map((w) =>
            w.id === workflowId
              ? { ...w, connections: [...w.connections, connection], updatedAt: new Date().toISOString() }
              : w,
          ),
        }))
        return connId
      },

      removeConnection: (workflowId, connId) => {
        set((state) => ({
          workflows: state.workflows.map((w) =>
            w.id === workflowId
              ? {
                  ...w,
                  connections: w.connections.filter((c) => c.id !== connId),
                  updatedAt: new Date().toISOString(),
                }
              : w,
          ),
        }))
      },

      updateConnectionStatus: (workflowId, connId, status) => {
        set((state) => ({
          workflows: state.workflows.map((w) =>
            w.id === workflowId
              ? {
                  ...w,
                  connections: w.connections.map((c) =>
                    c.id === connId ? { ...c, status } : c,
                  ),
                }
              : w,
          ),
        }))
      },

      setWorkflowStatus: (workflowId, status) => {
        set((state) => ({
          workflows: state.workflows.map((w) =>
            w.id === workflowId ? { ...w, status, updatedAt: new Date().toISOString() } : w,
          ),
        }))
      },

      setWorkflowName: (workflowId, name) => {
        set((state) => ({
          workflows: state.workflows.map((w) =>
            w.id === workflowId ? { ...w, name, updatedAt: new Date().toISOString() } : w,
          ),
        }))
      },

      setViewport: (workflowId, viewport) => {
        set((state) => ({
          workflows: state.workflows.map((w) =>
            w.id === workflowId ? { ...w, viewport } : w,
          ),
        }))
      },

      incrementRunCount: (workflowId) => {
        set((state) => ({
          workflows: state.workflows.map((w) =>
            w.id === workflowId
              ? { ...w, runCount: w.runCount + 1, lastRunAt: new Date().toISOString() }
              : w,
          ),
        }))
      },

      resetExecution: (workflowId) => {
        set((state) => ({
          workflows: state.workflows.map((w) =>
            w.id === workflowId
              ? {
                  ...w,
                  nodes: w.nodes.map((n) => ({ ...n, status: NodeStatus.Idle, output: null })),
                  connections: w.connections.map((c) => ({ ...c, status: NodeStatus.Idle })),
                }
              : w,
          ),
        }))
      },
    }),
    {
      name: 'origina-workflow-storage',
    },
  ),
)

export default useWorkflowStore
