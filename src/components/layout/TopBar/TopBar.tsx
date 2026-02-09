import { useLocation } from 'react-router-dom'
import { Bell, Search, User } from 'lucide-react'
import { useAppStore } from '../../../stores/useAppStore'
import './TopBar.css'

const ROUTE_TITLES: Record<string, string> = {
  '/': 'Home',
  '/pages': 'Pages',
  '/projects': 'Projects',
  '/documents': 'Documents',
  '/calendar': 'Calendar',
  '/data': 'Databases',
  '/inbox': 'Inbox',
  '/settings': 'Settings',
}

export default function TopBar() {
  const location = useLocation()
  const { openCommandPalette } = useAppStore()

  const getPageTitle = () => {
    // Exact match first
    if (ROUTE_TITLES[location.pathname]) {
      return ROUTE_TITLES[location.pathname]
    }
    // Prefix match for nested routes
    const prefix = Object.keys(ROUTE_TITLES).find(
      (key) => key !== '/' && location.pathname.startsWith(key)
    )
    return prefix ? ROUTE_TITLES[prefix] : 'SignOf'
  }

  return (
    <header className="topbar">
      <div className="topbar__left">
        <h1 className="topbar__title">{getPageTitle()}</h1>
      </div>

      <div className="topbar__right">
        {/* Search Button */}
        <button
          className="topbar__icon-btn"
          onClick={openCommandPalette}
          aria-label="Search"
          title="Search (⌘K)"
        >
          <Search size={20} />
        </button>

        {/* Notifications */}
        <button
          className="topbar__icon-btn topbar__icon-btn--badge"
          aria-label="Notifications"
          title="Notifications"
        >
          <Bell size={20} />
          <span className="topbar__badge">3</span>
        </button>

        {/* User Menu */}
        <button
          className="topbar__user-btn"
          aria-label="User menu"
          title="Account"
        >
          <div className="topbar__avatar">
            <User size={18} />
          </div>
        </button>
      </div>
    </header>
  )
}
