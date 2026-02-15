import type { AgentType } from '../types'
import { useWorkspaceStore } from '../../workspace/stores/useWorkspaceStore'
import { useProjectStore } from '../../projects/stores/useProjectStore'
import { useSchedulingStore } from '../../scheduling/stores/useSchedulingStore'
import { useTemplateStore } from '../../documents/stores/useTemplateStore'
import { useContactStore } from '../../documents/stores/useContactStore'
import { useDatabaseStore } from '../../databases/stores/useDatabaseStore'
import { useInvoiceStore } from '../../accounting/stores/useInvoiceStore'
import { useExpenseStore } from '../../accounting/stores/useExpenseStore'
import { useTaxFilingStore } from '../../tax/stores/useTaxFilingStore'
import { useInboxStore } from '../../inbox/stores/useInboxStore'
import { getModuleMetrics, getUpcomingDeadlines } from '../../../lib/crossModuleService'
import { DEFAULT_SCHEDULE, EventTypeCategory, LocationType } from '../../scheduling/types'
import { PaymentTerms } from '../../accounting/types'
import { NotificationType } from '../../inbox/types'
import type { TaxYear } from '../../tax/types'

// ─── Types ──────────────────────────────────────────────────────────

export interface ToolDefinition {
  name: string
  description: string
  input_schema: {
    type: 'object'
    properties: Record<string, { type: string; description: string; enum?: string[] }>
    required: string[]
  }
}

// ─── Tool Schemas ───────────────────────────────────────────────────

