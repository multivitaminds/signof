import { create } from 'zustand'
import { useDatabaseStore } from './useDatabaseStore'
import { FIELD_TYPE_LABELS } from '../types'
import type { DbFieldType } from '../types'
import { TRIGGER_LABELS, ACTION_LABELS } from '../types/automation'
import type { AutomationTrigger, AutomationAction } from '../types/automation'

// ─── ID Generator ────────────────────────────────────────────────────

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

// ─── Types ──────────────────────────────────────────────────────────

export interface CopilotMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  context?: string
}

export interface CopilotSuggestion {
  id: string
  type: 'tip' | 'warning' | 'optimization' | 'missing_info' | 'review'
  title: string
  description: string
  action?: { label: string; route?: string }
  dismissed: boolean
  sectionId?: string
}

// ─── Response Generator ─────────────────────────────────────────────

function generateResponse(userMessage: string, context?: string): string {
  const msg = userMessage.toLowerCase()

  const dbState = useDatabaseStore.getState()
  const databases = Object.values(dbState.databases)
  const allTables = Object.values(dbState.tables)
  const automations = dbState.automations

  // Keyword: relation / lookup / rollup / formula (check before table/field since "field" is common)
  if (msg.includes('relation') || msg.includes('lookup') || msg.includes('rollup') || msg.includes('formula')) {
    const advancedFields = allTables.flatMap((t) =>
      t.fields.filter((f) =>
        f.type === 'relation' || f.type === 'lookup' || f.type === 'rollup' || f.type === 'formula'
      ).map((f) => ({ tableName: t.name, fieldName: f.name, type: f.type }))
    )

    if (advancedFields.length === 0) {
      return 'No relation, lookup, rollup, or formula fields found. These advanced field types let you connect tables and compute derived values.'
    }

    const list = advancedFields
      .map((f) => `- ${f.tableName} > ${f.fieldName} (${FIELD_TYPE_LABELS[f.type as DbFieldType] ?? f.type})`)
      .join('\n')

    return `Found ${advancedFields.length} advanced field(s):\n\n${list}`
  }

  // Keyword: table / field / column
  if (msg.includes('table') || msg.includes('field') || msg.includes('column')) {
    if (allTables.length === 0) {
      return 'No tables found in your databases. Create a database first and it will include a default table.'
    }

    const tableList = allTables.map((t) => {
      const fieldSummary = t.fields
        .map((f) => `${f.name} (${FIELD_TYPE_LABELS[f.type as DbFieldType] ?? f.type})`)
        .join(', ')
      return `- ${t.name}: ${t.fields.length} field(s), ${t.rows.length} row(s)\n  Fields: ${fieldSummary}`
    }).join('\n')

    return `You have ${allTables.length} table(s) across ${databases.length} database(s).\n\n${tableList}`
  }

  // Keyword: row / record
  if (msg.includes('row') || msg.includes('record')) {
    const totalRows = allTables.reduce((sum, t) => sum + t.rows.length, 0)
    const tableBreakdown = allTables
      .map((t) => `- ${t.name}: ${t.rows.length} row(s)`)
      .join('\n')

    return `You have ${totalRows} total row(s) across ${allTables.length} table(s).\n\n${tableBreakdown}`
  }

  // Keyword: view / kanban / grid / calendar / gallery / form / timeline
  if (msg.includes('view') || msg.includes('kanban') || msg.includes('grid') || msg.includes('calendar') || msg.includes('gallery') || msg.includes('form') || msg.includes('timeline')) {
    const allViews = allTables.flatMap((t) => t.views)
    const viewsByType: Record<string, number> = {}
    for (const v of allViews) {
      viewsByType[v.type] = (viewsByType[v.type] ?? 0) + 1
    }
    const breakdown = Object.entries(viewsByType)
      .map(([type, count]) => `- ${type}: ${count}`)
      .join('\n')

    return `You have ${allViews.length} view(s) across ${allTables.length} table(s).\n\nBy type:\n${breakdown}`
  }

  // Keyword: automation
  if (msg.includes('automation')) {
    if (automations.length === 0) {
      return 'No automations configured yet. Automations can trigger actions (like sending notifications or updating fields) when records change.'
    }

    const active = automations.filter((a) => a.enabled)
    const inactive = automations.filter((a) => !a.enabled)
    const list = automations
      .map((a) => {
        const triggerLabel = TRIGGER_LABELS[a.trigger as AutomationTrigger] ?? a.trigger
        const actionLabel = ACTION_LABELS[a.action as AutomationAction] ?? a.action
        return `- ${a.name}: ${triggerLabel} -> ${actionLabel} (${a.enabled ? 'active' : 'inactive'}, ${a.runCount} runs)`
      })
      .join('\n')

    return `You have ${automations.length} automation(s) (${active.length} active, ${inactive.length} inactive).\n\n${list}`
  }

  // Keyword: filter / sort / group
  if (msg.includes('filter') || msg.includes('sort') || msg.includes('group')) {
    const viewsWithFilters = allTables.flatMap((t) => t.views).filter((v) => v.filters.length > 0)
    const viewsWithSorts = allTables.flatMap((t) => t.views).filter((v) => v.sorts.length > 0)
    const viewsWithGrouping = allTables.flatMap((t) => t.views).filter((v) => v.groupBy)

    return `Data organization across your views:\n- ${viewsWithFilters.length} view(s) with active filters\n- ${viewsWithSorts.length} view(s) with sorting\n- ${viewsWithGrouping.length} view(s) with grouping`
  }

  // Keyword: import / export
  if (msg.includes('import') || msg.includes('export')) {
    const totalRows = allTables.reduce((sum, t) => sum + t.rows.length, 0)
    return `Your database contains ${totalRows} total row(s) across ${allTables.length} table(s). Import and export capabilities let you move data in and out of your databases.`
  }

  // Keyword: schema
  if (msg.includes('schema')) {
    if (allTables.length === 0) {
      return 'No schema to display — create a database first.'
    }

    const schema = allTables.map((t) => {
      const fields = t.fields
        .map((f) => `  - ${f.name}: ${FIELD_TYPE_LABELS[f.type as DbFieldType] ?? f.type}${f.required ? ' (required)' : ''}`)
        .join('\n')
      return `Table: ${t.name}\n${fields}`
    }).join('\n\n')

    return `Database schema:\n\n${schema}`
  }

  // Context-aware response based on section
  if (context) {
    const sectionContextMap: Record<string, string> = {
      tables: 'the Tables view, where you manage your database tables, fields, and rows',
      views: 'the Views section, where you configure how data is displayed (grid, kanban, calendar, gallery, form, timeline)',
      automations: 'the Automations section, where you set up rules to trigger actions when records change',
      schema: 'the Schema view, where you review and modify your table structure and field types',
    }
    const sectionDesc = sectionContextMap[context]
    if (sectionDesc) {
      return `You're currently working in ${sectionDesc}. I can help you understand the data here or suggest actions. What would you like to know?`
    }
  }

  // Fallback: generic helpful response
  const totalTables = allTables.length
  const totalRows = allTables.reduce((sum, t) => sum + t.rows.length, 0)
  const totalViews = allTables.reduce((sum, t) => sum + t.views.length, 0)

  return `I'm your Database Copilot — here to help manage your relational data. You have ${databases.length} database(s) with ${totalTables} table(s), ${totalRows} row(s), and ${totalViews} view(s). I can help with:\n- Table and field structure\n- Row and record management\n- View configuration (grid, kanban, calendar, gallery, form, timeline)\n- Relations, lookups, rollups, and formulas\n- Automations and triggers\n- Filters, sorting, and grouping\n- Import and export\n- Schema overview\n\nWhat would you like to know?`
}

