import { create } from 'zustand'
import { useSchedulingStore } from './useSchedulingStore'

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
  type: 'tip' | 'warning' | 'deduction' | 'missing_info' | 'review'
  title: string
  description: string
  action?: { label: string; route?: string }
  dismissed: boolean
  sectionId?: string
}

// ─── Response Generator ─────────────────────────────────────────────

function generateResponse(userMessage: string, context?: string): string {
  const msg = userMessage.toLowerCase()

  const schedulingState = useSchedulingStore.getState()

  // Keyword: booking / schedule / upcoming
  if (msg.includes('booking') || msg.includes('schedule') || msg.includes('upcoming')) {
    const bookings = schedulingState.bookings
    const today = new Date()
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
    const upcoming = bookings.filter((b) => b.date >= todayStr && b.status !== 'cancelled')
    const past = bookings.filter((b) => b.date < todayStr)

    const byStatus: Record<string, number> = {}
    for (const b of bookings) {
      byStatus[b.status] = (byStatus[b.status] ?? 0) + 1
    }
    const statusBreakdown = Object.entries(byStatus)
      .map(([status, count]) => `${status}: ${count}`)
      .join(', ')

    let response = `You have ${bookings.length} booking(s) total (${upcoming.length} upcoming, ${past.length} past). Status breakdown: ${statusBreakdown}.`

    if (upcoming.length > 0) {
      response += `\n\nUpcoming bookings:\n${upcoming.slice(0, 5).map((b) => `- ${b.date} ${b.startTime}-${b.endTime}: ${b.attendees.map((a) => a.name).join(', ')} (${b.status})`).join('\n')}`
    }
    return response
  }

  // Keyword: availability / free / busy
  if (msg.includes('availability') || msg.includes('free') || msg.includes('busy')) {
    const eventTypes = schedulingState.eventTypes
    const activeTypes = eventTypes.filter((et) => et.isActive)

    let response = `You have ${eventTypes.length} event type(s) (${activeTypes.length} active).`
    if (activeTypes.length > 0) {
      response += `\n\nActive event types and their availability:\n${activeTypes.map((et) => `- ${et.name}: ${et.durationMinutes}min, max ${et.maxBookingsPerDay} bookings/day, ${et.schedulingWindowDays}-day window`).join('\n')}`
    }
    return response
  }

  // Keyword: no-show / noshow / missed
  if (msg.includes('no-show') || msg.includes('noshow') || msg.includes('missed')) {
    const overallRate = schedulingState.getNoShowRate()
    const eventTypes = schedulingState.eventTypes

    const ratesByType = eventTypes
      .map((et) => ({
        name: et.name,
        rate: schedulingState.getNoShowRate(et.id),
        bookings: schedulingState.bookings.filter((b) => b.eventTypeId === et.id).length,
      }))
      .filter((r) => r.bookings > 0)

    let response = `Overall no-show rate: ${overallRate}%.`
    if (ratesByType.length > 0) {
      response += `\n\nBy event type:\n${ratesByType.map((r) => `- ${r.name}: ${r.rate}% (${r.bookings} booking(s))`).join('\n')}`
    }
    return response
  }

  // Keyword: waitlist / wait list / queue
  if (msg.includes('waitlist') || msg.includes('wait list') || msg.includes('queue')) {
    const waitlist = schedulingState.waitlist
    if (waitlist.length === 0) {
      return 'No waitlist entries at the moment. Waitlists are available for event types that have waitlist enabled.'
    }

    const byStatus: Record<string, number> = {}
    for (const w of waitlist) {
      byStatus[w.status] = (byStatus[w.status] ?? 0) + 1
    }
    const statusBreakdown = Object.entries(byStatus)
      .map(([status, count]) => `${status}: ${count}`)
      .join(', ')

    return `You have ${waitlist.length} waitlist entry(ies). Status breakdown: ${statusBreakdown}.`
  }

  // Keyword: event type / meeting type / duration
  if (msg.includes('event type') || msg.includes('meeting type') || msg.includes('duration')) {
    const eventTypes = schedulingState.eventTypes
    if (eventTypes.length === 0) {
      return 'No event types created yet. Create one to start accepting bookings.'
    }

    return `You have ${eventTypes.length} event type(s):\n${eventTypes.map((et) => `- ${et.name}: ${et.durationMinutes}min, ${et.category}, ${et.isActive ? 'active' : 'inactive'}, max ${et.maxBookingsPerDay}/day`).join('\n')}`
  }

  // Keyword: conflict / overlap / double-booked
  if (msg.includes('conflict') || msg.includes('overlap') || msg.includes('double-booked')) {
    const bookings = schedulingState.bookings.filter((b) => b.status !== 'cancelled')

    // Check for overlapping bookings on the same date
    const conflicts: string[] = []
    for (let i = 0; i < bookings.length; i++) {
      for (let j = i + 1; j < bookings.length; j++) {
        const a = bookings[i]!
        const b = bookings[j]!
        if (a.date === b.date && a.startTime < b.endTime && b.startTime < a.endTime) {
          conflicts.push(`${a.date} ${a.startTime}-${a.endTime} overlaps with ${b.startTime}-${b.endTime}`)
        }
      }
    }

    if (conflicts.length === 0) {
      return 'No booking conflicts detected. All bookings have non-overlapping time slots.'
    }
    return `Found ${conflicts.length} potential conflict(s):\n${conflicts.map((c) => `- ${c}`).join('\n')}`
  }

  // Keyword: reschedule / rescheduled
  if (msg.includes('reschedule') || msg.includes('rescheduled')) {
    const rescheduled = schedulingState.bookings.filter((b) => b.status === 'rescheduled')
    if (rescheduled.length === 0) {
      return 'No rescheduled bookings found.'
    }
    return `You have ${rescheduled.length} rescheduled booking(s):\n${rescheduled.map((b) => `- ${b.date} ${b.startTime}-${b.endTime}: ${b.attendees.map((a) => a.name).join(', ')}${b.rescheduleReason ? ` (reason: ${b.rescheduleReason})` : ''}`).join('\n')}`
  }

  // Keyword: cancel / cancelled
  if (msg.includes('cancel') || msg.includes('cancelled')) {
    const cancelled = schedulingState.bookings.filter((b) => b.status === 'cancelled')
    if (cancelled.length === 0) {
      return 'No cancelled bookings found.'
    }
    return `You have ${cancelled.length} cancelled booking(s):\n${cancelled.map((b) => `- ${b.date} ${b.startTime}-${b.endTime}: ${b.attendees.map((a) => a.name).join(', ')}${b.cancelReason ? ` (reason: ${b.cancelReason})` : ''}`).join('\n')}`
  }

  // Keyword: timezone / time zone
  if (msg.includes('timezone') || msg.includes('time zone')) {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
    const bookings = schedulingState.bookings
    const timezones = new Set<string>()
    for (const b of bookings) {
      timezones.add(b.timezone)
      for (const a of b.attendees) {
        timezones.add(a.timezone)
      }
    }
    return `Your timezone: ${tz}. Timezones seen across bookings: ${[...timezones].join(', ') || 'none yet'}.`
  }

  // Keyword: sync / calendar sync / connected
  if (msg.includes('sync') || msg.includes('calendar sync') || msg.includes('connected')) {
    const connections = schedulingState.calendarConnections
    const connectedCalendars = connections.filter((c) => c.connected)
    const disconnected = connections.filter((c) => !c.connected)

    let response = `Calendar sync: ${connections.length} configured, ${connectedCalendars.length} connected.`
    if (connectedCalendars.length > 0) {
      response += `\n\nConnected:\n${connectedCalendars.map((c) => `- ${c.name} (${c.email}): ${c.syncDirection}, last synced ${c.lastSyncedAt ?? 'never'}`).join('\n')}`
    }
    if (disconnected.length > 0) {
      response += `\n\nDisconnected:\n${disconnected.map((c) => `- ${c.name} (${c.email})`).join('\n')}`
    }
    return response
  }

  // Context-aware: if the user is in a specific section
  if (context) {
    const sectionContextMap: Record<string, string> = {
      event_types: 'the Event Types page, where you create and manage meeting types with durations, locations, and availability',
      bookings: 'the Bookings page, where you view and manage upcoming and past bookings',
      calendar_sync: 'the Calendar Sync page, where you connect external calendars like Google, Outlook, and Apple',
      analytics: 'the Analytics page, where you see booking trends, no-show rates, and scheduling patterns',
      no_shows: 'the No-Shows page, where you track and manage missed appointments',
      waitlist: 'the Waitlist page, where you manage waitlist entries for fully-booked event types',
    }
    const sectionDesc = sectionContextMap[context]
    if (sectionDesc) {
      return `You're currently working in ${sectionDesc}. I can help you understand the data here or suggest actions. What would you like to know?`
    }
  }

  // Fallback: generic helpful response
  const bookingCount = schedulingState.bookings.length
  const eventTypeCount = schedulingState.eventTypes.filter((et) => et.isActive).length
  const connectedCount = schedulingState.calendarConnections.filter((c) => c.connected).length

  return `I'm your Scheduling Copilot — here to help manage your calendar and bookings. You currently have ${bookingCount} booking(s), ${eventTypeCount} active event type(s), and ${connectedCount} connected calendar(s). I can help with:\n- Booking summaries and upcoming schedule\n- Availability and event type management\n- No-show tracking and rates\n- Waitlist management\n- Conflict detection\n- Calendar sync status\n- Timezone information\n\nWhat would you like to know?`
}