export const ORCHESTREE_TOOLS: ToolDefinition[] = [
  // ── Workspace ────────────────────────────────────────────────────
  {
    name: 'create_page',
    description: 'Create a new workspace page in Orchestree. Returns the page ID.',
    input_schema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'The title of the new page' },
      },
      required: ['title'],
    },
  },
  {
    name: 'search_pages',
    description: 'Search workspace pages by title. Returns matching pages.',
    input_schema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search query to match against page titles' },
      },
      required: ['query'],
    },
  },
  {
    name: 'add_block',
    description: 'Add a content block to the first workspace page. Returns the block ID.',
    input_schema: {
      type: 'object',
      properties: {
        content: { type: 'string', description: 'The text content for the block' },
        pageId: { type: 'string', description: 'Optional page ID to add the block to (defaults to first page)' },
      },
      required: ['content'],
    },
  },

  // ── Projects ─────────────────────────────────────────────────────
  {
    name: 'create_issue',
    description: 'Create a new project issue/task in the first available project. Returns the issue ID.',
    input_schema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'The title of the issue' },
        description: { type: 'string', description: 'Optional description of the issue' },
        priority: {
          type: 'string',
          description: 'Priority level',
          enum: ['none', 'low', 'medium', 'high', 'urgent'],
        },
      },
      required: ['title'],
    },
  },
  {
    name: 'list_issues',
    description: 'List open issues across all projects. Returns issue titles and statuses.',
    input_schema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  {
    name: 'create_cycle',
    description: 'Create a new sprint cycle in the first available project.',
    input_schema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Name of the sprint cycle' },
        startDate: { type: 'string', description: 'Start date in YYYY-MM-DD format' },
        endDate: { type: 'string', description: 'End date in YYYY-MM-DD format' },
      },
      required: ['name', 'startDate', 'endDate'],
    },
  },
  {
    name: 'create_goal',
    description: 'Create a new project goal in the first available project.',
    input_schema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'The title of the goal' },
        description: { type: 'string', description: 'Optional description of the goal' },
        targetDate: { type: 'string', description: 'Optional target date in YYYY-MM-DD format' },
      },
      required: ['title'],
    },
  },

  // ── Documents ────────────────────────────────────────────────────
  {
    name: 'create_template',
    description: 'Create a new document template. Returns the template ID.',
    input_schema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'The name of the template' },
        description: { type: 'string', description: 'Optional description of the template' },
      },
      required: ['name'],
    },
  },
  {
    name: 'add_contact',
    description: 'Add a new contact to the address book.',
    input_schema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Full name of the contact' },
        email: { type: 'string', description: 'Email address of the contact' },
      },
      required: ['name'],
    },
  },

  // ── Scheduling ───────────────────────────────────────────────────
  {
    name: 'create_booking',
    description: 'Schedule a new meeting/booking using the first available event type.',
    input_schema: {
      type: 'object',
      properties: {
        date: { type: 'string', description: 'Date in YYYY-MM-DD format' },
        startTime: { type: 'string', description: 'Start time in HH:MM format (24h)' },
        endTime: { type: 'string', description: 'End time in HH:MM format (24h)' },
        attendeeName: { type: 'string', description: 'Name of the attendee' },
        attendeeEmail: { type: 'string', description: 'Email of the attendee' },
        notes: { type: 'string', description: 'Optional meeting notes' },
      },
      required: ['date', 'startTime', 'endTime', 'attendeeName', 'attendeeEmail'],
    },
  },
  {
    name: 'create_event_type',
    description: 'Create a new event type for scheduling.',
    input_schema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Name of the event type (e.g. "30-min Meeting")' },
        durationMinutes: { type: 'string', description: 'Duration in minutes (default 30)' },
      },
      required: ['name'],
    },
  },
  {
    name: 'cancel_booking',
    description: 'Cancel an existing booking by ID.',
    input_schema: {
      type: 'object',
      properties: {
        bookingId: { type: 'string', description: 'The ID of the booking to cancel' },
        reason: { type: 'string', description: 'Optional cancellation reason' },
      },
      required: ['bookingId'],
    },
  },
  {
    name: 'list_bookings',
    description: 'List upcoming bookings.',
    input_schema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },

  // ── Databases ────────────────────────────────────────────────────
  {
    name: 'create_database',
    description: 'Create a new database in the Databases module.',
    input_schema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'The name of the database' },
        icon: { type: 'string', description: 'Emoji icon for the database' },
        description: { type: 'string', description: 'Optional description' },
      },
      required: ['name'],
    },
  },
  {
    name: 'add_table',
    description: 'Add a new table to the first available database.',
    input_schema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Name of the table' },
      },
      required: ['name'],
    },
  },
  {
    name: 'add_row',
    description: 'Add a new row to the first table of the first database.',
    input_schema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },

  // ── Accounting ───────────────────────────────────────────────────
  {
    name: 'create_invoice',
    description: 'Create a new invoice. Returns the invoice number.',
    input_schema: {
      type: 'object',
      properties: {
        customerName: { type: 'string', description: 'Name of the customer' },
        amount: { type: 'string', description: 'Total invoice amount' },
        description: { type: 'string', description: 'Description of the line item' },
        dueDate: { type: 'string', description: 'Due date in YYYY-MM-DD format (default: 30 days from now)' },
      },
      required: ['customerName', 'amount'],
    },
  },
  {
    name: 'create_expense',
    description: 'Record a new expense.',
    input_schema: {
      type: 'object',
      properties: {
        amount: { type: 'string', description: 'Expense amount' },
        vendorName: { type: 'string', description: 'Name of the vendor' },
        description: { type: 'string', description: 'Description of the expense' },
        category: {
          type: 'string',
          description: 'Expense category',
          enum: ['advertising', 'insurance', 'legal', 'meals', 'office_supplies', 'payroll', 'rent', 'software', 'travel', 'utilities', 'other'],
        },
      },
      required: ['amount', 'vendorName'],
    },
  },

  // ── Tax ──────────────────────────────────────────────────────────
  {
    name: 'create_tax_filing',
    description: 'Start a new tax filing for a given tax year.',
    input_schema: {
      type: 'object',
      properties: {
        taxYear: {
          type: 'string',
          description: 'Tax year to file for',
          enum: ['2025', '2024', '2023'],
        },
      },
      required: ['taxYear'],
    },
  },

  // ── Inbox ────────────────────────────────────────────────────────
  {
    name: 'mark_all_read',
    description: 'Mark all notifications in the inbox as read.',
    input_schema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  {
    name: 'send_notification',
    description: 'Send a notification to the inbox.',
    input_schema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Notification title' },
        message: { type: 'string', description: 'Notification message' },
      },
      required: ['title', 'message'],
    },
  },

  // ── Cross-module ─────────────────────────────────────────────────
  {
    name: 'get_workspace_stats',
    description: 'Get cross-module metrics including document counts, open issues, upcoming bookings, unpaid invoices, and more.',
    input_schema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  {
    name: 'get_upcoming_deadlines',
    description: 'Get upcoming deadlines across all modules (documents, projects, bookings, invoices, tax).',
    input_schema: {
      type: 'object',
      properties: {
        limit: { type: 'string', description: 'Maximum number of deadlines to return (default 10)' },
      },
      required: [],
    },
  },
]

