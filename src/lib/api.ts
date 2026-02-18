import type { ApiResponse } from './apiTypes'

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

interface RequestOptions {
  method?: HttpMethod
  body?: unknown
  headers?: Record<string, string>
  signal?: AbortSignal
}

// Auth endpoint paths that should NOT trigger token refresh on 401
const AUTH_PATHS = ['/api/auth/login', '/api/auth/signup', '/api/auth/refresh']

class ApiClient {
  private baseUrl: string
  private token: string | null = null
  private refreshPromise: Promise<boolean> | null = null

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  setToken(token: string | null): void {
    this.token = token
  }

  private async tryRefreshToken(): Promise<boolean> {
    // Deduplicate concurrent refresh attempts
    if (this.refreshPromise) return this.refreshPromise

    this.refreshPromise = this.executeRefresh()
    try {
      return await this.refreshPromise
    } finally {
      this.refreshPromise = null
    }
  }

  private async executeRefresh(): Promise<boolean> {
    try {
      // Dynamic import to avoid circular dependency
      const { useAuthStore } = await import('../features/auth/stores/useAuthStore')
      const { refreshToken } = useAuthStore.getState()
      if (!refreshToken) return false

      const response = await fetch(this.baseUrl + '/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      })

      if (!response.ok) {
        // Refresh failed — clear tokens and log out
        this.token = null
        useAuthStore.getState().logout()
        return false
      }

      const tokens = await response.json() as {
        accessToken: string
        refreshToken: string
        expiresIn: number
      }
      this.token = tokens.accessToken
      useAuthStore.getState().setTokens(tokens.accessToken, tokens.refreshToken)
      return true
    } catch {
      return false
    }
  }

  async request<T>(path: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    const { method = 'GET', body, headers = {}, signal } = options

    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers,
    }

    if (this.token) {
      requestHeaders['Authorization'] = `Bearer ${this.token}`
    }

    const fetchOptions: RequestInit = {
      method,
      headers: requestHeaders,
      signal,
    }

    if (body !== undefined && method !== 'GET') {
      fetchOptions.body = JSON.stringify(body)
    }

    let response = await fetch(this.baseUrl + path, fetchOptions)

    // On 401 for non-auth endpoints, try refreshing the token
    if (response.status === 401 && !AUTH_PATHS.includes(path)) {
      const refreshed = await this.tryRefreshToken()
      if (refreshed) {
        // Retry with new token
        const retryHeaders = { ...requestHeaders, Authorization: `Bearer ${this.token}` }
        response = await fetch(this.baseUrl + path, { ...fetchOptions, headers: retryHeaders })
      }
    }

    if (!response.ok) {
      if (response.status === 401) {
        this.token = null
      }

      let message = `Request failed with status ${response.status}`
      try {
        const errorBody: unknown = await response.json()
        if (
          typeof errorBody === 'object' &&
          errorBody !== null &&
          'error' in errorBody &&
          typeof (errorBody as Record<string, unknown>).error === 'string'
        ) {
          message = (errorBody as { error: string }).error
        } else if (
          typeof errorBody === 'object' &&
          errorBody !== null &&
          'message' in errorBody &&
          typeof (errorBody as Record<string, unknown>).message === 'string'
        ) {
          message = (errorBody as { message: string }).message
        }
      } catch {
        // Use default message if JSON parsing fails
      }

      throw new Error(message)
    }

    const data: T = await response.json() as T

    return { data, ok: true }
  }

  async get<T>(path: string, options: Omit<RequestOptions, 'method' | 'body'> = {}): Promise<ApiResponse<T>> {
    return this.request<T>(path, { ...options, method: 'GET' })
  }

  async post<T>(path: string, body?: unknown, options: Omit<RequestOptions, 'method' | 'body'> = {}): Promise<ApiResponse<T>> {
    return this.request<T>(path, { ...options, method: 'POST', body })
  }

  async put<T>(path: string, body?: unknown, options: Omit<RequestOptions, 'method' | 'body'> = {}): Promise<ApiResponse<T>> {
    return this.request<T>(path, { ...options, method: 'PUT', body })
  }

  async del<T>(path: string, options: Omit<RequestOptions, 'method' | 'body'> = {}): Promise<ApiResponse<T>> {
    return this.request<T>(path, { ...options, method: 'DELETE' })
  }

  async upload<T>(
    path: string,
    file: File,
    fields?: Record<string, string>,
  ): Promise<ApiResponse<T>> {
    const formData = new FormData()
    formData.append('file', file)

    if (fields) {
      for (const [key, value] of Object.entries(fields)) {
        formData.append(key, value)
      }
    }

    const headers: Record<string, string> = {}
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`
    }

    const response = await fetch(this.baseUrl + path, {
      method: 'POST',
      headers,
      body: formData,
    })

    if (!response.ok) {
      if (response.status === 401) {
        this.token = null
      }

      let message = `Upload failed with status ${response.status}`
      try {
        const errorBody: unknown = await response.json()
        if (
          typeof errorBody === 'object' &&
          errorBody !== null &&
          'message' in errorBody &&
          typeof (errorBody as Record<string, unknown>).message === 'string'
        ) {
          message = (errorBody as { message: string }).message
        }
      } catch {
        // Use default message if JSON parsing fails
      }

      throw new Error(message)
    }

    const data: T = await response.json() as T

    return { data, ok: true }
  }
}

export const api = new ApiClient(import.meta.env.VITE_API_URL ?? '')
