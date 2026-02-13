import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import EmbedNodeView from '../nodeViews/EmbedNodeView'

export const OrchestreeEmbed = Node.create({
  name: 'orchestreeEmbed',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      url: { default: '' },
      blockId: { default: null },
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-type="orchestree-embed"]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'orchestree-embed' })]
  },

  addNodeView() {
    return ReactNodeViewRenderer(EmbedNodeView)
  },
})
