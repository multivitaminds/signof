import { useState, useEffect } from 'react'

/**
 * useDebouncedValue -- returns a debounced copy of the input value.
 * The returned value only updates after `delay` ms of inactivity.
 *
 * @param value  The rapidly-changing source value
 * @param delay  Debounce interval in milliseconds
 * @returns      The debounced value
 */
export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebounced(value)
    }, delay)

    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debounced
}
