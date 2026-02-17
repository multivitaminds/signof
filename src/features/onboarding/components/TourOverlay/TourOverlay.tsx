import { useEffect, useState, useCallback } from 'react'
import './TourOverlay.css'

interface TourOverlayProps {
  targetSelector: string
  onClickOutside: () => void
}

interface SpotlightRect {
  top: number
  left: number
  width: number
  height: number
}

const SPOTLIGHT_PADDING = 8

export default function TourOverlay({ targetSelector, onClickOutside }: TourOverlayProps) {
  const [rect, setRect] = useState<SpotlightRect | null>(null)

  const updateRect = useCallback(() => {
    const el = document.querySelector(targetSelector)
    if (el) {
      const r = el.getBoundingClientRect()
      setRect({
        top: r.top - SPOTLIGHT_PADDING,
        left: r.left - SPOTLIGHT_PADDING,
        width: r.width + SPOTLIGHT_PADDING * 2,
        height: r.height + SPOTLIGHT_PADDING * 2,
      })
    } else {
      setRect(null)
    }
  }, [targetSelector])

  useEffect(() => {
    updateRect()

    const observer = new ResizeObserver(updateRect)
    observer.observe(document.body)

    window.addEventListener('scroll', updateRect, true)
    window.addEventListener('resize', updateRect)

    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', updateRect, true)
      window.removeEventListener('resize', updateRect)
    }
  }, [updateRect])

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      // Only dismiss if clicking the dark backdrop, not the spotlight area
      const target = e.target as HTMLElement
      if (target.classList.contains('tour-overlay')) {
        onClickOutside()
      }
    },
    [onClickOutside]
  )

  return (
    <div
      className="tour-overlay"
      onClick={handleOverlayClick}
      aria-hidden="true"
    >
      {rect && (
        <div
          className="tour-overlay__spotlight"
          style={{
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
          }}
        />
      )}
    </div>
  )
}
