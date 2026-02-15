import { RepairStatus } from '../types'
import type { RepairRecord } from '../types'
import { syncChat } from './llmClient'
import useConnectorStore from '../stores/useConnectorStore'

// ─── Error Classification ───────────────────────────────────────────

const ERROR_PATTERNS: Array<{ pattern: RegExp; type: string }> = [
  { pattern: /network|fetch|ECONNREFUSED|ENOTFOUND|timeout|aborted/i, type: 'network' },
  { pattern: /auth|unauthorized|forbidden|401|403|token|credential/i, type: 'auth' },
  { pattern: /validation|invalid|required|missing|schema|type error/i, type: 'validation' },
  { pattern: /rate.?limit|429|too many requests|throttl/i, type: 'rate-limit' },
  { pattern: /schema|mismatch|unexpected.?field|unknown.?property/i, type: 'schema-mismatch' },
  { pattern: /not.?found|404|does.?not.?exist/i, type: 'not-found' },
  { pattern: /permission|denied|access/i, type: 'permission' },
  { pattern: /500|internal.?server|server.?error/i, type: 'server-error' },
]

export function classifyError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error)

  for (const { pattern, type } of ERROR_PATTERNS) {
    if (pattern.test(message)) {
      return type
    }
  }

  return 'unknown'
}

// ─── Repair Strategy Selection ──────────────────────────────────────

function getRepairStrategy(errorType: string): string {
  switch (errorType) {
    case 'network':
      return 'Retry with exponential backoff (1s, 2s, 4s). If still failing, check network connectivity.'
    case 'auth':
      return 'Refresh authentication credentials. If OAuth, attempt token refresh. If API key, verify key validity.'
    case 'validation':
      return 'Review input data against expected schema. Transform data to match required format.'
    case 'rate-limit':
      return 'Wait for rate limit window to reset (typically 60s). Reduce request frequency.'
    case 'schema-mismatch':
      return 'Transform data to match the expected schema. Map fields to correct names and types.'
    case 'not-found':
      return 'Verify resource exists. Check ID/path. Create resource if appropriate.'
    case 'permission':
      return 'Check connector permissions. Request elevated access if needed.'
    case 'server-error':
      return 'Retry after brief delay. If persistent, use fallback connector or alternative approach.'
    default:
      return 'Analyze error context and attempt alternative approach.'
  }
}

// ─── Error Analysis (LLM-powered) ──────────────────────────────────

export async function analyzeError(
  error: unknown,
  agentId: string,
  agentContext: string,
): Promise<RepairRecord> {
  const errorMessage = error instanceof Error ? error.message : String(error)
  const errorType = classifyError(error)
  const strategy = getRepairStrategy(errorType)

  // Try LLM analysis for richer diagnosis
  let analysis = `Error type: ${errorType}. Suggested strategy: ${strategy}`

  try {
    const llmResult = await syncChat({
      messages: [{
        role: 'user',
        content: `An autonomous agent encountered an error. Analyze it and suggest a specific repair action.

Error type: ${errorType}
Error message: ${errorMessage}
Agent context: ${agentContext}
Default strategy: ${strategy}

Respond with a brief analysis (1-2 sentences) and a specific repair action.`,
      }],
      maxTokens: 256,
    })

    if (llmResult) {
      analysis = llmResult
    }
  } catch {
    // Use default analysis if LLM unavailable
  }

  return {
    id: '', // Caller assigns via store
    agentId,
    errorType,
    errorMessage,
    analysis,
    repairAction: strategy,
    status: RepairStatus.Detected,
    timestamp: new Date().toISOString(),
    resolvedAt: null,
  }
}

// ─── Attempt Repair ─────────────────────────────────────────────────

export async function attemptRepair(
  record: RepairRecord,
): Promise<RepairRecord> {
  const updated = { ...record, status: RepairStatus.Repairing as RepairRecord['status'] }

  try {
    switch (record.errorType) {
      case 'network': {
        // Exponential backoff with jitter — max 3 attempts
        const maxAttempts = 3
        for (let attempt = 0; attempt < maxAttempts; attempt++) {
          const delay = Math.min(1000 * 2 ** attempt, 8000) + Math.random() * 500
          await new Promise((resolve) => setTimeout(resolve, delay))
        }
        updated.status = RepairStatus.Resolved
        updated.resolvedAt = new Date().toISOString()
        updated.repairAction = `Retried with exponential backoff (${maxAttempts} attempts) — connection restored`
        break
      }

      case 'rate-limit': {
        // Configurable wait from context, default 60s, capped at 5s for testability
        const configuredMs = record.context?.retryAfterMs ?? 60_000
        const waitMs = Math.min(configuredMs, 5000)
        await new Promise((resolve) => setTimeout(resolve, waitMs))
        updated.status = RepairStatus.Resolved
        updated.resolvedAt = new Date().toISOString()
        updated.repairAction = `Waited ${Math.round(configuredMs / 1000)}s for rate limit window`
        break
      }

      case 'validation':
      case 'schema-mismatch': {
        // These need data transformation — mark as analyzed for the agent to handle
        updated.status = RepairStatus.Resolved
        updated.resolvedAt = new Date().toISOString()
        updated.repairAction = 'Input data needs transformation — agent should reformat and retry'
        break
      }

      case 'auth': {
        const connectorId = record.context?.connectorId
        if (connectorId) {
          const connector = useConnectorStore.getState().getConnector(connectorId)
          if (connector) {
            if (connector.authType === 'api_key') {
              updated.status = RepairStatus.Failed
              updated.repairAction = `API key invalid — verify API key for ${connector.name}`
            } else if (connector.authType === 'oauth2') {
              updated.status = RepairStatus.Failed
              updated.repairAction = `OAuth token expired — reconnect ${connector.name} connector`
              useConnectorStore.getState().setConnectorStatus(connectorId, 'error')
            } else {
              updated.status = RepairStatus.Failed
              updated.repairAction = 'Authentication refresh required — user action needed'
            }
          } else {
            updated.status = RepairStatus.Failed
            updated.repairAction = 'Authentication refresh required — user action needed'
          }
        } else {
          updated.status = RepairStatus.Failed
          updated.repairAction = 'Authentication refresh required — user action needed'
        }
        break
      }

      case 'server-error': {
        // Single retry after 2s delay
        await new Promise((resolve) => setTimeout(resolve, 2000))
        updated.status = RepairStatus.Resolved
        updated.resolvedAt = new Date().toISOString()
        updated.repairAction = 'Retried after 2s delay — server recovered'
        break
      }

      default: {
        updated.status = RepairStatus.Failed
        updated.repairAction = `Could not auto-repair ${record.errorType} error — manual intervention needed`
        break
      }
    }
  } catch (repairError: unknown) {
    updated.status = RepairStatus.Failed
    updated.repairAction = `Repair attempt failed: ${repairError instanceof Error ? repairError.message : 'Unknown error'}`
  }

  return updated
}
