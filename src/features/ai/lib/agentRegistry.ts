import type { AgentCapabilityManifest, AgentDomain } from '../types'

// ─── Agent Registry (Singleton) ─────────────────────────────────────

const registry = new Map<string, AgentCapabilityManifest>()

export function registerAgent(manifest: AgentCapabilityManifest): void {
  registry.set(manifest.agentTypeId, manifest)
}

export function getAgent(agentTypeId: string): AgentCapabilityManifest | undefined {
  return registry.get(agentTypeId)
}

export function getAll(): AgentCapabilityManifest[] {
  return Array.from(registry.values())
}

export function findByDomain(domain: AgentDomain): AgentCapabilityManifest[] {
  return Array.from(registry.values()).filter((m) => m.domain === domain)
}

export function findByCapability(toolName: string): AgentCapabilityManifest[] {
  return Array.from(registry.values()).filter((m) =>
    m.capabilities.tools.includes(toolName)
  )
}

export function matchTaskToAgents(
  taskDescription: string,
  domain?: AgentDomain,
): AgentCapabilityManifest[] {
  const lower = taskDescription.toLowerCase()
  const candidates = domain
    ? findByDomain(domain)
    : Array.from(registry.values())

  // Score each agent by keyword overlap
  const scored = candidates.map((agent) => {
    let score = 0
    const keywords = [
      ...agent.capabilities.inputTypes,
      ...agent.capabilities.outputTypes,
      ...agent.capabilities.domains,
      agent.displayName.toLowerCase(),
      agent.description.toLowerCase(),
    ]
    for (const kw of keywords) {
      if (lower.includes(kw.toLowerCase())) score += 2
    }
    // Bonus for tool overlap with task keywords
    for (const tool of agent.capabilities.tools) {
      const toolWords = tool.replace(/_/g, ' ')
      if (lower.includes(toolWords)) score += 3
    }
    return { agent, score }
  })

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((s) => s.agent)
}

export function getDomainStats(): Record<AgentDomain, number> {
  const stats = {} as Record<AgentDomain, number>
  for (const agent of registry.values()) {
    stats[agent.domain] = (stats[agent.domain] ?? 0) + 1
  }
  return stats
}

export function getRegistrySize(): number {
  return registry.size
}
