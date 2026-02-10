import { useState, useCallback, useEffect, useRef } from 'react'
import './CoverPicker.css'

const PRESET_COVERS = [
  { id: 'gradient-blue', label: 'Blue', style: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { id: 'gradient-green', label: 'Green', style: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' },
  { id: 'gradient-orange', label: 'Orange', style: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
  { id: 'gradient-purple', label: 'Purple', style: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
  { id: 'gradient-red', label: 'Red', style: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
  { id: 'gradient-teal', label: 'Teal', style: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' },
  { id: 'gradient-dark', label: 'Dark', style: 'linear-gradient(135deg, #0c0c0c 0%, #1a1a2e 100%)' },
  { id: 'gradient-warm', label: 'Warm', style: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)' },
]

interface CoverPickerProps {
  currentCover?: string
  onSelect: (coverUrl: string) => void
  onRemove: () => void
  onClose: () => void
}

export default function CoverPicker({ currentCover, onSelect, onRemove, onClose }: CoverPickerProps) {
  const [urlInput, setUrlInput] = useState('')
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  const handleUrlSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      if (urlInput.trim()) {
        onSelect(urlInput.trim())
      }
    },
    [urlInput, onSelect]
  )

  return (
    <div ref={ref} className="cover-picker">
      <div className="cover-picker__header">
        <span className="cover-picker__title">Cover image</span>
      </div>

      <div className="cover-picker__presets">
        {PRESET_COVERS.map((cover) => (
          <button
            key={cover.id}
            className="cover-picker__preset"
            style={{ background: cover.style }}
            onClick={() => onSelect(`gradient:${cover.style}`)}
            title={cover.label}
            aria-label={`${cover.label} cover`}
          />
        ))}
      </div>

      <form onSubmit={handleUrlSubmit} className="cover-picker__url-form">
        <input
          type="url"
          className="cover-picker__url-input"
          placeholder="Paste image URL..."
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
        />
        <button type="submit" className="cover-picker__url-btn btn-primary" disabled={!urlInput.trim()}>
          Add
        </button>
      </form>

      {currentCover && (
        <button className="cover-picker__remove" onClick={onRemove}>
          Remove cover
        </button>
      )}
    </div>
  )
}
