import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import EquationNodeView from '../nodeViews/EquationNodeView'

export const SignofEquation = Node.create({
  name: 'signofEquation',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      content: { default: '' },
      blockId: { default: null },
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-type="signof-equation"]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'signof-equation' })]
  },

  addNodeView() {
    return ReactNodeViewRenderer(EquationNodeView)
  },
})
