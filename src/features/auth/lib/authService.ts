import { api } from '../../../lib/api'
import type { ApiResult } from '../../../lib/apiTypes'

export interface LoginRequest {
  email: string
  password: string
}

export interface SignupRequest {
  email: string
  password: string
  displayName: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

export interface AuthUser {
  id: string
  email: string
  displayName: string
  avatarUrl: string | null
}

export interface AuthResponse {
  user: AuthUser
  tokens: AuthTokens
}

const authService = {
  async login(data: LoginRequest): Promise<ApiResult<AuthResponse>> {
    try {
      const response = await api.post<AuthResponse>('/api/auth/login', data)
      api.setToken(response.data.tokens.accessToken)
      return { data: response.data, ok: true as const }
    } catch (error) {
      return { ok: false as const, status: 401, message: (error as Error).message }
    }
  },

  async signup(data: SignupRequest): Promise<ApiResult<AuthResponse>> {
    try {
      const response = await api.post<AuthResponse>('/api/auth/signup', data)
      api.setToken(response.data.tokens.accessToken)
      return { data: response.data, ok: true as const }
    } catch (error) {
      return { ok: false as const, status: 400, message: (error as Error).message }
    }
  },

  async logout(): Promise<void> {
    try {
      await api.post('/api/auth/logout', {})
    } catch {
      // Logout should succeed even if API fails
    } finally {
      api.setToken(null)
    }
  },

  async refreshToken(refreshToken: string): Promise<ApiResult<AuthTokens>> {
    try {
      const response = await api.post<AuthTokens>('/api/auth/refresh', { refreshToken })
      api.setToken(response.data.accessToken)
      return { data: response.data, ok: true as const }
    } catch (error) {
      return { ok: false as const, status: 401, message: (error as Error).message }
    }
  },

  async getCurrentUser(): Promise<ApiResult<AuthUser>> {
    try {
      const response = await api.get<AuthUser>('/api/auth/me')
      return { data: response.data, ok: true as const }
    } catch (error) {
      return { ok: false as const, status: 401, message: (error as Error).message }
    }
  },
}

export default authService
