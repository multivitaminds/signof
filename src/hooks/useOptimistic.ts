import { useState, useCallback, useRef } from 'react'

interface UseOptimisticReturn<T> {
  /** Current value (may be the optimistic value) */
  value: T
  /** Set an optimistic value immediately */
  setOptimistic: (newValue: T) => void
  /** Revert to the last committed value */
  rollback: () => void
  /** Promote the current optimistic value to the new baseline */
  commit: () => void
  /** True when the current value differs from the committed baseline */
  isOptimistic: boolean
}

/**
 * useOptimistic -- optimistic UI pattern hook.
 *
 * Lets you immediately update the UI while an async operation completes.
 * Call `commit()` on success or `rollback()` on failure.
 *
 * @param initialValue  The initial committed value
 */
export function useOptimistic<T>(initialValue: T): UseOptimisticReturn<T> {
  const [value, setValue] = useState<T>(initialValue)
  const committedRef = useRef<T>(initialValue)
  const [isOptimistic, setIsOptimistic] = useState(false)

  const setOptimistic = useCallback((newValue: T) => {
    setValue(newValue)
    setIsOptimistic(true)
  }, [])

  const rollback = useCallback(() => {
    setValue(committedRef.current)
    setIsOptimistic(false)
  }, [])

  const commit = useCallback(() => {
    committedRef.current = value
    setIsOptimistic(false)
  }, [value])

  return {
    value,
    setOptimistic,
    rollback,
    commit,
    isOptimistic,
  }
}
