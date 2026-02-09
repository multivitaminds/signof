import { useState, useEffect } from 'react'
import './AIMemoryPage.css'

export default function AIMemoryPage() {
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    // Simulates store hydration — will be replaced by useMemoryStore.getState().hydrate()
    const timer = setTimeout(() => {
      setIsHydrated(true)
    }, 0)
    return () => clearTimeout(timer)
  }, [])

  if (!isHydrated) {
    return (
      <div className="ai-memory-page">
        <div className="ai-memory-page__loading" aria-label="Loading memory">
          <div className="ai-memory-page__spinner" />
          <span>Loading context memory...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="ai-memory-page">
      <div data-testid="memory-explorer-placeholder">Memory Explorer</div>
    </div>
  )
}
