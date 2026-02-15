import useMessageBusStore from '../stores/useMessageBusStore'
import useAgentRuntimeStore from '../stores/useAgentRuntimeStore'
import useWorkflowStore from '../stores/useWorkflowStore'
import useConnectorStore from '../stores/useConnectorStore'
import { MessagePriority } from '../types'
import type { AutonomyMode, RepairRecord, MarketplaceAgent } from '../types'
import { startAutonomousLoop } from './autonomousLoop'

// ─── Trigger Workflow from Agent ────────────────────────────────────

export function triggerWorkflowFromAgent(
  agentId: string,
  workflowId: string,
): void {
  const workflow = useWorkflowStore.getState().workflows.find((w) => w.id === workflowId)
  if (!workflow) {
    useMessageBusStore.getState().publish(
      agentId,
      'system.alerts',
      `Failed to trigger workflow: ${workflowId} not found`,
      MessagePriority.High,
    )
    return
  }

  useWorkflowStore.getState().setWorkflowStatus(workflowId, 'active')
  useMessageBusStore.getState().publish(
    agentId,
    'coordination.handoff',
    `Triggered workflow "${workflow.name}" (${workflowId})`,
  )
}

// ─── Deploy Agent from Workflow Node ────────────────────────────────

export function deployAgentFromWorkflow(
  nodeData: Record<string, unknown>,
): string | null {
  const agentId = nodeData.agentId as string | undefined
  const autonomyMode = (nodeData.autonomyMode as string) ?? 'suggest'

  if (!agentId) return null

  // Create a minimal MarketplaceAgent from node data
  const agent: MarketplaceAgent = {
    id: Number(agentId) || Date.now(),
    name: (nodeData.name as string) ?? `Workflow Agent ${agentId}`,
    description: (nodeData.task as string) ?? 'Deployed from workflow',
    integrations: '',
    autonomy: autonomyMode,
    price: 'N/A',
  }

  const connectorIds = (nodeData.connectorIds as string[]) ?? []
  const deployedId = useAgentRuntimeStore.getState().deployAgent(
    agent,
    autonomyMode as typeof AutonomyMode.FullAuto,
    connectorIds,
  )

  startAutonomousLoop(deployedId)

  return deployedId
}

// ─── Trigger Repair Workflow ────────────────────────────────────────

export function triggerRepairWorkflow(
  repairRecord: RepairRecord,
): void {
  // Look for a workflow tagged as a repair workflow
  const workflows = useWorkflowStore.getState().workflows
  const repairWorkflow = workflows.find((w) =>
    w.name.toLowerCase().includes('repair') ||
    w.name.toLowerCase().includes('healing'),
  )

  if (repairWorkflow) {
    useWorkflowStore.getState().setWorkflowStatus(repairWorkflow.id, 'active')
    useMessageBusStore.getState().publish(
      repairRecord.agentId,
      'healing.report',
      `Triggered repair workflow "${repairWorkflow.name}" for error: ${repairRecord.errorType}`,
      MessagePriority.High,
    )
  } else {
    // Publish the repair event so other agents can help
    useMessageBusStore.getState().publish(
      repairRecord.agentId,
      'healing.report',
      `No repair workflow found. Error: ${repairRecord.errorType} — ${repairRecord.errorMessage.slice(0, 200)}`,
      MessagePriority.High,
    )
  }
}

// ─── Share Connectors Between Systems ───────────────────────────────

export function getAvailableConnectorsForAgent(agentId: string): string[] {
  const agent = useAgentRuntimeStore.getState().getAgent(agentId)
  if (!agent) return []

  return agent.connectorIds.filter((id) => {
    const connector = useConnectorStore.getState().getConnector(id)
    return connector?.status === 'connected'
  })
}

// ─── Agent-to-Workflow Event Listener ───────────────────────────────

export function setupWorkflowTriggerListener(): void {
  // Subscribe a system listener to watch for workflow trigger messages
  useMessageBusStore.getState().subscribe('workflow-bridge', 'coordination.handoff')
}
