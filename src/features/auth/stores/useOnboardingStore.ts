import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface OnboardingState {
  workspaceName: string
  workspaceIcon: string
  role: string
  teamSize: string
  useCases: string[]
  invitedEmails: string[]
  theme: 'light' | 'dark' | 'system'
  accentColor: string
  completed: boolean
  currentStep: number

  setWorkspace: (name: string, icon: string) => void
  setRole: (role: string) => void
  setTeamSize: (size: string) => void
  setUseCases: (cases: string[]) => void
  toggleUseCase: (useCase: string) => void
  addInviteEmail: (email: string) => void
  removeInviteEmail: (email: string) => void
  setTheme: (theme: 'light' | 'dark' | 'system') => void
  setAccentColor: (color: string) => void
  completeOnboarding: () => void
  setStep: (step: number) => void
  reset: () => void
}

const INITIAL_STATE = {
  workspaceName: '',
  workspaceIcon: '\u{1F680}',
  role: '',
  teamSize: '',
  useCases: [] as string[],
  invitedEmails: [] as string[],
  theme: 'system' as const,
  accentColor: '#4F46E5',
  completed: false,
  currentStep: 0,
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      ...INITIAL_STATE,

      setWorkspace: (name, icon) => set({ workspaceName: name, workspaceIcon: icon }),

      setRole: (role) => set({ role }),

      setTeamSize: (size) => set({ teamSize: size }),

      setUseCases: (cases) => set({ useCases: cases }),

      toggleUseCase: (useCase) =>
        set((state) => ({
          useCases: state.useCases.includes(useCase)
            ? state.useCases.filter((u) => u !== useCase)
            : [...state.useCases, useCase],
        })),

      addInviteEmail: (email) =>
        set((state) => {
          if (state.invitedEmails.includes(email)) return state
          return { invitedEmails: [...state.invitedEmails, email] }
        }),

      removeInviteEmail: (email) =>
        set((state) => ({
          invitedEmails: state.invitedEmails.filter((e) => e !== email),
        })),

      setTheme: (theme) => set({ theme }),

      setAccentColor: (color) => set({ accentColor: color }),

      completeOnboarding: () => set({ completed: true }),

      setStep: (step) => set({ currentStep: step }),

      reset: () => set({ ...INITIAL_STATE }),
    }),
    { name: 'origina-onboarding-storage' }
  )
)
