import { useEffect, useRef, useCallback } from 'react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useMemoryStore } from '../stores/useMemoryStore'
import { MemoryCategory, MemoryScope } from '../types'

// ─── Auto-capture settings store ───────────────────────────────────────

export interface AutoCaptureState {
  enabled: boolean
  capturedIds: string[]
  toggleEnabled: () => void
  setEnabled: (enabled: boolean) => void
  addCapturedId: (id: string) => void
}

export const useAutoCaptureStore = create<AutoCaptureState>()(
  persist(
    (set) => ({
      enabled: true,
      capturedIds: [],

      toggleEnabled: () => set((s) => ({ enabled: !s.enabled })),
      setEnabled: (enabled) => set({ enabled }),
      addCapturedId: (id) => set((s) => ({
        capturedIds: [...s.capturedIds, id],
      })),
    }),
    {
      name: 'origina-auto-capture',
      partialize: (s) => ({ enabled: s.enabled }),
    }
  )
)

// ─── Category mapping ──────────────────────────────────────────────────

const ACTION_CATEGORY_MAP: Record<string, MemoryCategory> = {
  document: MemoryCategory.Workflows,
  project: MemoryCategory.Decisions,
  booking: MemoryCategory.People,
  page: MemoryCategory.Projects,
}

// ─── Auto-capture event types ──────────────────────────────────────────

export interface AutoCaptureEvent {
  type: 'document_created' | 'issue_completed' | 'booking_made' | 'page_created'
  title: string
  detail: string
  category: MemoryCategory
}

// ─── Hook ──────────────────────────────────────────────────────────────

export function useAutoCapture() {
  const enabled = useAutoCaptureStore((s) => s.enabled)
  const addCapturedId = useAutoCaptureStore((s) => s.addCapturedId)
  const addEntry = useMemoryStore((s) => s.addEntry)
  const queueRef = useRef<AutoCaptureEvent[]>([])

  const captureEvent = useCallback((event: AutoCaptureEvent) => {
    if (!enabled) return
    queueRef.current.push(event)
  }, [enabled])

  // Process queued events
  useEffect(() => {
    if (!enabled) return

    const interval = setInterval(() => {
      const events = queueRef.current.splice(0)
      for (const event of events) {
        const tags = ['auto-captured', event.type.replace('_', '-')]
        addEntry(
          event.title,
          `[Auto-captured] ${event.detail}`,
          event.category,
          tags,
          MemoryScope.Workspace,
        ).then((entry) => {
          if (entry) {
            addCapturedId(entry.id)
          }
        })
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [enabled, addEntry, addCapturedId])

  const captureDocumentCreated = useCallback((name: string) => {
    captureEvent({
      type: 'document_created',
      title: `Created document: ${name}`,
      detail: `Document "${name}" was created and added to the workspace.`,
      category: ACTION_CATEGORY_MAP['document']!,
    })
  }, [captureEvent])

  const captureIssueCompleted = useCallback((issueTitle: string, projectName: string) => {
    captureEvent({
      type: 'issue_completed',
      title: `Completed: ${issueTitle}`,
      detail: `Issue "${issueTitle}" was completed in project "${projectName}".`,
      category: ACTION_CATEGORY_MAP['project']!,
    })
  }, [captureEvent])

  const captureBookingMade = useCallback((eventName: string, date: string) => {
    captureEvent({
      type: 'booking_made',
      title: `Scheduled: ${eventName}`,
      detail: `Booking "${eventName}" was scheduled for ${date}.`,
      category: ACTION_CATEGORY_MAP['booking']!,
    })
  }, [captureEvent])

  const capturePageCreated = useCallback((pageName: string) => {
    captureEvent({
      type: 'page_created',
      title: `Created page: ${pageName}`,
      detail: `Page "${pageName}" was created in the workspace.`,
      category: ACTION_CATEGORY_MAP['page']!,
    })
  }, [captureEvent])

  return {
    enabled,
    captureDocumentCreated,
    captureIssueCompleted,
    captureBookingMade,
    capturePageCreated,
    captureEvent,
  }
}

// ─── Utility: check if a memory entry was auto-captured ────────────────

export function isAutoCaptured(tags: string[]): boolean {
  return tags.includes('auto-captured')
}
