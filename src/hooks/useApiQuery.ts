import { useState, useEffect, useCallback, useRef } from 'react'

interface UseApiQueryOptions<T> {
  queryFn: () => Promise<{ ok: boolean; data?: T; error?: { message: string } }>
  enabled?: boolean
}

interface UseApiQueryResult<T> {
  data: T | null
  error: string | null
  isLoading: boolean
  refetch: () => void
}

/** Lightweight data-fetching hook with loading/error states and refetch */
export function useApiQuery<T>(options: UseApiQueryOptions<T>): UseApiQueryResult<T> {
  const { queryFn, enabled = true } = options
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const mountedRef = useRef(true)
  const queryFnRef = useRef(queryFn)
  queryFnRef.current = queryFn

  const execute = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await queryFnRef.current()
      if (!mountedRef.current) return
      if (result.ok && result.data !== undefined) {
        setData(result.data)
      } else {
        setError(result.error?.message ?? 'Request failed')
      }
    } catch (err) {
      if (!mountedRef.current) return
      setError((err as Error).message)
    } finally {
      if (mountedRef.current) {
        setIsLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    mountedRef.current = true
    if (enabled) {
      execute()
    }
    return () => {
      mountedRef.current = false
    }
  }, [enabled, execute])

  return { data, error, isLoading, refetch: execute }
}
