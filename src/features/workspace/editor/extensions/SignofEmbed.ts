import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import EmbedNodeView from '../nodeViews/EmbedNodeView'

export const SignofEmbed = Node.create({
  name: 'signofEmbed',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      url: { default: '' },
      blockId: { default: null },
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-type="signof-embed"]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'signof-embed' })]
  },

  addNodeView() {
    return ReactNodeViewRenderer(EmbedNodeView)
  },
})
