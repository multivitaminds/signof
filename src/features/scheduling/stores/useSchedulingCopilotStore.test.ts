import { act } from 'react'
import { useSchedulingCopilotStore } from './useSchedulingCopilotStore'

// ─── Mock Scheduling Store ──────────────────────────────────────────

vi.mock('./useSchedulingStore', () => ({
  useSchedulingStore: {
    getState: () => ({
      eventTypes: [
        {
          id: 'et-1', name: '30-Minute Meeting', description: 'Quick sync', slug: '30-min',
          category: 'one_on_one', color: '#4F46E5', durationMinutes: 30,
          bufferBeforeMinutes: 0, bufferAfterMinutes: 5, maxBookingsPerDay: 8,
          minimumNoticeMinutes: 60, schedulingWindowDays: 30, location: 'zoom',
          schedule: {}, dateOverrides: [], customQuestions: [], maxAttendees: 1,
          waitlistEnabled: false, maxWaitlist: 0, isActive: true,
          createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z',
        },
        {
          id: 'et-2', name: 'Team Standup', description: 'Daily standup', slug: 'standup',
          category: 'group', color: '#059669', durationMinutes: 15,
          bufferBeforeMinutes: 0, bufferAfterMinutes: 0, maxBookingsPerDay: 1,
          minimumNoticeMinutes: 30, schedulingWindowDays: 14, location: 'google_meet',
          schedule: {}, dateOverrides: [], customQuestions: [], maxAttendees: 10,
          waitlistEnabled: true, maxWaitlist: 5, isActive: true,
          createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z',
        },
        {
          id: 'et-3', name: 'Workshop', description: 'Inactive workshop', slug: 'workshop',
          category: 'group', color: '#DC2626', durationMinutes: 60,
          bufferBeforeMinutes: 10, bufferAfterMinutes: 10, maxBookingsPerDay: 2,
          minimumNoticeMinutes: 120, schedulingWindowDays: 60, location: 'in_person',
          schedule: {}, dateOverrides: [], customQuestions: [], maxAttendees: 20,
          waitlistEnabled: false, maxWaitlist: 0, isActive: false,
          createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z',
        },
      ],
      bookings: [
        {
          id: 'b-1', eventTypeId: 'et-1', date: '2026-02-20', startTime: '10:00', endTime: '10:30',
          timezone: 'America/New_York', status: 'confirmed',
          attendees: [{ name: 'Alice Smith', email: 'alice@example.com', timezone: 'America/New_York' }],
          notes: '', createdAt: '2026-02-10T00:00:00Z', updatedAt: '2026-02-10T00:00:00Z',
        },
        {
          id: 'b-2', eventTypeId: 'et-1', date: '2026-02-20', startTime: '14:00', endTime: '14:30',
          timezone: 'America/New_York', status: 'confirmed',
          attendees: [{ name: 'Bob Jones', email: 'bob@example.com', timezone: 'America/Chicago' }],
          notes: '', createdAt: '2026-02-10T00:00:00Z', updatedAt: '2026-02-10T00:00:00Z',
        },
        {
          id: 'b-3', eventTypeId: 'et-2', date: '2026-01-15', startTime: '09:00', endTime: '09:15',
          timezone: 'America/New_York', status: 'no_show',
          attendees: [{ name: 'Charlie Brown', email: 'charlie@example.com', timezone: 'America/New_York' }],
          notes: '', createdAt: '2026-01-10T00:00:00Z', updatedAt: '2026-01-15T00:00:00Z',
        },
        {
          id: 'b-4', eventTypeId: 'et-1', date: '2026-01-10', startTime: '11:00', endTime: '11:30',
          timezone: 'America/New_York', status: 'cancelled', cancelReason: 'Schedule conflict',
          attendees: [{ name: 'Diana Prince', email: 'diana@example.com', timezone: 'Europe/London' }],
          notes: '', createdAt: '2026-01-05T00:00:00Z', updatedAt: '2026-01-10T00:00:00Z',
        },
      ],
      calendarConnections: [
        {
          id: 'cal-google', provider: 'google', name: 'Google Calendar', email: 'user@gmail.com',
          syncDirection: 'two_way', checkConflicts: true, connected: true,
          lastSyncedAt: '2026-02-10T08:30:00Z',
        },
        {
          id: 'cal-outlook', provider: 'outlook', name: 'Outlook Calendar', email: 'user@outlook.com',
          syncDirection: 'one_way', checkConflicts: false, connected: false,
          lastSyncedAt: null,
        },
      ],
      waitlist: [
        { id: 'w-1', eventTypeId: 'et-2', date: '2026-02-20', timeSlot: '09:00', name: 'Eve Green', email: 'eve@example.com', status: 'waiting', createdAt: '2026-02-15T00:00:00Z' },
        { id: 'w-2', eventTypeId: 'et-2', date: '2026-02-21', timeSlot: '09:00', name: 'Frank White', email: 'frank@example.com', status: 'notified', createdAt: '2026-02-15T00:00:00Z' },
      ],
      getNoShowRate: (eventTypeId?: string) => {
        if (eventTypeId === 'et-2') return 100
        if (eventTypeId === 'et-1') return 0
        return 25
      },
      getFilteredBookings: () => [],
    }),
  },
}))

