import type { AgentType } from '../types'
import { useWorkspaceStore } from '../../workspace/stores/useWorkspaceStore'
import { useProjectStore } from '../../projects/stores/useProjectStore'
import { useSchedulingStore } from '../../scheduling/stores/useSchedulingStore'
import { useTemplateStore } from '../../documents/stores/useTemplateStore'
import { useContactStore } from '../../documents/stores/useContactStore'
import { useDatabaseStore } from '../../databases/stores/useDatabaseStore'
import { useInvoiceStore } from '../../accounting/stores/useInvoiceStore'
import { useExpenseStore } from '../../accounting/stores/useExpenseStore'
import { useAccountingStore } from '../../accounting/stores/useAccountingStore'
import { usePayrollStore } from '../../accounting/stores/usePayrollStore'
import { useTaxFilingStore } from '../../tax/stores/useTaxFilingStore'
import { useTaxDocumentStore } from '../../tax/stores/useTaxDocumentStore'
import { useTaxInterviewStore } from '../../tax/stores/useTaxInterviewStore'
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

export const ORIGINA_TOOLS: ToolDefinition[] = [
  // ── Workspace ────────────────────────────────────────────────────
  {
    name: 'create_page',
    description: 'Create a new workspace page in OriginA. Returns the page ID.',
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
  {
    name: 'analyze_bookings',
    description: 'Analyze booking data by status, event type, or date range. Returns booking breakdown and trends.',
    input_schema: {
      type: 'object',
      properties: {
        event_type_id: { type: 'string', description: 'Filter by event type ID' },
        status: { type: 'string', description: 'Filter by booking status', enum: ['confirmed', 'cancelled', 'rescheduled', 'completed', 'no_show'] },
      },
      required: [],
    },
  },
  {
    name: 'get_availability_summary',
    description: 'Get a summary of availability gaps and busy periods across event types.',
    input_schema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  {
    name: 'get_no_show_stats',
    description: 'Get no-show rates and patterns by event type.',
    input_schema: {
      type: 'object',
      properties: {
        event_type_id: { type: 'string', description: 'Filter by specific event type ID' },
      },
      required: [],
    },
  },
  {
    name: 'review_calendar_health',
    description: 'Check calendar sync status, conflicts, and upcoming booking load.',
    input_schema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  {
    name: 'get_waitlist_summary',
    description: 'Summarize waitlist entries by event type and status.',
    input_schema: {
      type: 'object',
      properties: {
        event_type_id: { type: 'string', description: 'Filter by event type ID' },
      },
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

  // ── Database Analysis ────────────────────────────────────────────
  {
    name: 'analyze_database_schema',
    description: 'Analyze database schema: summarize tables, fields, field types, and relation connections.',
    input_schema: {
      type: 'object',
      properties: {
        database_id: { type: 'string', description: 'Filter by specific database ID' },
      },
      required: [],
    },
  },
  {
    name: 'get_table_stats',
    description: 'Get table statistics: row counts, field distribution, and empty/filled rates per table.',
    input_schema: {
      type: 'object',
      properties: {
        table_id: { type: 'string', description: 'Filter by specific table ID' },
      },
      required: [],
    },
  },
  {
    name: 'review_database_automations',
    description: 'List automation rules with their triggers, actions, active/inactive status, and run counts.',
    input_schema: {
      type: 'object',
      properties: {
        enabled_only: { type: 'string', description: 'Set to "true" to show only enabled automations' },
      },
      required: [],
    },
  },
  {
    name: 'analyze_views',
    description: 'Summarize database views by type (grid, kanban, calendar, gallery, form, timeline) across all tables.',
    input_schema: {
      type: 'object',
      properties: {
        table_id: { type: 'string', description: 'Filter by specific table ID' },
      },
      required: [],
    },
  },
  {
    name: 'get_relation_map',
    description: 'Map all relation, lookup, and rollup fields and their connections between tables.',
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

  {
    name: 'analyze_expenses',
    description: 'Analyze expense data by category, vendor, or date range. Returns expense breakdown and trends.',
    input_schema: {
      type: 'object',
      properties: {
        category: { type: 'string', description: 'Filter by expense category (e.g., "software", "rent", "utilities")' },
        date_range: { type: 'string', description: 'Date range to analyze (e.g., "2026-01", "2026-Q1")' },
      },
      required: [],
    },
  },
  {
    name: 'get_invoice_summary',
    description: 'Get a summary of invoices by status with outstanding and overdue totals.',
    input_schema: {
      type: 'object',
      properties: {
        status: { type: 'string', description: 'Filter by invoice status', enum: ['draft', 'sent', 'partially_paid', 'paid', 'overdue', 'void'] },
      },
      required: [],
    },
  },
  {
    name: 'get_account_balance',
    description: 'Get the balance for a specific general ledger account or all accounts of a type.',
    input_schema: {
      type: 'object',
      properties: {
        account_id: { type: 'string', description: 'The account ID to look up' },
        account_type: { type: 'string', description: 'Filter by account type', enum: ['asset', 'liability', 'equity', 'revenue', 'expense'] },
      },
      required: [],
    },
  },
  {
    name: 'review_cash_flow',
    description: 'Analyze cash inflows and outflows over a date range. Returns net cash flow and transaction breakdown.',
    input_schema: {
      type: 'object',
      properties: {
        start_date: { type: 'string', description: 'Start date (YYYY-MM-DD)' },
        end_date: { type: 'string', description: 'End date (YYYY-MM-DD)' },
      },
      required: [],
    },
  },
  {
    name: 'get_payroll_summary',
    description: 'Get a summary of payroll including employee headcount, latest pay run status, and total costs.',
    input_schema: {
      type: 'object',
      properties: {
        pay_period: { type: 'string', description: 'Pay period to summarize (e.g., "2026-01")' },
      },
      required: [],
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

  {
    name: 'analyze_tax_document',
    description: 'Analyze a tax document by ID. Returns extracted fields and any warnings.',
    input_schema: {
      type: 'object',
      properties: {
        documentId: { type: 'string', description: 'The ID of the uploaded tax document to analyze' },
      },
      required: ['documentId'],
    },
  },
  {
    name: 'suggest_deductions',
    description: 'Suggest applicable deductions and credits based on interview answers for a given tax year.',
    input_schema: {
      type: 'object',
      properties: {
        taxYear: {
          type: 'string',
          description: 'Tax year to suggest deductions for',
          enum: ['2025', '2024', '2023'],
        },
      },
      required: ['taxYear'],
    },
  },
  {
    name: 'review_filing',
    description: 'Review a tax filing for errors by aggregating data from all tax stores. Returns a list of issues found.',
    input_schema: {
      type: 'object',
      properties: {
        taxYear: {
          type: 'string',
          description: 'Tax year to review',
          enum: ['2025', '2024', '2023'],
        },
      },
      required: ['taxYear'],
    },
  },
  {
    name: 'explain_tax_field',
    description: 'Explain a specific tax form field in plain English.',
    input_schema: {
      type: 'object',
      properties: {
        formType: { type: 'string', description: 'The tax form type (e.g. "w2", "1099_nec", "1098")' },
        fieldKey: { type: 'string', description: 'The field key to explain (e.g. "box_1", "wages", "ein")' },
      },
      required: ['formType', 'fieldKey'],
    },
  },
  {
    name: 'check_submission_status',
    description: 'Check the status of an e-filing submission by its local submission ID.',
    input_schema: {
      type: 'object',
      properties: {
        submissionId: { type: 'string', description: 'The local submission ID to check' },
      },
      required: ['submissionId'],
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

      case 'analyze_bookings': {
        const schedState = useSchedulingStore.getState()
        const allBookings = schedState.bookings
        const eventTypeId = input.event_type_id as string | undefined
        const statusFilter = input.status as string | undefined

        let filtered = allBookings
        if (eventTypeId) {
          filtered = filtered.filter((b) => b.eventTypeId === eventTypeId)
        }
        if (statusFilter) {
          filtered = filtered.filter((b) => b.status === statusFilter)
        }

        const today = new Date()
        const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

        const byStatus: Record<string, number> = {}
        for (const b of filtered) {
          byStatus[b.status] = (byStatus[b.status] ?? 0) + 1
        }

        const upcomingCount = filtered.filter((b) => b.date >= todayStr && b.status !== 'cancelled').length
        const pastCount = filtered.filter((b) => b.date < todayStr).length

        return JSON.stringify({
          success: true,
          total: filtered.length,
          upcoming: upcomingCount,
          past: pastCount,
          byStatus,
        })
      }

      case 'get_availability_summary': {
        const schedState = useSchedulingStore.getState()
        const eventTypes = schedState.eventTypes
        const allBookings = schedState.bookings
        const today = new Date()
        const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

        const availability = eventTypes.map((et) => {
          const upcomingBookings = allBookings.filter(
            (b) => b.eventTypeId === et.id && b.date >= todayStr && b.status !== 'cancelled'
          )
          const bookingsByDate: Record<string, number> = {}
          for (const b of upcomingBookings) {
            bookingsByDate[b.date] = (bookingsByDate[b.date] ?? 0) + 1
          }
          const fullyBookedDates = Object.entries(bookingsByDate)
            .filter(([, count]) => count >= et.maxBookingsPerDay)
            .map(([date]) => date)

          return {
            eventTypeId: et.id,
            name: et.name,
            isActive: et.isActive,
            durationMinutes: et.durationMinutes,
            maxBookingsPerDay: et.maxBookingsPerDay,
            upcomingBookings: upcomingBookings.length,
            fullyBookedDates,
          }
        })

        return JSON.stringify({ success: true, eventTypes: availability })
      }

      case 'get_no_show_stats': {
        const schedState = useSchedulingStore.getState()
        const eventTypeIdFilter = input.event_type_id as string | undefined

        if (eventTypeIdFilter) {
          const et = schedState.eventTypes.find((e) => e.id === eventTypeIdFilter)
          const rate = schedState.getNoShowRate(eventTypeIdFilter)
          return JSON.stringify({
            success: true,
            eventType: et ? { id: et.id, name: et.name } : null,
            noShowRate: rate,
          })
        }

        const overallRate = schedState.getNoShowRate()
        const byEventType = schedState.eventTypes.map((et) => ({
          eventTypeId: et.id,
          name: et.name,
          noShowRate: schedState.getNoShowRate(et.id),
          totalBookings: schedState.bookings.filter((b) => b.eventTypeId === et.id).length,
        }))

        return JSON.stringify({
          success: true,
          overallNoShowRate: overallRate,
          byEventType,
        })
      }

      case 'review_calendar_health': {
        const schedState = useSchedulingStore.getState()
        const connections = schedState.calendarConnections
        const allBookings = schedState.bookings
        const today = new Date()
        const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
        const nextWeek = new Date(today)
        nextWeek.setDate(nextWeek.getDate() + 7)
        const nextWeekStr = `${nextWeek.getFullYear()}-${String(nextWeek.getMonth() + 1).padStart(2, '0')}-${String(nextWeek.getDate()).padStart(2, '0')}`

        const connectedCalendars = connections.filter((c) => c.connected)
        const next7Days = allBookings.filter(
          (b) => b.date >= todayStr && b.date <= nextWeekStr && b.status !== 'cancelled'
        )

        // Check for conflicts
        const activeBookings = allBookings.filter((b) => b.status !== 'cancelled')
        const conflicts: Array<{ date: string; booking1: string; booking2: string }> = []
        for (let i = 0; i < activeBookings.length; i++) {
          for (let j = i + 1; j < activeBookings.length; j++) {
            const a = activeBookings[i]!
            const b = activeBookings[j]!
            if (a.date === b.date && a.startTime < b.endTime && b.startTime < a.endTime) {
              conflicts.push({ date: a.date, booking1: a.id, booking2: b.id })
            }
          }
        }

        return JSON.stringify({
          success: true,
          calendars: {
            total: connections.length,
            connected: connectedCalendars.length,
            details: connections.map((c) => ({
              id: c.id,
              provider: c.provider,
              connected: c.connected,
              syncDirection: c.syncDirection,
              lastSyncedAt: c.lastSyncedAt,
            })),
          },
          upcomingLoad: next7Days.length,
          conflicts: conflicts.length,
          conflictDetails: conflicts,
        })
      }

      case 'get_waitlist_summary': {
        const schedState = useSchedulingStore.getState()
        const waitlist = schedState.waitlist
        const eventTypeIdFilter = input.event_type_id as string | undefined

        const filtered = eventTypeIdFilter
          ? waitlist.filter((w) => w.eventTypeId === eventTypeIdFilter)
          : waitlist

        const byStatus: Record<string, number> = {}
        for (const w of filtered) {
          byStatus[w.status] = (byStatus[w.status] ?? 0) + 1
        }

        const byEventType: Record<string, number> = {}
        for (const w of filtered) {
          byEventType[w.eventTypeId] = (byEventType[w.eventTypeId] ?? 0) + 1
        }

        return JSON.stringify({
          success: true,
          total: filtered.length,
          byStatus,
          byEventType,
          entries: filtered.slice(0, 20).map((w) => ({
            id: w.id,
            eventTypeId: w.eventTypeId,
            date: w.date,
            name: w.name,
            status: w.status,
          })),
        })
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

      // ── Database Analysis ────────────────────────────────────────
      case 'analyze_database_schema': {
        const dbState = useDatabaseStore.getState()
        const databaseId = input.database_id as string | undefined
        const databases = databaseId
          ? [dbState.databases[databaseId]].filter(Boolean)
          : Object.values(dbState.databases)

        const tableIds = databases.flatMap((db) => db!.tables)
        const tables = tableIds.map((tid) => dbState.tables[tid]).filter(Boolean)

        const tableSchemas = tables.map((t) => ({
          id: t!.id,
          name: t!.name,
          fieldCount: t!.fields.length,
          rowCount: t!.rows.length,
          viewCount: t!.views.length,
          fields: t!.fields.map((f) => ({
            name: f.name,
            type: f.type,
            hasRelation: !!f.relationConfig,
            hasLookup: !!f.lookupConfig,
            hasRollup: !!f.rollupConfig,
            hasFormula: !!f.formulaConfig,
          })),
        }))

        return JSON.stringify({
          success: true,
          databaseCount: databases.length,
          tableCount: tables.length,
          tables: tableSchemas,
        })
      }

      case 'get_table_stats': {
        const dbState = useDatabaseStore.getState()
        const tableId = input.table_id as string | undefined
        const tables = tableId
          ? [dbState.tables[tableId]].filter(Boolean)
          : Object.values(dbState.tables)

        const stats = tables.map((t) => {
          const totalCells = t!.rows.length * t!.fields.length
          let filledCells = 0
          for (const row of t!.rows) {
            for (const field of t!.fields) {
              const val = row.cells[field.id]
              if (val !== null && val !== undefined && val !== '') {
                filledCells++
              }
            }
          }
          const fieldTypeDist: Record<string, number> = {}
          for (const f of t!.fields) {
            fieldTypeDist[f.type] = (fieldTypeDist[f.type] ?? 0) + 1
          }
          return {
            tableId: t!.id,
            name: t!.name,
            rowCount: t!.rows.length,
            fieldCount: t!.fields.length,
            totalCells,
            filledCells,
            fillRate: totalCells > 0 ? Math.round((filledCells / totalCells) * 100) : 0,
            fieldTypeDistribution: fieldTypeDist,
          }
        })

        return JSON.stringify({ success: true, tables: stats })
      }

      case 'review_database_automations': {
        const dbState = useDatabaseStore.getState()
        const enabledOnly = input.enabled_only === 'true'
        const automations = enabledOnly
          ? dbState.automations.filter((a) => a.enabled)
          : dbState.automations

        const rules = automations.map((a) => ({
          id: a.id,
          name: a.name,
          description: a.description,
          trigger: a.trigger,
          action: a.action,
          enabled: a.enabled,
          runCount: a.runCount,
          lastRunAt: a.lastRunAt,
        }))

        const activeCount = dbState.automations.filter((a) => a.enabled).length
        const inactiveCount = dbState.automations.filter((a) => !a.enabled).length

        return JSON.stringify({
          success: true,
          total: dbState.automations.length,
          active: activeCount,
          inactive: inactiveCount,
          rules,
        })
      }

      case 'analyze_views': {
        const dbState = useDatabaseStore.getState()
        const tableIdFilter = input.table_id as string | undefined
        const tables = tableIdFilter
          ? [dbState.tables[tableIdFilter]].filter(Boolean)
          : Object.values(dbState.tables)

        const allViews = tables.flatMap((t) => t!.views)
        const byType: Record<string, number> = {}
        for (const v of allViews) {
          byType[v.type] = (byType[v.type] ?? 0) + 1
        }

        const viewDetails = allViews.map((v) => ({
          id: v.id,
          name: v.name,
          type: v.type,
          tableId: v.tableId,
          filterCount: v.filters.length,
          sortCount: v.sorts.length,
          hasGrouping: !!v.groupBy,
          hiddenFieldCount: v.hiddenFields.length,
        }))

        return JSON.stringify({
          success: true,
          totalViews: allViews.length,
          byType,
          views: viewDetails,
        })
      }

      case 'get_relation_map': {
        const dbState = useDatabaseStore.getState()
        const allTables = Object.values(dbState.tables)

        const relations = allTables.flatMap((t) =>
          t.fields
            .filter((f) => f.type === 'relation' && f.relationConfig)
            .map((f) => ({
              sourceTable: t.name,
              sourceTableId: t.id,
              sourceField: f.name,
              sourceFieldId: f.id,
              targetTableId: f.relationConfig!.targetTableId,
              targetFieldId: f.relationConfig!.targetFieldId,
              allowMultiple: f.relationConfig!.allowMultiple,
            }))
        )

        const lookups = allTables.flatMap((t) =>
          t.fields
            .filter((f) => f.type === 'lookup' && f.lookupConfig)
            .map((f) => ({
              table: t.name,
              tableId: t.id,
              field: f.name,
              fieldId: f.id,
              relationFieldId: f.lookupConfig!.relationFieldId,
              targetFieldId: f.lookupConfig!.targetFieldId,
            }))
        )

        const rollups = allTables.flatMap((t) =>
          t.fields
            .filter((f) => f.type === 'rollup' && f.rollupConfig)
            .map((f) => ({
              table: t.name,
              tableId: t.id,
              field: f.name,
              fieldId: f.id,
              relationFieldId: f.rollupConfig!.relationFieldId,
              targetFieldId: f.rollupConfig!.targetFieldId,
              aggregation: f.rollupConfig!.aggregation,
            }))
        )

        return JSON.stringify({
          success: true,
          relations,
          lookups,
          rollups,
          totalConnections: relations.length + lookups.length + rollups.length,
        })
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

      case 'analyze_expenses': {
        const expenses = useExpenseStore.getState().expenses
        const category = input.category as string | undefined
        const filtered = category
          ? expenses.filter((e) => e.categoryId === category)
          : expenses

        const totalByCategory: Record<string, number> = {}
        for (const exp of filtered) {
          totalByCategory[exp.categoryId] = (totalByCategory[exp.categoryId] ?? 0) + exp.amount
        }

        const vendorTotals: Record<string, number> = {}
        for (const exp of filtered) {
          vendorTotals[exp.vendorName] = (vendorTotals[exp.vendorName] ?? 0) + exp.amount
        }

        const total = filtered.reduce((sum, e) => sum + e.amount, 0)
        const recurringCount = filtered.filter((e) => e.recurring).length

        return JSON.stringify({
          success: true,
          count: filtered.length,
          total,
          byCategory: totalByCategory,
          topVendors: Object.entries(vendorTotals)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([name, amount]) => ({ name, amount })),
          recurringCount,
        })
      }

      case 'get_invoice_summary': {
        const invoiceState = useInvoiceStore.getState()
        const status = input.status as string | undefined
        const invoices = status
          ? invoiceState.getInvoicesByStatus(status as 'draft')
          : invoiceState.invoices

        const byStatus: Record<string, number> = {}
        for (const inv of invoices) {
          byStatus[inv.status] = (byStatus[inv.status] ?? 0) + 1
        }

        return JSON.stringify({
          success: true,
          count: invoices.length,
          byStatus,
          outstandingTotal: invoiceState.getOutstandingTotal(),
          overdueTotal: invoiceState.getOverdueTotal(),
          invoices: invoices.slice(0, 10).map((inv) => ({
            invoiceNumber: inv.invoiceNumber,
            customerName: inv.customerName,
            total: inv.total,
            balance: inv.balance,
            status: inv.status,
            dueDate: inv.dueDate,
          })),
        })
      }

      case 'get_account_balance': {
        const acctState = useAccountingStore.getState()
        const accountId = input.account_id as string | undefined
        const accountType = input.account_type as string | undefined

        if (accountId) {
          const account = acctState.getAccountById(accountId)
          if (!account) {
            return JSON.stringify({ success: false, error: `Account not found: ${accountId}` })
          }
          return JSON.stringify({
            success: true,
            account: { id: account.id, name: account.name, type: account.type, balance: account.balance },
          })
        }

        const accounts = accountType
          ? acctState.getAccountsByType(accountType as 'asset')
          : acctState.accounts

        const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0)
        return JSON.stringify({
          success: true,
          count: accounts.length,
          totalBalance,
          accounts: accounts.map((a) => ({ id: a.id, name: a.name, type: a.type, balance: a.balance })),
        })
      }

      case 'review_cash_flow': {
        const acctState = useAccountingStore.getState()
        const startDate = input.start_date as string | undefined
        const endDate = input.end_date as string | undefined

        const transactions = (startDate && endDate)
          ? acctState.getTransactionsByDateRange(startDate, endDate)
          : acctState.transactions

        let totalInflows = 0
        let totalOutflows = 0

        for (const txn of transactions) {
          if (txn.type === 'income') {
            for (const line of txn.lines) {
              totalInflows += line.debit
            }
          } else if (txn.type === 'expense') {
            for (const line of txn.lines) {
              totalOutflows += line.debit
            }
          }
        }

        return JSON.stringify({
          success: true,
          transactionCount: transactions.length,
          totalInflows,
          totalOutflows,
          netCashFlow: totalInflows - totalOutflows,
          dateRange: { start: startDate ?? 'all', end: endDate ?? 'all' },
        })
      }

      case 'get_payroll_summary': {
        const prState = usePayrollStore.getState()
        const activeEmployees = prState.employees.filter((e) => e.status === 'active')
        const totalAnnualPayroll = activeEmployees.reduce((sum, e) => sum + e.payRate, 0)

        const latestPayRun = prState.payRuns.length > 0
          ? prState.payRuns[prState.payRuns.length - 1]
          : null

        return JSON.stringify({
          success: true,
          employeeCount: prState.employees.length,
          activeCount: activeEmployees.length,
          totalAnnualPayroll,
          latestPayRun: latestPayRun
            ? {
                payDate: latestPayRun.payDate,
                status: latestPayRun.status,
                totalGross: latestPayRun.totalGross,
                totalNet: latestPayRun.totalNet,
                employeeCount: latestPayRun.employeeCount,
              }
            : null,
          employees: activeEmployees.map((e) => ({
            name: `${e.firstName} ${e.lastName}`,
            title: e.title,
            payRate: e.payRate,
          })),
        })
      }

      // ── Tax ────────────────────────────────────────────────────
      case 'create_tax_filing': {
        const taxYear = (input.taxYear as string) || '2025'
        useTaxFilingStore.getState().createFiling(taxYear as TaxYear)
        return JSON.stringify({ success: true, taxYear })
      }

      case 'analyze_tax_document': {
        const documentId = input.documentId as string
        if (!documentId) {
          return JSON.stringify({ success: false, error: 'documentId is required' })
        }
        const docState = useTaxDocumentStore.getState()
        const doc = docState.documents.find((d) => d.id === documentId)
        if (!doc) {
          return JSON.stringify({ success: false, error: `Document not found: ${documentId}` })
        }
        const extraction = docState.extractionResults[documentId]
        const fields = extraction
          ? extraction.fields.map((f) => ({
              key: f.key,
              value: f.value,
              confidence: f.confidence,
              confirmed: f.confirmed,
            }))
          : []
        const warnings: string[] = []
        if (!extraction) {
          warnings.push('Document has not been extracted yet — trigger extraction first')
        } else if (extraction.warnings.length > 0) {
          warnings.push(...extraction.warnings)
        }
        if (doc.status === 'issue_found' && doc.issueNote) {
          warnings.push(`Issue flagged: ${doc.issueNote}`)
        }
        return JSON.stringify({
          success: true,
          document: {
            id: doc.id,
            fileName: doc.fileName,
            formType: doc.formType,
            taxYear: doc.taxYear,
            employerName: doc.employerName,
            status: doc.status,
          },
          extractedFields: fields,
          overallConfidence: extraction?.overallConfidence ?? null,
          warnings,
        })
      }

      case 'suggest_deductions': {
        const year = (input.taxYear as string) || '2025'
        const interviewState = useTaxInterviewStore.getState()
        const answers = interviewState.answers
        const completedSections = interviewState.getCompletedSections()
        const suggestions: Array<{ deduction: string; description: string; eligibility: string }> = []

        // Standard vs Itemized
        suggestions.push({
          deduction: 'Standard Deduction',
          description: `For tax year ${year}, the standard deduction may reduce your taxable income significantly.`,
          eligibility: 'Available to most filers who do not itemize',
        })

        // Check if mortgage-related answers or documents exist
        const docState = useTaxDocumentStore.getState()
        const hasMortgageDocs = docState.documents.some(
          (d) => d.formType === '1098' && d.taxYear === year
        )
        if (hasMortgageDocs) {
          suggestions.push({
            deduction: 'Mortgage Interest Deduction',
            description: 'You have a 1098 form uploaded — mortgage interest may be deductible if you itemize.',
            eligibility: 'Requires itemized deductions and qualified home mortgage',
          })
        }

        // Self-employment / 1099 income
        const has1099Docs = docState.documents.some(
          (d) => d.formType === '1099_nec' && d.taxYear === year
        )
        if (has1099Docs) {
          suggestions.push({
            deduction: 'Self-Employment Tax Deduction',
            description: 'You may deduct half of your self-employment tax from gross income.',
            eligibility: 'Available if you have 1099-NEC self-employment income',
          })
          suggestions.push({
            deduction: 'Home Office Deduction',
            description: 'If you use part of your home exclusively for business, you may qualify.',
            eligibility: 'Requires exclusive and regular use of home space for business',
          })
          suggestions.push({
            deduction: 'Business Expense Deductions',
            description: 'Equipment, software, supplies, and other ordinary business expenses.',
            eligibility: 'Must be ordinary and necessary expenses for your trade or business',
          })
        }

        // Education credits
        if (completedSections.includes('credits') || Object.keys(answers).some((k) => k.startsWith('credits_'))) {
          suggestions.push({
            deduction: 'Education Credits (American Opportunity / Lifetime Learning)',
            description: 'Credits for qualified tuition and education expenses.',
            eligibility: 'Subject to income limits and enrollment requirements',
          })
        }

        // Health insurance
        if (completedSections.includes('health_insurance')) {
          suggestions.push({
            deduction: 'Health Insurance Premium Deduction',
            description: 'Self-employed individuals may deduct health insurance premiums.',
            eligibility: 'Available for self-employed taxpayers not eligible for employer coverage',
          })
        }

        // Student loan interest (general suggestion)
        suggestions.push({
          deduction: 'Student Loan Interest Deduction',
          description: 'Up to $2,500 of student loan interest may be deductible.',
          eligibility: 'Subject to income limits; available even if you do not itemize',
        })

        return JSON.stringify({
          success: true,
          taxYear: year,
          interviewProgress: interviewState.getOverallProgress(),
          suggestions,
        })
      }

      case 'review_filing': {
        const year = (input.taxYear as string) || '2025'
        const filing = useTaxFilingStore.getState().getFilingByYear(year as TaxYear)
        const docState = useTaxDocumentStore.getState()
        const interviewState = useTaxInterviewStore.getState()
        const issues: Array<{ severity: 'error' | 'warning' | 'info'; field: string; message: string }> = []

        if (!filing) {
          return JSON.stringify({
            success: true,
            taxYear: year,
            issues: [{ severity: 'error', field: 'filing', message: `No filing found for tax year ${year}` }],
          })
        }

        // Check personal info
        if (!filing.firstName || !filing.lastName) {
          issues.push({ severity: 'error', field: 'name', message: 'First name and last name are required' })
        }
        if (!filing.ssn) {
          issues.push({ severity: 'error', field: 'ssn', message: 'SSN is required for filing' })
        }
        if (!filing.email) {
          issues.push({ severity: 'warning', field: 'email', message: 'Email address is missing — recommended for IRS correspondence' })
        }
        if (!filing.address.street || !filing.address.city || !filing.address.state || !filing.address.zip) {
          issues.push({ severity: 'error', field: 'address', message: 'Complete mailing address is required' })
        }

        // Check income
        if (filing.wages === 0 && filing.otherIncome === 0) {
          issues.push({ severity: 'warning', field: 'income', message: 'No income reported — verify this is correct' })
        }

        // Cross-reference documents
        const yearDocs = docState.documents.filter((d) => d.taxYear === year)
        const docsWithIssues = yearDocs.filter((d) => d.status === 'issue_found')
        if (docsWithIssues.length > 0) {
          issues.push({
            severity: 'error',
            field: 'documents',
            message: `${docsWithIssues.length} document(s) have unresolved issues: ${docsWithIssues.map((d) => d.fileName).join(', ')}`,
          })
        }
        const pendingDocs = yearDocs.filter((d) => d.status === 'pending_review')
        if (pendingDocs.length > 0) {
          issues.push({
            severity: 'warning',
            field: 'documents',
            message: `${pendingDocs.length} document(s) still pending review: ${pendingDocs.map((d) => d.fileName).join(', ')}`,
          })
        }

        // Check interview completeness
        const interviewProgress = interviewState.getOverallProgress()
        if (interviewProgress < 100) {
          issues.push({
            severity: 'warning',
            field: 'interview',
            message: `Tax interview is ${interviewProgress}% complete — finish all sections before filing`,
          })
        }

        // Check checklist
        const checklist = useTaxFilingStore.getState().checklist
        const incompleteItems = checklist.filter((item) => !item.completed)
        if (incompleteItems.length > 0) {
          issues.push({
            severity: 'info',
            field: 'checklist',
            message: `${incompleteItems.length} checklist item(s) incomplete: ${incompleteItems.map((i) => i.label).join(', ')}`,
          })
        }

        return JSON.stringify({
          success: true,
          taxYear: year,
          filingState: filing.state,
          totalIssues: issues.length,
          errors: issues.filter((i) => i.severity === 'error').length,
          warnings: issues.filter((i) => i.severity === 'warning').length,
          info: issues.filter((i) => i.severity === 'info').length,
          issues,
        })
      }

      case 'explain_tax_field': {
        const formType = (input.formType as string) || ''
        const fieldKey = (input.fieldKey as string) || ''

        const explanations: Record<string, Record<string, string>> = {
          w2: {
            box_1: 'Wages, tips, other compensation — your total taxable wages from this employer before any pre-tax deductions.',
            box_2: 'Federal income tax withheld — the amount your employer already sent to the IRS on your behalf.',
            box_3: 'Social Security wages — the portion of your wages subject to Social Security tax (may differ from Box 1).',
            box_4: 'Social Security tax withheld — the 6.2% tax withheld for Social Security.',
            box_5: 'Medicare wages and tips — wages subject to Medicare tax (usually same as or more than Box 1).',
            box_6: 'Medicare tax withheld — the 1.45% tax withheld for Medicare.',
            box_12: 'Various codes for retirement contributions (D = 401k), health savings (W = HSA), and other benefits.',
            wages: 'Your total taxable compensation from this employer, reported in Box 1.',
            ein: 'Employer Identification Number — the 9-digit number identifying your employer with the IRS.',
          },
          '1099_nec': {
            box_1: 'Nonemployee compensation — the total amount you were paid as a freelancer or independent contractor.',
            box_4: 'Federal income tax withheld, if any backup withholding was applied.',
            payer_tin: 'Payer Taxpayer Identification Number — the company or person who paid you.',
          },
          '1099_int': {
            box_1: 'Interest income — the total interest earned from this bank or financial institution.',
            box_2: 'Early withdrawal penalty — any penalty charged for withdrawing funds before maturity.',
            box_3: 'Interest on U.S. Savings Bonds and Treasury obligations.',
            box_4: 'Federal income tax withheld from interest payments.',
          },
          '1099_div': {
            box_1a: 'Total ordinary dividends — all dividends paid to you during the tax year.',
            box_1b: 'Qualified dividends — the portion of dividends taxed at the lower capital gains rate.',
            box_2a: 'Total capital gain distributions from mutual funds or REITs.',
          },
          '1098': {
            box_1: 'Mortgage interest received — the deductible interest you paid on your home loan.',
            box_2: 'Outstanding mortgage principal — the remaining balance on your loan.',
            box_5: 'Mortgage insurance premiums — may be deductible depending on income and tax year.',
            box_6: 'Points paid on purchase — upfront interest charges that may be deductible.',
          },
        }

        const formExplanations = explanations[formType.toLowerCase()]
        if (!formExplanations) {
          return JSON.stringify({
            success: true,
            formType,
            fieldKey,
            explanation: `No detailed explanations available for form type "${formType}". Please consult IRS instructions for this form.`,
          })
        }

        const explanation = formExplanations[fieldKey.toLowerCase()]
        if (!explanation) {
          const availableFields = Object.keys(formExplanations).join(', ')
          return JSON.stringify({
            success: true,
            formType,
            fieldKey,
            explanation: `No explanation found for field "${fieldKey}" on form "${formType}". Available fields: ${availableFields}`,
          })
        }

        return JSON.stringify({
          success: true,
          formType,
          fieldKey,
          explanation,
        })
      }

      case 'check_submission_status': {
        const subId = input.submissionId as string
        if (!subId) {
          return JSON.stringify({ success: false, error: 'submissionId is required' })
        }
        const submission = useTaxFilingStore.getState().submissions.find((s) => s.id === subId)
        if (!submission) {
          return JSON.stringify({ success: false, error: `Submission not found: ${subId}` })
        }
        return JSON.stringify({
          success: true,
          submission: {
            id: submission.id,
            formType: submission.formType,
            taxYear: submission.taxYear,
            state: submission.state,
            taxBanditSubmissionId: submission.taxBanditSubmissionId,
            taxBanditRecordId: submission.taxBanditRecordId,
            validationErrors: submission.validationErrors,
            irsErrors: submission.irsErrors,
            pdfUrl: submission.pdfUrl,
            createdAt: submission.createdAt,
            updatedAt: submission.updatedAt,
            filedAt: submission.filedAt,
          },
        })
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

export const AGENT_TOOL_MAP: Partial<Record<AgentType, string[]>> = {
  planner: ['create_page', 'create_issue', 'create_goal', 'create_cycle', 'list_issues', 'get_workspace_stats', 'get_upcoming_deadlines'],
  researcher: ['search_pages', 'list_issues', 'list_bookings', 'get_workspace_stats', 'get_upcoming_deadlines'],
  writer: ['create_page', 'add_block', 'search_pages', 'create_template'],
  analyst: ['get_workspace_stats', 'get_upcoming_deadlines', 'create_database', 'add_table', 'add_row', 'list_issues', 'list_bookings', 'analyze_database_schema', 'get_table_stats', 'review_database_automations', 'analyze_views', 'get_relation_map'],
  designer: ['create_page', 'add_block'],
  developer: ['create_issue', 'create_page', 'list_issues', 'create_cycle', 'get_workspace_stats'],
  reviewer: ['create_issue', 'list_issues', 'get_workspace_stats'],
  coordinator: ['create_issue', 'create_booking', 'cancel_booking', 'list_bookings', 'create_event_type', 'send_notification', 'get_workspace_stats', 'get_upcoming_deadlines', 'analyze_bookings', 'get_availability_summary', 'get_no_show_stats', 'review_calendar_health', 'get_waitlist_summary'],
  sales: ['add_contact', 'create_booking', 'create_template', 'create_invoice', 'list_bookings', 'get_workspace_stats'],
  marketing: ['create_page', 'add_block', 'create_template', 'send_notification', 'get_workspace_stats'],
  finance: ['create_invoice', 'create_expense', 'analyze_expenses', 'get_invoice_summary', 'get_account_balance', 'review_cash_flow', 'get_payroll_summary', 'create_tax_filing', 'analyze_tax_document', 'suggest_deductions', 'create_database', 'add_table', 'add_row', 'get_workspace_stats', 'get_upcoming_deadlines'],
  legal: ['create_page', 'create_template', 'search_pages', 'get_workspace_stats'],
  compliance: ['get_workspace_stats', 'get_upcoming_deadlines', 'create_tax_filing', 'review_filing', 'list_issues'],
  hr: ['create_page', 'create_template', 'add_contact', 'create_booking', 'send_notification', 'create_expense'],
  customerSuccess: ['add_contact', 'create_issue', 'create_booking', 'send_notification', 'list_bookings', 'get_workspace_stats'],
  translation: ['create_page', 'search_pages', 'add_block'],
  seo: ['create_page', 'search_pages', 'get_workspace_stats'],
  socialMedia: ['create_page', 'add_block', 'send_notification', 'get_workspace_stats'],
  security: ['get_workspace_stats', 'create_issue', 'list_issues', 'send_notification'],
  devops: ['create_issue', 'list_issues', 'create_cycle', 'get_workspace_stats'],
  tax: ['create_tax_filing', 'analyze_tax_document', 'suggest_deductions', 'review_filing', 'explain_tax_field', 'check_submission_status', 'get_upcoming_deadlines'],
}

export function getToolsForAgent(agentType: AgentType): ToolDefinition[] {
  const toolNames = AGENT_TOOL_MAP[agentType]
  if (!toolNames) {
    // Default: give read-only tools
    return ORIGINA_TOOLS.filter(
      (t) => t.name === 'get_workspace_stats' || t.name === 'get_upcoming_deadlines',
    )
  }
  return ORIGINA_TOOLS.filter((t) => toolNames.includes(t.name))
}
