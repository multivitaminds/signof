import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import FileNodeView from '../nodeViews/FileNodeView'

export const OrchestreeFile = Node.create({
  name: 'orchestreeFile',
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
    return [{ tag: 'div[data-type="orchestree-file"]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'orchestree-file' })]
  },

  addNodeView() {
    return ReactNodeViewRenderer(FileNodeView)
  },
})
