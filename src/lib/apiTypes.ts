export interface ApiResponse<T> {
  data: T
  ok: true
}

export interface ApiError {
  ok: false
  status: number
  message: string
  code?: string
}

export type ApiResult<T> = ApiResponse<T> | ApiError

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}
