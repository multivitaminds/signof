import { NavLink, Outlet } from 'react-router-dom'
import ModuleHeader from '../../../components/ui/ModuleHeader'
import { DemoVideoSection } from '../../../components/ui/DemoVideo'
import './BrainTreeLayout.css'

export default function BrainTreeLayout() {
  return (
    <div className="clawgpt-layout">
      <ModuleHeader
        title="Command Center"
        subtitle="Manage your messaging channels, AI skills, and automations in one place"
      />

      <DemoVideoSection videos={[
        { title: 'Getting Started with Command Center', description: 'Connect your first channel and start routing messages.', duration: '4:15' },
        { title: 'Configuring Skills & Personality', description: 'Install skills and shape your AI personality for better responses.', duration: '3:50' },
        { title: 'Multi-Device Orchestration', description: 'Pair devices and run commands across your entire fleet.', duration: '5:00' },
      ]} />

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
      </nav>

      <div className="clawgpt-layout__content">
        <Outlet />
      </div>
    </div>
  )
}
