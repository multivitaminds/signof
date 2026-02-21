// Basic metrics — request count, latency, error rate

interface MetricEntry {
  count: number;
  totalMs: number;
  errors: number;
  lastUpdated: number;
}

const metrics = new Map<string, MetricEntry>();
const startTime = Date.now();

/**
 * Record a request metric.
 */
export function recordRequest(endpoint: string, durationMs: number, isError = false): void {
  const existing = metrics.get(endpoint) ?? { count: 0, totalMs: 0, errors: 0, lastUpdated: 0 };
  existing.count += 1;
  existing.totalMs += durationMs;
  if (isError) existing.errors += 1;
  existing.lastUpdated = Date.now();
  metrics.set(endpoint, existing);
}

/**
 * Get metrics summary.
 */
export function getMetrics(): {
  uptime: number;
  endpoints: Array<{
    endpoint: string;
    requestCount: number;
    averageMs: number;
    errorCount: number;
    errorRate: number;
  }>;
  totals: {
    requests: number;
    errors: number;
    averageMs: number;
  };
} {
  const endpoints: Array<{
    endpoint: string;
    requestCount: number;
    averageMs: number;
    errorCount: number;
    errorRate: number;
  }> = [];

  let totalRequests = 0;
  let totalErrors = 0;
  let totalMs = 0;

  for (const [endpoint, entry] of metrics) {
    endpoints.push({
      endpoint,
      requestCount: entry.count,
      averageMs: Math.round(entry.totalMs / entry.count),
      errorCount: entry.errors,
      errorRate: entry.count > 0 ? Math.round((entry.errors / entry.count) * 100) : 0,
    });
    totalRequests += entry.count;
    totalErrors += entry.errors;
    totalMs += entry.totalMs;
  }

  return {
    uptime: Math.floor((Date.now() - startTime) / 1000),
    endpoints: endpoints.sort((a, b) => b.requestCount - a.requestCount),
    totals: {
      requests: totalRequests,
      errors: totalErrors,
      averageMs: totalRequests > 0 ? Math.round(totalMs / totalRequests) : 0,
    },
  };
}

/**
 * Reset all metrics.
 */
export function resetMetrics(): void {
  metrics.clear();
}
