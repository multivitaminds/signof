import { useState, useCallback, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  Home,
  FolderKanban,
  FileSignature,
  Calendar,
  MoreHorizontal,
  Database,
  Inbox,
  Settings,
  Brain,
  Receipt,
  Code2,
  X,
} from 'lucide-react'
import { useInboxStore } from '../../../features/inbox/stores/useInboxStore'
import { useSwipeGesture } from '../../../hooks/useSwipeGesture'
import './MobileNav.css'

interface TabItem {
  id: string
  label: string
  icon: React.ComponentType<{ size?: number; className?: string }>
  path: string
}

interface MoreItem {
  id: string
  label: string
  icon: React.ComponentType<{ size?: number; className?: string }>
  path: string
  badge?: number
}

const TABS: TabItem[] = [
  { id: 'home', label: 'Home', icon: Home, path: '/' },
  { id: 'projects', label: 'Projects', icon: FolderKanban, path: '/projects' },
  { id: 'docs', label: 'Docs', icon: FileSignature, path: '/documents' },
  { id: 'calendar', label: 'Calendar', icon: Calendar, path: '/calendar' },
]


export default function MobileNav() {
  const location = useLocation()
  const navigate = useNavigate()
  const [moreOpen, setMoreOpen] = useState(false)

  const inboxNotifications = useInboxStore((s) => s.notifications)
  const unreadCount = useMemo(
    () => inboxNotifications.filter((n) => !n.read).length,
    [inboxNotifications]
  )

  const MORE_ITEMS: MoreItem[] = useMemo(() => [
    { id: 'databases', label: 'Databases', icon: Database, path: '/data' },
    { id: 'inbox', label: 'Inbox', icon: Inbox, path: '/inbox', badge: unreadCount || undefined },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
    { id: 'ai', label: 'Copilot', icon: Brain, path: '/copilot' },
    { id: 'tax', label: 'Tax', icon: Receipt, path: '/tax' },
    { id: 'developer', label: 'Developer', icon: Code2, path: '/developer' },
  ], [unreadCount])

  const isActive = useCallback((path: string): boolean => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }, [location.pathname])

  // Check if a "more" item is active
  const moreActive = useMemo(() => {
    return MORE_ITEMS.some((item) => isActive(item.path))
  }, [MORE_ITEMS, isActive])

  const handleTabClick = useCallback((path: string) => {
    navigate(path)
    setMoreOpen(false)
  }, [navigate])

  const handleMoreToggle = useCallback(() => {
    setMoreOpen((prev) => !prev)
  }, [])

  const handleMoreItemClick = useCallback((path: string) => {
    navigate(path)
    setMoreOpen(false)
  }, [navigate])

  const handleBackdropClick = useCallback(() => {
    setMoreOpen(false)
  }, [])

  const swipeRef = useSwipeGesture<HTMLDivElement>({
    onSwipeDown: handleBackdropClick,
  })

  return (
    <>
      {/* More sheet backdrop */}
      {moreOpen && (
        <div
          className="mobile-nav__backdrop"
          onClick={handleBackdropClick}
          aria-hidden="true"
        />
      )}

      {/* Slide-up more sheet */}
      <div
        ref={swipeRef}
        className={`mobile-nav__more-sheet ${moreOpen ? 'mobile-nav__more-sheet--open' : ''}`}
        role="dialog"
        aria-label="More navigation options"
        aria-hidden={!moreOpen}
      >
        <div className="mobile-nav__more-header">
          <span className="mobile-nav__more-title">More</span>
          <button
            className="mobile-nav__more-close"
            onClick={handleMoreToggle}
            aria-label="Close more menu"
          >
            <X size={20} />
          </button>
        </div>
        <nav className="mobile-nav__more-list">
          {MORE_ITEMS.map((item) => {
            const Icon = item.icon
            const active = isActive(item.path)
            return (
              <button
                key={item.id}
                className={`mobile-nav__more-item ${active ? 'mobile-nav__more-item--active' : ''}`}
                onClick={() => handleMoreItemClick(item.path)}
                aria-current={active ? 'page' : undefined}
              >
                <Icon size={20} className="mobile-nav__more-icon" />
                <span className="mobile-nav__more-label">{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="mobile-nav__more-badge" aria-label={`${item.badge} unread`}>
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Bottom tab bar */}
      <nav className="mobile-nav" role="navigation" aria-label="Mobile navigation">
        {TABS.map((tab) => {
          const Icon = tab.icon
          const active = isActive(tab.path)
          return (
            <button
              key={tab.id}
              className={`mobile-nav__tab ${active ? 'mobile-nav__tab--active' : ''}`}
              onClick={() => handleTabClick(tab.path)}
              aria-current={active ? 'page' : undefined}
              aria-label={tab.label}
            >
              <Icon size={22} className="mobile-nav__tab-icon" />
              <span className="mobile-nav__tab-label">{tab.label}</span>
              {active && <span className="mobile-nav__tab-indicator" />}
            </button>
          )
        })}
        {/* More tab */}
        <button
          className={`mobile-nav__tab ${moreActive || moreOpen ? 'mobile-nav__tab--active' : ''}`}
          onClick={handleMoreToggle}
          aria-label="More options"
          aria-expanded={moreOpen}
        >
          <div className="mobile-nav__tab-icon-wrap">
            <MoreHorizontal size={22} className="mobile-nav__tab-icon" />
            {unreadCount > 0 && (
              <span className="mobile-nav__tab-dot" aria-label={`${unreadCount} unread notifications`} />
            )}
          </div>
          <span className="mobile-nav__tab-label">More</span>
          {(moreActive || moreOpen) && <span className="mobile-nav__tab-indicator" />}
        </button>
      </nav>
    </>
  )
}