// ─── Store Interface ────────────────────────────────────────────────

interface SchedulingCopilotState {
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
    type: 'bookings' | 'availability' | 'calendar_health'
    summary: string
    items: string[]
    timestamp: string
  } | null
  analyzeBookings: () => void
  reviewAvailability: () => void
  checkCalendarHealth: () => void
}

// ─── Store ──────────────────────────────────────────────────────────

export const useSchedulingCopilotStore = create<SchedulingCopilotState>()(
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

      // Generate response after a simulated delay (500-1500ms)
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

    analyzeBookings: () => {
      set({ isAnalyzing: true })

      setTimeout(() => {
        const schedulingState = useSchedulingStore.getState()
        const bookings = schedulingState.bookings
        const today = new Date()
        const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

        const items: string[] = []

        // Status breakdown
        const byStatus: Record<string, number> = {}
        for (const b of bookings) {
          byStatus[b.status] = (byStatus[b.status] ?? 0) + 1
        }
        for (const [status, count] of Object.entries(byStatus)) {
          items.push(`${status}: ${count} booking(s)`)
        }

        // Upcoming vs past
        const upcoming = bookings.filter((b) => b.date >= todayStr && b.status !== 'cancelled')
        const past = bookings.filter((b) => b.date < todayStr)
        items.push(`${upcoming.length} upcoming, ${past.length} past`)

        // No-show rate
        const noShowRate = schedulingState.getNoShowRate()
        items.push(`Overall no-show rate: ${noShowRate}%`)

        // Flag high no-show event types
        const eventTypes = schedulingState.eventTypes
        for (const et of eventTypes) {
          const etRate = schedulingState.getNoShowRate(et.id)
          if (etRate > 20) {
            items.push(`High no-show rate for "${et.name}": ${etRate}%`)
            get().addSuggestion({
              type: 'warning',
              title: `High No-Show Rate: ${et.name}`,
              description: `${et.name} has a ${etRate}% no-show rate. Consider sending reminders or requiring deposits.`,
              action: { label: 'View Event Type', route: '/calendar' },
              sectionId: 'bookings',
            })
          }
        }

        // Cancelled bookings warning
        const cancelledCount = byStatus['cancelled'] ?? 0
        if (cancelledCount > 0) {
          get().addSuggestion({
            type: 'tip',
            title: `${cancelledCount} Cancelled Booking(s)`,
            description: `You have ${cancelledCount} cancelled booking(s). Review cancellation reasons to improve retention.`,
            action: { label: 'View Cancelled', route: '/calendar' },
            sectionId: 'bookings',
          })
        }

        const summary =
          bookings.length > 0
            ? `Analyzed ${bookings.length} booking(s): ${upcoming.length} upcoming, ${past.length} past. No-show rate: ${noShowRate}%.`
            : 'No bookings recorded yet. Create event types and share your booking page to get started.'

        set({
          isAnalyzing: false,
          lastAnalysis: {
            type: 'bookings',
            summary,
            items,
            timestamp: new Date().toISOString(),
          },
        })
      }, 800)
    },

    reviewAvailability: () => {
      set({ isAnalyzing: true })

      setTimeout(() => {
        const schedulingState = useSchedulingStore.getState()
        const eventTypes = schedulingState.eventTypes
        const bookings = schedulingState.bookings

        const items: string[] = []

        if (eventTypes.length === 0) {
          set({
            isAnalyzing: false,
            lastAnalysis: {
              type: 'availability',
              summary: 'No event types found. Create your first event type to start accepting bookings.',
              items: ['No event types created yet'],
              timestamp: new Date().toISOString(),
            },
          })
          return
        }

        const activeTypes = eventTypes.filter((et) => et.isActive)
        const inactiveTypes = eventTypes.filter((et) => !et.isActive)

        items.push(`${activeTypes.length} active event type(s), ${inactiveTypes.length} inactive`)

        // Check each active event type's availability
        const today = new Date()
        const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

        for (const et of activeTypes) {
          const etBookings = bookings.filter((b) => b.eventTypeId === et.id && b.date >= todayStr && b.status !== 'cancelled')
          items.push(`${et.name}: ${etBookings.length} upcoming booking(s), max ${et.maxBookingsPerDay}/day, ${et.durationMinutes}min each`)

          // Check if any day is at capacity
          const bookingsByDate: Record<string, number> = {}
          for (const b of etBookings) {
            bookingsByDate[b.date] = (bookingsByDate[b.date] ?? 0) + 1
          }
          for (const [date, count] of Object.entries(bookingsByDate)) {
            if (count >= et.maxBookingsPerDay) {
              items.push(`  Fully booked on ${date} (${count}/${et.maxBookingsPerDay})`)
              get().addSuggestion({
                type: 'warning',
                title: `${et.name}: Fully Booked on ${date}`,
                description: `${et.name} has reached its daily limit of ${et.maxBookingsPerDay} bookings on ${date}.${et.waitlistEnabled ? ' Waitlist is enabled.' : ' Consider enabling waitlist.'}`,
                action: { label: 'View Event Type', route: '/calendar' },
                sectionId: 'availability',
              })
            }
          }
        }

        if (inactiveTypes.length > 0) {
          get().addSuggestion({
            type: 'tip',
            title: `${inactiveTypes.length} Inactive Event Type(s)`,
            description: `You have ${inactiveTypes.length} inactive event type(s): ${inactiveTypes.map((et) => et.name).join(', ')}. Activate them if you want to accept bookings.`,
            sectionId: 'availability',
          })
        }

        const summary = `Reviewed ${eventTypes.length} event type(s): ${activeTypes.length} active with a combined capacity of ${activeTypes.reduce((sum, et) => sum + et.maxBookingsPerDay, 0)} bookings/day.`

        set({
          isAnalyzing: false,
          lastAnalysis: {
            type: 'availability',
            summary,
            items,
            timestamp: new Date().toISOString(),
          },
        })
      }, 800)
    },

    checkCalendarHealth: () => {
      set({ isAnalyzing: true })

      setTimeout(() => {
        const schedulingState = useSchedulingStore.getState()
        const connections = schedulingState.calendarConnections
        const bookings = schedulingState.bookings

        const items: string[] = []

        // Calendar connections
        const connected = connections.filter((c) => c.connected)
        const disconnected = connections.filter((c) => !c.connected)
        items.push(`${connected.length} connected calendar(s), ${disconnected.length} disconnected`)

        for (const conn of connected) {
          items.push(`${conn.name}: ${conn.syncDirection}, last synced ${conn.lastSyncedAt ?? 'never'}`)
        }

        // Flag disconnected calendars
        if (disconnected.length > 0) {
          get().addSuggestion({
            type: 'warning',
            title: `${disconnected.length} Disconnected Calendar(s)`,
            description: `${disconnected.map((c) => c.name).join(', ')} are not connected. Connect them to avoid double-bookings.`,
            action: { label: 'Manage Calendars', route: '/calendar' },
            sectionId: 'calendar_health',
          })
        }

        // Upcoming booking load (next 7 days)
        const today = new Date()
        const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
        const nextWeek = new Date(today)
        nextWeek.setDate(nextWeek.getDate() + 7)
        const nextWeekStr = `${nextWeek.getFullYear()}-${String(nextWeek.getMonth() + 1).padStart(2, '0')}-${String(nextWeek.getDate()).padStart(2, '0')}`

        const next7Days = bookings.filter(
          (b) => b.date >= todayStr && b.date <= nextWeekStr && b.status !== 'cancelled'
        )
        items.push(`${next7Days.length} booking(s) in the next 7 days`)

        // Check for conflicts (overlapping times on same date)
        const activeBookings = bookings.filter((b) => b.status !== 'cancelled')
        const conflicts: string[] = []
        for (let i = 0; i < activeBookings.length; i++) {
          for (let j = i + 1; j < activeBookings.length; j++) {
            const a = activeBookings[i]!
            const b = activeBookings[j]!
            if (a.date === b.date && a.startTime < b.endTime && b.startTime < a.endTime) {
              conflicts.push(`${a.date}: ${a.startTime}-${a.endTime} overlaps with ${b.startTime}-${b.endTime}`)
            }
          }
        }

        if (conflicts.length > 0) {
          items.push(`${conflicts.length} scheduling conflict(s) detected`)
          get().addSuggestion({
            type: 'warning',
            title: `${conflicts.length} Scheduling Conflict(s)`,
            description: `Found overlapping bookings: ${conflicts.slice(0, 3).join('; ')}${conflicts.length > 3 ? ` and ${conflicts.length - 3} more` : ''}.`,
            action: { label: 'View Bookings', route: '/calendar' },
            sectionId: 'calendar_health',
          })
        } else {
          items.push('No scheduling conflicts detected')
        }

        const summary =
          `Calendar health: ${connected.length}/${connections.length} calendar(s) connected, ${next7Days.length} booking(s) next week, ${conflicts.length} conflict(s).`

        set({
          isAnalyzing: false,
          lastAnalysis: {
            type: 'calendar_health',
            summary,
            items,
            timestamp: new Date().toISOString(),
          },
        })
      }, 600)
    },
  })
)
