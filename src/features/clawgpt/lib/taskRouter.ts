import { matchTaskToAgents, findByDomain, getAll } from '../../ai/lib/agentRegistry'
import { useFleetStore } from '../stores/useFleetStore'
import { FleetAgentStatus } from '../types'
import type { TaskQueueItem } from '../types'
import type { AgentCapabilityManifest, AgentDomain } from '../../ai/types'

// ─── Types ──────────────────────────────────────────────────────────

interface RouteResult {
  matched: boolean
  agentTypeId: string | null
  instanceId: string | null
  reason: string
}

interface ScoredCandidate {
  manifest: AgentCapabilityManifest
  score: number
  hasActiveInstance: boolean
  activeInstanceId: string | null
}

// ─── Scoring ────────────────────────────────────────────────────────

function scoreCandidate(
  manifest: AgentCapabilityManifest,
  task: TaskQueueItem,
): number {
  let score = 0
  const lower = task.description.toLowerCase()

  // Keyword match on display name
  const nameWords = manifest.displayName.toLowerCase().split(/\s+/)
  for (const word of nameWords) {
    if (word.length > 2 && lower.includes(word)) score += 5
  }

  // Keyword match on description
  const descWords = manifest.description.toLowerCase().split(/\s+/)
  for (const word of descWords) {
    if (word.length > 3 && lower.includes(word)) score += 2
  }

  // Domain match
  if (task.domain && manifest.domain === task.domain) {
    score += 10
  }

  // Input type match
  for (const inputType of manifest.capabilities.inputTypes) {
    if (lower.includes(inputType.toLowerCase())) score += 3
  }

  // Capability domain tag match
  for (const tag of manifest.capabilities.domains) {
    if (lower.includes(tag.toLowerCase())) score += 2
  }

  // Cost tier preference — prefer cheaper agents for normal/low priority
  if (task.priority === 'normal' || task.priority === 'low') {
    if (manifest.constraints.costTier === 'cheap') score += 3
    else if (manifest.constraints.costTier === 'standard') score += 1
  }

  // Latency preference — prefer realtime for critical/high priority
  if (task.priority === 'critical' || task.priority === 'high') {
    if (manifest.constraints.latencyProfile === 'realtime') score += 3
    else if (manifest.constraints.latencyProfile === 'interactive') score += 1
  }

  return score
}

// ─── Route Task ─────────────────────────────────────────────────────

export function routeTask(task: TaskQueueItem): RouteResult {
  // 1. Use registry matching to find candidates
  const registryMatches = matchTaskToAgents(
    task.description,
    task.domain as AgentDomain | undefined,
  )

  // 2. If no registry matches, try domain-based lookup
  const candidates = registryMatches.length > 0
    ? registryMatches
    : task.domain
      ? findByDomain(task.domain as AgentDomain)
      : getAll()

  if (candidates.length === 0) {
    return {
      matched: false,
      agentTypeId: null,
      instanceId: null,
      reason: 'No matching agents found in registry',
    }
  }

  // 3. Score and rank candidates
  const activeInstances = useFleetStore.getState().activeInstances
  const scored: ScoredCandidate[] = candidates.map((manifest) => {
    const instanceEntry = Object.values(activeInstances).find(
      (inst) =>
        inst.registryId === manifest.agentTypeId &&
        (inst.status === FleetAgentStatus.Idle || inst.status === FleetAgentStatus.Working)
    )
    return {
      manifest,
      score: scoreCandidate(manifest, task),
      hasActiveInstance: !!instanceEntry,
      activeInstanceId: instanceEntry?.instanceId ?? null,
    }
  })

  // Sort by: has active idle instance first, then by score
  scored.sort((a, b) => {
    // Prefer agents with idle instances
    const aIdle = a.hasActiveInstance && activeInstances[a.activeInstanceId!]?.status === FleetAgentStatus.Idle
    const bIdle = b.hasActiveInstance && activeInstances[b.activeInstanceId!]?.status === FleetAgentStatus.Idle
    if (aIdle && !bIdle) return -1
    if (!aIdle && bIdle) return 1
    return b.score - a.score
  })

  const best = scored[0]
  if (!best || best.score === 0) {
    // Fallback: return first candidate by domain
    const fallback = candidates[0]
    if (fallback) {
      return {
        matched: true,
        agentTypeId: fallback.agentTypeId,
        instanceId: null,
        reason: `Fallback match: ${fallback.displayName} (no keyword match, domain-based)`,
      }
    }
    return {
      matched: false,
      agentTypeId: null,
      instanceId: null,
      reason: 'No candidates scored above threshold',
    }
  }

  return {
    matched: true,
    agentTypeId: best.manifest.agentTypeId,
    instanceId: best.activeInstanceId,
    reason: `Best match: ${best.manifest.displayName} (score: ${best.score})`,
  }
}

// ─── Route to Multiple ──────────────────────────────────────────────

export function routeToMultiple(
  task: TaskQueueItem,
  count: number,
): RouteResult[] {
  const registryMatches = matchTaskToAgents(
    task.description,
    task.domain as AgentDomain | undefined,
  )

  const scored = registryMatches.map((manifest) => ({
    manifest,
    score: scoreCandidate(manifest, task),
  }))

  scored.sort((a, b) => b.score - a.score)

  return scored.slice(0, count).map((s) => ({
    matched: true,
    agentTypeId: s.manifest.agentTypeId,
    instanceId: null,
    reason: `Multi-route match: ${s.manifest.displayName} (score: ${s.score})`,
  }))
}

// ─── Task Decomposition (stub for workflow integration) ─────────────

export function decomposeTask(description: string): string[] {
  // Simple heuristic decomposition — split on conjunctions and list markers
  const parts = description
    .split(/(?:,\s*(?:and|then|also)\s*)|(?:\.\s+)|(?:\d+\.\s+)|(?:;\s*)/)
    .map((s) => s.trim())
    .filter((s) => s.length > 10)

  return parts.length > 1 ? parts : [description]
}
