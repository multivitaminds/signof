import { useState, useEffect, useCallback, useRef } from 'react'

interface UseApiState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

export function useApi<T>(
  fetcher: () => Promise<T>,
  deps: unknown[] = []
): UseApiState<T> & { refetch: () => void } {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: true,
    error: null,
  })
  const abortRef = useRef<AbortController | null>(null)
  const fetcherRef = useRef(fetcher)
  fetcherRef.current = fetcher

  // Track deps changes via a serialized key
  const depsKey = JSON.stringify(deps)

  const execute = useCallback(() => {
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setState((prev) => ({ ...prev, loading: true, error: null }))

    fetcherRef.current()
      .then((data) => {
        if (!controller.signal.aborted) {
          setState({ data, loading: false, error: null })
        }
      })
      .catch((err: unknown) => {
        if (!controller.signal.aborted) {
          const message = err instanceof Error ? err.message : 'An error occurred'
          setState({ data: null, loading: false, error: message })
        }
      })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [depsKey])

  useEffect(() => {
    execute()
    return () => { abortRef.current?.abort() }
  }, [execute])

  return { ...state, refetch: execute }
}
