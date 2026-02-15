import { create } from 'zustand'
import type { WebhookEvent, WebhookEventType } from '../types'

// ─── ID Generator ───────────────────────────────────────────────────

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

// ─── Store Interface ────────────────────────────────────────────────

interface TaxWebhookState {
  events: WebhookEvent[]

  addEvent: (submissionId: string, eventType: WebhookEventType, payload?: Record<string, unknown>) => void
  getEventsForSubmission: (submissionId: string) => WebhookEvent[]
  getLatestEvent: (submissionId: string) => WebhookEvent | undefined
  clearEvents: () => void
  clearEventsForSubmission: (submissionId: string) => void
}

// ─── Store ──────────────────────────────────────────────────────────

export const useTaxWebhookStore = create<TaxWebhookState>()(
  (set, get) => ({
    events: [],

    addEvent: (submissionId, eventType, payload) =>
      set((state) => ({
        events: [
          ...state.events,
          {
            id: generateId(),
            submissionId,
            eventType,
            payload: payload ?? {},
            receivedAt: new Date().toISOString(),
          },
        ],
      })),

    getEventsForSubmission: (submissionId) =>
      get().events.filter((e) => e.submissionId === submissionId),

    getLatestEvent: (submissionId) => {
      const events = get().events.filter((e) => e.submissionId === submissionId)
      return events.length > 0 ? events[events.length - 1] : undefined
    },

    clearEvents: () => set({ events: [] }),

    clearEventsForSubmission: (submissionId) =>
      set((state) => ({
        events: state.events.filter((e) => e.submissionId !== submissionId),
      })),
  })
)
