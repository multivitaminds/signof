import { useState, useCallback, useRef, useMemo, useEffect } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
  Home,
  FileText,
  FolderKanban,
  FileSignature,
  Calendar,
  Database,
  Inbox,
  Sparkles,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
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
  MessageSquare,
  Calculator,
  Brain,
  Star,
  ChevronDown,
  Bell,
  BarChart3,
  Music,
} from 'lucide-react'
import { useAppStore } from '../../../stores/useAppStore'
import { useDocumentStore } from '../../../stores/useDocumentStore'
import { useFavoritesStore } from '../../../stores/useFavoritesStore'
import { useWorkspaceStore } from '../../../features/workspace/stores/useWorkspaceStore'
import { useProjectStore } from '../../../features/projects/stores/useProjectStore'
import { useInboxStore } from '../../../features/inbox/stores/useInboxStore'
import { useNotificationStore } from '../../../features/notifications/stores/useNotificationStore'
import NotificationBadge from '../../../features/notifications/components/NotificationBadge/NotificationBadge'
import NotificationCenter from '../../../features/notifications/components/NotificationCenter/NotificationCenter'
import PageTree from '../../../features/workspace/components/PageTree/PageTree'
import RecentsList from '../../../features/home/components/RecentsList/RecentsList'
import ShortcutHint from '../../ui/ShortcutHint/ShortcutHint'
import { useChorusStore } from '../../../features/chorus/stores/useChorusStore'
import { ACTIVE_STATUSES } from '../../../types'
import type { FavoriteItem } from '../../../types'
import './Sidebar.css'

interface NavItem {
  path: string
  label: string
  icon: React.ComponentType<{ size?: number; className?: string }>
  badge?: number
  dataTour?: string
  shortcutKey?: string
}

