import { useState, useCallback } from 'react'
import { NodeViewWrapper } from '@tiptap/react'
import type { NodeViewProps } from '@tiptap/react'
import './BookmarkNodeView.css'

export default function BookmarkNodeView({ node, updateAttributes }: NodeViewProps) {
  const url = (node.attrs.url as string) ?? ''
  const [inputUrl, setInputUrl] = useState(url)

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      if (inputUrl.trim()) {
        updateAttributes({ url: inputUrl.trim() })
      }
    },
    [inputUrl, updateAttributes]
  )

  if (!url) {
    return (
      <NodeViewWrapper className="tiptap-bookmark" data-type="origina-bookmark" contentEditable={false}>
        <form className="tiptap-bookmark__form" onSubmit={handleSubmit}>
          <input
            className="tiptap-bookmark__input"
            type="url"
            placeholder="Paste bookmark URL..."
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
          />
          <button type="submit" className="btn-primary tiptap-bookmark__btn" disabled={!inputUrl.trim()}>
            Save
          </button>
        </form>
      </NodeViewWrapper>
    )
  }

  return (
    <NodeViewWrapper className="tiptap-bookmark" data-type="origina-bookmark" contentEditable={false}>
      <a
        className="tiptap-bookmark__link"
        href={url}
        target="_blank"
        rel="noopener noreferrer"
      >
        <span className="tiptap-bookmark__icon">🔗</span>
        <span className="tiptap-bookmark__url">{url}</span>
      </a>
    </NodeViewWrapper>
  )
}
