export interface WebVitalsMetrics {
  lcp: number | null
  fid: number | null
  cls: number | null
  ttfb: number | null
}

type MetricsCallback = (metrics: WebVitalsMetrics) => void

/** Collect Core Web Vitals using native PerformanceObserver API */
export function collectWebVitals(callback: MetricsCallback): () => void {
  const metrics: WebVitalsMetrics = {
    lcp: null,
    fid: null,
    cls: null,
    ttfb: null,
  }

  const observers: PerformanceObserver[] = []
  const notify = () => callback({ ...metrics })

  if (typeof PerformanceObserver === 'undefined') {
    return () => {}
  }

  // LCP — Largest Contentful Paint
  try {
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const last = entries[entries.length - 1]
      if (last) {
        metrics.lcp = last.startTime
        notify()
      }
    })
    lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true })
    observers.push(lcpObserver)
  } catch {
    // Browser does not support this entry type
  }

  // FID — First Input Delay
  try {
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const first = entries[0]
      if (first) {
        const entry = first as PerformanceEventTiming
        metrics.fid = entry.processingStart - entry.startTime
        notify()
      }
    })
    fidObserver.observe({ type: 'first-input', buffered: true })
    observers.push(fidObserver)
  } catch {
    // Browser does not support this entry type
  }

  // CLS — Cumulative Layout Shift
  try {
    let clsValue = 0
    const clsObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const layoutEntry = entry as PerformanceEntry & {
          hadRecentInput?: boolean
          value?: number
        }
        if (!layoutEntry.hadRecentInput && typeof layoutEntry.value === 'number') {
          clsValue += layoutEntry.value
        }
      }
      metrics.cls = clsValue
      notify()
    })
    clsObserver.observe({ type: 'layout-shift', buffered: true })
    observers.push(clsObserver)
  } catch {
    // Browser does not support this entry type
  }

  // TTFB — Time to First Byte
  try {
    const navEntries = performance.getEntriesByType('navigation')
    const navEntry = navEntries[0] as PerformanceNavigationTiming | undefined
    if (navEntry) {
      metrics.ttfb = navEntry.responseStart - navEntry.requestStart
      notify()
    }
  } catch {
    // Navigation timing not available
  }

  return () => {
    for (const observer of observers) {
      observer.disconnect()
    }
  }
}
