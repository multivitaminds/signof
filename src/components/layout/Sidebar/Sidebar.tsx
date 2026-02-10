import { useState, useCallback, useRef, useMemo } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
  Home,
  FileText,
  FolderKanban,
  FileSignature,
  Calendar,
  Database,
  Inbox,
  Brain,
  Settings,
  ChevronLeft,
  ChevronRight,
  Search,
  Plus,
  X,
  File,
  FolderPlus,
  Upload,
  CalendarPlus,
  Table,
  Receipt,
  Code2,
} from 'lucide-react'
import { useAppStore } from '../../../stores/useAppStore'
import { useDocumentStore } from '../../../stores/useDocumentStore'
import { useWorkspaceStore } from '../../../features/workspace/stores/useWorkspaceStore'
import { useProjectStore } from '../../../features/projects/stores/useProjectStore'
import { useInboxStore } from '../../../features/inbox/stores/useInboxStore'
import PageTree from '../../../features/workspace/components/PageTree/PageTree'
import { ACTIVE_STATUSES } from '../../../types'
import './Sidebar.css'

interface NavItem {
  path: string
  label: string
  icon: React.ComponentType<{ size?: number; className?: string }>
  badge?: number
}

const NEW_MENU_ITEMS = [
  { id: 'page', label: 'New Page', icon: File, path: '/pages/new' },
  { id: 'project', label: 'New Project', icon: FolderPlus, path: '/projects/new' },
  { id: 'document', label: 'New Document', icon: Upload, path: '/documents?action=upload' },
  { id: 'event', label: 'New Event', icon: CalendarPlus, path: '/calendar/new' },
  { id: 'database', label: 'New Database', icon: Table, path: '/data/new' },
  { id: 'filing', label: 'New Tax Filing', icon: Receipt, path: '/tax/filing' },
]

