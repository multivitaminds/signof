import { useCallback } from 'react'

/** Mark the start and end of a user journey for performance measurement */
export function usePerformanceMark(name: string) {
  const mark = useCallback(
    (phase: 'start' | 'end') => {
      const markName = `orchestree-${name}-${phase}`
      performance.mark(markName)
      if (phase === 'end') {
        try {
          performance.measure(
            `orchestree-${name}`,
            `orchestree-${name}-start`,
            markName
          )
          const entries = performance.getEntriesByName(`orchestree-${name}`)
          const last = entries[entries.length - 1]
          if (last && import.meta.env.DEV) {
            // eslint-disable-next-line no-console
            console.debug(`[Perf] ${name}: ${last.duration.toFixed(1)}ms`)
          }
        } catch {
          // start mark may not exist
        }
      }
    },
    [name]
  )
  return mark
}
