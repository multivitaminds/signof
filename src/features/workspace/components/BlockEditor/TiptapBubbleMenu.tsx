import { useState, useCallback } from 'react'
import type { Editor } from '@tiptap/react'
import { Bold, Italic, Underline, Strikethrough, Code, Link, Highlighter, Palette } from 'lucide-react'
import './TiptapBubbleMenu.css'

interface TiptapBubbleMenuProps {
  editor: Editor
}

const TEXT_COLORS = [
  { label: 'Default', color: 'inherit' },
  { label: 'Red', color: '#DC2626' },
  { label: 'Orange', color: '#EA580C' },
  { label: 'Yellow', color: '#CA8A04' },
  { label: 'Green', color: '#16A34A' },
  { label: 'Blue', color: '#2563EB' },
  { label: 'Purple', color: '#9333EA' },
  { label: 'Pink', color: '#DB2777' },
  { label: 'Gray', color: '#6B7280' },
]

const HIGHLIGHT_COLORS = [
  { label: 'Default', color: '#FEF08A' },
  { label: 'Red', color: '#FECACA' },
  { label: 'Orange', color: '#FED7AA' },
  { label: 'Green', color: '#BBF7D0' },
  { label: 'Blue', color: '#BFDBFE' },
  { label: 'Purple', color: '#E9D5FF' },
  { label: 'Pink', color: '#FBCFE8' },
  { label: 'Gray', color: '#E5E7EB' },
]

