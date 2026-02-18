// ─── Extraction Queue ──────────────────────────────────────────────────
//
// Limits concurrent document extractions and retries failures with
// exponential backoff. Prevents flooding the extraction pipeline when
// many documents are uploaded at once.

export interface QueueOptions {
  concurrency?: number
  maxRetries?: number
  baseDelay?: number
  onStart?: (docId: string) => void
  onComplete?: (docId: string) => void
  onRetry?: (docId: string, attempt: number, error: unknown) => void
  onError?: (docId: string, error: unknown) => void
}

interface QueueItem {
  docId: string
  resolve: () => void
  reject: (err: unknown) => void
}

export function createExtractionQueue(
  extractFn: (docId: string) => Promise<void>,
  options: QueueOptions = {},
) {
  const {
    concurrency = 2,
    maxRetries = 3,
    baseDelay = 1000,
    onStart,
    onComplete,
    onRetry,
    onError,
  } = options

  const queue: QueueItem[] = []
  let activeCount = 0

  function flush(): void {
    while (activeCount < concurrency && queue.length > 0) {
      const item = queue.shift()!
      activeCount++
      void run(item)
    }
  }

  async function run(item: QueueItem): Promise<void> {
    const { docId, resolve, reject } = item
    onStart?.(docId)

    let lastError: unknown
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await extractFn(docId)
        onComplete?.(docId)
        resolve()
        activeCount--
        flush()
        return
      } catch (err: unknown) {
        lastError = err
        if (attempt < maxRetries) {
          onRetry?.(docId, attempt, err)
          const delay = baseDelay * Math.pow(2, attempt - 1)
          await new Promise<void>((r) => setTimeout(r, delay))
        }
      }
    }

    // All retries exhausted
    onError?.(docId, lastError)
    reject(lastError)
    activeCount--
    flush()
  }

  return {
    enqueue(docIds: string[]): Promise<void> {
      const promises = docIds.map(
        (docId) =>
          new Promise<void>((resolve, reject) => {
            queue.push({ docId, resolve, reject })
          }),
      )
      flush()
      return Promise.allSettled(promises).then(() => undefined)
    },

    clear(): void {
      queue.length = 0
    },

    pending(): number {
      return queue.length
    },

    active(): number {
      return activeCount
    },
  }
}
