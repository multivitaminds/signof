import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import TOCNodeView from '../nodeViews/TOCNodeView'

export const OrchestreeTOC = Node.create({
  name: 'orchestreeTOC',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      blockId: { default: null },
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-type="orchestree-toc"]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'orchestree-toc' })]
  },

  addNodeView() {
    return ReactNodeViewRenderer(TOCNodeView)
  },
})
