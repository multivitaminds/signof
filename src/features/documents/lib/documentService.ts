import { api } from '../../../lib/api'
import type { ApiResult, PaginatedResponse } from '../../../lib/apiTypes'
import type { Document } from '../../../types'

interface DocumentFilters {
  status?: string
  search?: string
  page?: number
  limit?: number
}

const documentService = {
  async list(filters?: DocumentFilters): Promise<ApiResult<PaginatedResponse<Document>>> {
    try {
      const params = new URLSearchParams()
      if (filters?.status) params.set('status', filters.status)
      if (filters?.search) params.set('search', filters.search)
      if (filters?.page) params.set('page', String(filters.page))
      if (filters?.limit) params.set('limit', String(filters.limit))
      const query = params.toString() ? `?${params.toString()}` : ''
      const response = await api.get<PaginatedResponse<Document>>(`/documents${query}`)
      return { data: response.data, ok: true as const }
    } catch (error) {
      return { ok: false as const, status: 500, message: (error as Error).message }
    }
  },

  async getById(id: string): Promise<ApiResult<Document>> {
    try {
      const response = await api.get<Document>(`/documents/${id}`)
      return { data: response.data, ok: true as const }
    } catch (error) {
      return { ok: false as const, status: 500, message: (error as Error).message }
    }
  },

  async create(data: Partial<Document>): Promise<ApiResult<Document>> {
    try {
      const response = await api.post<Document>('/documents', data)
      return { data: response.data, ok: true as const }
    } catch (error) {
      return { ok: false as const, status: 500, message: (error as Error).message }
    }
  },

  async update(id: string, data: Partial<Document>): Promise<ApiResult<Document>> {
    try {
      const response = await api.put<Document>(`/documents/${id}`, data)
      return { data: response.data, ok: true as const }
    } catch (error) {
      return { ok: false as const, status: 500, message: (error as Error).message }
    }
  },

  async delete(id: string): Promise<ApiResult<void>> {
    try {
      const response = await api.del<void>(`/documents/${id}`)
      return { data: response.data, ok: true as const }
    } catch (error) {
      return { ok: false as const, status: 500, message: (error as Error).message }
    }
  },

  async sign(id: string, signerId: string, signatureData: string): Promise<ApiResult<Document>> {
    try {
      const response = await api.post<Document>(`/documents/${id}/sign`, { signerId, signatureData })
      return { data: response.data, ok: true as const }
    } catch (error) {
      return { ok: false as const, status: 500, message: (error as Error).message }
    }
  },
}

export default documentService
