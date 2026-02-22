import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import EmbedNodeView from '../nodeViews/EmbedNodeView'

export const OriginAEmbed = Node.create({
  name: 'originaEmbed',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      url: { default: '' },
      blockId: { default: null },
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-type="origina-embed"]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'origina-embed' })]
  },

  addNodeView() {
    return ReactNodeViewRenderer(EmbedNodeView)
  },
})
