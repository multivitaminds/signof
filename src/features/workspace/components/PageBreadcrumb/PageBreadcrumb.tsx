import { useMemo, useCallback } from 'react'
import { ChevronRight, Home } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useWorkspaceStore } from '../../stores/useWorkspaceStore'
import { getIconComponent, isEmojiIcon } from '../../../../lib/iconMap'
import './PageBreadcrumb.css'

interface PageBreadcrumbProps {
  pageId: string
}

export default function PageBreadcrumb({ pageId }: PageBreadcrumbProps) {
  const navigate = useNavigate()
  const getPageBreadcrumbs = useWorkspaceStore((s) => s.getPageBreadcrumbs)

  const crumbs = useMemo(() => getPageBreadcrumbs(pageId), [getPageBreadcrumbs, pageId])

  const handleNavigate = useCallback(
    (targetPageId: string) => {
      navigate(`/pages/${targetPageId}`)
    },
    [navigate]
  )

  const handleWorkspaceClick = useCallback(() => {
    navigate('/pages')
  }, [navigate])

  if (crumbs.length === 0) return null

  return (
    <nav className="page-breadcrumb" aria-label="Page breadcrumb">
      <ol className="page-breadcrumb__list">
        {/* Workspace root */}
        <li className="page-breadcrumb__item">
          <button
            className="page-breadcrumb__link"
            onClick={handleWorkspaceClick}
            aria-label="Workspace"
          >
            <Home size={14} />
            <span className="page-breadcrumb__text">Workspace</span>
          </button>
        </li>

        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1

          return (
            <li key={crumb.id} className="page-breadcrumb__item">
              <ChevronRight size={12} className="page-breadcrumb__separator" aria-hidden="true" />
              {isLast ? (
                <span className="page-breadcrumb__current" aria-current="page">
                  {crumb.icon && <span className="page-breadcrumb__icon">{(() => {
                    if (isEmojiIcon(crumb.icon)) return crumb.icon
                    const IC = getIconComponent(crumb.icon)
                    return IC ? <IC size={14} /> : crumb.icon
                  })()}</span>}
                  <span className="page-breadcrumb__text page-breadcrumb__text--current">
                    {crumb.title || 'Untitled'}
                  </span>
                </span>
              ) : (
                <button
                  className="page-breadcrumb__link"
                  onClick={() => handleNavigate(crumb.id)}
                >
                  {crumb.icon && <span className="page-breadcrumb__icon">{(() => {
                    if (isEmojiIcon(crumb.icon)) return crumb.icon
                    const IC = getIconComponent(crumb.icon)
                    return IC ? <IC size={14} /> : crumb.icon
                  })()}</span>}
                  <span className="page-breadcrumb__text">
                    {crumb.title || 'Untitled'}
                  </span>
                </button>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
