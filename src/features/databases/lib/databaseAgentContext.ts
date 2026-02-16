import { useDatabaseStore } from '../stores/useDatabaseStore'
import { FIELD_TYPE_LABELS } from '../types'
import type { DbFieldType } from '../types'
import { TRIGGER_LABELS, ACTION_LABELS } from '../types/automation'
import type { AutomationTrigger, AutomationAction } from '../types/automation'

// ─── Database Overview Context ──────────────────────────────────────

export function buildDatabaseOverviewContext(): string {
  const state = useDatabaseStore.getState()
  const databases = Object.values(state.databases)
  const allTables = Object.values(state.tables)

  if (databases.length === 0) {
    return 'Databases: No databases created yet.'
  }

  const totalRows = allTables.reduce((sum, t) => sum + t.rows.length, 0)
  const totalViews = allTables.reduce((sum, t) => sum + t.views.length, 0)

  const lines: string[] = [
    `Databases: ${databases.length} database(s), ${allTables.length} table(s), ${totalRows} row(s), ${totalViews} view(s)`,
  ]

  for (const db of databases) {
    const dbTables = db.tables.map((tid) => state.tables[tid]).filter(Boolean)
    const dbRows = dbTables.reduce((sum, t) => sum + (t ? t.rows.length : 0), 0)
    lines.push(`  ${db.name}: ${dbTables.length} table(s), ${dbRows} row(s)`)
  }

  return lines.join('\n')
}

// ─── Table Context ──────────────────────────────────────────────────

export function buildTableContext(): string {
  const state = useDatabaseStore.getState()
  const allTables = Object.values(state.tables)

  if (allTables.length === 0) {
    return 'Tables: No tables created yet.'
  }

  const lines: string[] = [`Tables: ${allTables.length} total`]

  for (const table of allTables) {
    lines.push(`  ${table.name}:`)

    // Fields
    const fieldList = table.fields
      .map((f) => `${f.name} (${FIELD_TYPE_LABELS[f.type as DbFieldType] ?? f.type})`)
      .join(', ')
    lines.push(`    Fields: ${fieldList}`)

    // Row count
    lines.push(`    Rows: ${table.rows.length}`)

    // View count
    lines.push(`    Views: ${table.views.length}`)
  }

  return lines.join('\n')
}

// ─── Automation Context ─────────────────────────────────────────────

export function buildAutomationContext(): string {
  const state = useDatabaseStore.getState()
  const automations = state.automations

  if (automations.length === 0) {
    return 'Automations: No automation rules configured.'
  }

  const active = automations.filter((a) => a.enabled)
  const inactive = automations.filter((a) => !a.enabled)

  const lines: string[] = [
    `Automations: ${automations.length} total (${active.length} active, ${inactive.length} inactive)`,
  ]

  for (const rule of automations) {
    const triggerLabel = TRIGGER_LABELS[rule.trigger as AutomationTrigger] ?? rule.trigger
    const actionLabel = ACTION_LABELS[rule.action as AutomationAction] ?? rule.action
    lines.push(`  ${rule.name}: ${triggerLabel} -> ${actionLabel} (${rule.enabled ? 'active' : 'inactive'}, ${rule.runCount} runs)`)
  }

  return lines.join('\n')
}

// ─── Full Database Context ──────────────────────────────────────────

export function buildFullDatabaseContext(): string {
  const lines: string[] = [
    '=== Database Context ===',
    '',
    buildDatabaseOverviewContext(),
    '',
    buildTableContext(),
    '',
    buildAutomationContext(),
    '',
    '=== End Database Context ===',
  ]

  return lines.join('\n')
}
