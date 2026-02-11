import { useEffect, useRef } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import Sidebar from './Sidebar/Sidebar'
import TopBar from './TopBar/TopBar'
import MobileNav from './MobileNav/MobileNav'
import PageTransition from './PageTransition/PageTransition'
import CommandPalette from '../CommandPalette/CommandPalette'
import KeyboardShortcutHelp from '../KeyboardShortcutHelp/KeyboardShortcutHelp'
import OfflineBanner from '../OfflineBanner/OfflineBanner'
import SearchOverlay from '../../features/search/components/SearchOverlay/SearchOverlay'
import AIChatSidebar from '../../features/ai/components/AIChatSidebar/AIChatSidebar'
import useAIChatStore from '../../features/ai/stores/useAIChatStore'
import { useTheme } from '../../hooks/useTheme'
import { useFocusOnRouteChange } from '../../hooks/useFocusOnRouteChange'
import { useIsMobile } from '../../hooks/useMediaQuery'
import { useAppStore } from '../../stores/useAppStore'
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts'
import './AppLayout.css'

const ROUTE_LABELS: Record<string, string> = {
  '/': 'Home',
  '/pages': 'Pages',
  '/projects': 'Projects',
  '/documents': 'Documents',
  '/calendar': 'Calendar',
  '/data': 'Databases',
  '/inbox': 'Inbox',
  '/ai': 'AI',
  '/tax': 'Tax',
  '/developer': 'Developer',
  '/settings': 'Settings',
}

export default function AppLayout() {
  // Activate theme sync
  useTheme()

  const isMobile = useIsMobile()
  const location = useLocation()
  const navigate = useNavigate()
  const mainRef = useRef<HTMLElement>(null)
  const mobileSidebarOpen = useAppStore((s) => s.mobileSidebarOpen)
  const closeMobileSidebar = useAppStore((s) => s.closeMobileSidebar)
  const addRecentItem = useAppStore((s) => s.addRecentItem)
  const searchOverlayOpen = useAppStore((s) => s.searchOverlayOpen)
  const closeSearchOverlay = useAppStore((s) => s.closeSearchOverlay)
  const setAIChatContext = useAIChatStore((s) => s.setContextLabel)

  // Focus management for screen readers on route changes
  useFocusOnRouteChange(mainRef)

  // Register all keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: '[',
      handler: () => useAppStore.getState().toggleSidebar(),
    },
    {
      key: '?',
      handler: () => useAppStore.getState().toggleShortcutHelp(),
    },
    {
      key: 'c',
      handler: () => useAppStore.getState().openCommandPalette(),
    },
    {
      key: 'n',
      handler: () => navigate('/documents?action=upload'),
    },
    // G-chord navigation
    { key: 'g', chord: 'g+h', handler: () => navigate('/') },
    { key: 'g', chord: 'g+d', handler: () => navigate('/documents') },
    { key: 'g', chord: 'g+p', handler: () => navigate('/projects') },
    { key: 'g', chord: 'g+a', handler: () => navigate('/pages') },
    { key: 'g', chord: 'g+s', handler: () => navigate('/calendar') },
    { key: 'g', chord: 'g+i', handler: () => navigate('/inbox') },
    { key: 'g', chord: 'g+c', handler: () => navigate('/data') },
    { key: 'g', chord: 'g+b', handler: () => navigate('/ai') },
    { key: 'g', chord: 'g+t', handler: () => navigate('/tax') },
    { key: 'g', chord: 'g+x', handler: () => navigate('/developer') },
  ])

  // Track recent items on navigation
  useEffect(() => {
    const label = ROUTE_LABELS[location.pathname]
    if (label) {
      addRecentItem({ path: location.pathname, label })
      setAIChatContext(label)
    }
  }, [location.pathname, addRecentItem, setAIChatContext])

  return (
    <div className="app-layout">
      {/* Skip to main content — visible on focus for keyboard users */}
      <a className="app-layout__skip-link" href="#main-content">
        Skip to main content
      </a>
      {/* Desktop sidebar (hidden on mobile via CSS) */}
      {!isMobile && <Sidebar />}
      {mobileSidebarOpen && (
        <div
          className="app-layout__backdrop"
          onClick={closeMobileSidebar}
          aria-hidden="true"
        />
      )}
      <div className="app-layout__main">
        <OfflineBanner />
        <TopBar />
        <main
          id="main-content"
          ref={mainRef}
          className="app-layout__content"
        >
          <PageTransition key={location.pathname}>
            <Outlet />
          </PageTransition>
        </main>
      </div>
      {/* Mobile bottom nav (hidden on desktop) */}
      {isMobile && <MobileNav />}
      <CommandPalette />
      <KeyboardShortcutHelp />
      <SearchOverlay isOpen={searchOverlayOpen} onClose={closeSearchOverlay} />
      <AIChatSidebar />
      {/* ARIA live region for toast announcements */}
      <div
        className="app-layout__live-region"
        aria-live="polite"
        aria-atomic="true"
        role="status"
      />
    </div>
  )
}
