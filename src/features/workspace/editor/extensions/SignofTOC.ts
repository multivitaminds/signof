import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import TOCNodeView from '../nodeViews/TOCNodeView'

export const SignofTOC = Node.create({
  name: 'signofTOC',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      blockId: { default: null },
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-type="signof-toc"]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'signof-toc' })]
  },

  addNodeView() {
    return ReactNodeViewRenderer(TOCNodeView)
  },
})
