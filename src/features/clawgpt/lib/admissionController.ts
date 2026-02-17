import { getAgent } from '../../ai/lib/agentRegistry'
import useCostTrackingStore from '../../ai/stores/useCostTrackingStore'
import useAgentIdentityStore from '../../ai/stores/useAgentIdentityStore'
import { useFleetStore } from '../stores/useFleetStore'
import type { ParsedAction } from '../../ai/types'
import { AlertSeverity } from '../types'

// ─── Types ──────────────────────────────────────────────────────────

export interface AdmissionResult {
  allowed: boolean
  gate: 'capability' | 'scope' | 'risk' | 'budget' | 'circuit_breaker' | null
  reason: string
  escalateTo: 'user' | 'admin' | null
}

type RiskLevel = 'low' | 'medium' | 'high' | 'critical'

// ─── Risk Classification ────────────────────────────────────────────

function classifyRisk(action: ParsedAction): RiskLevel {
  // Critical: actions that modify billing, delete data, or external API calls
  const criticalPatterns = ['delete', 'remove', 'payment', 'billing', 'api_key']
  const highPatterns = ['create_invoice', 'create_expense', 'create_tax_filing', 'cancel_booking']
  const mediumPatterns = ['create_', 'add_', 'send_notification']

  const actionStr = `${action.type} ${action.toolName ?? ''} ${action.connectorId ?? ''} ${action.description}`.toLowerCase()

  for (const pattern of criticalPatterns) {
    if (actionStr.includes(pattern)) return 'critical'
  }
  for (const pattern of highPatterns) {
    if (actionStr.includes(pattern)) return 'high'
  }
  for (const pattern of mediumPatterns) {
    if (actionStr.includes(pattern)) return 'medium'
  }
  return 'low'
}

// ─── Admission Controller ───────────────────────────────────────────

