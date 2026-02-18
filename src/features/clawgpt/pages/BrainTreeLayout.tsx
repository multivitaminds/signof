import { NavLink, Outlet } from 'react-router-dom'
import ModuleHeader from '../../../components/ui/ModuleHeader'
import './BrainTreeLayout.css'

export default function BrainTreeLayout() {
  return (
    <div className="clawgpt-layout">
      <ModuleHeader
        title="Command Center"
        subtitle="Agent Operating System — 540+ autonomous agents, fleet management, and multi-channel intelligence"
      />

      <nav className="clawgpt-layout__tabs" aria-label="Command Center sections">
        <NavLink
          to="/brain/dashboard"
          className={({ isActive }) =>
            `clawgpt-layout__tab${isActive ? ' clawgpt-layout__tab--active' : ''}`
          }
        >
          Overview
        </NavLink>
        <NavLink
          to="/brain/channels"
          className={({ isActive }) =>
            `clawgpt-layout__tab${isActive ? ' clawgpt-layout__tab--active' : ''}`
          }
        >
          Channels
        </NavLink>
        <NavLink
          to="/brain/inbox"
          className={({ isActive }) =>
            `clawgpt-layout__tab${isActive ? ' clawgpt-layout__tab--active' : ''}`
          }
        >
          Inbox
        </NavLink>
        <NavLink
          to="/brain/skills"
          className={({ isActive }) =>
            `clawgpt-layout__tab${isActive ? ' clawgpt-layout__tab--active' : ''}`
          }
        >
          Skills
        </NavLink>
        <NavLink
          to="/brain/soul"
          className={({ isActive }) =>
            `clawgpt-layout__tab${isActive ? ' clawgpt-layout__tab--active' : ''}`
          }
        >
          Personality
        </NavLink>
        <NavLink
          to="/brain/devices"
          className={({ isActive }) =>
            `clawgpt-layout__tab${isActive ? ' clawgpt-layout__tab--active' : ''}`
          }
        >
          Devices
        </NavLink>
        <NavLink
          to="/brain/fleet"
          className={({ isActive }) =>
            `clawgpt-layout__tab${isActive ? ' clawgpt-layout__tab--active' : ''}`
          }
        >
          Fleet
        </NavLink>
        <NavLink
          to="/brain/registry"
          className={({ isActive }) =>
            `clawgpt-layout__tab${isActive ? ' clawgpt-layout__tab--active' : ''}`
          }
        >
          Registry
        </NavLink>
      </nav>

      <div className="clawgpt-layout__content">
        <Outlet />
      </div>
    </div>
  )
}
