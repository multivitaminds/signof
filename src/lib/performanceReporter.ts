import type { WebVitalsMetrics } from '../hooks/useWebVitals'

interface PerformanceReport {
  vitals: WebVitalsMetrics
  timestamp: number
  url: string
  userAgent: string
}

/** Report performance metrics. Logs in dev; use sendBeacon in production. */
export function reportPerformance(report: PerformanceReport): void {
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.debug('[Perf]', report)
  }
  // In production, send to /api/metrics endpoint:
  // navigator.sendBeacon('/api/metrics', JSON.stringify(report))
}

/** Report an error with context */
export function reportError(error: Error, context?: Record<string, string>): void {
  if (import.meta.env.DEV) {
    console.error('[ErrorReport]', error, context)
  }
  // In production, send to /api/errors endpoint:
  // navigator.sendBeacon('/api/errors', JSON.stringify({
  //   message: error.message,
  //   stack: error.stack,
  //   context,
  //   timestamp: Date.now(),
  // }))
}
