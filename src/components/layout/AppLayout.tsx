import { useEffect, useCallback } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar/Sidebar'
import TopBar from './TopBar/TopBar'
import CommandPalette from '../CommandPalette/CommandPalette'
import { useTheme } from '../../hooks/useTheme'
import { useAppStore } from '../../stores/useAppStore'
import './AppLayout.css'

export default function AppLayout() {
  // Activate theme sync
  useTheme()

  const toggleSidebar = useAppStore((s) => s.toggleSidebar)
  const mobileSidebarOpen = useAppStore((s) => s.mobileSidebarOpen)
  const closeMobileSidebar = useAppStore((s) => s.closeMobileSidebar)

  // [ keyboard shortcut to toggle sidebar
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return
      }
      if (e.key === '[') {
        e.preventDefault()
        toggleSidebar()
      }
    },
    [toggleSidebar]
  )

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return (
    <div className="app-layout">
      <Sidebar />
      {mobileSidebarOpen && (
        <div
          className="app-layout__backdrop"
          onClick={closeMobileSidebar}
          aria-hidden="true"
        />
      )}
      <div className="app-layout__main">
        <TopBar />
        <main className="app-layout__content">
          <Outlet />
        </main>
      </div>
      <CommandPalette />
    </div>
  )
}
