import type { ParsedAction, GovernorDecision } from '../types'
import useGovernorStore from '../stores/useGovernorStore'

export function buildResourceId(action: ParsedAction): string | null {
  switch (action.type) {
    case 'connector':
      return action.connectorId ? `connector:${action.connectorId}` : null
    case 'tool':
      return action.toolName ? `tool:${action.toolName}` : null
    case 'workflow':
      return action.workflowId ? `workflow:${action.workflowId}` : null
    case 'message':
    case 'none':
      return null
  }
}

export function checkActionAllowed(action: ParsedAction, agentId: string, priority: number): GovernorDecision {
  const resourceId = buildResourceId(action)
  if (!resourceId) {
    return { allowed: true, reason: 'No lock required' }
  }
  return useGovernorStore.getState().checkResource(resourceId, agentId, priority)
}

export function acquireActionLock(action: ParsedAction, agentId: string, priority: number): GovernorDecision {
  const resourceId = buildResourceId(action)
  if (!resourceId) {
    return { allowed: true, reason: 'No lock required' }
  }
  return useGovernorStore.getState().acquireLock(resourceId, action.type, agentId, priority)
}

export function releaseActionLock(action: ParsedAction, agentId: string): void {
  const resourceId = buildResourceId(action)
  if (!resourceId) {
    return
  }
  useGovernorStore.getState().releaseLock(resourceId, agentId)
}
