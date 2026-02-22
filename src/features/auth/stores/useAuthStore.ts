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
  accessToken: string | null
  refreshToken: string | null

  login: (email: string, name: string) => void
  signup: (email: string, name: string) => void
  loginFromApi: (user: User, accessToken: string, refreshToken: string) => void
  setTokens: (accessToken: string, refreshToken: string) => void
  clearTokens: () => void
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
      accessToken: null,
      refreshToken: null,

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

      loginFromApi: (user, accessToken, refreshToken) => {
        set({
          status: AuthStatus.Authenticated,
          user,
          accessToken,
          refreshToken,
          accountMode: 'live',
        })
      },

      setTokens: (accessToken, refreshToken) => {
        set({ accessToken, refreshToken })
      },

      clearTokens: () => {
        set({ accessToken: null, refreshToken: null })
      },

      logout: () => {
        set({
          status: AuthStatus.Unauthenticated,
          user: null,
          accessToken: null,
          refreshToken: null,
        })
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
    {
      name: 'origina-auth-storage',
      partialize: (state) => ({
        status: state.status,
        user: state.user,
        onboardingComplete: state.onboardingComplete,
        accountMode: state.accountMode,
        registrationStep: state.registrationStep,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    }
  )
)
