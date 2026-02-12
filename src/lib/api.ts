import type { ApiResponse } from './apiTypes'

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

interface RequestOptions {
  method?: HttpMethod
  body?: unknown
  headers?: Record<string, string>
  signal?: AbortSignal
}

class ApiClient {
  private baseUrl: string
  private token: string | null = null

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  setToken(token: string | null): void {
    this.token = token
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

    const response = await fetch(this.baseUrl + path, fetchOptions)

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
