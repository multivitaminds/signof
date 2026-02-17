import { NavLink, Outlet } from 'react-router-dom'
import ModuleHeader from '../../../components/ui/ModuleHeader'
import { DemoVideoSection } from '../../../components/ui/DemoVideo'
import './BrainTreeLayout.css'

export default function BrainTreeLayout() {
  return (
    <div className="clawgpt-layout">
      <ModuleHeader
        title="ClawGPT"
        subtitle="Central intelligence hub — route messages, manage skills, define your brain's personality"
      />

      <DemoVideoSection videos={[
        { title: 'Getting Started with ClawGPT', description: 'Connect your first channel and start routing messages through the brain.', duration: '4:15' },
        { title: 'Configuring Skills & Soul', description: 'Install skills and shape your brain personality for better responses.', duration: '3:50' },
        { title: 'Multi-Device Orchestration', description: 'Pair devices and run commands across your entire fleet.', duration: '5:00' },
      ]} />

      <nav className="clawgpt-layout__tabs" aria-label="ClawGPT sections">
        <NavLink
          to="/brain/dashboard"
          className={({ isActive }) =>
            `clawgpt-layout__tab${isActive ? ' clawgpt-layout__tab--active' : ''}`
          }
        >
          Dashboard
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
          Soul
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
