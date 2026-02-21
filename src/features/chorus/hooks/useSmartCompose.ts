import { useCallback, useEffect, useRef, useState } from 'react'
import { getSmartSuggestion } from '../lib/smartComposeEngine'
import type { SmartComposeContext } from '../lib/smartComposeEngine'

const DEBOUNCE_MS = 500

interface UseSmartComposeOptions {
  channelName?: string
  recentMessages?: string[]
  topic?: string
  enabled?: boolean
}

interface UseSmartComposeResult {
  suggestion: string | null
  isLoading: boolean
  acceptSuggestion: () => string | null
  dismissSuggestion: () => void
  onDraftChange: (draft: string) => void
}

export function useSmartCompose(options: UseSmartComposeOptions = {}): UseSmartComposeResult {
  const { channelName, recentMessages, topic, enabled = true } = options
  const [suggestion, setSuggestion] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const draftRef = useRef('')

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [])

  const onDraftChange = useCallback(
    (draft: string) => {
      draftRef.current = draft

      // Clear existing suggestion and timer
      setSuggestion(null)
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }

      if (!enabled || draft.trim().length < 3) {
        setIsLoading(false)
        return
      }

      setIsLoading(true)

      timerRef.current = setTimeout(() => {
        const ctx: SmartComposeContext = {
          draft,
          channelName,
          recentMessages,
          topic,
        }

        getSmartSuggestion(ctx)
          .then((result) => {
            // Only apply if draft hasn't changed
            if (draftRef.current === draft) {
              setSuggestion(result)
              setIsLoading(false)
            }
          })
          .catch(() => {
            if (draftRef.current === draft) {
              setIsLoading(false)
            }
          })
      }, DEBOUNCE_MS)
    },
    [channelName, recentMessages, topic, enabled]
  )

  const acceptSuggestion = useCallback(() => {
    const current = suggestion
    setSuggestion(null)
    return current
  }, [suggestion])

  const dismissSuggestion = useCallback(() => {
    setSuggestion(null)
  }, [])

  return {
    suggestion,
    isLoading,
    acceptSuggestion,
    dismissSuggestion,
    onDraftChange,
  }
}
