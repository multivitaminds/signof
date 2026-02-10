import { useMemo } from 'react'
import { useMemoryStore } from '../stores/useMemoryStore'
import { formatTokenCount, TOKEN_BUDGET } from '../lib/tokenCount'
import MemoryExplorer from '../components/MemoryExplorer/MemoryExplorer'
import './AIMemoryPage.css'

export default function AIMemoryPage() {
  const entries = useMemoryStore((s) => s.entries)

  const totalTokens = useMemo(
    () => entries.reduce((sum, e) => sum + e.tokenCount, 0),
    [entries],
  )

  const usagePercent = Math.min((totalTokens / TOKEN_BUDGET) * 100, 100)

  return (
    <div className="ai-memory-page">
      <div className="ai-memory-page__header">
        <div className="ai-memory-page__header-text">
          <h2 className="ai-memory-page__title">Context Memory</h2>
          <p className="ai-memory-page__subtitle">
            1M token organizational memory
          </p>
        </div>
        <div className="ai-memory-page__usage-summary">
          <span className="ai-memory-page__usage-label">
            {formatTokenCount(totalTokens)} / {formatTokenCount(TOKEN_BUDGET)} tokens
          </span>
          <div
            className="ai-memory-page__usage-bar"
            role="progressbar"
            aria-valuenow={totalTokens}
            aria-valuemin={0}
            aria-valuemax={TOKEN_BUDGET}
            aria-label="Token usage"
          >
            <div
              className="ai-memory-page__usage-fill"
              style={{ width: `${usagePercent}%` }}
            />
          </div>
        </div>
      </div>

      <MemoryExplorer />
    </div>
  )
}
