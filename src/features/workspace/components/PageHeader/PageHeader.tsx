import { useState, useCallback, useRef } from 'react'
import { SmilePlus, ImagePlus } from 'lucide-react'
import type { Page } from '../../types'
import { getIconComponent, isEmojiIcon } from '../../../../lib/iconMap'
import EmojiPicker from '../EmojiPicker/EmojiPicker'
import CoverPicker from '../CoverPicker/CoverPicker'
import './PageHeader.css'

interface PageHeaderProps {
  page: Page
  onTitleChange: (title: string) => void
  onIconChange: (icon: string) => void
  onCoverChange?: (coverUrl: string) => void
}

export default function PageHeader({ page, onTitleChange, onIconChange, onCoverChange }: PageHeaderProps) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showCoverPicker, setShowCoverPicker] = useState(false)
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

  const handleCoverSelect = useCallback(
    (coverUrl: string) => {
      onCoverChange?.(coverUrl)
      setShowCoverPicker(false)
    },
    [onCoverChange]
  )

  const handleCoverRemove = useCallback(() => {
    onCoverChange?.('')
    setShowCoverPicker(false)
  }, [onCoverChange])

  const coverStyle = page.coverUrl
    ? page.coverUrl.startsWith('gradient:')
      ? { background: page.coverUrl.slice('gradient:'.length) }
      : { backgroundImage: `url(${page.coverUrl})` }
    : undefined

  return (
    <div className="page-header">
      {/* Cover */}
      {page.coverUrl ? (
        <div className="page-header__cover" style={coverStyle}>
          {onCoverChange && (
            <div className="page-header__cover-actions">
              <button
                className="page-header__cover-btn btn-secondary"
                onClick={() => setShowCoverPicker(!showCoverPicker)}
              >
                Change cover
              </button>
            </div>
          )}
          {showCoverPicker && (
            <CoverPicker
              currentCover={page.coverUrl}
              onSelect={handleCoverSelect}
              onRemove={handleCoverRemove}
              onClose={() => setShowCoverPicker(false)}
            />
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
          <div style={{ position: 'relative' }}>
            <button
              className="page-header__action-btn"
              onClick={() => setShowCoverPicker(!showCoverPicker)}
            >
              <ImagePlus size={16} />
              <span>Add cover</span>
            </button>
            {showCoverPicker && (
              <CoverPicker
                currentCover={page.coverUrl}
                onSelect={handleCoverSelect}
                onRemove={handleCoverRemove}
                onClose={() => setShowCoverPicker(false)}
              />
            )}
          </div>
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
            {isEmojiIcon(page.icon)
              ? page.icon
              : (() => {
                  const IC = getIconComponent(page.icon)
                  return IC ? <IC size={28} /> : page.icon
                })()}
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