export function evaluateAction(
  instanceId: string,
  registryId: string,
  action: ParsedAction,
): AdmissionResult {
  const manifest = getAgent(registryId)

  // Gate 1: Capability — does manifest allow this action type?
  if (manifest) {
    if (action.type === 'tool' && action.toolName) {
      if (!manifest.capabilities.tools.includes(action.toolName)) {
        return {
          allowed: false,
          gate: 'capability',
          reason: `Agent "${manifest.displayName}" does not have capability for tool "${action.toolName}"`,
          escalateTo: null,
        }
      }
    }
    if (action.type === 'connector' && action.connectorId) {
      if (
        manifest.capabilities.connectors.length > 0 &&
        !manifest.capabilities.connectors.includes(action.connectorId)
      ) {
        return {
          allowed: false,
          gate: 'capability',
          reason: `Agent "${manifest.displayName}" does not have access to connector "${action.connectorId}"`,
          escalateTo: null,
        }
      }
    }
  }

  // Gate 2: Scope — is action within the agent's domain?
  if (manifest && action.type === 'tool' && action.toolName) {
    const agentDomains = manifest.capabilities.domains
    // Scope check: only warn, don't block — cross-module actions are valid
    if (agentDomains.length > 0) {
      const toolDomain = inferToolDomain(action.toolName)
      if (toolDomain && !agentDomains.includes(toolDomain) && !agentDomains.includes('cross-module')) {
        // Soft scope warning — add alert but allow
        useFleetStore.getState().addAlert(
          AlertSeverity.Info,
          `Agent "${manifest.displayName}" executing out-of-scope tool "${action.toolName}" (domain: ${toolDomain})`,
          instanceId,
        )
      }
    }
  }

  // Gate 3: Risk — classify risk level, require approval for high+
  const riskLevel = classifyRisk(action)
  if (manifest) {
    const requiresApproval = manifest.constraints.requiresApproval
    if (
      (riskLevel === 'critical') ||
      (riskLevel === 'high' && requiresApproval.includes(action.type))
    ) {
      return {
        allowed: false,
        gate: 'risk',
        reason: `Action classified as ${riskLevel} risk: "${action.description}" — requires approval`,
        escalateTo: riskLevel === 'critical' ? 'admin' : 'user',
      }
    }
  }

  // Gate 4: Budget — check remaining budget
  const fleetInstance = useFleetStore.getState().activeInstances[instanceId]
  if (manifest && fleetInstance) {
    const maxCost = manifest.constraints.maxCostUsdBudget
    if (maxCost > 0 && fleetInstance.costUsd >= maxCost) {
      useFleetStore.getState().addAlert(
        AlertSeverity.Warning,
        `Agent "${manifest.displayName}" has exceeded cost budget ($${fleetInstance.costUsd.toFixed(4)} / $${maxCost.toFixed(2)})`,
        instanceId,
      )
      return {
        allowed: false,
        gate: 'budget',
        reason: `Cost budget exceeded: $${fleetInstance.costUsd.toFixed(4)} / $${maxCost.toFixed(2)}`,
        escalateTo: 'user',
      }
    }
    const maxTokens = manifest.constraints.maxTokenBudget
    if (maxTokens > 0 && fleetInstance.tokensConsumed >= maxTokens) {
      return {
        allowed: false,
        gate: 'budget',
        reason: `Token budget exceeded: ${fleetInstance.tokensConsumed} / ${maxTokens}`,
        escalateTo: 'user',
      }
    }
  }

  // Gate 5: Budget check via cost tracking store (agent-level budgets)
  const runtimeAgentId = fleetInstance?.runtimeAgentId
  if (runtimeAgentId) {
    const estimatedTokens = action.type === 'connector' ? 0 : 50
    const estimatedCost = action.type === 'connector' ? 0.001 : 0.0001
    const budgetCheck = useCostTrackingStore.getState().checkBudget(runtimeAgentId, estimatedTokens, estimatedCost)
    if (!budgetCheck.allowed) {
      return {
        allowed: false,
        gate: 'budget',
        reason: `Runtime budget: ${budgetCheck.reason}`,
        escalateTo: 'user',
      }
    }
  }

  // Gate 6: Contract check via identity store
  if (runtimeAgentId) {
    const identityStore = useAgentIdentityStore.getState()
    const allIdentities = Array.from(identityStore.identities.values())
    const identity = allIdentities.find((i) => i.id === runtimeAgentId)
    if (identity) {
      const contractCheck = identityStore.checkContract(identity.id, action)
      if (!contractCheck.allowed) {
        return {
          allowed: false,
          gate: 'capability',
          reason: `Contract violation: ${contractCheck.reason}`,
          escalateTo: null,
        }
      }
    }
  }

  return {
    allowed: true,
    gate: null,
    reason: 'All admission gates passed',
    escalateTo: null,
  }
}

// ─── Helpers ────────────────────────────────────────────────────────

function inferToolDomain(toolName: string): string | null {
  const domainMap: Record<string, string> = {
    create_page: 'workspace',
    search_pages: 'workspace',
    add_block: 'workspace',
    create_issue: 'projects',
    list_issues: 'projects',
    create_cycle: 'projects',
    create_goal: 'projects',
    create_template: 'documents',
    add_contact: 'documents',
    create_booking: 'scheduling',
    create_event_type: 'scheduling',
    cancel_booking: 'scheduling',
    list_bookings: 'scheduling',
    analyze_bookings: 'scheduling',
    get_availability_summary: 'scheduling',
    get_no_show_stats: 'scheduling',
    review_calendar_health: 'scheduling',
    get_waitlist_summary: 'scheduling',
    create_database: 'databases',
    add_table: 'databases',
    add_row: 'databases',
    analyze_database_schema: 'databases',
    get_table_stats: 'databases',
    review_database_automations: 'databases',
    analyze_views: 'databases',
    get_relation_map: 'databases',
    create_invoice: 'accounting',
    create_expense: 'accounting',
    analyze_expenses: 'accounting',
    get_invoice_summary: 'accounting',
    get_account_balance: 'accounting',
    review_cash_flow: 'accounting',
    get_payroll_summary: 'accounting',
    create_tax_filing: 'tax',
    analyze_tax_document: 'tax',
    suggest_deductions: 'tax',
    review_filing: 'tax',
    explain_tax_field: 'tax',
    check_submission_status: 'tax',
    mark_all_read: 'inbox',
    send_notification: 'inbox',
    get_workspace_stats: 'cross-module',
    get_upcoming_deadlines: 'cross-module',
  }
  return domainMap[toolName] ?? null
}
