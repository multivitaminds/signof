import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import EquationNodeView from '../nodeViews/EquationNodeView'

export const OrchestreeEquation = Node.create({
  name: 'orchestreeEquation',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      content: { default: '' },
      blockId: { default: null },
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-type="orchestree-equation"]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'orchestree-equation' })]
  },

  addNodeView() {
    return ReactNodeViewRenderer(EquationNodeView)
  },
})
