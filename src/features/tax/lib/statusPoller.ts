import type { TaxBanditClient } from './taxBanditClient'

// ─── Status Poller ──────────────────────────────────────────────────────
//
// Polls the TaxBandits API for filing status updates. Starts with a
// short interval and switches to a longer one after a configurable
// period. Automatically stops on a definitive result (accepted/rejected)
// or when the maximum duration is exceeded.

interface PollOptions {
  /** Initial polling interval in ms (default 10000 = 10s) */
  initialInterval?: number
  /** Longer polling interval used after switchAfter period (default 60000 = 60s) */
  longInterval?: number
  /** Time in ms before switching to long interval (default 300000 = 5 min) */
  switchAfter?: number
  /** Maximum polling duration in ms (default 3600000 = 1 hour) */
  maxDuration?: number
}

export interface PollResult {
  status: string
  acknowledgementStatus: string
  irsErrors: Array<{ code: string; message: string }>
}

interface PollHandle {
  stop: () => void
}

/**
 * Start polling the TaxBandits API for filing status.
 * Returns a handle with a `stop()` method to cancel polling.
 */
export function startPolling(
  client: TaxBanditClient,
  submissionId: string,
  formPath: string,
  onUpdate: (result: PollResult) => void,
  options?: PollOptions
): PollHandle {
  const opts = {
    initialInterval: options?.initialInterval ?? 10000,
    longInterval: options?.longInterval ?? 60000,
    switchAfter: options?.switchAfter ?? 300000,
    maxDuration: options?.maxDuration ?? 3600000,
  }

  let stopped = false
  const startTime = Date.now()

  const poll = async () => {
    if (stopped) return

    try {
      const result = await client.fetch<{
        Records: Array<{
          Status: string
          AcknowledgementStatus: string
          IRSErrors: Array<{ ErrorCode: string; ErrorMessage: string }> | null
        }>
      }>(`${formPath}/Status?SubmissionId=${encodeURIComponent(submissionId)}`)

      const record = result.Records?.[0]
      const pollResult: PollResult = {
        status: record?.Status ?? 'Unknown',
        acknowledgementStatus: record?.AcknowledgementStatus ?? 'Pending',
        irsErrors:
          record?.IRSErrors?.map((e) => ({
            code: e.ErrorCode,
            message: e.ErrorMessage,
          })) ?? [],
      }

      onUpdate(pollResult)

      // Stop on definitive result
      const ack = pollResult.acknowledgementStatus.toLowerCase()
      if (ack === 'accepted' || ack === 'rejected') {
        stopped = true
        return
      }
    } catch {
      // Continue polling on error
    }

    if (stopped) return
    if (Date.now() - startTime > opts.maxDuration) {
      stopped = true
      return
    }

    const elapsed = Date.now() - startTime
    const interval = elapsed > opts.switchAfter ? opts.longInterval : opts.initialInterval
    setTimeout(poll, interval)
  }

  // Start first poll
  setTimeout(poll, opts.initialInterval)

  return {
    stop: () => {
      stopped = true
    },
  }
}
