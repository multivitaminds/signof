import { useCallback } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  Home,
  FileText,
  FolderKanban,
  FileSignature,
  Calendar,
  Database,
  Inbox,
  Settings,
  ChevronLeft,
  ChevronRight,
  Search,
  Plus,
} from 'lucide-react'
import { useAppStore } from '../../../stores/useAppStore'
import './Sidebar.css'

interface NavItem {
  path: string
  label: string
  icon: React.ComponentType<{ size?: number; className?: string }>
}

const NAV_ITEMS: NavItem[] = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/pages', label: 'Pages', icon: FileText },
  { path: '/projects', label: 'Projects', icon: FolderKanban },
  { path: '/documents', label: 'Documents', icon: FileSignature },
  { path: '/calendar', label: 'Calendar', icon: Calendar },
  { path: '/data', label: 'Databases', icon: Database },
  { path: '/inbox', label: 'Inbox', icon: Inbox },
]

export default function Sidebar() {
  const location = useLocation()
  const {
    sidebarExpanded,
    toggleSidebar,
    openCommandPalette,
    mobileSidebarOpen,
    closeMobileSidebar,
  } = useAppStore()

  const handleSearchClick = useCallback(() => {
    openCommandPalette()
  }, [openCommandPalette])

  const handleNavClick = useCallback(() => {
    closeMobileSidebar()
  }, [closeMobileSidebar])

  const mobileClass = mobileSidebarOpen ? ' sidebar--mobile-open' : ''

  return (
    <aside
      className={`sidebar ${sidebarExpanded ? 'sidebar--expanded' : 'sidebar--collapsed'}${mobileClass}`}
    >
      {/* Header */}
      <div className="sidebar__header">
        {sidebarExpanded ? (
          <div className="sidebar__brand">
            <span className="sidebar__logo">SignOf</span>
            <span className="sidebar__logo-check">✓</span>
          </div>
        ) : (
          <div className="sidebar__brand-collapsed">
            <span className="sidebar__logo-mini">S✓</span>
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
              <kbd className="sidebar__search-kbd">⌘K</kbd>
            </>
          )}
        </button>
      </div>

      {/* Quick Actions */}
      {sidebarExpanded && (
        <div className="sidebar__actions">
          <button className="sidebar__action-btn">
            <Plus size={16} />
            <span>New</span>
          </button>
        </div>
      )}

      {/* Navigation */}
      <nav className="sidebar__nav">
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
                </NavLink>
              </li>
            )
          })}
        </ul>
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
    </aside>
  )
}
