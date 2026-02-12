import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Activity, ActivityType } from '../types'

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

// ─── Sample Activities ─────────────────────────────────────────────

function hoursAgo(h: number): string {
  return new Date(Date.now() - h * 3600000).toISOString()
}

function daysAgo(d: number): string {
  return new Date(Date.now() - d * 86400000).toISOString()
}

const SAMPLE_ACTIVITIES: Activity[] = [
  {
    id: 'act-01',
    type: 'document',
    action: 'signed',
    title: 'Employment Agreement signed',
    description: 'Jane Smith signed the Employment Agreement',
    entityId: '1',
    entityPath: '/documents/1',
    timestamp: hoursAgo(0.5),
    userId: 'u-jane',
    userName: 'Jane Smith',
    icon: '\u270D\uFE0F',
  },
  {
    id: 'act-02',
    type: 'page',
    action: 'updated',
    title: 'Product Roadmap Q1 updated',
    description: 'Alex Chen edited the Product Roadmap Q1 page',
    entityId: 'p-roadmap',
    entityPath: '/pages/p-roadmap',
    timestamp: hoursAgo(1),
    userId: 'u-alex',
    userName: 'Alex Chen',
    icon: '\uD83D\uDCC4',
  },
  {
    id: 'act-03',
    type: 'issue',
    action: 'created',
    title: 'Fix login redirect loop',
    description: 'Sam Wilson created issue SIG-142: Fix login redirect loop',
    entityId: 'i-142',
    entityPath: '/projects',
    timestamp: hoursAgo(1.5),
    userId: 'u-sam',
    userName: 'Sam Wilson',
    icon: '\uD83D\uDEA8',
  },
  {
    id: 'act-04',
    type: 'booking',
    action: 'completed',
    title: 'Team standup confirmed',
    description: 'Daily standup with engineering team was confirmed',
    entityId: 'b-standup',
    entityPath: '/calendar/bookings',
    timestamp: hoursAgo(2),
    userId: 'u-maria',
    userName: 'Maria Garcia',
    icon: '\uD83D\uDCC5',
  },
  {
    id: 'act-05',
    type: 'document',
    action: 'sent',
    title: 'NDA sent for signature',
    description: 'NDA - Project Phoenix was sent to Alice Johnson',
    entityId: '2',
    entityPath: '/documents/2',
    timestamp: hoursAgo(3),
    userId: 'u-you',
    userName: 'You',
    icon: '\uD83D\uDCE8',
  },
  {
    id: 'act-06',
    type: 'page',
    action: 'created',
    title: 'Meeting Notes - Sprint Review',
    description: 'Alex Chen created a new page: Meeting Notes - Sprint Review',
    entityId: 'p-sprint',
    entityPath: '/pages/p-sprint',
    timestamp: hoursAgo(4),
    userId: 'u-alex',
    userName: 'Alex Chen',
    icon: '\uD83D\uDDD2\uFE0F',
  },
  {
    id: 'act-07',
    type: 'issue',
    action: 'assigned',
    title: 'Dashboard redesign assigned',
    description: 'Dashboard redesign was assigned to Maria Garcia',
    entityId: 'i-138',
    entityPath: '/projects',
    timestamp: hoursAgo(5),
    userId: 'u-sam',
    userName: 'Sam Wilson',
    icon: '\uD83D\uDC64',
  },
  {
    id: 'act-08',
    type: 'database',
    action: 'created',
    title: 'Customer Tracker database created',
    description: 'You created the Customer Tracker database',
    entityId: 'db-customers',
    entityPath: '/data',
    timestamp: hoursAgo(6),
    userId: 'u-you',
    userName: 'You',
    icon: '\uD83D\uDDC4\uFE0F',
  },
  {
    id: 'act-09',
    type: 'document',
    action: 'completed',
    title: 'Vendor Agreement completed',
    description: 'All parties have signed the Vendor Agreement',
    entityId: 'd-vendor',
    entityPath: '/documents/d-vendor',
    timestamp: hoursAgo(8),
    userId: 'u-system',
    userName: 'System',
    icon: '\u2705',
  },
  {
    id: 'act-10',
    type: 'team',
    action: 'created',
    title: 'Engineering team created',
    description: 'You created the Engineering team workspace',
    entityId: 't-eng',
    entityPath: '/settings/teams',
    timestamp: hoursAgo(10),
    userId: 'u-you',
    userName: 'You',
    icon: '\uD83D\uDC65',
  },
  {
    id: 'act-11',
    type: 'issue',
    action: 'completed',
    title: 'API rate limiting implemented',
    description: 'Sam Wilson marked SIG-127 as done',
    entityId: 'i-127',
    entityPath: '/projects',
    timestamp: hoursAgo(12),
    userId: 'u-sam',
    userName: 'Sam Wilson',
    icon: '\uD83C\uDF89',
  },
  {
    id: 'act-12',
    type: 'booking',
    action: 'created',
    title: 'Design review scheduled',
    description: 'Maria Garcia booked a design review for Friday',
    entityId: 'b-design',
    entityPath: '/calendar/bookings',
    timestamp: daysAgo(1),
    userId: 'u-maria',
    userName: 'Maria Garcia',
    icon: '\uD83C\uDFA8',
  },
  {
    id: 'act-13',
    type: 'page',
    action: 'commented',
    title: 'Comment on API Documentation',
    description: 'Sam Wilson left a comment on API Documentation',
    entityId: 'p-api',
    entityPath: '/pages/p-api',
    timestamp: daysAgo(1),
    userId: 'u-sam',
    userName: 'Sam Wilson',
    icon: '\uD83D\uDCAC',
  },
  {
    id: 'act-14',
    type: 'document',
    action: 'created',
    title: 'Contractor Invoice #1042 uploaded',
    description: 'You uploaded Contractor Invoice #1042',
    entityId: '3',
    entityPath: '/documents/3',
    timestamp: daysAgo(2),
    userId: 'u-you',
    userName: 'You',
    icon: '\uD83D\uDCC1',
  },
  {
    id: 'act-15',
    type: 'issue',
    action: 'updated',
    title: 'Mobile navigation priority changed',
    description: 'Priority changed from Medium to High on SIG-135',
    entityId: 'i-135',
    entityPath: '/projects',
    timestamp: daysAgo(2),
    userId: 'u-alex',
    userName: 'Alex Chen',
    icon: '\u26A1',
  },
  {
    id: 'act-16',
    type: 'database',
    action: 'updated',
    title: 'Product Inventory updated',
    description: 'Maria Garcia added 12 new records to Product Inventory',
    entityId: 'db-inventory',
    entityPath: '/data',
    timestamp: daysAgo(3),
    userId: 'u-maria',
    userName: 'Maria Garcia',
    icon: '\uD83D\uDCCA',
  },
  {
    id: 'act-17',
    type: 'booking',
    action: 'completed',
    title: 'Client onboarding call completed',
    description: 'Onboarding call with Acme Corp was completed',
    entityId: 'b-onboard',
    entityPath: '/calendar/bookings',
    timestamp: daysAgo(3),
    userId: 'u-you',
    userName: 'You',
    icon: '\uD83D\uDCDE',
  },
  {
    id: 'act-18',
    type: 'document',
    action: 'signed',
    title: 'Service Agreement signed',
    description: 'All parties signed the Service Agreement',
    entityId: 'd-service',
    entityPath: '/documents/d-service',
    timestamp: daysAgo(4),
    userId: 'u-jane',
    userName: 'Jane Smith',
    icon: '\u270D\uFE0F',
  },
  {
    id: 'act-19',
    type: 'page',
    action: 'deleted',
    title: 'Draft notes removed',
    description: 'You moved Draft Notes - Old to trash',
    entityId: 'p-old',
    entityPath: '/pages',
    timestamp: daysAgo(5),
    userId: 'u-you',
    userName: 'You',
    icon: '\uD83D\uDDD1\uFE0F',
  },
  {
    id: 'act-20',
    type: 'team',
    action: 'updated',
    title: 'Design team members updated',
    description: 'Added 2 new members to the Design team',
    entityId: 't-design',
    entityPath: '/settings/teams',
    timestamp: daysAgo(6),
    userId: 'u-you',
    userName: 'You',
    icon: '\uD83D\uDC65',
  },
]

// ─── Store Interface ───────────────────────────────────────────────

interface ActivityState {
  activities: Activity[]

  // Actions
  addActivity: (activity: Omit<Activity, 'id'>) => void
  getRecentActivities: (limit: number) => Activity[]
  getActivitiesByType: (type: ActivityType) => Activity[]
  clearActivities: () => void

  // Clear data (alias for clearActivities, used by centralized reset)
  clearData: () => void
}

export const useActivityStore = create<ActivityState>()(
  persist(
    (set, get) => ({
      activities: SAMPLE_ACTIVITIES,

      addActivity: (activity) => {
        const newActivity: Activity = {
          ...activity,
          id: generateId(),
        }
        set((state) => ({
          activities: [newActivity, ...state.activities],
        }))
      },

      getRecentActivities: (limit) => {
        return get()
          .activities
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .slice(0, limit)
      },

      getActivitiesByType: (type) => {
        return get()
          .activities
          .filter((a) => a.type === type)
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      },

      clearActivities: () => {
        set({ activities: [] })
      },

      clearData: () => {
        set({ activities: [] })
      },
    }),
    {
      name: 'signof-activity-storage',
      partialize: (state) => ({
        activities: state.activities,
      }),
    }
  )
)
