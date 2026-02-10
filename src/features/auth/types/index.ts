export const AuthStatus = {
  Idle: 'idle',
  Loading: 'loading',
  Authenticated: 'authenticated',
  Unauthenticated: 'unauthenticated',
} as const

export type AuthStatus = (typeof AuthStatus)[keyof typeof AuthStatus]

export interface User {
  id: string
  name: string
  email: string
  avatarUrl: string | null
  createdAt: string
}

export interface OnboardingData {
  displayName: string
  workspaceName: string
  workspaceSlug: string
  workspaceIcon: string
  role: string
  teamSize: string
  useCases: string[]
  inviteEmails: string[]
  theme: 'light' | 'dark' | 'system'
}
