import type { FeatureKey } from './featureContexts'
import { useWorkspaceStore } from '../../workspace/stores/useWorkspaceStore'
import { useProjectStore } from '../../projects/stores/useProjectStore'
import { useSchedulingStore } from '../../scheduling/stores/useSchedulingStore'
import { useTemplateStore } from '../../documents/stores/useTemplateStore'
import { useContactStore } from '../../documents/stores/useContactStore'
import { useDatabaseStore } from '../../databases/stores/useDatabaseStore'
import { useInboxStore } from '../../inbox/stores/useInboxStore'
import useAIAgentStore from '../stores/useAIAgentStore'
import type { AgentType } from '../types'

// ─── Types ──────────────────────────────────────────────────────────

export interface IntentResult {
  action: string
  params: Record<string, string>
  featureKey: FeatureKey
  confidence: 'high' | 'medium' | 'low'
  response: string
}

// ─── Intent Patterns ────────────────────────────────────────────────

interface PatternDef {
  regex: RegExp
  action: string
  paramNames: string[]
  response: (params: Record<string, string>) => string
}

const WORKSPACE_PATTERNS: PatternDef[] = [
  {
    regex: /(?:create|add|new)\s+(?:a\s+)?page(?:\s+(?:called|named|titled))?\s+(.+)/i,
    action: 'create_page',
    paramNames: ['title'],
    response: (p) => `Created a new page "${p.title}". You can find it in your workspace sidebar.`,
  },
  {
    regex: /(?:create|add|new)\s+(?:a\s+)?(?:checklist|todo)\s*(?:page)?(?:\s+(?:called|named|titled))?\s*(.*)/i,
    action: 'create_page',
    paramNames: ['title'],
    response: (p) => `Created a checklist page "${p.title || 'Checklist'}".`,
  },
  {
    regex: /(?:write|note|add)\s+(.+)/i,
    action: 'add_block',
    paramNames: ['content'],
    response: (p) => `Added a note: "${p.content}".`,
  },
]

const PROJECTS_PATTERNS: PatternDef[] = [
  {
    regex: /(?:create|add|new)\s+(?:a\s+)?(?:task|issue)(?:\s+(?:called|named|titled))?\s+(.+)/i,
    action: 'create_issue',
    paramNames: ['title'],
    response: (p) => `Created task "${p.title}". You can view it in your project board.`,
  },
  {
    regex: /assign\s+(.+?)\s+to\s+(.+)/i,
    action: 'assign_issue',
    paramNames: ['issue', 'person'],
    response: (p) => `Assigned "${p.issue}" to ${p.person}.`,
  },
  {
    regex: /set\s+priority\s+(?:to\s+)?(\w+)/i,
    action: 'set_priority',
    paramNames: ['level'],
    response: (p) => `Set priority to ${p.level}.`,
  },
]

const SCHEDULING_PATTERNS: PatternDef[] = [
  {
    regex: /(?:schedule|book)\s+(?:a\s+)?(.+?)\s+(?:on|for)\s+(.+)/i,
    action: 'create_booking',
    paramNames: ['event', 'date'],
    response: (p) => `Scheduled "${p.event}" for ${p.date}. Check your calendar for details.`,
  },
  {
    regex: /cancel\s+(?:the\s+)?booking\s+(.+)/i,
    action: 'cancel_booking',
    paramNames: ['id'],
    response: (p) => `Cancelled booking ${p.id}.`,
  },
]

const DOCUMENTS_PATTERNS: PatternDef[] = [
  {
    regex: /(?:create|add|new)\s+(?:a\s+)?template(?:\s+(?:called|named|titled))?\s+(.+)/i,
    action: 'create_template',
    paramNames: ['name'],
    response: (p) => `Created template "${p.name}". You can customize it in the template editor.`,
  },
  {
    regex: /add\s+(?:a\s+)?contact\s+(\S+)\s+(\S+@\S+)/i,
    action: 'add_contact',
    paramNames: ['name', 'email'],
    response: (p) => `Added contact ${p.name} (${p.email}) to your address book.`,
  },
  {
    regex: /add\s+(?:a\s+)?contact\s+(.+)/i,
    action: 'add_contact',
    paramNames: ['name'],
    response: (p) => `Added contact "${p.name}". You can add their email later.`,
  },
]

