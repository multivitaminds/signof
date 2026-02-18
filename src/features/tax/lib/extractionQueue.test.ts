import { createExtractionQueue } from './extractionQueue'

describe('createExtractionQueue', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('processes items up to the concurrency limit', async () => {
    let running = 0
    let maxRunning = 0

    const extractFn = vi.fn(async () => {
      running++
      maxRunning = Math.max(maxRunning, running)
      await new Promise<void>((r) => setTimeout(r, 100))
      running--
    })

    const queue = createExtractionQueue(extractFn, { concurrency: 2 })
    const promise = queue.enqueue(['a', 'b', 'c', 'd'])

    // Advance past all timers
    await vi.advanceTimersByTimeAsync(500)
    await promise

    expect(extractFn).toHaveBeenCalledTimes(4)
    expect(maxRunning).toBe(2)
  })

  it('calls onStart and onComplete callbacks', async () => {
    const onStart = vi.fn()
    const onComplete = vi.fn()
    const extractFn = vi.fn().mockResolvedValue(undefined)

    const queue = createExtractionQueue(extractFn, { onStart, onComplete })
    const promise = queue.enqueue(['doc-1', 'doc-2'])
    await promise

    expect(onStart).toHaveBeenCalledWith('doc-1')
    expect(onStart).toHaveBeenCalledWith('doc-2')
    expect(onComplete).toHaveBeenCalledWith('doc-1')
    expect(onComplete).toHaveBeenCalledWith('doc-2')
  })

  it('retries failed extractions with exponential backoff', async () => {
    const onRetry = vi.fn()
    let callCount = 0

    const extractFn = vi.fn(async () => {
      callCount++
      if (callCount <= 2) throw new Error('transient')
    })

    const queue = createExtractionQueue(extractFn, {
      maxRetries: 3,
      baseDelay: 1000,
      onRetry,
    })

    const promise = queue.enqueue(['doc-1'])

    // First attempt fails, wait 1s for retry
    await vi.advanceTimersByTimeAsync(1100)
    // Second attempt fails, wait 2s for retry
    await vi.advanceTimersByTimeAsync(2100)
    await promise

    expect(extractFn).toHaveBeenCalledTimes(3)
    expect(onRetry).toHaveBeenCalledTimes(2)
    expect(onRetry).toHaveBeenCalledWith('doc-1', 1, expect.any(Error))
    expect(onRetry).toHaveBeenCalledWith('doc-1', 2, expect.any(Error))
  })

  it('calls onError after all retries are exhausted', async () => {
    const onError = vi.fn()
    const extractFn = vi.fn().mockRejectedValue(new Error('permanent'))

    const queue = createExtractionQueue(extractFn, {
      maxRetries: 2,
      baseDelay: 100,
      onError,
    })

    const promise = queue.enqueue(['doc-1'])
    await vi.advanceTimersByTimeAsync(500)
    await promise

    expect(onError).toHaveBeenCalledWith('doc-1', expect.any(Error))
    expect(extractFn).toHaveBeenCalledTimes(2)
  })

  it('reports pending and active counts', async () => {
    const extractFn = vi.fn(
      () => new Promise<void>((r) => setTimeout(r, 200)),
    )

    const queue = createExtractionQueue(extractFn, { concurrency: 1 })
    void queue.enqueue(['a', 'b', 'c'])

    // 1 active, 2 pending
    expect(queue.active()).toBe(1)
    expect(queue.pending()).toBe(2)

    await vi.advanceTimersByTimeAsync(250)
    expect(queue.active()).toBe(1)
    expect(queue.pending()).toBe(1)
  })

  it('clear() empties the pending queue', async () => {
    const extractFn = vi.fn(
      () => new Promise<void>((r) => setTimeout(r, 200)),
    )

    const queue = createExtractionQueue(extractFn, { concurrency: 1 })
    void queue.enqueue(['a', 'b', 'c'])

    expect(queue.pending()).toBe(2)
    queue.clear()
    expect(queue.pending()).toBe(0)
  })

  it('resolves enqueue promise even when some items fail', async () => {
    let calls = 0
    const extractFn = vi.fn(async () => {
      calls++
      if (calls === 2) throw new Error('fail')
    })

    const queue = createExtractionQueue(extractFn, {
      maxRetries: 1,
      baseDelay: 10,
    })

    // Should not reject — allSettled semantics
    await expect(queue.enqueue(['a', 'b', 'c'])).resolves.toBeUndefined()
  })
})