const NEW_MENU_ITEMS = [
  { id: 'page', label: 'New Page', icon: File, path: '/pages/new' },
  { id: 'project', label: 'New Project', icon: FolderPlus, path: '/projects/new' },
  { id: 'document', label: 'New Document', icon: Upload, path: '/documents?action=upload' },
  { id: 'event', label: 'New Event', icon: CalendarPlus, path: '/calendar/new' },
  { id: 'database', label: 'New Database', icon: Table, path: '/data/new' },
  { id: 'filing', label: 'New Tax Filing', icon: Receipt, path: '/tax/filing' },
  { id: 'invoice', label: 'New Invoice', icon: Calculator, path: '/accounting/invoices' },
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

  // Pull favorites from dedicated favorites store
  const dedicatedFavorites = useFavoritesStore((s) => s.favorites)

  // Merge workspace favorited pages into the favorites list
  const workspaceFavorites = useMemo(() => {
    const favPages: FavoriteItem[] = Object.values(pagesMap)
      .filter((p) => p.isFavorite && !p.trashedAt)
      .sort((a, b) => a.title.localeCompare(b.title))
      .map((p) => ({
        id: `ws-page-${p.id}`,
        path: `/pages/${p.id}`,
        label: p.title || 'Untitled',
        icon: p.icon || 'file',
      }))
    return favPages
  }, [pagesMap])

  const allFavorites = useMemo(() => {
    // Merge: app store favorites first, then dedicated store, then workspace page favorites (deduplicated)
    const existingPaths = new Set(favorites.map((f) => f.path))
    const combined = [...favorites]
    // Add dedicated favorites store items
    for (const df of dedicatedFavorites) {
      const asFav: FavoriteItem = { id: df.id, path: df.path, label: df.title, icon: df.icon }
      if (!existingPaths.has(asFav.path)) {
        existingPaths.add(asFav.path)
        combined.push(asFav)
      }
    }
    for (const wf of workspaceFavorites) {
      if (!existingPaths.has(wf.path)) {
        combined.push(wf)
      }
    }
    return combined
  }, [favorites, dedicatedFavorites, workspaceFavorites])

  const chorusUnreadCount = useChorusStore((s) => s.getTotalUnreadCount())

  const notificationUnreadCount = useNotificationStore((s) => s.getUnreadCount())
  const [notificationCenterOpen, setNotificationCenterOpen] = useState(false)

  const toggleNotificationCenter = useCallback(() => {
    setNotificationCenterOpen((prev) => !prev)
  }, [])

  const closeNotificationCenter = useCallback(() => {
    setNotificationCenterOpen(false)
  }, [])

  const [favoritesCollapsed, setFavoritesCollapsed] = useState(false)
  const [newMenuOpen, setNewMenuOpen] = useState(false)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const [isHovering, setIsHovering] = useState(false)
  const dragIndexRef = useRef<number | null>(null)
  const resizingRef = useRef(false)
  const newMenuRef = useRef<HTMLDivElement>(null)
  const hoverTimerRef = useRef<number | null>(null)

  // Sidebar is effectively expanded when pinned open OR hovered
  const effectiveExpanded = sidebarExpanded || isHovering

  const handleSidebarMouseEnter = useCallback(() => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current)
      hoverTimerRef.current = null
    }
    setIsHovering(true)
  }, [])

  const handleSidebarMouseLeave = useCallback(() => {
    if (sidebarExpanded) return // pinned open, don't auto-collapse
    hoverTimerRef.current = window.setTimeout(() => {
      setIsHovering(false)
    }, 300)
  }, [sidebarExpanded])

  // Cleanup hover timer on unmount
  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current)
    }
  }, [])

  const NAV_ITEMS: NavItem[] = [
    { path: '/', label: 'Home', icon: Home, shortcutKey: 'mod+1' },
    { path: '/pages', label: 'Pages', icon: FileText, shortcutKey: 'mod+2' },
    { path: '/projects', label: 'Projects', icon: FolderKanban, badge: openIssueCount || undefined, shortcutKey: 'mod+3' },
    { path: '/documents', label: 'Documents', icon: FileSignature, badge: pendingCount || undefined, shortcutKey: 'mod+4' },
    { path: '/calendar', label: 'Calendar', icon: Calendar, shortcutKey: 'mod+5' },
    { path: '/data', label: 'Databases', icon: Database, shortcutKey: 'mod+6' },
    { path: '/inbox', label: 'Inbox', icon: Inbox, badge: unreadCount || undefined, shortcutKey: 'mod+7' },
    { path: '/chorus', label: 'Chorus', icon: Music, badge: chorusUnreadCount || undefined },
    { path: '/copilot', label: 'Copilot', icon: Sparkles, dataTour: 'copilot', shortcutKey: 'mod+8' },
    { path: '/tax', label: 'Tax', icon: Receipt },
    { path: '/accounting', label: 'Accounting', icon: Calculator },
    { path: '/brain', label: 'Command Center', icon: Brain },
    { path: '/analytics', label: 'Analytics', icon: BarChart3 },
    { path: '/playground', label: 'Playground', icon: MessageSquare },
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
      if (!effectiveExpanded) return
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
    [effectiveExpanded, setSidebarWidth]
  )

  const mobileClass = mobileSidebarOpen ? ' sidebar--mobile-open' : ''
  const expandedWidth = effectiveExpanded ? `${sidebarWidth}px` : undefined

  return (
    <aside
      className={`sidebar ${effectiveExpanded ? 'sidebar--expanded' : 'sidebar--collapsed'}${mobileClass}`}
      style={effectiveExpanded ? { width: expandedWidth } : undefined}
      onMouseEnter={handleSidebarMouseEnter}
      onMouseLeave={handleSidebarMouseLeave}
      data-tour="sidebar"
    >
      {/* Header */}
      <div className="sidebar__header">
        {effectiveExpanded ? (
          <div className="sidebar__brand">
            <img
              src="/logo/origina-wordmark-indigo.png"
              alt="OriginA"
              className="sidebar__logo-img sidebar__logo-img--light"
            />
            <img
              src="/logo/origina-wordmark-cyan.png"
              alt="OriginA"
              className="sidebar__logo-img sidebar__logo-img--dark"
            />
          </div>
        ) : (
          <div className="sidebar__brand-collapsed">
            <img
              src="/logo/origina-icon-indigo.png"
              alt="OriginA"
              className="sidebar__logo-icon sidebar__logo-icon--light"
            />
            <img
              src="/logo/origina-icon-cyan.png"
              alt="OriginA"
              className="sidebar__logo-icon sidebar__logo-icon--dark"
            />
          </div>
        )}
        <div className="sidebar__header-actions">
          <button
            className="sidebar__notification-btn"
            onClick={toggleNotificationCenter}
            aria-label="Toggle notifications"
            title="Notifications"
          >
            <Bell size={22} />
            {effectiveExpanded && (
              <span className="sidebar__notification-label">Notifications</span>
            )}
            {notificationUnreadCount > 0 && (
              <NotificationBadge count={notificationUnreadCount} />
            )}
          </button>
          <button
            className="sidebar__toggle"
            onClick={toggleSidebar}
            aria-label={sidebarExpanded ? 'Unpin sidebar' : 'Pin sidebar open'}
            title={sidebarExpanded ? 'Unpin sidebar' : 'Pin sidebar open'}
          >
            {sidebarExpanded ? <PanelLeftClose size={22} /> : <PanelLeftOpen size={22} />}
            {effectiveExpanded && (
              <span className="sidebar__toggle-label">
                {sidebarExpanded ? 'Unpin' : 'Pin'}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="sidebar__search" data-tour="search">
        <button
          className="sidebar__search-btn"
          onClick={handleSearchClick}
          aria-label="Search or run command"
        >
          <Search size={18} />
          {effectiveExpanded && (
            <>
              <span className="sidebar__search-text">Search</span>
              <kbd className="sidebar__search-kbd">&#8984;K</kbd>
            </>
          )}
        </button>
      </div>

      {/* Quick Actions */}
      {effectiveExpanded && (
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

      {/* Scrollable content area — favorites + recents + nav */}
      <div className="sidebar__scrollable">
        {/* Favorites */}
        {effectiveExpanded && (
          <div className="sidebar__favorites">
            <button
              className="sidebar__section-toggle"
              onClick={() => setFavoritesCollapsed((prev) => !prev)}
              aria-expanded={!favoritesCollapsed}
              aria-label={favoritesCollapsed ? 'Expand favorites' : 'Collapse favorites'}
            >
              <ChevronDown
                size={14}
                className={`sidebar__section-chevron${favoritesCollapsed ? ' sidebar__section-chevron--collapsed' : ''}`}
              />
              <Star size={12} className="sidebar__section-star" />
              <span className="sidebar__section-label-text">Favorites</span>
            </button>
            {!favoritesCollapsed && (
              allFavorites.length > 0 ? (
                <ul className="sidebar__nav-list">
                  {allFavorites.map((fav, index) => (
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
                        <Star size={16} className="sidebar__nav-icon sidebar__star-icon" />
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
              ) : (
                <p className="sidebar__favorites-empty">No favorites yet</p>
              )
            )}
          </div>
        )}

        {/* Recents */}
        {effectiveExpanded && (
          <div className="sidebar__recents">
            <RecentsList />
          </div>
        )}

        {/* Navigation */}
        <nav className="sidebar__nav" data-tour="modules">
          {effectiveExpanded && (
            <div className="sidebar__section-label">Workspace</div>
          )}
          <ul className="sidebar__nav-list">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path ||
                (item.path !== '/' && location.pathname.startsWith(item.path))

              return (
                <li key={item.path} className="sidebar__nav-item" data-tour={item.dataTour}>
                  <NavLink
                    to={item.path}
                    className={`sidebar__nav-link ${isActive ? 'sidebar__nav-link--active' : ''}`}
                    title={!effectiveExpanded ? item.label : undefined}
                    onClick={handleNavClick}
                  >
                    <Icon size={20} className="sidebar__nav-icon" />
                    {effectiveExpanded && (
                      <span className="sidebar__nav-label">{item.label}</span>
                    )}
                    {item.badge !== undefined && item.badge > 0 && effectiveExpanded && (
                      <span className="sidebar__badge">{item.badge}</span>
                    )}
                    {item.shortcutKey && !item.badge && effectiveExpanded && (
                      <ShortcutHint keys={item.shortcutKey} />
                    )}
                  </NavLink>
                </li>
              )
            })}
          </ul>
          {effectiveExpanded && workspacePages.length > 0 && (
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
      </div>

      {/* Settings at bottom */}
      <div className="sidebar__footer" data-tour="settings">
        <NavLink
          to="/settings"
          className={`sidebar__nav-link ${location.pathname.startsWith('/settings') ? 'sidebar__nav-link--active' : ''}`}
          title={!effectiveExpanded ? 'Settings' : undefined}
          onClick={handleNavClick}
        >
          <Settings size={20} className="sidebar__nav-icon" />
          {effectiveExpanded && (
            <span className="sidebar__nav-label">Settings</span>
          )}
          {effectiveExpanded && (
            <ShortcutHint keys="mod+9" />
          )}
        </NavLink>
      </div>

      {/* Resize handle */}
      {effectiveExpanded && (
        <div
          className="sidebar__resize-handle"
          onMouseDown={handleResizeStart}
          role="separator"
          aria-label="Resize sidebar"
        />
      )}

      {/* Notification Center */}
      <NotificationCenter open={notificationCenterOpen} onClose={closeNotificationCenter} />
    </aside>
  )
}
