import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar/Sidebar'
import TopBar from './TopBar/TopBar'
import CommandPalette from '../CommandPalette/CommandPalette'
import './AppLayout.css'

export default function AppLayout() {
  return (
    <div className="app-layout">
      <Sidebar />
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