// ─── Store Reset ────────────────────────────────────────────────────

function resetStore() {
  useSchedulingCopilotStore.setState({
    isOpen: false,
    messages: [],
    isTyping: false,
    suggestions: [],
    isAnalyzing: false,
    lastAnalysis: null,
  })
}

// ─── Tests ──────────────────────────────────────────────────────────

describe('useSchedulingCopilotStore', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    resetStore()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('Initial state', () => {
    it('starts with panel closed, no messages, and no suggestions', () => {
      const state = useSchedulingCopilotStore.getState()
      expect(state.isOpen).toBe(false)
      expect(state.messages).toHaveLength(0)
      expect(state.suggestions).toHaveLength(0)
      expect(state.isTyping).toBe(false)
      expect(state.isAnalyzing).toBe(false)
      expect(state.lastAnalysis).toBeNull()
    })
  })

  describe('Panel controls', () => {
    it('openPanel sets isOpen to true', () => {
      act(() => {
        useSchedulingCopilotStore.getState().openPanel()
      })
      expect(useSchedulingCopilotStore.getState().isOpen).toBe(true)
    })

    it('closePanel sets isOpen to false', () => {
      useSchedulingCopilotStore.setState({ isOpen: true })
      act(() => {
        useSchedulingCopilotStore.getState().closePanel()
      })
      expect(useSchedulingCopilotStore.getState().isOpen).toBe(false)
    })

    it('togglePanel flips isOpen', () => {
      expect(useSchedulingCopilotStore.getState().isOpen).toBe(false)

      act(() => {
        useSchedulingCopilotStore.getState().togglePanel()
      })
      expect(useSchedulingCopilotStore.getState().isOpen).toBe(true)

      act(() => {
        useSchedulingCopilotStore.getState().togglePanel()
      })
      expect(useSchedulingCopilotStore.getState().isOpen).toBe(false)
    })
  })

  describe('sendMessage', () => {
    it('adds user message and generates assistant response after delay', () => {
      act(() => {
        useSchedulingCopilotStore.getState().sendMessage('Show me my bookings')
      })

      const stateAfterSend = useSchedulingCopilotStore.getState()
      expect(stateAfterSend.messages).toHaveLength(1)
      expect(stateAfterSend.messages[0]!.role).toBe('user')
      expect(stateAfterSend.messages[0]!.content).toBe('Show me my bookings')
      expect(stateAfterSend.isTyping).toBe(true)

      // Advance past max delay (1500ms)
      act(() => {
        vi.advanceTimersByTime(1600)
      })

      const stateAfterResponse = useSchedulingCopilotStore.getState()
      expect(stateAfterResponse.messages).toHaveLength(2)
      expect(stateAfterResponse.messages[1]!.role).toBe('assistant')
      expect(stateAfterResponse.isTyping).toBe(false)
      // Should contain booking-related content
      expect(stateAfterResponse.messages[1]!.content).toContain('booking')
    })

    it('includes context in the user message when provided', () => {
      act(() => {
        useSchedulingCopilotStore.getState().sendMessage('Help me here', 'event_types')
      })

      expect(useSchedulingCopilotStore.getState().messages[0]!.context).toBe('event_types')
    })

    it('generates keyword-aware responses for availability', () => {
      act(() => {
        useSchedulingCopilotStore.getState().sendMessage('What is my availability?')
      })

      act(() => {
        vi.advanceTimersByTime(1600)
      })

      const response = useSchedulingCopilotStore.getState().messages[1]!.content
      expect(response).toContain('event type')
    })

    it('generates keyword-aware responses for no-shows', () => {
      act(() => {
        useSchedulingCopilotStore.getState().sendMessage('Show me no-show stats')
      })

      act(() => {
        vi.advanceTimersByTime(1600)
      })

      const response = useSchedulingCopilotStore.getState().messages[1]!.content
      expect(response).toContain('no-show rate')
    })

    it('generates keyword-aware responses for calendar sync', () => {
      act(() => {
        useSchedulingCopilotStore.getState().sendMessage('Is my calendar synced?')
      })

      act(() => {
        vi.advanceTimersByTime(1600)
      })

      const response = useSchedulingCopilotStore.getState().messages[1]!.content
      expect(response).toContain('Calendar sync')
    })
  })

  describe('clearMessages', () => {
    it('empties the messages array and resets isTyping', () => {
      useSchedulingCopilotStore.setState({
        messages: [
          { id: '1', role: 'user', content: 'Hello', timestamp: '2026-01-01T00:00:00Z' },
          { id: '2', role: 'assistant', content: 'Hi!', timestamp: '2026-01-01T00:00:01Z' },
        ],
        isTyping: true,
      })

      act(() => {
        useSchedulingCopilotStore.getState().clearMessages()
      })

      const state = useSchedulingCopilotStore.getState()
      expect(state.messages).toHaveLength(0)
      expect(state.isTyping).toBe(false)
    })
  })

  describe('addSuggestion', () => {
    it('adds a suggestion with generated id and dismissed=false', () => {
      act(() => {
        useSchedulingCopilotStore.getState().addSuggestion({
          type: 'tip',
          title: 'Test Tip',
          description: 'A helpful tip',
          sectionId: 'bookings',
        })
      })

      const suggestions = useSchedulingCopilotStore.getState().suggestions
      expect(suggestions).toHaveLength(1)
      expect(suggestions[0]!.type).toBe('tip')
      expect(suggestions[0]!.title).toBe('Test Tip')
      expect(suggestions[0]!.dismissed).toBe(false)
      expect(suggestions[0]!.id).toBeTruthy()
    })
  })

  describe('dismissSuggestion', () => {
    it('marks the specified suggestion as dismissed', () => {
      useSchedulingCopilotStore.setState({
        suggestions: [
          { id: 'sug1', type: 'tip', title: 'Tip', description: 'A tip', dismissed: false },
          { id: 'sug2', type: 'warning', title: 'Warning', description: 'A warning', dismissed: false },
        ],
      })

      act(() => {
        useSchedulingCopilotStore.getState().dismissSuggestion('sug1')
      })

      const suggestions = useSchedulingCopilotStore.getState().suggestions
      expect(suggestions[0]!.dismissed).toBe(true)
      expect(suggestions[1]!.dismissed).toBe(false)
    })
  })

  describe('getSuggestionsForSection', () => {
    it('returns only non-dismissed suggestions for the specified section', () => {
      useSchedulingCopilotStore.setState({
        suggestions: [
          { id: 's1', type: 'tip', title: 'Tip 1', description: 'Booking tip', dismissed: false, sectionId: 'bookings' },
          { id: 's2', type: 'warning', title: 'Warning 1', description: 'Dismissed', dismissed: true, sectionId: 'bookings' },
          { id: 's3', type: 'review', title: 'Review 1', description: 'Availability review', dismissed: false, sectionId: 'availability' },
          { id: 's4', type: 'tip', title: 'Tip 2', description: 'Another booking tip', dismissed: false, sectionId: 'bookings' },
        ],
      })

      const bookingSuggestions = useSchedulingCopilotStore.getState().getSuggestionsForSection('bookings')
      expect(bookingSuggestions).toHaveLength(2)
      expect(bookingSuggestions[0]!.id).toBe('s1')
      expect(bookingSuggestions[1]!.id).toBe('s4')

      const availabilitySuggestions = useSchedulingCopilotStore.getState().getSuggestionsForSection('availability')
      expect(availabilitySuggestions).toHaveLength(1)
      expect(availabilitySuggestions[0]!.id).toBe('s3')

      const emptySuggestions = useSchedulingCopilotStore.getState().getSuggestionsForSection('calendar_health')
      expect(emptySuggestions).toHaveLength(0)
    })
  })

  describe('analyzeBookings', () => {
    it('produces lastAnalysis with bookings type after delay', () => {
      act(() => {
        useSchedulingCopilotStore.getState().analyzeBookings()
      })

      expect(useSchedulingCopilotStore.getState().isAnalyzing).toBe(true)
      expect(useSchedulingCopilotStore.getState().lastAnalysis).toBeNull()

      act(() => {
        vi.advanceTimersByTime(900)
      })

      const state = useSchedulingCopilotStore.getState()
      expect(state.isAnalyzing).toBe(false)
      expect(state.lastAnalysis).not.toBeNull()
      expect(state.lastAnalysis!.type).toBe('bookings')
      expect(state.lastAnalysis!.summary).toContain('4 booking(s)')
      expect(state.lastAnalysis!.items.length).toBeGreaterThan(0)
      expect(state.lastAnalysis!.timestamp).toBeTruthy()
    })
  })

  describe('reviewAvailability', () => {
    it('produces lastAnalysis with availability type after delay', () => {
      act(() => {
        useSchedulingCopilotStore.getState().reviewAvailability()
      })

      expect(useSchedulingCopilotStore.getState().isAnalyzing).toBe(true)

      act(() => {
        vi.advanceTimersByTime(900)
      })

      const state = useSchedulingCopilotStore.getState()
      expect(state.isAnalyzing).toBe(false)
      expect(state.lastAnalysis).not.toBeNull()
      expect(state.lastAnalysis!.type).toBe('availability')
      expect(state.lastAnalysis!.summary).toBeTruthy()
      expect(state.lastAnalysis!.items.length).toBeGreaterThan(0)
    })
  })

  describe('checkCalendarHealth', () => {
    it('produces lastAnalysis with calendar_health type after delay', () => {
      act(() => {
        useSchedulingCopilotStore.getState().checkCalendarHealth()
      })

      expect(useSchedulingCopilotStore.getState().isAnalyzing).toBe(true)

      act(() => {
        vi.advanceTimersByTime(700)
      })

      const state = useSchedulingCopilotStore.getState()
      expect(state.isAnalyzing).toBe(false)
      expect(state.lastAnalysis).not.toBeNull()
      expect(state.lastAnalysis!.type).toBe('calendar_health')
      expect(state.lastAnalysis!.summary).toBeTruthy()
      expect(state.lastAnalysis!.items.length).toBeGreaterThan(0)
    })

    it('detects disconnected calendars', () => {
      act(() => {
        useSchedulingCopilotStore.getState().checkCalendarHealth()
      })

      act(() => {
        vi.advanceTimersByTime(700)
      })

      const suggestions = useSchedulingCopilotStore.getState().suggestions
      const disconnectedWarning = suggestions.find((s) => s.title.includes('Disconnected'))
      expect(disconnectedWarning).toBeTruthy()
    })
  })

  describe('clearSuggestions', () => {
    it('removes all suggestions', () => {
      useSchedulingCopilotStore.setState({
        suggestions: [
          { id: 's1', type: 'tip', title: 'Tip', description: 'A tip', dismissed: false },
          { id: 's2', type: 'warning', title: 'Warning', description: 'A warning', dismissed: false },
        ],
      })

      act(() => {
        useSchedulingCopilotStore.getState().clearSuggestions()
      })

      expect(useSchedulingCopilotStore.getState().suggestions).toHaveLength(0)
    })
  })
})
