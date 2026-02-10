import { useCallback, useRef } from 'react'
import { ImageIcon } from 'lucide-react'
import EditableContent from '../EditableContent/EditableContent'
import type { BlockComponentProps } from './types'

export default function ImageBlock({
  block,
  onContentChange,
  onEnter,
  onBackspace,
  onArrowUp,
  onArrowDown,
  onSlash,
  onSelectionChange,
  autoFocus,
}: BlockComponentProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageUrl = block.properties.imageUrl

  const handleClick = useCallback(() => {
    if (!imageUrl) {
      fileInputRef.current?.click()
    }
  }, [imageUrl])

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = () => {
        // Store as data URL in content for now
        // In a real app, this would upload to a server
        onContentChange(reader.result as string)
      }
      reader.readAsDataURL(file)
    },
    [onContentChange]
  )

  if (!imageUrl) {
    return (
      <div className="block-image__placeholder" onClick={handleClick} role="button" tabIndex={0}>
        <ImageIcon size={24} />
        <span>Click to add an image</span>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
      </div>
    )
  }

  return (
    <div className="block-image">
      <img src={imageUrl} alt={block.properties.caption ?? ''} className="block-image__img" />
      <div className="block-image__caption">
        <EditableContent
          content={block.properties.caption ?? ''}
          marks={[]}
          placeholder="Add a caption..."
          onContentChange={onContentChange}
          onEnter={onEnter}
          onBackspace={onBackspace}
          onArrowUp={onArrowUp}
          onArrowDown={onArrowDown}
          onSlash={onSlash}
          onSelectionChange={onSelectionChange}
          autoFocus={autoFocus}
        />
      </div>
    </div>
  )
}
