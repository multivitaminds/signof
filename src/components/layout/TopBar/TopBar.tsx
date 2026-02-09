import { useLocation } from 'react-router-dom'
import { Bell, Search, User, Sun, Moon, Monitor, Menu } from 'lucide-react'
import { useAppStore } from '../../../stores/useAppStore'
import { useTheme } from '../../../hooks/useTheme'
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

const THEME_ICON = {
  light: Sun,
  dark: Moon,
  system: Monitor,
} as const

const THEME_LABEL = {
  light: 'Light mode',
  dark: 'Dark mode',
  system: 'System theme',
} as const

export default function TopBar() {
  const location = useLocation()
  const { openCommandPalette, openMobileSidebar } = useAppStore()
  const { theme, cycleTheme } = useTheme()

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

  const ThemeIcon = THEME_ICON[theme]

  return (
    <header className="topbar">
      <div className="topbar__left">
        {/* Hamburger — mobile only */}
        <button
          className="topbar__icon-btn topbar__hamburger"
          onClick={openMobileSidebar}
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
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

        {/* Theme Toggle */}
        <button
          className="topbar__icon-btn"
          onClick={cycleTheme}
          aria-label={THEME_LABEL[theme]}
          title={THEME_LABEL[theme]}
        >
          <ThemeIcon size={20} />
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