const DATABASES_PATTERNS: PatternDef[] = [
  {
    regex: /(?:create|add|new)\s+(?:a\s+)?database(?:\s+(?:called|named|titled))?\s+(.+)/i,
    action: 'create_database',
    paramNames: ['name'],
    response: (p) => `Created database "${p.name}". Add tables and fields to get started.`,
  },
  {
    regex: /add\s+(?:a\s+)?(?:row|record)/i,
    action: 'add_row',
    paramNames: [],
    response: () => 'Added a new row to the current table.',
  },
]

const INBOX_PATTERNS: PatternDef[] = [
  {
    regex: /mark\s+all\s+(?:as\s+)?read/i,
    action: 'mark_all_read',
    paramNames: [],
    response: () => 'Marked all notifications as read.',
  },
  {
    regex: /clear\s+(?:all\s+)?(?:notifications|inbox)/i,
    action: 'clear_inbox',
    paramNames: [],
    response: () => 'Cleared all notifications from your inbox.',
  },
]

const HOME_PATTERNS: PatternDef[] = [
  {
    regex: /show\s+(?:my\s+)?stats/i,
    action: 'show_stats',
    paramNames: [],
    response: () => 'Here are your dashboard stats. Check the stats overview section above for detailed metrics.',
  },
  {
    regex: /start\s+(?:an?\s+)?agent\s+(\w+)/i,
    action: 'start_agent',
    paramNames: ['type'],
    response: (p) => `Started ${p.type} agent. You can monitor its progress in the AI panel.`,
  },
]

const PATTERNS_BY_FEATURE: Record<FeatureKey, PatternDef[]> = {
  home: HOME_PATTERNS,
  workspace: WORKSPACE_PATTERNS,
  projects: PROJECTS_PATTERNS,
  documents: DOCUMENTS_PATTERNS,
  scheduling: SCHEDULING_PATTERNS,
  databases: DATABASES_PATTERNS,
  inbox: INBOX_PATTERNS,
}

// ─── Fallback responses ─────────────────────────────────────────────

const FALLBACK_RESPONSES: Record<FeatureKey, string> = {
  home: "I can help you view stats, start AI agents, or navigate your dashboard. Try something like \"Show my stats\".",
  workspace: "I can create pages, add notes, and manage your workspace. Try \"Create a new page called Meeting Notes\".",
  projects: "I can create tasks, assign issues, and set priorities. Try \"Create a task called Fix login bug\".",
  documents: "I can create templates and add contacts. Try \"Create template Invoice\" or \"Add contact John john@email.com\".",
  scheduling: "I can schedule meetings and manage bookings. Try \"Schedule a meeting for tomorrow\".",
  databases: "I can create databases and add records. Try \"Create database Contacts\".",
  inbox: "I can manage your notifications. Try \"Mark all read\" or \"Clear notifications\".",
}

// ─── Parse Intent ───────────────────────────────────────────────────

export function parseIntent(text: string, featureKey: FeatureKey): IntentResult {
  const patterns = PATTERNS_BY_FEATURE[featureKey]

  for (const pattern of patterns) {
    const match = text.match(pattern.regex)
    if (match) {
      const params: Record<string, string> = {}
      pattern.paramNames.forEach((name, i) => {
        params[name] = match[i + 1]?.trim() ?? ''
      })
      return {
        action: pattern.action,
        params,
        featureKey,
        confidence: 'high',
        response: pattern.response(params),
      }
    }
  }

  // Try all feature patterns as cross-feature fallback with medium confidence
  for (const [key, patterns] of Object.entries(PATTERNS_BY_FEATURE)) {
    if (key === featureKey) continue
    for (const pattern of patterns) {
      const match = text.match(pattern.regex)
      if (match) {
        const params: Record<string, string> = {}
        pattern.paramNames.forEach((name, i) => {
          params[name] = match[i + 1]?.trim() ?? ''
        })
        return {
          action: pattern.action,
          params,
          featureKey: key as FeatureKey,
          confidence: 'medium',
          response: pattern.response(params),
        }
      }
    }
  }

  // No match — low confidence fallback
  return {
    action: 'unknown',
    params: {},
    featureKey,
    confidence: 'low',
    response: FALLBACK_RESPONSES[featureKey],
  }
}

