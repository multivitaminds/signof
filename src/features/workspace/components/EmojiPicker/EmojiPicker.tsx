import { useState, useEffect, useRef } from 'react'
import './EmojiPicker.css'

interface EmojiPickerProps {
  onSelect: (emoji: string) => void
  onClose: () => void
}

const EMOJI_CATEGORIES = {
  Documents: ['📄', '📝', '📋', '📎', '📌', '📁', '📂', '🗂️', '📑', '📃'],
  Objects: ['🚀', '💡', '🎯', '⚡', '🔑', '🔧', '🔨', '🛠️', '💻', '📱'],
  Nature: ['🌟', '🌈', '🌻', '🌿', '🍀', '🔥', '💧', '🌊', '⭐', '🌙'],
  Symbols: ['✅', '❌', '⚠️', '💬', '📊', '📈', '🏷️', '🎨', '🎵', '❤️'],
  People: ['👋', '👍', '👏', '🤝', '💪', '🧠', '👀', '🎉', '🤔', '😊'],
} as const

type Category = keyof typeof EMOJI_CATEGORIES

export default function EmojiPicker({ onSelect, onClose }: EmojiPickerProps) {
  const [activeCategory, setActiveCategory] = useState<Category>('Documents')
  const pickerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [onClose])

  return (
    <div ref={pickerRef} className="emoji-picker" role="dialog" aria-label="Choose an emoji">
      <div className="emoji-picker__tabs">
        {(Object.keys(EMOJI_CATEGORIES) as Category[]).map((cat) => (
          <button
            key={cat}
            className={`emoji-picker__tab ${activeCategory === cat ? 'emoji-picker__tab--active' : ''}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>
      <div className="emoji-picker__grid">
        {EMOJI_CATEGORIES[activeCategory].map((emoji) => (
          <button
            key={emoji}
            className="emoji-picker__item"
            onClick={() => onSelect(emoji)}
            aria-label={emoji}
          >
            {emoji}
          </button>
        ))}
      </div>
      <button
        className="emoji-picker__remove"
        onClick={() => onSelect('')}
      >
        Remove icon
      </button>
    </div>
  )
}
