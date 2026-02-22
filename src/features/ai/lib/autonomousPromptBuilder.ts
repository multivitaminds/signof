import type { AutonomousAgent, AgentGoal, AgentMessage, RepairRecord, ConnectorDefinition, AgentType } from '../types'
import type { MemoryEntry } from '../types'
import useCostTrackingStore from '../stores/useCostTrackingStore'
import useCircuitBreakerStore from '../stores/useCircuitBreakerStore'
import useAgentIdentityStore from '../stores/useAgentIdentityStore'
import { formatTokenCount } from './tokenCount'

export function buildAutonomousPrompt(
  agent: AutonomousAgent,
  memories: MemoryEntry[],
  connectors: ConnectorDefinition[],
  recentMessages: AgentMessage[],
  recentRepairs: RepairRecord[],
): string {
  const lines: string[] = []

  // ── Agent Identity ───────────────────────────────────────────────
  lines.push(`You are the "${agent.name}" autonomous agent in OriginA.`)
  lines.push(`Description: ${agent.description}`)
  lines.push(`Integrations: ${agent.integrations}`)
  lines.push('')

  // ── Autonomy Mode ────────────────────────────────────────────────
  switch (agent.autonomyMode) {
    case 'full_auto':
      lines.push('Autonomy Mode: FULL AUTO — You may act freely without user approval. Execute actions directly.')
      break
    case 'suggest':
      lines.push('Autonomy Mode: SUGGEST — Present your planned actions for user review before executing. Explain your reasoning.')
      break
    case 'ask_first':
      lines.push('Autonomy Mode: ASK FIRST — Always ask for explicit user permission before taking any action.')
      break
  }
  lines.push('')

  // ── Goal Stack ───────────────────────────────────────────────────
  const activeGoals = agent.goalStack.filter((g: AgentGoal) => g.status === 'active')
  if (activeGoals.length > 0) {
    lines.push('Active Goals (ordered by priority):')
    const sorted = [...activeGoals].sort((a, b) => b.priority - a.priority)
    for (const goal of sorted) {
      lines.push(`  [P${goal.priority}] ${goal.description}`)
      if (goal.subGoals.length > 0) {
        for (const sub of goal.subGoals) {
          lines.push(`    - ${sub}`)
        }
      }
    }
    lines.push('')
  }

  // ── Available Connectors ─────────────────────────────────────────
  const agentConnectors = connectors.filter((c) => agent.connectorIds.includes(c.id))
  if (agentConnectors.length > 0) {
    lines.push('Available Connectors:')
    for (const conn of agentConnectors) {
      const actions = conn.actions.map((a) => a.name).join(', ')
      lines.push(`  - ${conn.name} [${conn.status}]: ${actions}`)
    }
    lines.push('')
  }

  // ── Memory Context ───────────────────────────────────────────────
  if (memories.length > 0) {
    lines.push('Relevant Memories:')
    for (const mem of memories.slice(0, 15)) {
      lines.push(`  [${mem.category}] ${mem.title}: ${mem.content.slice(0, 200)}`)
    }
    lines.push('')
  }

  // ── Recent Messages ──────────────────────────────────────────────
  if (recentMessages.length > 0) {
    lines.push('Recent Messages:')
    for (const msg of recentMessages.slice(-10)) {
      const from = msg.fromAgentId
      const to = msg.toAgentId ?? msg.topic
      lines.push(`  [${msg.priority}] ${from} → ${to}: ${msg.content.slice(0, 150)}`)
    }
    lines.push('')
  }

  // ── Self-Healing Context ─────────────────────────────────────────
  const relevantRepairs = recentRepairs.filter((r) => r.agentId === String(agent.id))
  if (relevantRepairs.length > 0) {
    lines.push('Recent Repairs (avoid repeating these errors):')
    for (const repair of relevantRepairs.slice(-5)) {
      lines.push(`  - ${repair.errorType}: ${repair.errorMessage.slice(0, 100)} → ${repair.repairAction.slice(0, 100)} [${repair.status}]`)
    }
    lines.push('')
  }

  // ── Budget Status ──────────────────────────────────────────────────
  const budget = useCostTrackingStore.getState().getBudget(String(agent.id))
  if (budget) {
    const tokenPct = budget.maxTokens > 0 ? Math.round((budget.usedTokens / budget.maxTokens) * 100) : 0
    lines.push('Budget Status:')
    lines.push(`  Tokens: ${formatTokenCount(budget.usedTokens)} / ${formatTokenCount(budget.maxTokens)} (${tokenPct}%)`)
    lines.push(`  Cost: $${budget.usedCostUsd.toFixed(2)} / $${budget.maxCostUsd.toFixed(2)}`)
    if (tokenPct >= budget.warningThresholdPct) {
      lines.push(`  WARNING: Budget at ${tokenPct}%. Conserve tokens.`)
    }
    lines.push('')
  }

  // ── Circuit Breaker Alerts ─────────────────────────────────────────
  const allBreakers = Array.from(useCircuitBreakerStore.getState().breakers.values())
  const alertBreakers = allBreakers.filter((b) => b.state !== 'closed')
  if (alertBreakers.length > 0) {
    lines.push('Circuit Breaker Alerts:')
    for (const b of alertBreakers) {
      lines.push(`  - ${b.connectorId}: ${b.state} (failures: ${b.failureCount}, retry after: ${b.nextRetryAt ?? 'N/A'})`)
    }
    lines.push('  Avoid using connectors with open circuits.')
    lines.push('')
  }

  // ── Contract Scope ─────────────────────────────────────────────────
  const identity = useAgentIdentityStore.getState().findByAgentType(agent.name as AgentType)?.[0]
  if (identity) {
    lines.push('Contract Scope:')
    if (identity.contract.allowedTools.length > 0) {
      lines.push(`  Allowed tools: ${identity.contract.allowedTools.join(', ')}`)
    }
    if (identity.contract.allowedConnectors.length > 0) {
      lines.push(`  Allowed connectors: ${identity.contract.allowedConnectors.join(', ')}`)
    }
    if (identity.contract.restrictions.length > 0) {
      lines.push(`  Restrictions: ${identity.contract.restrictions.join('; ')}`)
    }
    lines.push(`  Reputation: ${identity.reputationScore}/100`)
    lines.push('')
  }

  // ── Instructions ─────────────────────────────────────────────────
  lines.push('Instructions:')
  lines.push('- Think step by step: observe → reason → plan → act → reflect')
  lines.push('- Use available connectors and tools to accomplish your goals')
  lines.push('- Remember important observations for future reference')
  lines.push('- If an action fails, analyze the error and try an alternative approach')
  lines.push('- Communicate with other agents via the message bus when coordination is needed')
  lines.push('- Be concise and actionable in your responses')

  return lines.join('\n')
}