// ─── Execute Intent ─────────────────────────────────────────────────

export function executeIntent(intent: IntentResult): boolean {
  try {
    switch (intent.action) {
      case 'create_page': {
        const title = intent.params.title || 'Untitled'
        useWorkspaceStore.getState().addPage(title)
        return true
      }

      case 'add_block': {
        const pages = useWorkspaceStore.getState().getRootPages()
        const firstPage = pages[0]
        if (firstPage) {
          const blockId = useWorkspaceStore.getState().addBlock(firstPage.id, 'paragraph')
          useWorkspaceStore.getState().updateBlockContent(blockId, intent.params.content ?? '')
          return true
        }
        return false
      }

      case 'create_issue': {
        const projects = useProjectStore.getState().projects
        const projectIds = Object.keys(projects)
        const projectId = projectIds[0] ?? ''
        if (projectId) {
          useProjectStore.getState().createIssue({
            projectId,
            title: intent.params.title ?? 'Untitled Task',
          })
          return true
        }
        return false
      }

      case 'assign_issue':
      case 'set_priority': {
        // These require knowing the current issue context
        // In a real implementation, we'd need UI context
        return false
      }

      case 'create_booking': {
        const eventTypes = useSchedulingStore.getState().eventTypes
        const firstEventType = eventTypes[0]
        if (firstEventType) {
          const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
          useSchedulingStore.getState().addBooking({
            eventTypeId: firstEventType.id,
            date: new Date().toISOString().split('T')[0] ?? '',
            startTime: '10:00',
            endTime: '10:30',
            attendees: [{ name: 'AI Booking', email: 'ai@signof.app', timezone: tz }],
            notes: '',
            status: 'confirmed',
            timezone: tz,
          })
          return true
        }
        return false
      }

      case 'cancel_booking': {
        const id = intent.params.id
        if (id) {
          useSchedulingStore.getState().cancelBooking(id)
          return true
        }
        return false
      }

      case 'create_template': {
        useTemplateStore.getState().addTemplate({
          name: intent.params.name ?? 'Untitled Template',
          description: '',
          documentName: intent.params.name ?? 'Untitled',
          fields: [],
          recipientRoles: [],
        })
        return true
      }

      case 'add_contact': {
        useContactStore.getState().addContact({
          name: intent.params.name ?? 'Unknown',
          email: intent.params.email ?? '',
          signingHistory: [],
        })
        return true
      }

      case 'create_database': {
        useDatabaseStore.getState().addDatabase(
          intent.params.name ?? 'Untitled Database',
          '📊',
          ''
        )
        return true
      }

      case 'add_row': {
        const dbState = useDatabaseStore.getState()
        const allDatabases = Object.values(dbState.databases)
        const firstDb = allDatabases[0]
        if (firstDb && firstDb.tables.length > 0) {
          const firstTableId = firstDb.tables[0]
          if (firstTableId) {
            dbState.addRow(firstTableId)
            return true
          }
        }
        return false
      }

      case 'mark_all_read': {
        useInboxStore.getState().markAllAsRead()
        return true
      }

      case 'clear_inbox': {
        useInboxStore.getState().clearAll()
        return true
      }

      case 'show_stats': {
        // Navigational intent — no store action needed
        return true
      }

      case 'start_agent': {
        const agentType = intent.params.type?.toLowerCase() as AgentType
        if (agentType) {
          useAIAgentStore.getState().startAgent(agentType, 'AI-initiated task')
          return true
        }
        return false
      }

      default:
        return false
    }
  } catch {
    return false
  }
}
