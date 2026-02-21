import { useCallback, useEffect } from 'react'
import { X, Sparkles, Loader2, RefreshCw } from 'lucide-react'
import { useChorusCopilotStore } from '../../stores/useChorusCopilotStore'
import './ChannelDigest.css'

interface ChannelDigestProps {
  channelId: string
  channelName: string
  onClose: () => void
}

export default function ChannelDigest({
  channelId,
  channelName,
  onClose,
}: ChannelDigestProps) {
  const isAnalyzing = useChorusCopilotStore((s) => s.isAnalyzing)
  const lastAnalysis = useChorusCopilotStore((s) => s.lastAnalysis)
  const summarizeChannel = useChorusCopilotStore((s) => s.summarizeChannel)

  const isChannelSummary = lastAnalysis?.type === 'channel_summary'

  useEffect(() => {
    summarizeChannel(channelId)
  }, [channelId, summarizeChannel])

  const handleRegenerate = useCallback(() => {
    summarizeChannel(channelId)
  }, [summarizeChannel, channelId])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    },
    [onClose]
  )

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-label={`Channel digest for #${channelName}`}
      aria-modal="true"
    >
      <div
        className="modal-content chorus-digest"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={() => {}}
        role="document"
      >
        <div className="modal-header chorus-digest__header">
          <div className="chorus-digest__title">
            <Sparkles size={18} className="chorus-digest__icon" />
            <h2>Channel Digest — #{channelName}</h2>
          </div>
          <button
            className="chorus-digest__close"
            onClick={onClose}
            aria-label="Close digest"
            type="button"
          >
            <X size={18} />
          </button>
        </div>

        <div className="chorus-digest__body">
          {isAnalyzing && (
            <div className="chorus-digest__loading">
              <Loader2 size={24} className="chorus-digest__spinner" />
              <p>Analyzing channel activity...</p>
            </div>
          )}

          {!isAnalyzing && isChannelSummary && lastAnalysis && (
            <>
              <div className="chorus-digest__summary">
                <p>{lastAnalysis.summary}</p>
              </div>

              {lastAnalysis.items.length > 0 && (
                <div className="chorus-digest__section">
                  <h3>Key Points</h3>
                  <ul className="chorus-digest__items">
                    {lastAnalysis.items.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}

          {!isAnalyzing && !isChannelSummary && (
            <div className="chorus-digest__empty">
              <p>No digest available. Click regenerate to analyze channel activity.</p>
            </div>
          )}
        </div>

        <div className="chorus-digest__footer">
          <button
            className="btn-secondary chorus-digest__regenerate"
            onClick={handleRegenerate}
            disabled={isAnalyzing}
            type="button"
          >
            <RefreshCw size={14} />
            <span>Regenerate</span>
          </button>
        </div>
      </div>
    </div>
  )
}
