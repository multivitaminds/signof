import { Link, useLocation } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import type { BreadcrumbSegment } from '../../types'
import { useWorkspaceStore } from '../../features/workspace/stores/useWorkspaceStore'
import './Breadcrumbs.css'

const ROUTE_LABELS: Record<string, string> = {
  '': 'Home',
  pages: 'Pages',
  projects: 'Projects',
  documents: 'Documents',
  calendar: 'Calendar',
  data: 'Databases',
  inbox: 'Inbox',
  ai: 'AI',
  settings: 'Settings',
  memory: 'Memory',
  agents: 'Agent Teams',
}

function buildBreadcrumbs(pathname: string): BreadcrumbSegment[] {
  const segments = pathname.split('/').filter(Boolean)
  const crumbs: BreadcrumbSegment[] = [{ label: 'Home', path: '/' }]

  let currentPath = ''
  for (const segment of segments) {
    currentPath += `/${segment}`
    const label = ROUTE_LABELS[segment] ?? segment
    crumbs.push({ label, path: currentPath })
  }

  return crumbs
}

export default function Breadcrumbs() {
  const location = useLocation()
  const pages = useWorkspaceStore((s) => s.pages)
  const crumbs = buildBreadcrumbs(location.pathname)

  // Resolve page IDs to titles
  const resolvedCrumbs = crumbs.map((crumb) => {
    const segments = crumb.path.split('/')
    const lastSegment = segments[segments.length - 1]
    if (segments.includes('pages') && lastSegment && lastSegment !== 'pages' && lastSegment !== 'new') {
      const page = pages[lastSegment]
      if (page) {
        return { ...crumb, label: page.title || 'Untitled' }
      }
    }
    return crumb
  })

  return (
    <nav className="breadcrumbs" aria-label="Breadcrumbs">
      <ol className="breadcrumbs__list">
        {resolvedCrumbs.map((crumb, index) => {
          const isLast = index === resolvedCrumbs.length - 1

          return (
            <li key={crumb.path} className="breadcrumbs__item">
              {index > 0 && (
                <ChevronRight
                  className="breadcrumbs__separator"
                  size={14}
                  aria-hidden="true"
                />
              )}
              {isLast ? (
                <span className="breadcrumbs__current" aria-current="page">
                  {crumb.label}
                </span>
              ) : (
                <Link className="breadcrumbs__link" to={crumb.path}>
                  {crumb.label}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