export default function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const {
    sidebarExpanded,
    sidebarWidth,
    toggleSidebar,
    setSidebarWidth,
    openCommandPalette,
    mobileSidebarOpen,
    closeMobileSidebar,
    favorites,
    removeFavorite,
    reorderFavorites,
  } = useAppStore()

  const documents = useDocumentStore((s) => s.documents)
  const pendingCount = documents.filter((d) =>
    (ACTIVE_STATUSES as string[]).includes(d.status)
  ).length

  const pagesMap = useWorkspaceStore((s) => s.pages)
  const workspacePages = useMemo(() => Object.values(pagesMap), [pagesMap])

  const openIssueCount = useProjectStore((s) => {
    const issues = Object.values(s.issues)
    return issues.filter((i) => i.status !== 'done' && i.status !== 'cancelled').length
  })

  const inboxNotifications = useInboxStore((s) => s.notifications)
  const unreadCount = useMemo(
    () => inboxNotifications.filter((n) => !n.read).length,
    [inboxNotifications]
  )

  const [newMenuOpen, setNewMenuOpen] = useState(false)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const dragIndexRef = useRef<number | null>(null)
  const resizingRef = useRef(false)
  const newMenuRef = useRef<HTMLDivElement>(null)

  const NAV_ITEMS: NavItem[] = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/pages', label: 'Pages', icon: FileText },
    { path: '/projects', label: 'Projects', icon: FolderKanban, badge: openIssueCount || undefined },
    { path: '/documents', label: 'Documents', icon: FileSignature, badge: pendingCount || undefined },
    { path: '/calendar', label: 'Calendar', icon: Calendar },
    { path: '/data', label: 'Databases', icon: Database },
    { path: '/inbox', label: 'Inbox', icon: Inbox, badge: unreadCount || undefined },
    { path: '/ai', label: 'AI', icon: Brain },
    { path: '/tax', label: 'Tax', icon: Receipt },
    { path: '/developer', label: 'Developer', icon: Code2 },
  ]

  const handleSearchClick = useCallback(() => {
    openCommandPalette()
  }, [openCommandPalette])

  const handleNavClick = useCallback(() => {
    closeMobileSidebar()
  }, [closeMobileSidebar])

  // New menu
  const toggleNewMenu = useCallback(() => {
    setNewMenuOpen((prev) => !prev)
  }, [])

  const handleNewMenuSelect = useCallback(
    (path: string) => {
      navigate(path)
      setNewMenuOpen(false)
      closeMobileSidebar()
    },
    [navigate, closeMobileSidebar]
  )

  // Close new menu on outside click
  const handleNewMenuBlur = useCallback((e: React.FocusEvent) => {
    if (!newMenuRef.current?.contains(e.relatedTarget as Node)) {
      setNewMenuOpen(false)
    }
  }, [])

  // Drag and drop for favorites
  const handleDragStart = useCallback((index: number) => {
    dragIndexRef.current = index
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault()
    setDragOverIndex(index)
  }, [])

  const handleDrop = useCallback(
    (index: number) => {
      if (dragIndexRef.current !== null && dragIndexRef.current !== index) {
        reorderFavorites(dragIndexRef.current, index)
      }
      dragIndexRef.current = null
      setDragOverIndex(null)
    },
    [reorderFavorites]
  )

  const handleDragEnd = useCallback(() => {
    dragIndexRef.current = null
    setDragOverIndex(null)
  }, [])

  // Resize handle
  const handleResizeStart = useCallback(
    (e: React.MouseEvent) => {
      if (!sidebarExpanded) return
      e.preventDefault()
      resizingRef.current = true

      const handleMouseMove = (moveEvent: MouseEvent) => {
        if (!resizingRef.current) return
        const newWidth = Math.min(320, Math.max(180, moveEvent.clientX))
        setSidebarWidth(newWidth)
      }

      const handleMouseUp = () => {
        resizingRef.current = false
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
        document.body.style.cursor = ''
        document.body.style.userSelect = ''
      }

      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    },
    [sidebarExpanded, setSidebarWidth]
  )

  const mobileClass = mobileSidebarOpen ? ' sidebar--mobile-open' : ''
  const expandedWidth = sidebarExpanded ? `${sidebarWidth}px` : undefined

  return (
    <aside
      className={`sidebar ${sidebarExpanded ? 'sidebar--expanded' : 'sidebar--collapsed'}${mobileClass}`}
      style={sidebarExpanded ? { width: expandedWidth } : undefined}
    >
      {/* Header */}
      <div className="sidebar__header">
        {sidebarExpanded ? (
          <div className="sidebar__brand">
            <span className="sidebar__logo">SignOf</span>
            <span className="sidebar__logo-check">&#10003;</span>
          </div>
        ) : (
          <div className="sidebar__brand-collapsed">
            <span className="sidebar__logo-mini">S&#10003;</span>
          </div>
        )}
        <button
          className="sidebar__toggle"
          onClick={toggleSidebar}
          aria-label={sidebarExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          {sidebarExpanded ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        </button>
      </div>

      {/* Search */}
      <div className="sidebar__search">
        <button
          className="sidebar__search-btn"
          onClick={handleSearchClick}
          aria-label="Search or run command"
        >
          <Search size={18} />
          {sidebarExpanded && (
            <>
              <span className="sidebar__search-text">Search</span>
              <kbd className="sidebar__search-kbd">&#8984;K</kbd>
            </>
          )}
        </button>
      </div>

      {/* Quick Actions */}
      {sidebarExpanded && (
        <div className="sidebar__actions" ref={newMenuRef} onBlur={handleNewMenuBlur}>
          <button className="sidebar__action-btn" onClick={toggleNewMenu} aria-label="Create new">
            <Plus size={16} />
            <span>New</span>
          </button>
          {newMenuOpen && (
            <div className="sidebar__new-menu" role="menu">
              {NEW_MENU_ITEMS.map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.id}
                    className="sidebar__new-menu-item"
                    role="menuitem"
                    onClick={() => handleNewMenuSelect(item.path)}
                  >
                    <Icon size={16} />
                    <span>{item.label}</span>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Favorites */}
      {sidebarExpanded && favorites.length > 0 && (
        <div className="sidebar__favorites">
          <div className="sidebar__section-label">Favorites</div>
          <ul className="sidebar__nav-list">
            {favorites.map((fav, index) => (
              <li
                key={fav.id}
                className={`sidebar__nav-item sidebar__favorite-item ${dragOverIndex === index ? 'sidebar__favorite-item--drag-over' : ''}`}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={() => handleDrop(index)}
                onDragEnd={handleDragEnd}
              >
                <NavLink
                  to={fav.path}
                  className={`sidebar__nav-link ${location.pathname === fav.path ? 'sidebar__nav-link--active' : ''}`}
                  onClick={handleNavClick}
                >
                  <FileText size={20} className="sidebar__nav-icon" />
                  <span className="sidebar__nav-label">{fav.label}</span>
                </NavLink>
                <button
                  className="sidebar__favorite-remove"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    removeFavorite(fav.id)
                  }}
                  aria-label={`Remove ${fav.label} from favorites`}
                >
                  <X size={14} />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Navigation */}
      <nav className="sidebar__nav">
        {sidebarExpanded && (
          <div className="sidebar__section-label">Workspace</div>
        )}
        <ul className="sidebar__nav-list">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path ||
              (item.path !== '/' && location.pathname.startsWith(item.path))

            return (
              <li key={item.path} className="sidebar__nav-item">
                <NavLink
                  to={item.path}
                  className={`sidebar__nav-link ${isActive ? 'sidebar__nav-link--active' : ''}`}
                  title={!sidebarExpanded ? item.label : undefined}
                  onClick={handleNavClick}
                >
                  <Icon size={20} className="sidebar__nav-icon" />
                  {sidebarExpanded && (
                    <span className="sidebar__nav-label">{item.label}</span>
                  )}
                  {item.badge !== undefined && item.badge > 0 && sidebarExpanded && (
                    <span className="sidebar__badge">{item.badge}</span>
                  )}
                </NavLink>
              </li>
            )
          })}
        </ul>
        {sidebarExpanded && workspacePages.length > 0 && (
          <div className="sidebar__page-tree">
            <PageTree
              pages={workspacePages}
              selectedPageId={location.pathname.split('/pages/')[1]}
              onSelectPage={(id) => {
                navigate(`/pages/${id}`)
                closeMobileSidebar()
              }}
              compact
              maxItems={5}
            />
          </div>
        )}
      </nav>

      {/* Divider */}
      <div className="sidebar__divider" />

      {/* Settings at bottom */}
      <div className="sidebar__footer">
        <NavLink
          to="/settings"
          className={`sidebar__nav-link ${location.pathname.startsWith('/settings') ? 'sidebar__nav-link--active' : ''}`}
          title={!sidebarExpanded ? 'Settings' : undefined}
          onClick={handleNavClick}
        >
          <Settings size={20} className="sidebar__nav-icon" />
          {sidebarExpanded && (
            <span className="sidebar__nav-label">Settings</span>
          )}
        </NavLink>
      </div>

      {/* Resize handle */}
      {sidebarExpanded && (
        <div
          className="sidebar__resize-handle"
          onMouseDown={handleResizeStart}
          role="separator"
          aria-label="Resize sidebar"
        />
      )}
    </aside>
  )
}
