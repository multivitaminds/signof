import { useState, useCallback } from 'react'
import { useWorkspaceStore } from '../../stores/useWorkspaceStore'
import type { Block } from '../../types'
import './EmbedBlock.css'

interface EmbedBlockProps {
  block: Block
}

export default function EmbedBlock({
  block,
}: EmbedBlockProps) {
  const embedUrl = block.properties.embedUrl ?? ''
  const [inputValue, setInputValue] = useState('')

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      const trimmed = inputValue.trim()
      if (trimmed) {
        useWorkspaceStore.setState((state) => {
          const existing = state.blocks[block.id]
          if (!existing) return state
          return {
            blocks: {
              ...state.blocks,
              [block.id]: {
                ...existing,
                properties: { ...existing.properties, embedUrl: trimmed },
              },
            },
          }
        })
      }
    },
    [inputValue, block.id]
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        setInputValue('')
      }
    },
    []
  )

  if (!embedUrl) {
    return (
      <div className="block-embed block-embed--empty">
        <form className="block-embed__form" onSubmit={handleSubmit}>
          <input
            className="block-embed__input"
            type="url"
            placeholder="Paste a URL to embed..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            aria-label="Embed URL"
          />
          <button
            type="submit"
            className="block-embed__submit btn-primary"
            disabled={!inputValue.trim()}
          >
            Embed
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="block-embed">
      <iframe
        className="block-embed__iframe"
        src={embedUrl}
        title="Embedded content"
        sandbox="allow-scripts allow-same-origin allow-popups"
        loading="lazy"
        allowFullScreen
      />
    </div>
  )
}
