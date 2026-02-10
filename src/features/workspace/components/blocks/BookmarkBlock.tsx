import { useState, useCallback } from 'react'
import type { Block } from '../../types'
import './BookmarkBlock.css'

interface BookmarkBlockProps {
  block: Block
  onContentChange: (content: string) => void
}

export default function BookmarkBlock({
  block,
  onContentChange,
}: BookmarkBlockProps) {
  const url = block.content || ''
  const [inputValue, setInputValue] = useState('')

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      const trimmed = inputValue.trim()
      if (trimmed) {
        onContentChange(trimmed)
      }
    },
    [inputValue, onContentChange]
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        setInputValue('')
      }
    },
    []
  )

  if (!url) {
    return (
      <div className="block-bookmark block-bookmark--empty">
        <form className="block-bookmark__form" onSubmit={handleSubmit}>
          <input
            className="block-bookmark__input"
            type="url"
            placeholder="Paste a URL to create a bookmark..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            aria-label="Bookmark URL"
          />
          <button
            type="submit"
            className="block-bookmark__submit btn-primary"
            disabled={!inputValue.trim()}
          >
            Add
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="block-bookmark">
      <div className="block-bookmark__card">
        <div className="block-bookmark__info">
          <span className="block-bookmark__url">{url}</span>
        </div>
        <a
          className="block-bookmark__open"
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Open ${url} in new tab`}
        >
          Open
        </a>
      </div>
    </div>
  )
}
