import type { WorkflowNodeDefinition } from '../../types'
import { triggerNodes } from './triggerNodes'
import { actionNodes } from './actionNodes'
import { agentNodes } from './agentNodes'
import { logicNodes } from './logicNodes'
import { transformNodes } from './transformNodes'

const ALL_NODE_DEFINITIONS: WorkflowNodeDefinition[] = [
  ...triggerNodes,
  ...actionNodes,
  ...agentNodes,
  ...logicNodes,
  ...transformNodes,
]

export const NODE_REGISTRY: Record<string, WorkflowNodeDefinition> = {}
for (const def of ALL_NODE_DEFINITIONS) {
  NODE_REGISTRY[def.type] = def
}

export function getNodeDefinition(type: string): WorkflowNodeDefinition | undefined {
  return NODE_REGISTRY[type]
}

export function getNodesByCategory(category: WorkflowNodeDefinition['category']): WorkflowNodeDefinition[] {
  return ALL_NODE_DEFINITIONS.filter((n) => n.category === category)
}

export function getAllNodeDefinitions(): WorkflowNodeDefinition[] {
  return ALL_NODE_DEFINITIONS
}

export { triggerNodes, actionNodes, agentNodes, logicNodes, transformNodes }
