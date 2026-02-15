import { useCallback } from 'react'
import { Circle, CheckCircle, Loader, SkipForward } from 'lucide-react'
import type { InterviewSection, InterviewSectionId } from '../../types'
import { InterviewSectionStatus } from '../../types'
import './SectionNavSidebar.css'

interface SectionNavSidebarProps {
  sections: InterviewSection[]
  currentSectionId: InterviewSectionId
  onSectionClick: (sectionId: InterviewSectionId) => void
}

const STATUS_ICONS: Record<string, React.ReactNode> = {
  [InterviewSectionStatus.NotStarted]: <Circle size={18} />,
  [InterviewSectionStatus.InProgress]: <Loader size={18} className="section-nav-sidebar__spinner" />,
  [InterviewSectionStatus.Completed]: <CheckCircle size={18} />,
  [InterviewSectionStatus.Skipped]: <SkipForward size={18} />,
}

function SectionNavSidebar({ sections, currentSectionId, onSectionClick }: SectionNavSidebarProps) {
  const handleClick = useCallback(
    (sectionId: InterviewSectionId) => {
      onSectionClick(sectionId)
    },
    [onSectionClick]
  )

  return (
    <nav className="section-nav-sidebar" aria-label="Interview sections">
      <ul className="section-nav-sidebar__list">
        {sections.map((section) => {
          const isCurrent = section.id === currentSectionId
          const statusClass = `section-nav-sidebar__item--${section.status}`

          return (
            <li key={section.id}>
              <button
                type="button"
                className={`section-nav-sidebar__item ${statusClass}${isCurrent ? ' section-nav-sidebar__item--current' : ''}`}
                onClick={() => handleClick(section.id)}
                aria-current={isCurrent ? 'step' : undefined}
              >
                <span className="section-nav-sidebar__icon">
                  {STATUS_ICONS[section.status]}
                </span>
                <span className="section-nav-sidebar__text">
                  <span className="section-nav-sidebar__title">{section.title}</span>
                  <span className="section-nav-sidebar__desc">{section.description}</span>
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

export default SectionNavSidebar
