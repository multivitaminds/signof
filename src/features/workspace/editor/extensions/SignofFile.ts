import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import FileNodeView from '../nodeViews/FileNodeView'

export const SignofFile = Node.create({
  name: 'signofFile',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      fileName: { default: '' },
      fileDataUrl: { default: '' },
      blockId: { default: null },
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-type="signof-file"]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'signof-file' })]
  },

  addNodeView() {
    return ReactNodeViewRenderer(FileNodeView)
  },
})
