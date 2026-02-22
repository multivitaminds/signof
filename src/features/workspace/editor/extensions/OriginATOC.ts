import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import TOCNodeView from '../nodeViews/TOCNodeView'

export const OriginATOC = Node.create({
  name: 'originaTOC',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      blockId: { default: null },
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-type="origina-toc"]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'origina-toc' })]
  },

  addNodeView() {
    return ReactNodeViewRenderer(TOCNodeView)
  },
})