// ─── Tool Execution ─────────────────────────────────────────────────

export function executeTool(
  name: string,
  input: Record<string, unknown>,
): string {
  try {
    switch (name) {
      // ── Workspace ──────────────────────────────────────────────
      case 'create_page': {
        const title = (input.title as string) || 'Untitled'
        const pageId = useWorkspaceStore.getState().addPage(title)
        return JSON.stringify({ success: true, pageId, title })
      }

      case 'search_pages': {
        const query = ((input.query as string) || '').toLowerCase()
        const allPages = useWorkspaceStore.getState().getAllPages()
        const matches = allPages.filter((p) => p.title.toLowerCase().includes(query))
        const results = matches.slice(0, 10).map((p) => ({ id: p.id, title: p.title, updatedAt: p.updatedAt }))
        return JSON.stringify({ success: true, count: matches.length, pages: results })
      }

      case 'add_block': {
        const pageId = input.pageId as string | undefined
        const targetPageId = pageId || useWorkspaceStore.getState().getRootPages()[0]?.id
        if (!targetPageId) {
          return JSON.stringify({ success: false, error: 'No pages available' })
        }
        const blockId = useWorkspaceStore.getState().addBlock(targetPageId, 'paragraph')
        useWorkspaceStore.getState().updateBlockContent(blockId, (input.content as string) || '')
        return JSON.stringify({ success: true, blockId, pageId: targetPageId })
      }

      // ── Projects ───────────────────────────────────────────────
      case 'create_issue': {
        const projects = useProjectStore.getState().projects
        const projectId = Object.keys(projects)[0]
        if (!projectId) {
          return JSON.stringify({ success: false, error: 'No projects available' })
        }
        const issue = useProjectStore.getState().createIssue({
          projectId,
          title: (input.title as string) || 'Untitled Task',
        })
        return JSON.stringify({ success: true, issueId: issue.id, projectId })
      }

      case 'list_issues': {
        const allIssues = Object.values(useProjectStore.getState().issues)
        const open = allIssues.filter((i) => i.status !== 'done' && i.status !== 'cancelled')
        const results = open.slice(0, 20).map((i) => ({
          id: i.id,
          title: i.title,
          status: i.status,
          priority: i.priority,
          identifier: i.identifier,
        }))
        return JSON.stringify({ success: true, count: open.length, issues: results })
      }

      case 'create_cycle': {
        const projects = useProjectStore.getState().projects
        const projectId = Object.keys(projects)[0]
        if (!projectId) {
          return JSON.stringify({ success: false, error: 'No projects available' })
        }
        const cycleId = useProjectStore.getState().createCycle({
          projectId,
          name: (input.name as string) || 'New Sprint',
          startDate: (input.startDate as string) || new Date().toISOString().split('T')[0] || '',
          endDate: (input.endDate as string) || (() => {
            const d = new Date(); d.setDate(d.getDate() + 14); return d.toISOString().split('T')[0] || ''
          })(),
        })
        return JSON.stringify({ success: true, cycleId, projectId })
      }

      case 'create_goal': {
        const projects = useProjectStore.getState().projects
        const projectId = Object.keys(projects)[0]
        if (!projectId) {
          return JSON.stringify({ success: false, error: 'No projects available' })
        }
        const goalId = useProjectStore.getState().createGoal({
          projectId,
          title: (input.title as string) || 'New Goal',
          description: (input.description as string) || '',
          targetDate: (input.targetDate as string) || null,
        })
        return JSON.stringify({ success: true, goalId, projectId })
      }

      // ── Documents ──────────────────────────────────────────────
      case 'create_template': {
        useTemplateStore.getState().addTemplate({
          name: (input.name as string) || 'Untitled Template',
          description: (input.description as string) || '',
          documentName: (input.name as string) || 'Untitled',
          fields: [],
          recipientRoles: [],
        })
        return JSON.stringify({ success: true, name: input.name })
      }

      case 'add_contact': {
        useContactStore.getState().addContact({
          name: (input.name as string) || 'Unknown',
          email: (input.email as string) || '',
          signingHistory: [],
        })
        return JSON.stringify({ success: true, name: input.name })
      }

      // ── Scheduling ─────────────────────────────────────────────
      case 'create_booking': {
        const eventTypes = useSchedulingStore.getState().eventTypes
        const firstEventType = eventTypes[0]
        if (!firstEventType) {
          // Create a default event type first
          useSchedulingStore.getState().addEventType({
            name: 'Quick Meeting',
            description: 'Auto-created for AI booking',
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
        }
        const eventType = useSchedulingStore.getState().eventTypes[0]
        if (!eventType) {
          return JSON.stringify({ success: false, error: 'Failed to get event type' })
        }
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
        useSchedulingStore.getState().addBooking({
          eventTypeId: eventType.id,
          date: (input.date as string) || new Date().toISOString().split('T')[0] || '',
          startTime: (input.startTime as string) || '10:00',
          endTime: (input.endTime as string) || '10:30',
          attendees: [{
            name: (input.attendeeName as string) || 'Attendee',
            email: (input.attendeeEmail as string) || '',
            timezone: tz,
          }],
          notes: (input.notes as string) || '',
          status: 'confirmed',
          timezone: tz,
        })
        return JSON.stringify({ success: true, date: input.date, attendee: input.attendeeName })
      }

      case 'create_event_type': {
        const slug = ((input.name as string) || 'meeting').toLowerCase().replace(/\s+/g, '-')
        const duration = input.durationMinutes ? parseInt(input.durationMinutes as string, 10) : 30
        const eventType = useSchedulingStore.getState().addEventType({
          name: (input.name as string) || 'Meeting',
          description: '',
          slug,
          category: EventTypeCategory.OneOnOne,
          color: '#4F46E5',
          durationMinutes: isNaN(duration) ? 30 : duration,
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
        return JSON.stringify({ success: true, eventTypeId: eventType.id, name: input.name })
      }

      case 'cancel_booking': {
        const bookingId = input.bookingId as string
        if (!bookingId) {
          return JSON.stringify({ success: false, error: 'Booking ID is required' })
        }
        useSchedulingStore.getState().cancelBooking(bookingId, (input.reason as string) || undefined)
        return JSON.stringify({ success: true, bookingId })
      }

      case 'list_bookings': {
        const upcoming = useSchedulingStore.getState().getFilteredBookings('upcoming')
        const results = upcoming.slice(0, 20).map((b) => ({
          id: b.id,
          date: b.date,
          startTime: b.startTime,
          endTime: b.endTime,
          status: b.status,
          attendees: b.attendees.map((a) => a.name),
        }))
        return JSON.stringify({ success: true, count: upcoming.length, bookings: results })
      }

      // ── Databases ──────────────────────────────────────────────
      case 'create_database': {
        const dbId = useDatabaseStore.getState().addDatabase(
          (input.name as string) || 'Untitled Database',
          (input.icon as string) || '📊',
          (input.description as string) || '',
        )
        return JSON.stringify({ success: true, databaseId: dbId, name: input.name })
      }

      case 'add_table': {
        const databases = Object.values(useDatabaseStore.getState().databases)
        const firstDb = databases[0]
        if (!firstDb) {
          return JSON.stringify({ success: false, error: 'No databases available' })
        }
        const tableId = useDatabaseStore.getState().addTable(
          firstDb.id,
          (input.name as string) || 'New Table',
          'clipboard-list',
        )
        return JSON.stringify({ success: true, tableId, databaseId: firstDb.id })
      }

      case 'add_row': {
        const databases = Object.values(useDatabaseStore.getState().databases)
        const firstDb = databases[0]
        if (!firstDb || firstDb.tables.length === 0) {
          return JSON.stringify({ success: false, error: 'No tables available' })
        }
        const firstTableId = firstDb.tables[0]
        if (!firstTableId) {
          return JSON.stringify({ success: false, error: 'No tables available' })
        }
        const rowId = useDatabaseStore.getState().addRow(firstTableId)
        return JSON.stringify({ success: true, rowId, tableId: firstTableId })
      }

      // ── Accounting ─────────────────────────────────────────────
      case 'create_invoice': {
        const amount = parseFloat((input.amount as string) || '0')
        const today = new Date()
        const dueDate = (input.dueDate as string) || (() => {
          const d = new Date(today); d.setDate(d.getDate() + 30); return d.toISOString().split('T')[0] || ''
        })()
        const invoice = useInvoiceStore.getState().addInvoice({
          customerId: '',
          customerName: (input.customerName as string) || 'Customer',
          issueDate: today.toISOString().split('T')[0] || '',
          dueDate,
          paymentTerms: PaymentTerms.Net30,
          status: 'draft',
          lineItems: [{
            id: Date.now().toString(36),
            description: (input.description as string) || 'Services',
            quantity: 1,
            rate: isNaN(amount) ? 0 : amount,
            amount: isNaN(amount) ? 0 : amount,
          }],
          subtotal: isNaN(amount) ? 0 : amount,
          taxRate: 0,
          taxAmount: 0,
          discount: 0,
          total: isNaN(amount) ? 0 : amount,
          amountPaid: 0,
          balance: isNaN(amount) ? 0 : amount,
          notes: '',
        })
        return JSON.stringify({ success: true, invoiceNumber: invoice.invoiceNumber, customerName: input.customerName })
      }

      case 'create_expense': {
        const expAmount = parseFloat((input.amount as string) || '0')
        const today = new Date().toISOString().split('T')[0] || ''
        useExpenseStore.getState().addExpense({
          date: today,
          amount: isNaN(expAmount) ? 0 : expAmount,
          vendorId: null,
          vendorName: (input.vendorName as string) || 'Vendor',
          categoryId: ((input.category as string) || 'other') as 'other',
          description: (input.description as string) || '',
          accountId: '',
          receipt: null,
          recurring: false,
        })
        return JSON.stringify({ success: true, amount: expAmount, vendorName: input.vendorName })
      }

      // ── Tax ────────────────────────────────────────────────────
      case 'create_tax_filing': {
        const taxYear = (input.taxYear as string) || '2025'
        useTaxFilingStore.getState().createFiling(taxYear as TaxYear)
        return JSON.stringify({ success: true, taxYear })
      }

      // ── Inbox ──────────────────────────────────────────────────
      case 'mark_all_read': {
        useInboxStore.getState().markAllAsRead()
        return JSON.stringify({ success: true, message: 'All notifications marked as read' })
      }

      case 'send_notification': {
        useInboxStore.getState().addNotification(
          NotificationType.System,
          (input.title as string) || 'Notification',
          (input.message as string) || '',
        )
        return JSON.stringify({ success: true, title: input.title })
      }

      // ── Cross-module ───────────────────────────────────────────
      case 'get_workspace_stats': {
        const metrics = getModuleMetrics()
        return JSON.stringify({ success: true, metrics })
      }

      case 'get_upcoming_deadlines': {
        const limit = input.limit ? parseInt(input.limit as string, 10) : 10
        const deadlines = getUpcomingDeadlines(isNaN(limit) ? 10 : limit)
        return JSON.stringify({ success: true, deadlines })
      }

      default:
        return JSON.stringify({ success: false, error: `Unknown tool: ${name}` })
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Tool execution failed'
    return JSON.stringify({ success: false, error: message })
  }
}

// ─── Agent Tool Filtering ───────────────────────────────────────────

const AGENT_TOOL_MAP: Partial<Record<AgentType, string[]>> = {
  planner: ['create_page', 'create_issue', 'create_goal', 'create_cycle', 'list_issues', 'get_workspace_stats', 'get_upcoming_deadlines'],
  researcher: ['search_pages', 'list_issues', 'list_bookings', 'get_workspace_stats', 'get_upcoming_deadlines'],
  writer: ['create_page', 'add_block', 'search_pages', 'create_template'],
  analyst: ['get_workspace_stats', 'get_upcoming_deadlines', 'create_database', 'add_table', 'add_row', 'list_issues', 'list_bookings'],
  designer: ['create_page', 'add_block'],
  developer: ['create_issue', 'create_page', 'list_issues', 'create_cycle', 'get_workspace_stats'],
  reviewer: ['create_issue', 'list_issues', 'get_workspace_stats'],
  coordinator: ['create_issue', 'create_booking', 'cancel_booking', 'list_bookings', 'create_event_type', 'send_notification', 'get_workspace_stats', 'get_upcoming_deadlines'],
  sales: ['add_contact', 'create_booking', 'create_template', 'create_invoice', 'list_bookings', 'get_workspace_stats'],
  marketing: ['create_page', 'add_block', 'create_template', 'send_notification', 'get_workspace_stats'],
  finance: ['create_invoice', 'create_expense', 'create_tax_filing', 'create_database', 'add_table', 'add_row', 'get_workspace_stats', 'get_upcoming_deadlines'],
  legal: ['create_page', 'create_template', 'search_pages', 'get_workspace_stats'],
  compliance: ['get_workspace_stats', 'get_upcoming_deadlines', 'create_tax_filing', 'list_issues'],
  hr: ['create_page', 'create_template', 'add_contact', 'create_booking', 'send_notification', 'create_expense'],
  customerSuccess: ['add_contact', 'create_issue', 'create_booking', 'send_notification', 'list_bookings', 'get_workspace_stats'],
  translation: ['create_page', 'search_pages', 'add_block'],
  seo: ['create_page', 'search_pages', 'get_workspace_stats'],
  socialMedia: ['create_page', 'add_block', 'send_notification', 'get_workspace_stats'],
  security: ['get_workspace_stats', 'create_issue', 'list_issues', 'send_notification'],
  devops: ['create_issue', 'list_issues', 'create_cycle', 'get_workspace_stats'],
}

export function getToolsForAgent(agentType: AgentType): ToolDefinition[] {
  const toolNames = AGENT_TOOL_MAP[agentType]
  if (!toolNames) {
    // Default: give read-only tools
    return ORCHESTREE_TOOLS.filter(
      (t) => t.name === 'get_workspace_stats' || t.name === 'get_upcoming_deadlines',
    )
  }
  return ORCHESTREE_TOOLS.filter((t) => toolNames.includes(t.name))
}
