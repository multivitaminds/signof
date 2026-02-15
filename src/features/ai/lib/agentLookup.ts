import type { AgentDetailInfo, AgentType as AgentTypeValue } from '../types'
import { AgentType } from '../types'
import { AGENT_DEFINITIONS } from './agentDefinitions'
import { CORE_PERSONAS } from '../data/corePersonas'
import { getMarketplaceAgentDetail } from '../data/personaGenerator'

const CORE_AGENT_TYPES = new Set(Object.values(AgentType))

export function lookupAgent(agentId: string): AgentDetailInfo | undefined {
  // Check core agents first
  if (CORE_AGENT_TYPES.has(agentId as AgentTypeValue)) {
    const def = AGENT_DEFINITIONS.find(d => d.type === agentId)
    const persona = CORE_PERSONAS[agentId as AgentTypeValue]
    if (!def || !persona) return undefined
    return {
      id: agentId,
      name: def.label,
      description: def.description,
      icon: def.icon,
      color: def.color,
      category: def.category,
      persona,
      useCases: def.useCases,
      capabilities: def.capabilities,
    }
  }

  // Try marketplace: parse "domainId-numericId"
  const dashIdx = agentId.lastIndexOf('-')
  if (dashIdx > 0) {
    const domainId = agentId.slice(0, dashIdx)
    const numId = parseInt(agentId.slice(dashIdx + 1), 10)
    if (!isNaN(numId)) {
      return getMarketplaceAgentDetail(domainId, numId)
    }
  }

  return undefined
}
