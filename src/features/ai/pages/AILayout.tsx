import { NavLink, Outlet } from 'react-router-dom'
import { Wand2 } from 'lucide-react'
import './AILayout.css'

export default function AILayout() {
  return (
    <div className="ai-layout">
      <div className="ai-layout__header">
        <Wand2 size={24} className="ai-layout__icon" />
        <h1 className="ai-layout__title">Intelligence</h1>
      </div>

      <nav className="ai-layout__tabs" aria-label="AI sections">
        <NavLink
          to="/ai/memory"
          className={({ isActive }) =>
            `ai-layout__tab${isActive ? ' ai-layout__tab--active' : ''}`
          }
        >
          Context Memory
        </NavLink>
        <NavLink
          to="/ai/agents"
          className={({ isActive }) =>
            `ai-layout__tab${isActive ? ' ai-layout__tab--active' : ''}`
          }
        >
          Agent Teams
        </NavLink>
      </nav>

      <div className="ai-layout__content">
        <Outlet />
      </div>
    </div>
  )
}
