import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import FileNodeView from '../nodeViews/FileNodeView'

export const OriginAFile = Node.create({
  name: 'originaFile',
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
    return [{ tag: 'div[data-type="origina-file"]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'origina-file' })]
  },

  addNodeView() {
    return ReactNodeViewRenderer(FileNodeView)
  },
})
