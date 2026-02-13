import { NavLink, Outlet } from 'react-router-dom'
import ModuleHeader from '../../../components/ui/ModuleHeader'
import { DemoVideoSection } from '../../../components/ui/DemoVideo'
import './AILayout.css'

export default function AILayout() {
  return (
    <div className="ai-layout">
      <ModuleHeader title="Copilot" subtitle="AI agents and organizational memory" />

      <DemoVideoSection videos={[
        { title: 'Getting Started with Copilot Agents', description: 'Learn how to configure and run your first AI agent.', duration: '3:45' },
        { title: 'Building Multi-Agent Pipelines', description: 'Chain multiple agents together for complex workflows.', duration: '5:20' },
        { title: 'Using the Workflow Canvas', description: 'Visual drag-and-drop workflow builder walkthrough.', duration: '4:10' },
      ]} />

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
      </nav>

      <div className="ai-layout__content">
        <Outlet />
      </div>
    </div>
  )
}
