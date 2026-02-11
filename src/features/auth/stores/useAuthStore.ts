import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, OnboardingData } from '../types'
import { AuthStatus } from '../types'

function rid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

type AccountMode = 'demo' | 'live'

interface AuthState {
  status: AuthStatus
  user: User | null
  onboardingComplete: boolean
  accountMode: AccountMode

  login: (email: string, name: string) => void
  signup: (email: string, name: string) => void
  logout: () => void
  completeOnboarding: (data: OnboardingData) => void
  setAccountMode: (mode: AccountMode) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      status: AuthStatus.Unauthenticated,
      user: null,
      onboardingComplete: false,
      accountMode: 'demo' as AccountMode,

      login: (email, name) => {
        const user: User = {
          id: rid(),
          name,
          email,
          avatarUrl: null,
          createdAt: new Date().toISOString(),
        }
        set({ status: AuthStatus.Authenticated, user })
      },

      signup: (email, name) => {
        const user: User = {
          id: rid(),
          name,
          email,
          avatarUrl: null,
          createdAt: new Date().toISOString(),
        }
        set({ status: AuthStatus.Authenticated, user, onboardingComplete: false })
      },

      logout: () => {
        set({ status: AuthStatus.Unauthenticated, user: null })
      },

      completeOnboarding: (_data) => {
        set({ onboardingComplete: true })
      },

      setAccountMode: (mode) => {
        set({ accountMode: mode })
      },
    }),
    { name: 'signof-auth-storage' }
  )
)
