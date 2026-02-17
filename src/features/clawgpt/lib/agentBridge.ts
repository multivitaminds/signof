import useAIAgentStore from '../../ai/stores/useAIAgentStore'
import { AGENT_DEFINITIONS } from '../../ai/lib/agentDefinitions'
import type { BrainMessage } from '../types'

export interface AvailableAgent {
  type: string
  label: string
  description: string
  icon: string
  category: string
}

export interface AgentAssignment {
  channelId: string
  agentId: string
  agentType: string
  assignedAt: string
}

export interface MemoryLogEntry {
  id: string
  title: string
  content: string
  sourceType: string
  sourceRef: string
  timestamp: string
}

/**
 * Get all available agent types from the AI agent store definitions.
 */
export function getAvailableAgents(): AvailableAgent[] {
  return AGENT_DEFINITIONS.map(def => ({
    type: def.type,
    label: def.label,
    description: def.description,
    icon: def.icon,
    category: def.category,
  }))
}

/**
 * Assign an agent to a channel. Returns an assignment record
 * with the agent type resolved from the AI agent store.
 */
export function assignAgentToChannel(
  channelId: string,
  agentId: string
): AgentAssignment {
  const store = useAIAgentStore.getState()
  const run = store.runs.find(r => r.id === agentId)
  const agentType = run?.agentType ?? 'researcher'

  return {
    channelId,
    agentId,
    agentType,
    assignedAt: new Date().toISOString(),
  }
}

/**
 * Create a memory entry shape from a BrainMessage.
 * This can be passed to the memory store for persistence.
 */
export function logMessageToMemory(message: BrainMessage): MemoryLogEntry {
  const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 8)

  return {
    id,
    title: `Message from ${message.senderName} via ${message.channelType}`,
    content: message.content,
    sourceType: 'brain_message',
    sourceRef: message.id,
    timestamp: message.timestamp,
  }
}
