import { useCallback } from 'react'
import { useActivityStore } from '../stores/useActivityStore'
import type { ActivityType, ActivityAction } from '../types'

/* ------------------------------------------------------------------ */
/*  Hook: useActivityTracker                                           */
/*  Provides convenience methods for logging activities to the store.  */
/* ------------------------------------------------------------------ */

interface TrackActivityParams {
  type: ActivityType
  action: ActivityAction
  entityId: string
  entityTitle: string
  entityPath: string
  description?: string
  icon?: string
  userName?: string
}

export function useActivityTracker() {
  const addActivity = useActivityStore((s) => s.addActivity)

  /* ---- Core tracker ------------------------------------------------*/

  const trackActivity = useCallback(
    ({
      type,
      action,
      entityId,
      entityTitle,
      entityPath,
      description,
      icon = '',
      userName = 'You',
    }: TrackActivityParams) => {
      addActivity({
        type,
        action,
        title: entityTitle,
        description: description ?? `${userName} ${action} "${entityTitle}"`,
        entityId,
        entityPath,
        timestamp: new Date().toISOString(),
        userId: 'u-you',
        userName,
        icon,
      })
    },
    [addActivity],
  )

  /* ---- Helpers for common activity patterns -------------------------*/

  const trackPageCreated = useCallback(
    (entityId: string, title: string, path?: string) => {
      trackActivity({
        type: 'page' as ActivityType,
        action: 'created' as ActivityAction,
        entityId,
        entityTitle: title,
        entityPath: path ?? `/pages/${entityId}`,
        icon: '\uD83D\uDDD2\uFE0F',
      })
    },
    [trackActivity],
  )

  const trackPageUpdated = useCallback(
    (entityId: string, title: string, path?: string) => {
      trackActivity({
        type: 'page' as ActivityType,
        action: 'updated' as ActivityAction,
        entityId,
        entityTitle: title,
        entityPath: path ?? `/pages/${entityId}`,
        icon: '\uD83D\uDCC4',
      })
    },
    [trackActivity],
  )

  const trackDocumentCreated = useCallback(
    (entityId: string, title: string) => {
      trackActivity({
        type: 'document' as ActivityType,
        action: 'created' as ActivityAction,
        entityId,
        entityTitle: title,
        entityPath: `/documents/${entityId}`,
        icon: '\uD83D\uDCC1',
      })
    },
    [trackActivity],
  )

  const trackDocumentSigned = useCallback(
    (entityId: string, title: string, signerName?: string) => {
      trackActivity({
        type: 'document' as ActivityType,
        action: 'signed' as ActivityAction,
        entityId,
        entityTitle: `${title} signed`,
        entityPath: `/documents/${entityId}`,
        description: signerName
          ? `${signerName} signed "${title}"`
          : `You signed "${title}"`,
        icon: '\u270D\uFE0F',
        userName: signerName,
      })
    },
    [trackActivity],
  )

  const trackDocumentSent = useCallback(
    (entityId: string, title: string) => {
      trackActivity({
        type: 'document' as ActivityType,
        action: 'sent' as ActivityAction,
        entityId,
        entityTitle: `${title} sent for signature`,
        entityPath: `/documents/${entityId}`,
        icon: '\uD83D\uDCE8',
      })
    },
    [trackActivity],
  )

  const trackDocumentCompleted = useCallback(
    (entityId: string, title: string) => {
      trackActivity({
        type: 'document' as ActivityType,
        action: 'completed' as ActivityAction,
        entityId,
        entityTitle: `${title} completed`,
        entityPath: `/documents/${entityId}`,
        description: `All parties have signed "${title}"`,
        icon: '\u2705',
        userName: 'System',
      })
    },
    [trackActivity],
  )

  const trackIssueCreated = useCallback(
    (entityId: string, title: string) => {
      trackActivity({
        type: 'issue' as ActivityType,
        action: 'created' as ActivityAction,
        entityId,
        entityTitle: title,
        entityPath: '/projects',
        icon: '\uD83D\uDEA8',
      })
    },
    [trackActivity],
  )

  const trackIssueStatusChanged = useCallback(
    (entityId: string, title: string, newStatus: string) => {
      trackActivity({
        type: 'issue' as ActivityType,
        action: 'updated' as ActivityAction,
        entityId,
        entityTitle: title,
        entityPath: '/projects',
        description: `Status changed to "${newStatus}" on "${title}"`,
        icon: '\u26A1',
      })
    },
    [trackActivity],
  )

  const trackIssueAssigned = useCallback(
    (entityId: string, title: string, assigneeName: string) => {
      trackActivity({
        type: 'issue' as ActivityType,
        action: 'assigned' as ActivityAction,
        entityId,
        entityTitle: `${title} assigned`,
        entityPath: '/projects',
        description: `"${title}" was assigned to ${assigneeName}`,
        icon: '\uD83D\uDC64',
      })
    },
    [trackActivity],
  )

  const trackBookingCreated = useCallback(
    (entityId: string, title: string) => {
      trackActivity({
        type: 'booking' as ActivityType,
        action: 'created' as ActivityAction,
        entityId,
        entityTitle: title,
        entityPath: '/calendar/bookings',
        icon: '\uD83D\uDCC5',
      })
    },
    [trackActivity],
  )

  const trackBookingCompleted = useCallback(
    (entityId: string, title: string) => {
      trackActivity({
        type: 'booking' as ActivityType,
        action: 'completed' as ActivityAction,
        entityId,
        entityTitle: `${title} completed`,
        entityPath: '/calendar/bookings',
        icon: '\uD83D\uDCDE',
      })
    },
    [trackActivity],
  )

  return {
    trackActivity,
    trackPageCreated,
    trackPageUpdated,
    trackDocumentCreated,
    trackDocumentSigned,
    trackDocumentSent,
    trackDocumentCompleted,
    trackIssueCreated,
    trackIssueStatusChanged,
    trackIssueAssigned,
    trackBookingCreated,
    trackBookingCompleted,
  }
}
