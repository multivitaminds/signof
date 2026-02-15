import { useState } from 'react'
import type { MemoryEntry } from '../../types'
import './AgentMemoryViewer.css'

interface AgentMemoryViewerProps {
  agentId: string
  memories: MemoryEntry[]
  onSearch?: (query: string) => void
  onShare?: (memoryId: string) => void
  onAgentChange?: (agentId: string) => void
  availableAgents?: Array<{ id: string; name: string }>
}

export default function AgentMemoryViewer({
  agentId,
  memories,
  onSearch,
  onShare,
  onAgentChange,
  availableAgents,
}: AgentMemoryViewerProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (q: string) => {
    setSearchQuery(q)
    onSearch?.(q)
  }

  return (
    <div className="mem-viewer">
      <div className="mem-viewer__controls">
        {availableAgents && availableAgents.length > 0 && (
          <select
            className="mem-viewer__agent-select"
            value={agentId}
            onChange={(e) => onAgentChange?.(e.target.value)}
            aria-label="Select agent"
          >
            {availableAgents.map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
        )}
        <input
          className="mem-viewer__search"
          type="text"
          placeholder="Search memories..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          aria-label="Search memories"
        />
      </div>

      <div className="mem-viewer__list">
        {memories.length === 0 ? (
          <p className="mem-viewer__empty">No memories found</p>
        ) : (
          memories.map((m) => (
            <div key={m.id} className="mem-viewer__item">
              <div className="mem-viewer__item-header">
                <span className="mem-viewer__item-title">{m.title}</span>
                <span className="mem-viewer__item-category">{m.category}</span>
              </div>
              <p className="mem-viewer__item-content">
                {m.content.length > 120 ? m.content.slice(0, 120) + '...' : m.content}
              </p>
              <div className="mem-viewer__item-footer">
                <span className="mem-viewer__item-tokens">{m.tokenCount} tokens</span>
                <span className="mem-viewer__item-date">{new Date(m.createdAt).toLocaleDateString()}</span>
                {m.pinned && <span className="mem-viewer__item-pinned">pinned</span>}
                {onShare && (
                  <button className="mem-viewer__share-btn" onClick={() => onShare(m.id)}>
                    Share
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
