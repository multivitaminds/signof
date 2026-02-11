import { Search, User, Sun, Moon, Monitor, Menu, Brain } from 'lucide-react'
import { useAppStore } from '../../../stores/useAppStore'
import { useTheme } from '../../../hooks/useTheme'
import useAIChatStore from '../../../features/ai/stores/useAIChatStore'
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

export default function TopBar() {
  const { openCommandPalette, openMobileSidebar } = useAppStore()
  const { theme, cycleTheme } = useTheme()
  const toggleAIChat = useAIChatStore((s) => s.toggleOpen)

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
          <Search size={20} />
        </button>

        {/* AI Chat Toggle */}
        <button
          className="topbar__icon-btn"
          onClick={toggleAIChat}
          aria-label="Toggle AI assistant"
          title="AI Assistant"
        >
          <Brain size={20} />
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
        <NotificationCenter />

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
