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
import { getUpcomingDeadlines, getRecentCrossModuleActivity } from '../../../lib/crossModuleService'
import { useDocumentStore } from '../../../stores/useDocumentStore'
import { DEFAULT_SCHEDULE, EventTypeCategory, LocationType } from '../../scheduling/types'

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
  {
    regex: /search\s+(?:my\s+)?pages/i,
    action: 'search_pages',
    paramNames: [],
    response: () => {
      const pages = useWorkspaceStore.getState().getAllPages()
      if (pages.length === 0) return 'No pages found in your workspace.'
      const recent = pages.slice(0, 5).map((p) => p.title).join(', ')
      return `You have ${pages.length} page${pages.length === 1 ? '' : 's'}. Recent: ${recent}.`
    },
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
  {
    regex: /show\s+(?:my\s+)?issues/i,
    action: 'show_issues',
    paramNames: [],
    response: () => {
      const issues = Object.values(useProjectStore.getState().issues)
      const open = issues.filter((i) => i.status !== 'done' && i.status !== 'cancelled')
      if (issues.length === 0) return 'No issues found. Create one to get started!'
      const latest = issues[issues.length - 1]
      return `You have ${open.length} open issue${open.length === 1 ? '' : 's'} out of ${issues.length} total. Latest: "${latest?.title}".`
    },
  },
  {
    regex: /start\s+(?:a\s+)?sprint/i,
    action: 'start_sprint',
    paramNames: [],
    response: () => 'Started a new 2-week sprint. You can manage it from the Cycles tab in Projects.',
  },
  {
    regex: /set\s+(?:a\s+)?goal/i,
    action: 'set_goal',
    paramNames: [],
    response: () => 'Created a new goal. Head to the Goals tab to add details and link issues.',
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
  {
    regex: /show\s+(?:my\s+)?bookings/i,
    action: 'show_bookings',
    paramNames: [],
    response: () => {
      const bookings = useSchedulingStore.getState().getFilteredBookings('upcoming')
      if (bookings.length === 0) return 'No upcoming bookings.'
      const next = bookings[0]
      return `You have ${bookings.length} upcoming booking${bookings.length === 1 ? '' : 's'}. Next: ${next?.date} at ${next?.startTime}.`
    },
  },
  {
    regex: /create\s+(?:an?\s+)?event\s*type/i,
    action: 'create_event_type',
    paramNames: [],
    response: () => 'Created a new "Quick Meeting" event type (30 min). You can customize it in the Scheduling tab.',
  },
  {
    regex: /check\s+(?:my\s+)?availability/i,
    action: 'check_availability',
    paramNames: [],
    response: () => {
      const connections = useSchedulingStore.getState().calendarConnections
      const connected = connections.filter((c) => c.connected)
      if (connected.length === 0) return 'No calendars connected. Connect one in Settings to check availability.'
      return `You have ${connected.length} calendar${connected.length === 1 ? '' : 's'} connected (${connected.map((c) => c.name).join(', ')}). Your availability is synced.`
    },
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
  {
    regex: /check\s+(?:my\s+)?pending(?:\s+signatures)?/i,
    action: 'check_pending',
    paramNames: [],
    response: () => {
      const docs = useDocumentStore.getState().documents.filter((d) => d.status === 'pending')
      if (docs.length === 0) return 'No pending documents. Everything is signed!'
      const names = docs.slice(0, 5).map((d) => d.name).join(', ')
      return `You have ${docs.length} pending document${docs.length === 1 ? '' : 's'}: ${names}.`
    },
  },
  {
    regex: /generate\s+(?:a\s+)?document/i,
    action: 'generate_document',
    paramNames: [],
    response: () => 'To generate a document, head to the Templates tab and create from a template. You can customize fields and recipients before sending.',
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
  {
    regex: /add\s+(?:a\s+)?table/i,
    action: 'add_table',
    paramNames: [],
    response: () => 'Added a new table to your database. You can rename it and add fields.',
  },
  {
    regex: /create\s+(?:a\s+)?view/i,
    action: 'create_view',
    paramNames: [],
    response: () => 'Created a new Grid view. You can switch view types from the view selector.',
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
  {
    regex: /summarize\s+(?:my\s+)?notifications/i,
    action: 'summarize_notifications',
    paramNames: [],
    response: () => {
      const notifications = useInboxStore.getState().notifications.filter((n) => !n.archived)
      if (notifications.length === 0) return 'Your inbox is empty. No notifications to summarize.'
      const byCategory: Record<string, number> = {}
      for (const n of notifications) {
        byCategory[n.category] = (byCategory[n.category] ?? 0) + 1
      }
      const breakdown = Object.entries(byCategory).map(([cat, count]) => `${cat}: ${count}`).join(', ')
      return `You have ${notifications.length} notification${notifications.length === 1 ? '' : 's'}. Breakdown: ${breakdown}.`
    },
  },
  {
    regex: /show\s+(?:my\s+)?unread/i,
    action: 'show_unread',
    paramNames: [],
    response: () => {
      const total = useInboxStore.getState().getUnreadCount()
      if (total === 0) return 'No unread notifications. You\'re all caught up!'
      return `You have ${total} unread notification${total === 1 ? '' : 's'}. Use "Mark all read" to clear them.`
    },
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
  {
    regex: /what'?s\s+due\s+today/i,
    action: 'whats_due_today',
    paramNames: [],
    response: () => {
      const deadlines = getUpcomingDeadlines().filter((d) => d.urgency === 'today')
      if (deadlines.length === 0) return 'Nothing is due today. You\'re all clear!'
      const names = deadlines.slice(0, 5).map((d) => d.title).join(', ')
      return `You have ${deadlines.length} item${deadlines.length === 1 ? '' : 's'} due today: ${names}.`
    },
  },
  {
    regex: /summarize\s+(?:my\s+)?activity/i,
    action: 'summarize_activity',
    paramNames: [],
    response: () => {
      const activities = getRecentCrossModuleActivity(5)
      if (activities.length === 0) return 'No recent activity to summarize.'
      const lines = activities.map((a) => `• ${a.description}`).join('\n')
      return `Here's your recent activity:\n${lines}`
    },
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
            attendees: [{ name: 'AI Booking', email: 'ai@orchestree.app', timezone: tz }],
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

      // ─── Read-only intents (data already in response) ───────────
      case 'whats_due_today':
      case 'summarize_activity':
      case 'search_pages':
      case 'show_issues':
      case 'check_pending':
      case 'generate_document':
      case 'show_bookings':
      case 'check_availability':
      case 'summarize_notifications':
      case 'show_unread':
        return true

      // ─── Mutation intents ──────────────────────────────────────
      case 'start_sprint': {
        const sprintProjects = useProjectStore.getState().projects
        const sprintProjectId = Object.keys(sprintProjects)[0]
        if (sprintProjectId) {
          const today = new Date()
          const endDate = new Date(today)
          endDate.setDate(endDate.getDate() + 14)
          useProjectStore.getState().createCycle({
            projectId: sprintProjectId,
            name: 'Sprint',
            startDate: today.toISOString().split('T')[0] ?? '',
            endDate: endDate.toISOString().split('T')[0] ?? '',
          })
          return true
        }
        return false
      }

      case 'set_goal': {
        const goalProjects = useProjectStore.getState().projects
        const goalProjectId = Object.keys(goalProjects)[0]
        if (goalProjectId) {
          useProjectStore.getState().createGoal({
            projectId: goalProjectId,
            title: 'New Goal',
          })
          return true
        }
        return false
      }

      case 'create_event_type': {
        useSchedulingStore.getState().addEventType({
          name: 'Quick Meeting',
          description: 'A quick 30-minute meeting',
          slug: 'quick-meeting',
          category: EventTypeCategory.OneOnOne,
          color: '#4F46E5',
          durationMinutes: 30,
          bufferBeforeMinutes: 0,
          bufferAfterMinutes: 5,
          maxBookingsPerDay: 8,
          minimumNoticeMinutes: 60,
          schedulingWindowDays: 30,
          location: LocationType.Zoom,
          schedule: DEFAULT_SCHEDULE,
          dateOverrides: [],
          customQuestions: [],
          maxAttendees: 1,
          waitlistEnabled: false,
          maxWaitlist: 0,
          isActive: true,
        })
        return true
      }

      case 'add_table': {
        const tableDbState = useDatabaseStore.getState()
        const tableDbList = Object.values(tableDbState.databases)
        const firstTableDb = tableDbList[0]
        if (firstTableDb) {
          tableDbState.addTable(firstTableDb.id, 'New Table', 'clipboard-list')
          return true
        }
        return false
      }

      case 'create_view': {
        const viewDbState = useDatabaseStore.getState()
        const viewDbList = Object.values(viewDbState.databases)
        const viewDb = viewDbList[0]
        if (viewDb && viewDb.tables.length > 0) {
          const firstViewTableId = viewDb.tables[0]
          if (firstViewTableId) {
            viewDbState.addView(firstViewTableId, 'New View', 'grid')
            return true
          }
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
