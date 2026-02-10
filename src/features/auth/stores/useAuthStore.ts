import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, OnboardingData } from '../types'
import { AuthStatus } from '../types'

function rid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

interface AuthState {
  status: AuthStatus
  user: User | null
  onboardingComplete: boolean

  login: (email: string, name: string) => void
  signup: (email: string, name: string) => void
  logout: () => void
  completeOnboarding: (data: OnboardingData) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      status: AuthStatus.Unauthenticated,
      user: null,
      onboardingComplete: false,

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
    }),
    { name: 'signof-auth-storage' }
  )
)
