import { useCallback, useRef } from 'react'
import { NodeViewWrapper } from '@tiptap/react'
import type { NodeViewProps } from '@tiptap/react'
import './FileNodeView.css'

export default function FileNodeView({ node, updateAttributes }: NodeViewProps) {
  const fileName = (node.attrs.fileName as string) ?? ''
  const fileDataUrl = (node.attrs.fileDataUrl as string) ?? ''
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = () => {
        updateAttributes({
          fileName: file.name,
          fileDataUrl: reader.result as string,
        })
      }
      reader.readAsDataURL(file)
    },
    [updateAttributes]
  )

  const handleClick = useCallback(() => {
    if (!fileName) {
      fileInputRef.current?.click()
    }
  }, [fileName])

  if (!fileName) {
    return (
      <NodeViewWrapper className="tiptap-file" data-type="orchestree-file" contentEditable={false}>
        <div className="tiptap-file__placeholder" onClick={handleClick} role="button" tabIndex={0}>
          <span className="tiptap-file__icon">📎</span>
          <span>Click to upload a file</span>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
        </div>
      </NodeViewWrapper>
    )
  }

  return (
    <NodeViewWrapper className="tiptap-file" data-type="orchestree-file" contentEditable={false}>
      <div className="tiptap-file__info">
        <span className="tiptap-file__icon">📎</span>
        <span className="tiptap-file__name">{fileName}</span>
        {fileDataUrl && (
          <a
            className="tiptap-file__download"
            href={fileDataUrl}
            download={fileName}
          >
            Download
          </a>
        )}
      </div>
    </NodeViewWrapper>
  )
}
