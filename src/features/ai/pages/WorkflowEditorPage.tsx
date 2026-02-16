import { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import useWorkflowStore from '../stores/useWorkflowStore'
import { getNodeDefinition } from '../lib/nodeDefinitions'
import WorkflowToolbar from '../components/WorkflowToolbar/WorkflowToolbar'
import WorkflowNodePalette from '../components/WorkflowNodePalette/WorkflowNodePalette'
import WorkflowNodeCard from '../components/WorkflowNodeCard/WorkflowNodeCard'
import NodeParameterPanel from '../components/NodeParameterPanel/NodeParameterPanel'
import type { WorkflowNode } from '../types'
import './WorkflowEditorPage.css'

// ─── Layout constants ─────────────────────────────────────────────────
const NODE_WIDTH = 200
const NODE_HEADER_HEIGHT = 40

// ─── Connection helpers ───────────────────────────────────────────────

interface PendingConnection {
  sourceNodeId: string
  sourcePortId: string
  mouseX: number
  mouseY: number
}

interface DragState {
  nodeId: string
  offsetX: number
  offsetY: number
}

function getOutputPortPosition(
  node: WorkflowNode,
  portIndex: number,
  totalPorts: number,
): { x: number; y: number } {
  const spacing = NODE_HEADER_HEIGHT / Math.max(totalPorts, 1)
  return {
    x: node.x + NODE_WIDTH,
    y: node.y + NODE_HEADER_HEIGHT + portIndex * spacing + spacing / 2,
  }
}

function getInputPortPosition(
  node: WorkflowNode,
  portIndex: number,
  totalPorts: number,
): { x: number; y: number } {
  const spacing = NODE_HEADER_HEIGHT / Math.max(totalPorts, 1)
  return {
    x: node.x,
    y: node.y + NODE_HEADER_HEIGHT + portIndex * spacing + spacing / 2,
  }
}

function computeBezierPath(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): string {
  const dx = Math.abs(x2 - x1) * 0.5
  return `M${x1},${y1} C${x1 + dx},${y1} ${x2 - dx},${y2} ${x2},${y2}`
}

// ─── Component ────────────────────────────────────────────────────────

export default function WorkflowEditorPage() {
  const { workflowId } = useParams<{ workflowId: string }>()
  const navigate = useNavigate()
  const workflows = useWorkflowStore((s) => s.workflows)

  // Store actions
  const setWorkflowName = useWorkflowStore((s) => s.setWorkflowName)
  const setWorkflowStatus = useWorkflowStore((s) => s.setWorkflowStatus)
  const storeAddNode = useWorkflowStore((s) => s.addNode)
  const storeRemoveNode = useWorkflowStore((s) => s.removeNode)
  const storeMoveNode = useWorkflowStore((s) => s.moveNode)
  const storeUpdateNodeData = useWorkflowStore((s) => s.updateNodeData)
  const storeAddConnection = useWorkflowStore((s) => s.addConnection)
  const storeRemoveConnection = useWorkflowStore((s) => s.removeConnection)
  const incrementRunCount = useWorkflowStore((s) => s.incrementRunCount)
  const resetExecution = useWorkflowStore((s) => s.resetExecution)

  // Local editor state
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [showPalette, setShowPalette] = useState(true)
  const [dragState, setDragState] = useState<DragState | null>(null)
  const [pendingConnection, setPendingConnection] = useState<PendingConnection | null>(null)

  const canvasRef = useRef<HTMLDivElement>(null)

  const workflow = useMemo(
    () => workflows.find((w) => w.id === workflowId),
    [workflows, workflowId],
  )

  const selectedNode = useMemo(() => {
    if (!workflow || !selectedNodeId) return null
    return workflow.nodes.find((n) => n.id === selectedNodeId) ?? null
  }, [workflow, selectedNodeId])

  const selectedNodeDef = useMemo(() => {
    if (!selectedNode) return undefined
    return getNodeDefinition(selectedNode.type)
  }, [selectedNode])

  // ─── Keyboard: Delete / Escape ────────────────────────────────────
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!workflowId || !selectedNodeId) return
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return

      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault()
        storeRemoveNode(workflowId, selectedNodeId)
        setSelectedNodeId(null)
      }
      if (e.key === 'Escape') {
        setSelectedNodeId(null)
        setPendingConnection(null)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [workflowId, selectedNodeId, storeRemoveNode])

  // ─── Drop from palette onto canvas ────────────────────────────────
  const handleCanvasDragOver = useCallback((e: React.DragEvent) => {
    if (e.dataTransfer.types.includes('application/workflow-node-type')) {
      e.preventDefault()
      e.dataTransfer.dropEffect = 'copy'
    }
  }, [])

  const handleCanvasDrop = useCallback(
    (e: React.DragEvent) => {
      const nodeType = e.dataTransfer.getData('application/workflow-node-type')
      if (!nodeType || !workflowId || !canvasRef.current) return

      e.preventDefault()
      const def = getNodeDefinition(nodeType)
      if (!def) return

      const rect = canvasRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left + canvasRef.current.scrollLeft - NODE_WIDTH / 2
      const y = e.clientY - rect.top + canvasRef.current.scrollTop - NODE_HEADER_HEIGHT / 2

      storeAddNode(workflowId, nodeType, def.label, Math.max(0, x), Math.max(0, y), { ...def.defaultData })
    },
    [workflowId, storeAddNode],
  )

  // ─── Palette click: add at center ────────────────────────────────
  const handlePaletteNodeSelect = useCallback(
    (nodeType: string) => {
      if (!workflowId) return
      const def = getNodeDefinition(nodeType)
      if (!def) return

      const cx = canvasRef.current
        ? canvasRef.current.scrollLeft + canvasRef.current.clientWidth / 2 - NODE_WIDTH / 2
        : 300
      const cy = canvasRef.current
        ? canvasRef.current.scrollTop + canvasRef.current.clientHeight / 2 - NODE_HEADER_HEIGHT / 2
        : 200

      storeAddNode(workflowId, nodeType, def.label, Math.max(0, cx), Math.max(0, cy), { ...def.defaultData })
    },
    [workflowId, storeAddNode],
  )

  // ─── Node dragging ────────────────────────────────────────────────
  const handleNodeMouseDown = useCallback(
    (e: React.MouseEvent, node: WorkflowNode) => {
      if ((e.target as HTMLElement).closest('.wf-node-card__port')) return
      e.preventDefault()
      e.stopPropagation()

      const nodeEl = e.currentTarget as HTMLElement
      const rect = nodeEl.getBoundingClientRect()
      setDragState({
        nodeId: node.id,
        offsetX: e.clientX - rect.left,
        offsetY: e.clientY - rect.top,
      })
    },
    [],
  )

  const handleCanvasMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (dragState && workflowId && canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect()
        const x = e.clientX - rect.left + canvasRef.current.scrollLeft - dragState.offsetX
        const y = e.clientY - rect.top + canvasRef.current.scrollTop - dragState.offsetY
        storeMoveNode(workflowId, dragState.nodeId, Math.max(0, x), Math.max(0, y))
      }

      if (pendingConnection && canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect()
        setPendingConnection((prev) => {
          if (!prev) return null
          return {
            ...prev,
            mouseX: e.clientX - rect.left + (canvasRef.current?.scrollLeft ?? 0),
            mouseY: e.clientY - rect.top + (canvasRef.current?.scrollTop ?? 0),
          }
        })
      }
    },
    [dragState, pendingConnection, workflowId, storeMoveNode],
  )

  const handleCanvasMouseUp = useCallback(() => {
    if (dragState) setDragState(null)
    if (pendingConnection) setPendingConnection(null)
  }, [dragState, pendingConnection])

  // ─── Port clicking: connection creation ───────────────────────────
  const handlePortClick = useCallback(
    (nodeId: string, portId: string, portType: 'input' | 'output') => {
      if (!workflowId || !workflow) return

      if (portType === 'output') {
        const node = workflow.nodes.find((n) => n.id === nodeId)
        if (!node) return
        const def = getNodeDefinition(node.type)
        const outputs = def?.outputs ?? []
        const outputIndex = outputs.findIndex((p) => p.id === portId)
        const portPos = getOutputPortPosition(node, Math.max(0, outputIndex), outputs.length)

        setPendingConnection({
          sourceNodeId: nodeId,
          sourcePortId: portId,
          mouseX: portPos.x,
          mouseY: portPos.y,
        })
      } else if (portType === 'input' && pendingConnection) {
        if (pendingConnection.sourceNodeId === nodeId) {
          setPendingConnection(null)
          return
        }

        const exists = workflow.connections.some(
          (c) =>
            c.sourceNodeId === pendingConnection.sourceNodeId &&
            c.sourcePortId === pendingConnection.sourcePortId &&
            c.targetNodeId === nodeId &&
            c.targetPortId === portId,
        )
        if (!exists) {
          storeAddConnection(workflowId, {
            sourceNodeId: pendingConnection.sourceNodeId,
            sourcePortId: pendingConnection.sourcePortId,
            targetNodeId: nodeId,
            targetPortId: portId,
          })
        }
        setPendingConnection(null)
      }
    },
    [workflowId, workflow, pendingConnection, storeAddConnection],
  )

  // ─── Canvas click: deselect ───────────────────────────────────────
  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement
    if (
      target === e.currentTarget ||
      target.classList.contains('wf-editor__canvas-scroll') ||
      target.classList.contains('wf-editor__svg-layer')
    ) {
      setSelectedNodeId(null)
      setPendingConnection(null)
    }
  }, [])

  // ─── Parameter update ─────────────────────────────────────────────
  const handleUpdateNodeData = useCallback(
    (nodeId: string, data: Record<string, unknown>) => {
      if (!workflowId) return
      storeUpdateNodeData(workflowId, nodeId, data)
    },
    [workflowId, storeUpdateNodeData],
  )

  // ─── Toolbar actions ──────────────────────────────────────────────
  const handleRun = useCallback(() => {
    if (!workflowId) return
    setWorkflowStatus(workflowId, 'active')
    incrementRunCount(workflowId)
  }, [workflowId, setWorkflowStatus, incrementRunCount])

  const handlePause = useCallback(() => {
    if (!workflowId) return
    setWorkflowStatus(workflowId, 'paused')
  }, [workflowId, setWorkflowStatus])

  const handleStop = useCallback(() => {
    if (!workflowId) return
    setWorkflowStatus(workflowId, 'draft')
    resetExecution(workflowId)
  }, [workflowId, setWorkflowStatus, resetExecution])

  // ─── Double-click connection to remove ────────────────────────────
  const handleConnectionDoubleClick = useCallback(
    (connId: string) => {
      if (!workflowId) return
      storeRemoveConnection(workflowId, connId)
    },
    [workflowId, storeRemoveConnection],
  )

  // ─── Render ───────────────────────────────────────────────────────

  if (!workflow) {
    return (
      <div className="wf-editor wf-editor--not-found">
        <p>Workflow not found.</p>
        <button className="btn--primary" onClick={() => navigate('/copilot/workflows')}>
          Back to Workflows
        </button>
      </div>
    )
  }

  return (
    <div className="wf-editor">
      <WorkflowToolbar
        workflowName={workflow.name}
        status={workflow.status}
        onNameChange={(name) => setWorkflowName(workflow.id, name)}
        onRun={handleRun}
        onPause={handlePause}
        onStop={handleStop}
      />

      <div className="wf-editor__body">
        {showPalette && (
          <div className="wf-editor__palette">
            <div className="wf-editor__palette-header">
              <span>Node Palette</span>
              <button
                className="wf-editor__close-btn"
                onClick={() => setShowPalette(false)}
                aria-label="Close palette"
              >
                &times;
              </button>
            </div>
            <WorkflowNodePalette onNodeSelect={handlePaletteNodeSelect} />
          </div>
        )}

        <div
          className="wf-editor__canvas"
          onDragOver={handleCanvasDragOver}
          onDrop={handleCanvasDrop}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          onClick={handleCanvasClick}
          ref={canvasRef}
          role="application"
          aria-label="Workflow canvas"
        >
          {!showPalette && (
            <button
              className="wf-editor__toggle-palette"
              onClick={() => setShowPalette(true)}
              aria-label="Show palette"
            >
              +
            </button>
          )}

          <div className="wf-editor__canvas-scroll">
            {/* SVG layer for connection lines */}
            <svg className="wf-editor__svg-layer" aria-hidden="true">
              {workflow.connections.map((conn) => {
                const sourceNode = workflow.nodes.find((n) => n.id === conn.sourceNodeId)
                const targetNode = workflow.nodes.find((n) => n.id === conn.targetNodeId)
                if (!sourceNode || !targetNode) return null

                const srcDef = getNodeDefinition(sourceNode.type)
                const tgtDef = getNodeDefinition(targetNode.type)
                const srcOutputs = srcDef?.outputs ?? []
                const tgtInputs = tgtDef?.inputs ?? []
                const srcIdx = srcOutputs.findIndex((p) => p.id === conn.sourcePortId)
                const tgtIdx = tgtInputs.findIndex((p) => p.id === conn.targetPortId)
                const start = getOutputPortPosition(sourceNode, Math.max(0, srcIdx), srcOutputs.length)
                const end = getInputPortPosition(targetNode, Math.max(0, tgtIdx), tgtInputs.length)
                const path = computeBezierPath(start.x, start.y, end.x, end.y)

                return (
                  <path
                    key={conn.id}
                    d={path}
                    className={`wf-editor__connection-path wf-editor__connection-path--${conn.status}`}
                    onDoubleClick={() => handleConnectionDoubleClick(conn.id)}
                  />
                )
              })}

              {/* Pending connection line */}
              {pendingConnection && (() => {
                const sourceNode = workflow.nodes.find((n) => n.id === pendingConnection.sourceNodeId)
                if (!sourceNode) return null
                const def = getNodeDefinition(sourceNode.type)
                const outputs = def?.outputs ?? []
                const outputIndex = outputs.findIndex((p) => p.id === pendingConnection.sourcePortId)
                const startPos = getOutputPortPosition(sourceNode, Math.max(0, outputIndex), outputs.length)
                const path = computeBezierPath(startPos.x, startPos.y, pendingConnection.mouseX, pendingConnection.mouseY)
                return <path d={path} className="wf-editor__pending-line" />
              })()}
            </svg>

            {/* Nodes */}
            {workflow.nodes.map((node) => {
              const def = getNodeDefinition(node.type)
              return (
                <div
                  key={node.id}
                  className={`wf-editor__node-wrapper${dragState?.nodeId === node.id ? ' wf-editor__node-wrapper--dragging' : ''}`}
                  style={{ left: node.x, top: node.y }}
                  onMouseDown={(e) => handleNodeMouseDown(e, node)}
                >
                  <WorkflowNodeCard
                    node={node}
                    definition={def}
                    isSelected={selectedNodeId === node.id}
                    onSelect={() => setSelectedNodeId(node.id)}
                    onPortClick={(portId, portType) => handlePortClick(node.id, portId, portType)}
                  />
                </div>
              )
            })}

            {/* Empty state */}
            {workflow.nodes.length === 0 && (
              <div className="wf-editor__empty-state">
                <div className="wf-editor__empty-icon">+</div>
                <p className="wf-editor__empty-text">
                  Drag nodes from the palette or click a node type to add it to the canvas
                </p>
                <p className="wf-editor__empty-hint">Delete to remove &middot; Escape to deselect</p>
              </div>
            )}
          </div>
        </div>

        {selectedNode && (
          <div className="wf-editor__params">
            <NodeParameterPanel
              node={selectedNode}
              definition={selectedNodeDef}
              onUpdateData={handleUpdateNodeData}
            />
          </div>
        )}
      </div>

      {/* Status bar */}
      <div className="wf-editor__status-bar">
        <span className="wf-editor__status-item">
          <span className={`wf-editor__status-dot wf-editor__status-dot--${workflow.status}`} />
          {workflow.status}
        </span>
        <span className="wf-editor__status-item">
          {workflow.nodes.length} node{workflow.nodes.length !== 1 ? 's' : ''}
        </span>
        <span className="wf-editor__status-item">
          {workflow.connections.length} connection{workflow.connections.length !== 1 ? 's' : ''}
        </span>
        {workflow.runCount > 0 && (
          <span className="wf-editor__status-item">
            {workflow.runCount} run{workflow.runCount !== 1 ? 's' : ''}
          </span>
        )}
        <span className="wf-editor__status-spacer" />
        <button
          className="wf-editor__status-back"
          onClick={() => navigate('/copilot/workflows')}
        >
          &larr; Back to Workflows
        </button>
      </div>
    </div>
  )
}
