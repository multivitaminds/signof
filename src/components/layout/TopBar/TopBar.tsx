import { useState, useCallback, useRef, useEffect } from 'react'
import { Search, User, Sun, Moon, Monitor, Menu, Settings, HelpCircle, LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../../../stores/useAppStore'
import { useTheme } from '../../../hooks/useTheme'
import Breadcrumbs from '../../Breadcrumbs/Breadcrumbs'
import NotificationCenter from '../../NotificationCenter/NotificationCenter'
import './TopBar.css'

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

const PROFILE_MENU_ITEMS = [
  { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
  { id: 'help', label: 'Help & Support', icon: HelpCircle, path: '/settings' },
  { id: 'logout', label: 'Sign Out', icon: LogOut, path: '/' },
] as const

export default function TopBar() {
  const { openCommandPalette, openMobileSidebar } = useAppStore()
  const { theme, cycleTheme } = useTheme()
  const navigate = useNavigate()

  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [profileMenuIndex, setProfileMenuIndex] = useState(-1)
  const profileRef = useRef<HTMLDivElement>(null)

  const ThemeIcon = THEME_ICON[theme]

  const handleProfileClick = useCallback(() => {
    setProfileMenuOpen((prev) => {
      if (!prev) setProfileMenuIndex(-1)
      return !prev
    })
  }, [])

  const handleProfileMenuSelect = useCallback(
    (path: string) => {
      navigate(path)
      setProfileMenuOpen(false)
    },
    [navigate]
  )

  const handleProfileKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!profileMenuOpen) return
      switch (e.key) {
        case 'Escape':
          e.preventDefault()
          setProfileMenuOpen(false)
          break
        case 'ArrowDown':
          e.preventDefault()
          setProfileMenuIndex((prev) =>
            prev < PROFILE_MENU_ITEMS.length - 1 ? prev + 1 : 0
          )
          break
        case 'ArrowUp':
          e.preventDefault()
          setProfileMenuIndex((prev) =>
            prev > 0 ? prev - 1 : PROFILE_MENU_ITEMS.length - 1
          )
          break
        case 'Enter': {
          e.preventDefault()
          const item = PROFILE_MENU_ITEMS[profileMenuIndex]
          if (item) handleProfileMenuSelect(item.path)
        }
          break
      }
    },
    [profileMenuOpen, profileMenuIndex, handleProfileMenuSelect]
  )

  useEffect(() => {
    if (!profileMenuOpen) return
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [profileMenuOpen])

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
        <Breadcrumbs />
      </div>

      <div className="topbar__right">
        {/* Search Button */}
        <button
          className="topbar__icon-btn"
          onClick={openCommandPalette}
          aria-label="Search"
          title="Search (⌘K)"
        >
          <Search size={24} />
        </button>

        {/* Theme Toggle */}
        <button
          className="topbar__icon-btn topbar__theme-btn"
          onClick={cycleTheme}
          aria-label={THEME_LABEL[theme]}
          title={THEME_LABEL[theme]}
        >
          <ThemeIcon size={24} />
          <span className="topbar__icon-label">
            {theme === 'light' ? 'Light' : theme === 'dark' ? 'Dark' : 'Auto'}
          </span>
        </button>

        {/* Notifications */}
        <NotificationCenter />

        {/* User Menu */}
        <div className="topbar__profile-wrapper" ref={profileRef} onKeyDown={handleProfileKeyDown}>
          <button
            className="topbar__user-btn"
            onClick={handleProfileClick}
            aria-label="User menu"
            aria-expanded={profileMenuOpen}
            aria-haspopup="true"
            title="Account"
          >
            <div className="topbar__avatar">
              <User size={18} />
            </div>
          </button>
          {profileMenuOpen && (
            <div className="topbar__profile-menu" role="menu">
              <div className="topbar__profile-menu-header">
                <div className="topbar__profile-menu-avatar">
                  <User size={20} />
                </div>
                <div className="topbar__profile-menu-info">
                  <span className="topbar__profile-menu-name">Demo User</span>
                  <span className="topbar__profile-menu-email">user@orchestree.io</span>
                </div>
              </div>
              <div className="topbar__profile-menu-divider" />
              {PROFILE_MENU_ITEMS.map((item, index) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.id}
                    className={`topbar__profile-menu-item ${item.id === 'logout' ? 'topbar__profile-menu-item--danger' : ''} ${profileMenuIndex === index ? 'topbar__profile-menu-item--focused' : ''}`}
                    role="menuitem"
                    tabIndex={-1}
                    onClick={() => handleProfileMenuSelect(item.path)}
                    onMouseEnter={() => setProfileMenuIndex(index)}
                  >
                    <Icon size={16} />
                    <span>{item.label}</span>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
