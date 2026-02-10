import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  NotificationCategoryPrefs,
  NotificationToggle,
  QuietHours,
} from '../types'

type CategoryKey = keyof Omit<NotificationCategoryPrefs, 'quietHours'>

interface NotificationPrefsState {
  prefs: NotificationCategoryPrefs

  toggleNotification: (
    category: CategoryKey,
    setting: string,
    channel: keyof NotificationToggle
  ) => void
  updateQuietHours: (updates: Partial<QuietHours>) => void
}

const defaultToggle = (inApp: boolean, email: boolean): NotificationToggle => ({
  inApp,
  email,
})

export const useNotificationPrefsStore = create<NotificationPrefsState>()(
  persist(
    (set) => ({
      prefs: {
        documents: {
          newDocument: defaultToggle(true, true),
          signatureRequest: defaultToggle(true, true),
          documentCompleted: defaultToggle(true, true),
          documentExpired: defaultToggle(true, false),
        },
        projects: {
          issueAssigned: defaultToggle(true, true),
          statusChanged: defaultToggle(true, false),
          commentMention: defaultToggle(true, true),
          cycleCompleted: defaultToggle(true, false),
        },
        scheduling: {
          newBooking: defaultToggle(true, true),
          bookingCancelled: defaultToggle(true, true),
          bookingReminder: defaultToggle(true, false),
        },
        workspace: {
          pageShared: defaultToggle(true, false),
          commentOnPage: defaultToggle(true, false),
          teamInvite: defaultToggle(true, true),
        },
        quietHours: {
          enabled: false,
          startTime: '22:00',
          endTime: '08:00',
        },
      },

      toggleNotification: (category, setting, channel) => {
        set((state) => {
          const categoryPrefs = state.prefs[category]
          const settingPrefs = (categoryPrefs as unknown as Record<string, NotificationToggle>)[setting]
          if (!settingPrefs) return state

          return {
            prefs: {
              ...state.prefs,
              [category]: {
                ...categoryPrefs,
                [setting]: {
                  ...settingPrefs,
                  [channel]: !settingPrefs[channel],
                },
              },
            },
          }
        })
      },

      updateQuietHours: (updates) => {
        set((state) => ({
          prefs: {
            ...state.prefs,
            quietHours: {
              ...state.prefs.quietHours,
              ...updates,
            },
          },
        }))
      },
    }),
    { name: 'signof-notification-prefs-storage' }
  )
)
