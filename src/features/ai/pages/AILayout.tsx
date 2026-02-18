import { NavLink, Outlet } from 'react-router-dom'
import ModuleHeader from '../../../components/ui/ModuleHeader'
import './AILayout.css'

export default function AILayout() {
  return (
    <div className="ai-layout">
      <ModuleHeader title="Copilot" subtitle="AI agents and organizational memory" />

      <nav className="ai-layout__tabs" aria-label="Copilot sections">
        <NavLink
          to="/copilot/memory"
          className={({ isActive }) =>
            `ai-layout__tab${isActive ? ' ai-layout__tab--active' : ''}`
          }
        >
          Context Memory
        </NavLink>
        <NavLink
          to="/copilot/agents"
          className={({ isActive }) =>
            `ai-layout__tab${isActive ? ' ai-layout__tab--active' : ''}`
          }
        >
          Agent Marketplace
        </NavLink>
        <NavLink
          to="/copilot/workflows"
          className={({ isActive }) =>
            `ai-layout__tab${isActive ? ' ai-layout__tab--active' : ''}`
          }
        >
          Workflows
        </NavLink>
        <NavLink
          to="/copilot/operations"
          className={({ isActive }) =>
            `ai-layout__tab${isActive ? ' ai-layout__tab--active' : ''}`
          }
        >
          Operations
        </NavLink>
        <NavLink
          to="/copilot/connectors"
          className={({ isActive }) =>
            `ai-layout__tab${isActive ? ' ai-layout__tab--active' : ''}`
          }
        >
          Connectors
        </NavLink>
      </nav>

      <div className="ai-layout__content">
        <Outlet />
      </div>
    </div>
  )
}
