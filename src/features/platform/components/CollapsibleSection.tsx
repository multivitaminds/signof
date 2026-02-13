import { useState, useCallback } from 'react'
import { ChevronRight } from 'lucide-react'
import './CollapsibleSection.css'

interface CollapsibleSectionProps {
  title: string
  subtitle?: string
  badge?: string | number
  defaultOpen?: boolean
  children: React.ReactNode
}

function CollapsibleSection({
  title,
  subtitle,
  badge,
  defaultOpen = false,
  children,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  const handleToggle = useCallback(() => {
    setIsOpen(prev => !prev)
  }, [])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        setIsOpen(prev => !prev)
      }
    },
    []
  )

  return (
    <div className="collapsible-section">
      <div
        className="collapsible-section__header"
        role="button"
        tabIndex={0}
        aria-expanded={isOpen}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
      >
        <ChevronRight
          size={16}
          className={`collapsible-section__chevron${isOpen ? ' collapsible-section__chevron--open' : ''}`}
        />
        <span className="collapsible-section__title">{title}</span>
        {subtitle && (
          <span className="collapsible-section__subtitle">{subtitle}</span>
        )}
        {badge !== undefined && (
          <span className="collapsible-section__badge">{badge}</span>
        )}
      </div>
      {isOpen && <div className="collapsible-section__body">{children}</div>}
    </div>
  )
}

export default CollapsibleSection
