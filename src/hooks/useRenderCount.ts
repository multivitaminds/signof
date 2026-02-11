import { useRef, useEffect } from 'react'

const isDev = import.meta.env.DEV

/**
 * useRenderCount -- dev-only hook that logs how many times a component
 * has rendered. No-ops in production builds.
 */
export function useRenderCount(componentName: string): void {
  const count = useRef(0)

  if (isDev) {
    count.current += 1
    console.debug(`[RenderCount] ${componentName}: ${count.current}`)
  }
}

/**
 * useWhyDidYouRender -- dev-only hook that logs which props changed
 * between renders. No-ops in production builds.
 */
export function useWhyDidYouRender(
  componentName: string,
  props: Record<string, unknown>
): void {
  const prevProps = useRef<Record<string, unknown> | undefined>(undefined)

  useEffect(() => {
    if (!isDev) return

    if (prevProps.current !== undefined) {
      const changed: Record<string, { from: unknown; to: unknown }> = {}
      const allKeys = new Set([...Object.keys(prevProps.current), ...Object.keys(props)])

      for (const key of allKeys) {
        if (prevProps.current[key] !== props[key]) {
          changed[key] = {
            from: prevProps.current[key],
            to: props[key],
          }
        }
      }

      if (Object.keys(changed).length > 0) {
        console.debug(`[WhyRender] ${componentName} re-rendered because:`, changed)
      }
    }

    prevProps.current = { ...props }
  })
}
