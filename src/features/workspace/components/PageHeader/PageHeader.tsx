import { useState, useCallback, useRef } from 'react'
import { SmilePlus, ImagePlus } from 'lucide-react'
import type { Page } from '../../types'
import EmojiPicker from '../EmojiPicker/EmojiPicker'
import './PageHeader.css'

interface PageHeaderProps {
  page: Page
  onTitleChange: (title: string) => void
  onIconChange: (icon: string) => void
  onCoverChange?: (coverUrl: string) => void
}

export default function PageHeader({ page, onTitleChange, onIconChange, onCoverChange }: PageHeaderProps) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const titleRef = useRef<HTMLHeadingElement>(null)

  const handleTitleInput = useCallback(() => {
    if (titleRef.current) {
      onTitleChange(titleRef.current.textContent ?? '')
    }
  }, [onTitleChange])

  const handleTitleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      titleRef.current?.blur()
    }
  }, [])

  const handleIconClick = useCallback(() => {
    setShowEmojiPicker((prev) => !prev)
  }, [])

  const handleEmojiSelect = useCallback(
    (emoji: string) => {
      onIconChange(emoji)
      setShowEmojiPicker(false)
    },
    [onIconChange]
  )

  const handleCoverClick = useCallback(() => {
    // Simple cover URL prompt for now
    if (!onCoverChange) return
    const url = prompt('Enter image URL for cover:')
    if (url) {
      onCoverChange(url)
    }
  }, [onCoverChange])

  return (
    <div className="page-header">
      {/* Cover */}
      {page.coverUrl ? (
        <div
          className="page-header__cover"
          style={{ backgroundImage: `url(${page.coverUrl})` }}
        >
          {onCoverChange && (
            <button className="page-header__cover-btn btn-secondary" onClick={handleCoverClick}>
              Change cover
            </button>
          )}
        </div>
      ) : null}

      {/* Actions (visible on hover) */}
      <div className="page-header__actions">
        {!page.icon && (
          <button className="page-header__action-btn" onClick={handleIconClick}>
            <SmilePlus size={16} />
            <span>Add icon</span>
          </button>
        )}
        {!page.coverUrl && onCoverChange && (
          <button className="page-header__action-btn" onClick={handleCoverClick}>
            <ImagePlus size={16} />
            <span>Add cover</span>
          </button>
        )}
      </div>

      {/* Icon */}
      {page.icon && (
        <div className="page-header__icon-wrapper">
          <button
            className="page-header__icon"
            onClick={handleIconClick}
            aria-label="Change icon"
          >
            {page.icon}
          </button>
        </div>
      )}

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <EmojiPicker
          onSelect={handleEmojiSelect}
          onClose={() => setShowEmojiPicker(false)}
        />
      )}

      {/* Title */}
      <h1
        ref={titleRef}
        className="page-header__title"
        contentEditable
        suppressContentEditableWarning
        data-placeholder="Untitled"
        onInput={handleTitleInput}
        onKeyDown={handleTitleKeyDown}
        spellCheck
      >
        {page.title}
      </h1>
    </div>
  )
}
