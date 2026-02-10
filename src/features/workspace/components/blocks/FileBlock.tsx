import { useCallback, useRef } from 'react'
import { useWorkspaceStore } from '../../stores/useWorkspaceStore'
import type { Block } from '../../types'
import './FileBlock.css'

interface FileBlockProps {
  block: Block
}

export default function FileBlock({
  block,
}: FileBlockProps) {
  const fileName = block.properties.fileName ?? ''
  const fileDataUrl = block.properties.fileDataUrl ?? ''
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleClick = useCallback(() => {
    if (!fileName) {
      fileInputRef.current?.click()
    }
  }, [fileName])

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = () => {
        useWorkspaceStore.setState((state) => {
          const existing = state.blocks[block.id]
          if (!existing) return state
          return {
            blocks: {
              ...state.blocks,
              [block.id]: {
                ...existing,
                properties: {
                  ...existing.properties,
                  fileName: file.name,
                  fileDataUrl: reader.result as string,
                },
              },
            },
          }
        })
      }
      reader.readAsDataURL(file)
    },
    [block.id]
  )

  if (!fileName) {
    return (
      <div
        className="block-file block-file--empty"
        onClick={handleClick}
        role="button"
        tabIndex={0}
        aria-label="Upload a file"
      >
        <span className="block-file__icon" aria-hidden="true">📎</span>
        <span className="block-file__placeholder">Click to upload a file</span>
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
      </div>
    )
  }

  return (
    <div className="block-file">
      <div className="block-file__card">
        <span className="block-file__icon" aria-hidden="true">📄</span>
        <span className="block-file__name">{fileName}</span>
        {fileDataUrl && (
          <a
            className="block-file__download"
            href={fileDataUrl}
            download={fileName}
            aria-label={`Download ${fileName}`}
          >
            Download
          </a>
        )}
      </div>
    </div>
  )
}
