import { api } from '../lib/api'
import { useAuthStore } from '../features/auth/stores/useAuthStore'
import type { User, OnboardingData } from '../features/auth/types'

function isApiEnabled(): boolean {
  return Boolean(import.meta.env.VITE_API_URL)
}

interface AuthTokenResponse {
  user: User
  token: string
}

export const authService = {
  async login(email: string, name: string): Promise<User> {
    if (!isApiEnabled()) {
      useAuthStore.getState().login(email, name)
      const user = useAuthStore.getState().user
      if (!user) throw new Error('Login failed')
      return user
    }
    const res = await api.post<AuthTokenResponse>('/auth/login', { email, name })
    api.setToken(res.data.token)
    useAuthStore.getState().login(email, name)
    return res.data.user
  },

  async signup(email: string, name: string): Promise<User> {
    if (!isApiEnabled()) {
      useAuthStore.getState().signup(email, name)
      const user = useAuthStore.getState().user
      if (!user) throw new Error('Signup failed')
      return user
    }
    const res = await api.post<AuthTokenResponse>('/auth/signup', { email, name })
    api.setToken(res.data.token)
    useAuthStore.getState().signup(email, name)
    return res.data.user
  },

  async logout(): Promise<void> {
    if (!isApiEnabled()) {
      useAuthStore.getState().logout()
      return
    }
    try {
      await api.post('/auth/logout')
    } finally {
      api.setToken(null)
      useAuthStore.getState().logout()
    }
  },

  async completeOnboarding(data: OnboardingData): Promise<void> {
    if (!isApiEnabled()) {
      useAuthStore.getState().completeOnboarding(data)
      return
    }
    await api.post('/auth/onboarding', data)
    useAuthStore.getState().completeOnboarding(data)
  },

  async refreshToken(): Promise<void> {
    if (!isApiEnabled()) {
      return
    }
    const res = await api.post<{ token: string }>('/auth/refresh')
    api.setToken(res.data.token)
  },
}
