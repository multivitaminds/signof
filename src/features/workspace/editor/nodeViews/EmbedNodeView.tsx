import { useState, useCallback } from 'react'
import { NodeViewWrapper } from '@tiptap/react'
import type { NodeViewProps } from '@tiptap/react'
import './EmbedNodeView.css'

export default function EmbedNodeView({ node, updateAttributes }: NodeViewProps) {
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
      <NodeViewWrapper className="tiptap-embed" data-type="signof-embed" contentEditable={false}>
        <form className="tiptap-embed__form" onSubmit={handleSubmit}>
          <input
            className="tiptap-embed__input"
            type="url"
            placeholder="Paste embed URL..."
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
          />
          <button type="submit" className="btn-primary tiptap-embed__btn" disabled={!inputUrl.trim()}>
            Embed
          </button>
        </form>
      </NodeViewWrapper>
    )
  }

  return (
    <NodeViewWrapper className="tiptap-embed" data-type="signof-embed" contentEditable={false}>
      <iframe
        className="tiptap-embed__iframe"
        src={url}
        title="Embedded content"
        sandbox="allow-scripts allow-same-origin"
        loading="lazy"
      />
    </NodeViewWrapper>
  )
}
