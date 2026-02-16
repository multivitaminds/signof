import { api } from './api'
import type { ApiResult, PaginatedResponse } from './apiTypes'

interface ServiceConfig {
  basePath: string
}

export interface CrudService<T> {
  list(params?: Record<string, string | number | boolean>): Promise<ApiResult<PaginatedResponse<T>>>
  getById(id: string): Promise<ApiResult<T>>
  create(data: Partial<T>): Promise<ApiResult<T>>
  update(id: string, data: Partial<T>): Promise<ApiResult<T>>
  delete(id: string): Promise<ApiResult<void>>
}

/** Factory to create typed CRUD services with minimal boilerplate */
export function createService<T>(config: ServiceConfig): CrudService<T> {
  const { basePath } = config

  return {
    async list(params) {
      try {
        const query = params
          ? '?' + new URLSearchParams(
              Object.entries(params).reduce<Record<string, string>>(
                (acc, [k, v]) => ({ ...acc, [k]: String(v) }),
                {}
              )
            ).toString()
          : ''
        const response = await api.get<PaginatedResponse<T>>(`${basePath}${query}`)
        return { data: response.data, ok: true as const }
      } catch (error) {
        return { ok: false as const, status: 500, message: (error as Error).message }
      }
    },

    async getById(id) {
      try {
        const response = await api.get<T>(`${basePath}/${id}`)
        return { data: response.data, ok: true as const }
      } catch (error) {
        return { ok: false as const, status: 500, message: (error as Error).message }
      }
    },

    async create(data) {
      try {
        const response = await api.post<T>(basePath, data)
        return { data: response.data, ok: true as const }
      } catch (error) {
        return { ok: false as const, status: 500, message: (error as Error).message }
      }
    },

    async update(id, data) {
      try {
        const response = await api.put<T>(`${basePath}/${id}`, data)
        return { data: response.data, ok: true as const }
      } catch (error) {
        return { ok: false as const, status: 500, message: (error as Error).message }
      }
    },

    async delete(id) {
      try {
        const response = await api.del<void>(`${basePath}/${id}`)
        return { data: response.data, ok: true as const }
      } catch (error) {
        return { ok: false as const, status: 500, message: (error as Error).message }
      }
    },
  }
}
