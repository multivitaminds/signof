import { useState, useCallback } from 'react'
import {
  LayoutGrid,
  Bot,
  Plug,
  DollarSign,
  Map,
} from 'lucide-react'
import ModuleHeader from '../../../components/ui/ModuleHeader'
import OverviewPage from './OverviewPage'
import AgentCatalogPage from './AgentCatalogPage'
import IntegrationsPage from './IntegrationsPage'
import BusinessPage from './BusinessPage'
import RoadmapPage from './RoadmapPage'
import type { PlatformTab } from '../types'
import './PlatformLayout.css'

interface NavItem {
  id: PlatformTab
  label: string
  icon: React.ReactNode
}

const NAV_ITEMS: NavItem[] = [
  { id: 'overview', label: 'Overview', icon: <LayoutGrid size={18} /> },
  { id: 'agents', label: 'Agent Catalog', icon: <Bot size={18} /> },
  { id: 'integrations', label: 'Integrations', icon: <Plug size={18} /> },
  { id: 'business', label: 'Business', icon: <DollarSign size={18} /> },
  { id: 'roadmap', label: 'Roadmap', icon: <Map size={18} /> },
]

const PAGE_MAP: Record<PlatformTab, React.FC> = {
  overview: OverviewPage,
  agents: AgentCatalogPage,
  integrations: IntegrationsPage,
  business: BusinessPage,
  roadmap: RoadmapPage,
}

function PlatformLayout() {
  const [activeTab, setActiveTab] = useState<PlatformTab>('overview')

  const handleTabChange = useCallback((tab: PlatformTab) => {
    setActiveTab(tab)
  }, [])

  const ActivePage = PAGE_MAP[activeTab]

  return (
    <div className="platform-layout">
      <aside className="platform-layout__sidebar">
        <ModuleHeader title="Platform" subtitle="SignOf Business Plan" />

        <nav className="platform-layout__nav">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              className={`platform-layout__nav-item ${
                activeTab === item.id ? 'platform-layout__nav-item--active' : ''
              }`}
              onClick={() => handleTabChange(item.id)}
              type="button"
              aria-current={activeTab === item.id ? 'page' : undefined}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="platform-layout__sidebar-footer">
          <div className="platform-layout__footer-stat">
            <strong>185</strong> Agents
          </div>
          <div className="platform-layout__footer-stat">
            <strong>739+</strong> Integrations
          </div>
          <div className="platform-layout__footer-stat">
            <strong>500+</strong> Connectors
          </div>
        </div>
      </aside>

      <main className="platform-layout__content">
        <ActivePage />
      </main>
    </div>
  )
}

export default PlatformLayout
