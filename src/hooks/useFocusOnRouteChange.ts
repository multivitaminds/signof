import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Focuses the main content area heading when the route changes,
 * so screen reader users know the page has changed.
 * Falls back to focusing the main element itself if no heading is found.
 */
export function useFocusOnRouteChange(mainRef: React.RefObject<HTMLElement | null>) {
  const location = useLocation()
  const isFirstRender = useRef(true)

  useEffect(() => {
    // Don't focus on initial mount — only on subsequent navigations
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    // Small delay to let the new page render
    const timer = setTimeout(() => {
      if (!mainRef.current) return

      // Try to find the first heading in main content
      const heading = mainRef.current.querySelector<HTMLElement>('h1, h2, h3')
      if (heading) {
        // Make it focusable if it isn't already
        if (!heading.hasAttribute('tabindex')) {
          heading.setAttribute('tabindex', '-1')
        }
        heading.focus({ preventScroll: false })
        return
      }

      // Fallback: focus the main element itself
      if (!mainRef.current.hasAttribute('tabindex')) {
        mainRef.current.setAttribute('tabindex', '-1')
      }
      mainRef.current.focus({ preventScroll: false })
    }, 100)

    return () => clearTimeout(timer)
  }, [location.pathname, mainRef])
}
