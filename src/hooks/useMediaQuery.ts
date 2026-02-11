import { useState, useEffect, useCallback } from 'react'

/**
 * useMediaQuery — reactive CSS media query matching.
 * SSR-safe: returns `false` when `window` is not available.
 */
export function useMediaQuery(query: string): boolean {
  const getMatches = useCallback((): boolean => {
    if (typeof window === 'undefined') return false
    return window.matchMedia(query).matches
  }, [query])

  const [matches, setMatches] = useState(getMatches)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const mql = window.matchMedia(query)

    const handleChange = () => {
      setMatches(mql.matches)
    }

    // Set initial value
    handleChange()

    mql.addEventListener('change', handleChange)
    return () => mql.removeEventListener('change', handleChange)
  }, [query])

  return matches
}

/** Viewport < 768px */
export function useIsMobile(): boolean {
  return useMediaQuery('(max-width: 767px)')
}

/** Viewport 768px - 1024px */
export function useIsTablet(): boolean {
  return useMediaQuery('(min-width: 768px) and (max-width: 1024px)')
}

/** Viewport > 1024px */
export function useIsDesktop(): boolean {
  return useMediaQuery('(min-width: 1025px)')
}

export default useMediaQuery