export default function TiptapBubbleMenu({ editor }: TiptapBubbleMenuProps) {
  const [showColorPicker, setShowColorPicker] = useState<'text' | 'highlight' | null>(null)
  const [linkUrl, setLinkUrl] = useState('')
  const [showLinkInput, setShowLinkInput] = useState(false)

  const toggleBold = useCallback(() => editor.chain().focus().toggleBold().run(), [editor])
  const toggleItalic = useCallback(() => editor.chain().focus().toggleItalic().run(), [editor])
  const toggleUnderline = useCallback(() => editor.chain().focus().toggleUnderline().run(), [editor])
  const toggleStrike = useCallback(() => editor.chain().focus().toggleStrike().run(), [editor])
  const toggleCode = useCallback(() => editor.chain().focus().toggleCode().run(), [editor])

  const handleLinkToggle = useCallback(() => {
    if (editor.isActive('link')) {
      editor.chain().focus().unsetLink().run()
    } else {
      setShowLinkInput(true)
      setLinkUrl('')
    }
  }, [editor])

  const handleLinkConfirm = useCallback(() => {
    if (linkUrl.trim()) {
      editor.chain().focus().setLink({ href: linkUrl.trim() }).run()
    }
    setShowLinkInput(false)
    setLinkUrl('')
  }, [editor, linkUrl])

  const handleColorSelect = useCallback(
    (type: 'text' | 'highlight', color: string) => {
      if (type === 'text') {
        if (color === 'inherit') {
          editor.chain().focus().unsetColor().run()
        } else {
          editor.chain().focus().setColor(color).run()
        }
      } else {
        editor.chain().focus().toggleHighlight({ color }).run()
      }
      setShowColorPicker(null)
    },
    [editor]
  )

  if (showLinkInput) {
    return (
      <div className="tiptap-bubble-menu">
        <input
          className="tiptap-bubble-menu__link-input"
          type="url"
          placeholder="Paste URL..."
          value={linkUrl}
          onChange={(e) => setLinkUrl(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleLinkConfirm()
            if (e.key === 'Escape') setShowLinkInput(false)
          }}
          autoFocus
        />
        <button
          className="tiptap-bubble-menu__btn tiptap-bubble-menu__btn--confirm"
          onClick={handleLinkConfirm}
          disabled={!linkUrl.trim()}
        >
          Link
        </button>
      </div>
    )
  }

  return (
    <div className="tiptap-bubble-menu" role="toolbar" aria-label="Text formatting">
      <button
        className={`tiptap-bubble-menu__btn ${editor.isActive('bold') ? 'tiptap-bubble-menu__btn--active' : ''}`}
        onMouseDown={(e) => { e.preventDefault(); toggleBold() }}
        title="Bold (Cmd+B)"
        aria-label="Bold"
        aria-pressed={editor.isActive('bold')}
      >
        <Bold size={14} />
      </button>
      <button
        className={`tiptap-bubble-menu__btn ${editor.isActive('italic') ? 'tiptap-bubble-menu__btn--active' : ''}`}
        onMouseDown={(e) => { e.preventDefault(); toggleItalic() }}
        title="Italic (Cmd+I)"
        aria-label="Italic"
        aria-pressed={editor.isActive('italic')}
      >
        <Italic size={14} />
      </button>
      <button
        className={`tiptap-bubble-menu__btn ${editor.isActive('underline') ? 'tiptap-bubble-menu__btn--active' : ''}`}
        onMouseDown={(e) => { e.preventDefault(); toggleUnderline() }}
        title="Underline (Cmd+U)"
        aria-label="Underline"
        aria-pressed={editor.isActive('underline')}
      >
        <Underline size={14} />
      </button>
      <button
        className={`tiptap-bubble-menu__btn ${editor.isActive('strike') ? 'tiptap-bubble-menu__btn--active' : ''}`}
        onMouseDown={(e) => { e.preventDefault(); toggleStrike() }}
        title="Strikethrough"
        aria-label="Strikethrough"
        aria-pressed={editor.isActive('strike')}
      >
        <Strikethrough size={14} />
      </button>

      <span className="tiptap-bubble-menu__separator" />

      <button
        className={`tiptap-bubble-menu__btn ${editor.isActive('code') ? 'tiptap-bubble-menu__btn--active' : ''}`}
        onMouseDown={(e) => { e.preventDefault(); toggleCode() }}
        title="Code (Cmd+E)"
        aria-label="Code"
        aria-pressed={editor.isActive('code')}
      >
        <Code size={14} />
      </button>
      <button
        className={`tiptap-bubble-menu__btn ${editor.isActive('link') ? 'tiptap-bubble-menu__btn--active' : ''}`}
        onMouseDown={(e) => { e.preventDefault(); handleLinkToggle() }}
        title="Link (Cmd+K)"
        aria-label="Link"
        aria-pressed={editor.isActive('link')}
      >
        <Link size={14} />
      </button>

      <span className="tiptap-bubble-menu__separator" />

      {/* Text Color */}
      <span className="tiptap-bubble-menu__color-wrapper">
        <button
          className={`tiptap-bubble-menu__btn ${editor.isActive('textStyle') ? 'tiptap-bubble-menu__btn--active' : ''}`}
          onMouseDown={(e) => {
            e.preventDefault()
            setShowColorPicker((prev) => (prev === 'text' ? null : 'text'))
          }}
          title="Text color"
          aria-label="Text color"
        >
          <Palette size={14} />
        </button>
        {showColorPicker === 'text' && (
          <div className="tiptap-bubble-menu__color-dropdown" role="menu" aria-label="Text colors">
            <div className="tiptap-bubble-menu__color-label">Text color</div>
            <div className="tiptap-bubble-menu__color-grid">
              {TEXT_COLORS.map((c) => (
                <button
                  key={c.label}
                  className="tiptap-bubble-menu__color-swatch"
                  style={{ color: c.color === 'inherit' ? 'var(--text-primary)' : c.color }}
                  onMouseDown={(e) => { e.preventDefault(); handleColorSelect('text', c.color) }}
                  title={c.label}
                  aria-label={`${c.label} text`}
                >
                  A
                </button>
              ))}
            </div>
          </div>
        )}
      </span>

      {/* Highlight Color */}
      <span className="tiptap-bubble-menu__color-wrapper">
        <button
          className={`tiptap-bubble-menu__btn ${editor.isActive('highlight') ? 'tiptap-bubble-menu__btn--active' : ''}`}
          onMouseDown={(e) => {
            e.preventDefault()
            setShowColorPicker((prev) => (prev === 'highlight' ? null : 'highlight'))
          }}
          title="Highlight"
          aria-label="Highlight"
        >
          <Highlighter size={14} />
        </button>
        {showColorPicker === 'highlight' && (
          <div className="tiptap-bubble-menu__color-dropdown" role="menu" aria-label="Highlight colors">
            <div className="tiptap-bubble-menu__color-label">Background</div>
            <div className="tiptap-bubble-menu__color-grid">
              {HIGHLIGHT_COLORS.map((c) => (
                <button
                  key={c.label}
                  className="tiptap-bubble-menu__color-swatch tiptap-bubble-menu__color-swatch--bg"
                  style={{ backgroundColor: c.color }}
                  onMouseDown={(e) => { e.preventDefault(); handleColorSelect('highlight', c.color) }}
                  title={c.label}
                  aria-label={`${c.label} highlight`}
                >
                  A
                </button>
              ))}
            </div>
          </div>
        )}
      </span>
    </div>
  )
}
