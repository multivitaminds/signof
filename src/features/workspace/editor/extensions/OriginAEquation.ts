import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import EquationNodeView from '../nodeViews/EquationNodeView'

export const OriginAEquation = Node.create({
  name: 'originaEquation',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      content: { default: '' },
      blockId: { default: null },
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-type="origina-equation"]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'origina-equation' })]
  },

  addNodeView() {
    return ReactNodeViewRenderer(EquationNodeView)
  },
})
