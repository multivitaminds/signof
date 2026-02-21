import { useCallback } from 'react'
import { Sparkles, Loader2 } from 'lucide-react'
import { useChorusCopilotStore } from '../../stores/useChorusCopilotStore'
import './ThreadSummary.css'

interface ThreadSummaryProps {
  channelId: string
  threadId: string
  replyCount: number
}

export default function ThreadSummary({
  channelId,
  threadId,
  replyCount,
}: ThreadSummaryProps) {
  const isAnalyzing = useChorusCopilotStore((s) => s.isAnalyzing)
  const lastAnalysis = useChorusCopilotStore((s) => s.lastAnalysis)
  const summarizeThread = useChorusCopilotStore((s) => s.summarizeThread)

  const isThreadSummary =
    lastAnalysis?.type === 'thread_summary'

  const handleSummarize = useCallback(() => {
    summarizeThread(channelId, threadId)
  }, [summarizeThread, channelId, threadId])

  if (replyCount < 5) return null

  return (
    <div className="chorus-thread-summary">
      {!isThreadSummary && (
        <button
          className="chorus-thread-summary__trigger"
          onClick={handleSummarize}
          disabled={isAnalyzing}
          type="button"
          aria-label="Summarize thread"
        >
          {isAnalyzing ? (
            <Loader2 size={14} className="chorus-thread-summary__spinner" />
          ) : (
            <Sparkles size={14} />
          )}
          <span>{isAnalyzing ? 'Summarizing...' : 'Summarize thread'}</span>
        </button>
      )}

      {isThreadSummary && lastAnalysis && (
        <div className="chorus-thread-summary__result" role="region" aria-label="Thread summary">
          <div className="chorus-thread-summary__header">
            <Sparkles size={14} />
            <span>Thread Summary</span>
          </div>
          <p className="chorus-thread-summary__text">{lastAnalysis.summary}</p>
          {lastAnalysis.items.length > 0 && (
            <ul className="chorus-thread-summary__items">
              {lastAnalysis.items.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          )}
          <button
            className="chorus-thread-summary__regenerate"
            onClick={handleSummarize}
            disabled={isAnalyzing}
            type="button"
          >
            Regenerate
          </button>
        </div>
      )}
    </div>
  )
}