// ─── Store Interface ────────────────────────────────────────────────

interface DatabaseCopilotState {
  // Panel visibility
  isOpen: boolean
  openPanel: () => void
  closePanel: () => void
  togglePanel: () => void

  // Messages
  messages: CopilotMessage[]
  isTyping: boolean
  sendMessage: (content: string, context?: string) => void
  clearMessages: () => void

  // Suggestions
  suggestions: CopilotSuggestion[]
  addSuggestion: (suggestion: Omit<CopilotSuggestion, 'id' | 'dismissed'>) => void
  dismissSuggestion: (id: string) => void
  getSuggestionsForSection: (sectionId: string) => CopilotSuggestion[]
  clearSuggestions: () => void

  // Analysis
  isAnalyzing: boolean
  lastAnalysis: {
    type: 'schema' | 'automations' | 'data_health'
    summary: string
    items: string[]
    timestamp: string
  } | null
  analyzeSchema: () => void
  reviewAutomations: () => void
  checkDataHealth: () => void
}

// ─── Store ──────────────────────────────────────────────────────────

export const useDatabaseCopilotStore = create<DatabaseCopilotState>()(
  (set, get) => ({
    isOpen: false,
    messages: [],
    isTyping: false,
    suggestions: [],
    isAnalyzing: false,
    lastAnalysis: null,

    // ─── Panel ───────────────────────────────────────────────────────

    openPanel: () => set({ isOpen: true }),

    closePanel: () => set({ isOpen: false }),

    togglePanel: () => set((state) => ({ isOpen: !state.isOpen })),

    // ─── Messages ────────────────────────────────────────────────────

    sendMessage: (content, context) => {
      const userMessage: CopilotMessage = {
        id: generateId(),
        role: 'user',
        content,
        timestamp: new Date().toISOString(),
        context,
      }

      set((state) => ({
        messages: [...state.messages, userMessage],
        isTyping: true,
      }))

      const delay = 500 + Math.random() * 1000
      setTimeout(() => {
        const responseContent = generateResponse(content, context)
        const assistantMessage: CopilotMessage = {
          id: generateId(),
          role: 'assistant',
          content: responseContent,
          timestamp: new Date().toISOString(),
        }

        set((state) => ({
          messages: [...state.messages, assistantMessage],
          isTyping: false,
        }))
      }, delay)
    },

    clearMessages: () => set({ messages: [], isTyping: false }),

    // ─── Suggestions ─────────────────────────────────────────────────

    addSuggestion: (suggestion) =>
      set((state) => ({
        suggestions: [
          ...state.suggestions,
          { ...suggestion, id: generateId(), dismissed: false },
        ],
      })),

    dismissSuggestion: (id) =>
      set((state) => ({
        suggestions: state.suggestions.map((s) =>
          s.id === id ? { ...s, dismissed: true } : s
        ),
      })),

    getSuggestionsForSection: (sectionId) => {
      return get().suggestions.filter(
        (s) => s.sectionId === sectionId && !s.dismissed
      )
    },

    clearSuggestions: () => set({ suggestions: [] }),

    // ─── Analysis ────────────────────────────────────────────────────

    analyzeSchema: () => {
      set({ isAnalyzing: true })

      setTimeout(() => {
        const dbState = useDatabaseStore.getState()
        const allTables = Object.values(dbState.tables)

        const items: string[] = []

        if (allTables.length === 0) {
          set({
            isAnalyzing: false,
            lastAnalysis: {
              type: 'schema',
              summary: 'No tables found. Create a database to get started.',
              items: ['No tables created yet'],
              timestamp: new Date().toISOString(),
            },
          })
          return
        }

        // Table overview
        for (const table of allTables) {
          items.push(`${table.name}: ${table.fields.length} field(s), ${table.rows.length} row(s), ${table.views.length} view(s)`)
        }

        // Field type distribution
        const fieldTypeCounts: Record<string, number> = {}
        for (const table of allTables) {
          for (const field of table.fields) {
            const label = FIELD_TYPE_LABELS[field.type as DbFieldType] ?? field.type
            fieldTypeCounts[label] = (fieldTypeCounts[label] ?? 0) + 1
          }
        }
        const sortedTypes = Object.entries(fieldTypeCounts)
          .sort(([, a], [, b]) => b - a)
        for (const [type, count] of sortedTypes) {
          items.push(`Field type: ${type} — ${count} field(s)`)
        }

        // Check for relation fields
        const relationFields = allTables.flatMap((t) =>
          t.fields.filter((f) => f.type === 'relation')
        )
        if (relationFields.length > 0) {
          items.push(`${relationFields.length} relation field(s) connecting tables`)
          get().addSuggestion({
            type: 'tip',
            title: 'Table Relations',
            description: `You have ${relationFields.length} relation field(s). Use lookups and rollups to aggregate data across related tables.`,
            action: { label: 'View Schema', route: '/databases' },
            sectionId: 'schema',
          })
        }

        // Check for tables with no rows
        const emptyTables = allTables.filter((t) => t.rows.length === 0)
        if (emptyTables.length > 0) {
          get().addSuggestion({
            type: 'missing_info',
            title: 'Empty Tables',
            description: `${emptyTables.length} table(s) have no data: ${emptyTables.map((t) => t.name).join(', ')}.`,
            action: { label: 'Add Data', route: '/databases' },
            sectionId: 'schema',
          })
        }

        const totalFields = allTables.reduce((sum, t) => sum + t.fields.length, 0)
        const totalRows = allTables.reduce((sum, t) => sum + t.rows.length, 0)
        const summary = `Analyzed ${allTables.length} table(s) with ${totalFields} field(s) and ${totalRows} row(s).`

        set({
          isAnalyzing: false,
          lastAnalysis: {
            type: 'schema',
            summary,
            items,
            timestamp: new Date().toISOString(),
          },
        })
      }, 800)
    },

    reviewAutomations: () => {
      set({ isAnalyzing: true })

      setTimeout(() => {
        const dbState = useDatabaseStore.getState()
        const automations = dbState.automations

        const items: string[] = []

        if (automations.length === 0) {
          set({
            isAnalyzing: false,
            lastAnalysis: {
              type: 'automations',
              summary: 'No automations configured. Set up automation rules to streamline your workflows.',
              items: ['No automations created yet'],
              timestamp: new Date().toISOString(),
            },
          })
          return
        }

        const active = automations.filter((a) => a.enabled)
        const inactive = automations.filter((a) => !a.enabled)
        items.push(`${active.length} active automation(s)`)
        items.push(`${inactive.length} inactive automation(s)`)

        // Trigger distribution
        const triggerCounts: Record<string, number> = {}
        for (const a of automations) {
          const label = TRIGGER_LABELS[a.trigger as AutomationTrigger] ?? a.trigger
          triggerCounts[label] = (triggerCounts[label] ?? 0) + 1
        }
        for (const [trigger, count] of Object.entries(triggerCounts)) {
          items.push(`Trigger: ${trigger} — ${count} rule(s)`)
        }

        // Total runs
        const totalRuns = automations.reduce((sum, a) => sum + a.runCount, 0)
        items.push(`Total execution count: ${totalRuns}`)

        // Suggestions
        if (inactive.length > 0) {
          get().addSuggestion({
            type: 'review',
            title: 'Inactive Automations',
            description: `${inactive.length} automation(s) are disabled: ${inactive.map((a) => a.name).join(', ')}. Review whether they should be re-enabled or removed.`,
            action: { label: 'View Automations', route: '/databases' },
            sectionId: 'automations',
          })
        }

        const neverRun = automations.filter((a) => a.enabled && a.runCount === 0)
        if (neverRun.length > 0) {
          get().addSuggestion({
            type: 'warning',
            title: 'Automations Never Triggered',
            description: `${neverRun.length} active automation(s) have never run: ${neverRun.map((a) => a.name).join(', ')}. Check their trigger conditions.`,
            sectionId: 'automations',
          })
        }

        const summary = `Reviewed ${automations.length} automation(s): ${active.length} active, ${inactive.length} inactive. Total runs: ${totalRuns}.`

        set({
          isAnalyzing: false,
          lastAnalysis: {
            type: 'automations',
            summary,
            items,
            timestamp: new Date().toISOString(),
          },
        })
      }, 800)
    },

    checkDataHealth: () => {
      set({ isAnalyzing: true })

      setTimeout(() => {
        const dbState = useDatabaseStore.getState()
        const allTables = Object.values(dbState.tables)

        const items: string[] = []

        if (allTables.length === 0) {
          set({
            isAnalyzing: false,
            lastAnalysis: {
              type: 'data_health',
              summary: 'No tables to check. Create a database first.',
              items: ['No tables available'],
              timestamp: new Date().toISOString(),
            },
          })
          return
        }

        const totalRows = allTables.reduce((sum, t) => sum + t.rows.length, 0)
        items.push(`${totalRows} total row(s) across ${allTables.length} table(s)`)

        // Check empty cells
        let totalCells = 0
        let emptyCells = 0
        for (const table of allTables) {
          for (const row of table.rows) {
            for (const field of table.fields) {
              totalCells++
              const val = row.cells[field.id]
              if (val === null || val === undefined || val === '') {
                emptyCells++
              }
            }
          }
        }

        if (totalCells > 0) {
          const fillRate = Math.round(((totalCells - emptyCells) / totalCells) * 100)
          items.push(`Data fill rate: ${fillRate}% (${totalCells - emptyCells}/${totalCells} cells filled)`)

          if (fillRate < 50) {
            get().addSuggestion({
              type: 'warning',
              title: 'Low Data Fill Rate',
              description: `Only ${fillRate}% of cells have data. Many fields are empty — consider cleaning up unused fields or filling in missing data.`,
              action: { label: 'Review Tables', route: '/databases' },
              sectionId: 'data_health',
            })
          }
        }

        // Check required fields without data
        let missingRequired = 0
        for (const table of allTables) {
          const requiredFields = table.fields.filter((f) => f.required)
          for (const row of table.rows) {
            for (const field of requiredFields) {
              const val = row.cells[field.id]
              if (val === null || val === undefined || val === '') {
                missingRequired++
              }
            }
          }
        }
        if (missingRequired > 0) {
          items.push(`${missingRequired} required field(s) missing data`)
          get().addSuggestion({
            type: 'warning',
            title: 'Missing Required Data',
            description: `${missingRequired} required field(s) are empty. Fill these in to ensure data integrity.`,
            action: { label: 'Review Data', route: '/databases' },
            sectionId: 'data_health',
          })
        }

        // Tables with many rows
        const largeTables = allTables.filter((t) => t.rows.length > 100)
        if (largeTables.length > 0) {
          items.push(`${largeTables.length} table(s) with 100+ rows`)
          get().addSuggestion({
            type: 'optimization',
            title: 'Large Tables Detected',
            description: `${largeTables.length} table(s) have over 100 rows: ${largeTables.map((t) => `${t.name} (${t.rows.length})`).join(', ')}. Consider adding views with filters to navigate data efficiently.`,
            sectionId: 'data_health',
          })
        }

        // Views per table
        const totalViews = allTables.reduce((sum, t) => sum + t.views.length, 0)
        items.push(`${totalViews} view(s) total`)

        const summary = totalRows > 0
          ? `Data health check: ${totalRows} row(s), ${totalCells > 0 ? `${Math.round(((totalCells - emptyCells) / totalCells) * 100)}% fill rate` : 'no fields'}, ${totalViews} view(s).`
          : 'Tables exist but no data has been added yet.'

        set({
          isAnalyzing: false,
          lastAnalysis: {
            type: 'data_health',
            summary,
            items,
            timestamp: new Date().toISOString(),
          },
        })
      }, 600)
    },
  })
)
