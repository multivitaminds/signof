import { startPolling } from './statusPoller'
import type { TaxBanditClient } from './taxBanditClient'
import type { PollResult } from './statusPoller'

function createMockClient(responses: Array<Record<string, unknown>>): TaxBanditClient {
  let callIndex = 0
  return {
    fetch: vi.fn(async () => {
      const response = responses[callIndex] ?? responses[responses.length - 1]
      callIndex++
      return response
    }),
  } as unknown as TaxBanditClient
}

function createAcceptedResponse() {
  return {
    Records: [{
      Status: 'Transmitted',
      AcknowledgementStatus: 'Accepted',
      IRSErrors: null,
    }],
  }
}

function createPendingResponse() {
  return {
    Records: [{
      Status: 'Transmitted',
      AcknowledgementStatus: 'Pending',
      IRSErrors: null,
    }],
  }
}

function createRejectedResponse() {
  return {
    Records: [{
      Status: 'Transmitted',
      AcknowledgementStatus: 'Rejected',
      IRSErrors: [{ ErrorCode: 'R0000-500', ErrorMessage: 'Invalid SSN' }],
    }],
  }
}

describe('statusPoller', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('starts polling after the initial interval', async () => {
    const client = createMockClient([createPendingResponse()])
    const onUpdate = vi.fn()

    startPolling(client, 'sub-1', 'FormW2', onUpdate, {
      initialInterval: 1000,
    })

    expect(client.fetch).not.toHaveBeenCalled()

    await vi.advanceTimersByTimeAsync(1000)

    expect(client.fetch).toHaveBeenCalledTimes(1)
    expect(onUpdate).toHaveBeenCalledTimes(1)
    expect(onUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'Transmitted',
        acknowledgementStatus: 'Pending',
        irsErrors: [],
      })
    )
  })

  it('stops polling when acknowledgement status is accepted', async () => {
    const client = createMockClient([createPendingResponse(), createAcceptedResponse()])
    const onUpdate = vi.fn()

    startPolling(client, 'sub-1', 'FormW2', onUpdate, {
      initialInterval: 1000,
    })

    // First poll: pending
    await vi.advanceTimersByTimeAsync(1000)
    expect(onUpdate).toHaveBeenCalledTimes(1)

    // Second poll: accepted
    await vi.advanceTimersByTimeAsync(1000)
    expect(onUpdate).toHaveBeenCalledTimes(2)

    const lastCall = onUpdate.mock.calls[1]![0] as PollResult
    expect(lastCall.acknowledgementStatus).toBe('Accepted')

    // Third interval: should not poll again
    await vi.advanceTimersByTimeAsync(1000)
    expect(onUpdate).toHaveBeenCalledTimes(2)
  })

  it('stops polling when acknowledgement status is rejected', async () => {
    const client = createMockClient([createRejectedResponse()])
    const onUpdate = vi.fn()

    startPolling(client, 'sub-1', 'FormW2', onUpdate, {
      initialInterval: 500,
    })

    await vi.advanceTimersByTimeAsync(500)

    const result = onUpdate.mock.calls[0]![0] as PollResult
    expect(result.acknowledgementStatus).toBe('Rejected')
    expect(result.irsErrors).toHaveLength(1)
    expect(result.irsErrors[0]!.code).toBe('R0000-500')

    // Should not poll again
    await vi.advanceTimersByTimeAsync(1000)
    expect(onUpdate).toHaveBeenCalledTimes(1)
  })

  it('handle.stop() cancels further polling', async () => {
    const client = createMockClient([createPendingResponse()])
    const onUpdate = vi.fn()

    const handle = startPolling(client, 'sub-1', 'FormW2', onUpdate, {
      initialInterval: 1000,
    })

    handle.stop()

    await vi.advanceTimersByTimeAsync(2000)
    expect(onUpdate).not.toHaveBeenCalled()
  })

  it('switches to long interval after switchAfter period', async () => {
    const client = createMockClient([
      createPendingResponse(),
      createPendingResponse(),
      createPendingResponse(),
      createAcceptedResponse(),
    ])
    const onUpdate = vi.fn()

    startPolling(client, 'sub-1', 'FormW2', onUpdate, {
      initialInterval: 100,
      longInterval: 500,
      switchAfter: 150,
    })

    // First poll at 100ms (initial interval)
    await vi.advanceTimersByTimeAsync(100)
    expect(onUpdate).toHaveBeenCalledTimes(1)

    // Second poll at 200ms (still initial, elapsed=100 < 150)
    await vi.advanceTimersByTimeAsync(100)
    expect(onUpdate).toHaveBeenCalledTimes(2)

    // Now elapsed=200 > switchAfter=150, so next interval is 500ms
    // Third poll at 700ms
    await vi.advanceTimersByTimeAsync(400)
    expect(onUpdate).toHaveBeenCalledTimes(2) // not yet
    await vi.advanceTimersByTimeAsync(100)
    expect(onUpdate).toHaveBeenCalledTimes(3)
  })

  it('stops polling after maxDuration is exceeded', async () => {
    const client = createMockClient([createPendingResponse()])
    const onUpdate = vi.fn()

    startPolling(client, 'sub-1', 'FormW2', onUpdate, {
      initialInterval: 500,
      maxDuration: 1200,
    })

    // First poll at 500ms
    await vi.advanceTimersByTimeAsync(500)
    expect(onUpdate).toHaveBeenCalledTimes(1)

    // Second poll at 1000ms
    await vi.advanceTimersByTimeAsync(500)
    expect(onUpdate).toHaveBeenCalledTimes(2)

    // Third poll at 1500ms - executes but then sees maxDuration exceeded and stops
    await vi.advanceTimersByTimeAsync(500)
    expect(onUpdate).toHaveBeenCalledTimes(3)

    // Fourth poll should NOT happen because polling stopped after maxDuration check
    await vi.advanceTimersByTimeAsync(500)
    expect(onUpdate).toHaveBeenCalledTimes(3)
  })

  it('continues polling on fetch error', async () => {
    let callCount = 0
    const client = {
      fetch: vi.fn(async () => {
        callCount++
        if (callCount === 1) throw new Error('Network error')
        return createAcceptedResponse()
      }),
    } as unknown as TaxBanditClient
    const onUpdate = vi.fn()

    startPolling(client, 'sub-1', 'FormW2', onUpdate, {
      initialInterval: 500,
    })

    // First poll errors
    await vi.advanceTimersByTimeAsync(500)
    expect(onUpdate).not.toHaveBeenCalled()

    // Second poll succeeds
    await vi.advanceTimersByTimeAsync(500)
    expect(onUpdate).toHaveBeenCalledTimes(1)
  })

  it('handles missing Records in response', async () => {
    const client = createMockClient([{ Records: [] }])
    const onUpdate = vi.fn()

    startPolling(client, 'sub-1', 'FormW2', onUpdate, {
      initialInterval: 500,
    })

    await vi.advanceTimersByTimeAsync(500)

    const result = onUpdate.mock.calls[0]![0] as PollResult
    expect(result.status).toBe('Unknown')
    expect(result.acknowledgementStatus).toBe('Pending')
    expect(result.irsErrors).toEqual([])
  })
})
