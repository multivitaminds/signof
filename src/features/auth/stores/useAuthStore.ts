import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, OnboardingData, RegistrationStep } from '../types'
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
  registrationStep: RegistrationStep

  login: (email: string, name: string) => void
  signup: (email: string, name: string) => void
  logout: () => void
  completeOnboarding: (data: OnboardingData) => void
  setAccountMode: (mode: AccountMode) => void
  setRegistrationStep: (step: RegistrationStep) => void
  completeRegistration: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      status: AuthStatus.Unauthenticated,
      user: null,
      onboardingComplete: false,
      accountMode: 'demo' as AccountMode,
      registrationStep: 'none' as RegistrationStep,

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
        set({
          status: AuthStatus.Authenticated,
          user,
          onboardingComplete: false,
          registrationStep: 'plan',
          accountMode: 'live',
        })
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

      setRegistrationStep: (step) => {
        set({ registrationStep: step })
      },

      completeRegistration: () => {
        set({
          registrationStep: 'complete',
          onboardingComplete: true,
          accountMode: 'live',
        })
      },
    }),
    { name: 'orchestree-auth-storage' }
  )
)
