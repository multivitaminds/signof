import { useEffect, useRef } from 'react'
import { useInboxStore } from '../stores/useInboxStore'
import { NotificationType } from '../types'

interface SimulatedNotification {
  type: NotificationType
  title: string
  message: string
  actionUrl: string
  actionLabel: string
  actorName: string
  link: string
  sourceId: string
}

const SIMULATED_NOTIFICATIONS: SimulatedNotification[] = [
  {
    type: NotificationType.DocumentSigned,
    title: 'Document signed',
    message: 'Alex Johnson signed "Q4 Partnership Agreement"',
    actionUrl: '/documents',
    actionLabel: 'View Document',
    actorName: 'Alex Johnson',
    link: '/documents',
    sourceId: 'doc-q4-partnership',
  },
  {
    type: NotificationType.Booking,
    title: 'New booking received',
    message: 'Maria Garcia booked a "Product Demo" session for next week',
    actionUrl: '/scheduling',
    actionLabel: 'View Booking',
    actorName: 'Maria Garcia',
    link: '/scheduling',
    sourceId: 'booking-demo',
  },
  {
    type: NotificationType.StatusChange,
    title: 'Issue status changed',
    message: '"Design Review" moved from In Progress to Review',
    actionUrl: '/projects',
    actionLabel: 'View Issue',
    actorName: 'Mike Rivera',
    link: '/projects',
    sourceId: 'issue-design-review',
  },
  {
    type: NotificationType.Comment,
    title: 'New comment',
    message: 'Sarah Chen commented on "Sprint Retro Notes"',
    actionUrl: '/pages',
    actionLabel: 'View Comment',
    actorName: 'Sarah Chen',
    link: '/pages',
    sourceId: 'page-sprint-retro',
  },
  {
    type: NotificationType.TeamJoined,
    title: 'Team member joined',
    message: 'Jordan Lee joined the Engineering team',
    actionUrl: '/settings/members',
    actionLabel: 'View Team',
    actorName: 'Jordan Lee',
    link: '/settings/members',
    sourceId: 'team-engineering',
  },
  {
    type: NotificationType.SignatureRequest,
    title: 'Signature requested',
    message: 'Lisa Park sent you "Vendor Agreement" for signing',
    actionUrl: '/documents',
    actionLabel: 'Sign Now',
    actorName: 'Lisa Park',
    link: '/documents',
    sourceId: 'doc-vendor-agreement',
  },
  {
    type: NotificationType.Reminder,
    title: 'Meeting starting soon',
    message: 'Your "Design Sync" meeting starts in 15 minutes',
    actionUrl: '/scheduling',
    actionLabel: 'View Booking',
    actorName: '',
    link: '/scheduling',
    sourceId: 'meeting-design-sync',
  },
  {
    type: NotificationType.Assignment,
    title: 'Task assigned',
    message: 'Emma Davis assigned you "Fix mobile nav layout"',
    actionUrl: '/projects',
    actionLabel: 'View Issue',
    actorName: 'Emma Davis',
    link: '/projects',
    sourceId: 'issue-mobile-nav',
  },
]

function getRandomInterval(): number {
  // Between 30 and 90 seconds
  return (30 + Math.random() * 60) * 1000
}

export default function useNotificationSimulator(): void {
  const simulatorEnabled = useInboxStore((s) => s.simulatorEnabled)
  const addNotification = useInboxStore((s) => s.addNotification)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const addNotificationRef = useRef(addNotification)

  useEffect(() => {
    addNotificationRef.current = addNotification
  }, [addNotification])

  useEffect(() => {
    if (!simulatorEnabled) return

    function generateNotification() {
      const idx = Math.floor(Math.random() * SIMULATED_NOTIFICATIONS.length)
      const template = SIMULATED_NOTIFICATIONS[idx]
      if (!template) return

      addNotificationRef.current(template.type, template.title, template.message, {
        actionUrl: template.actionUrl,
        actionLabel: template.actionLabel,
        actorName: template.actorName || undefined,
        link: template.link,
        sourceId: template.sourceId,
      })
    }

    function scheduleNext() {
      timerRef.current = setTimeout(() => {
        generateNotification()
        scheduleNext()
      }, getRandomInterval())
    }

    scheduleNext()

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
    }
  }, [simulatorEnabled])
}
