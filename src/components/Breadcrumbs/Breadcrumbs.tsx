import { Link, useLocation } from 'react-router-dom'
import { ChevronRight, MoreHorizontal } from 'lucide-react'
import type { BreadcrumbSegment } from '../../types'
import { useWorkspaceStore } from '../../features/workspace/stores/useWorkspaceStore'
import { useProjectStore } from '../../features/projects/stores/useProjectStore'
import { useDocumentStore } from '../../stores/useDocumentStore'
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
  new: 'New',
  bookings: 'Bookings',
  members: 'Members',
  tax: 'Tax',
  developer: 'Developer',
}

/** Max visible segments (including Home). Beyond this, middle ones collapse. */
const MAX_VISIBLE = 4

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
  const projectsMap = useProjectStore((s) => s.projects)
  const documents = useDocumentStore((s) => s.documents)
  const crumbs = buildBreadcrumbs(location.pathname)

  // Resolve IDs to human-readable titles
  const resolvedCrumbs = crumbs.map((crumb) => {
    const segments = crumb.path.split('/')
    const lastSegment = segments[segments.length - 1]
    if (
      segments.includes('pages') &&
      lastSegment &&
      lastSegment !== 'pages' &&
      lastSegment !== 'new'
    ) {
      const page = pages[lastSegment]
      if (page) {
        return { ...crumb, label: page.title || 'Untitled' }
      }
    }
    if (
      segments.includes('projects') &&
      lastSegment &&
      lastSegment !== 'projects' &&
      lastSegment !== 'new'
    ) {
      const project = projectsMap[lastSegment]
      if (project) {
        return { ...crumb, label: project.name }
      }
    }
    if (
      segments.includes('documents') &&
      lastSegment &&
      lastSegment !== 'documents' &&
      lastSegment !== 'new'
    ) {
      const doc = documents.find((d) => d.id === lastSegment)
      if (doc) {
        return { ...crumb, label: doc.name }
      }
    }
    return crumb
  })

  // Determine which crumbs to show, collapsing middle ones if too many
  const shouldCollapse = resolvedCrumbs.length > MAX_VISIBLE
  const visibleCrumbs = shouldCollapse
    ? [
        resolvedCrumbs[0]!,
        ...resolvedCrumbs.slice(-Math.max(MAX_VISIBLE - 1, 1)),
      ]
    : resolvedCrumbs

  return (
    <nav className="breadcrumbs" aria-label="Breadcrumbs">
      <ol className="breadcrumbs__list">
        {visibleCrumbs.map((crumb, index) => {
          const isLast = index === visibleCrumbs.length - 1

          // If we collapsed, insert "..." after first item
          const showEllipsis = shouldCollapse && index === 1

          return (
            <li key={crumb.path} className="breadcrumbs__item">
              {showEllipsis && (
                <>
                  <ChevronRight
                    className="breadcrumbs__separator"
                    size={14}
                    aria-hidden="true"
                  />
                  <span
                    className="breadcrumbs__ellipsis"
                    aria-label="Collapsed breadcrumbs"
                  >
                    <MoreHorizontal size={14} />
                  </span>
                </>
              )}
              {index > 0 && (
                <ChevronRight
                  className="breadcrumbs__separator"
                  size={14}
                  aria-hidden="true"
                />
              )}
              {isLast ? (
                <span
                  className="breadcrumbs__current"
                  aria-current="page"
                  title={crumb.label}
                >
                  {crumb.label}
                </span>
              ) : (
                <Link
                  className="breadcrumbs__link"
                  to={crumb.path}
                  title={crumb.label}
                >
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
