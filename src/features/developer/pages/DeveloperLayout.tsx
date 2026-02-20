import { useState, useCallback } from 'react'
import {
  Book,
  Terminal,
  Webhook,
  Package,
  PlayCircle,
  Key,
  Home,
  Cpu,
  Bot,
} from 'lucide-react'
import ModuleHeader from '../../../components/ui/ModuleHeader'
import { DemoVideoSection } from '../../../components/ui/DemoVideo'
import DeveloperCopilotButton from '../components/DeveloperCopilotButton/DeveloperCopilotButton'
import DeveloperCopilotPanel from '../components/DeveloperCopilotPanel/DeveloperCopilotPanel'
import './DeveloperLayout.css'

type DeveloperTab =
  | 'overview'
  | 'api-docs'
  | 'cli'
  | 'webhooks'
  | 'sdks'
  | 'sandbox'
  | 'api-keys'
  | 'mcp'
  | 'agent-toolkit'

interface NavItem {
  id: DeveloperTab
  label: string
  icon: React.ReactNode
}

interface NavSection {
  label: string
  items: NavItem[]
}

const NAV_SECTIONS: NavSection[] = [
  {
    label: 'Getting Started',
    items: [
      { id: 'overview', label: 'Overview', icon: <Home size={18} /> },
    ],
  },
  {
    label: 'Build',
    items: [
      { id: 'api-docs', label: 'API Reference', icon: <Book size={18} /> },
      { id: 'sdks', label: 'SDKs', icon: <Package size={18} /> },
      { id: 'cli', label: 'CLI & Shell', icon: <Terminal size={18} /> },
      { id: 'mcp', label: 'MCP', icon: <Cpu size={18} /> },
    ],
  },
  {
    label: 'Tools',
    items: [
      { id: 'sandbox', label: 'Sandbox', icon: <PlayCircle size={18} /> },
      { id: 'webhooks', label: 'Webhooks', icon: <Webhook size={18} /> },
      { id: 'api-keys', label: 'API Keys', icon: <Key size={18} /> },
    ],
  },
  {
    label: 'AI Platform',
    items: [
      { id: 'agent-toolkit', label: 'Agent Toolkit', icon: <Bot size={18} /> },
    ],
  },
]

// Page imports
import ApiDocsPage from './ApiDocsPage'
import CliDocsPage from './CliDocsPage'
import WebhooksPage from './WebhooksPage'
import SdkPage from './SdkPage'
import SandboxPage from './SandboxPage'
import ApiKeysPage from './ApiKeysPage'
import DocsHomePage from './DocsHomePage'
import McpDocsPage from './McpDocsPage'
import AgentToolkitPage from './AgentToolkitPage'

const PAGE_MAP: Record<Exclude<DeveloperTab, 'overview'>, React.FC> = {
  'api-docs': ApiDocsPage,
  'cli': CliDocsPage,
  'webhooks': WebhooksPage,
  'sdks': SdkPage,
  'sandbox': SandboxPage,
  'api-keys': ApiKeysPage,
  'mcp': McpDocsPage,
  'agent-toolkit': AgentToolkitPage,
}

function DeveloperLayout() {
  const [activeTab, setActiveTab] = useState<DeveloperTab>('overview')

  const handleTabChange = useCallback((tab: DeveloperTab) => {
    setActiveTab(tab)
  }, [])

  const handleNavigate = useCallback((tab: string) => {
    setActiveTab(tab as DeveloperTab)
  }, [])

  return (
    <div className="developer-layout">
      <aside className="developer-layout__sidebar">
        <ModuleHeader title="Developer" subtitle="API docs, webhooks, and SDKs" />

        <DemoVideoSection videos={[
          { title: 'API Playground Tour', description: 'Test API endpoints interactively in the sandbox.', duration: '4:00' },
          { title: 'SDK Integration Guide', description: 'Integrate Orchestree into your app with our SDKs.', duration: '5:30' },
        ]} />

        <nav className="developer-layout__nav">
          {NAV_SECTIONS.map((section, idx) => (
            <div key={section.label} className="developer-layout__nav-section">
              {idx > 0 && <div className="developer-layout__nav-section-divider" />}
              <span className="developer-layout__nav-section-label">{section.label}</span>
              {section.items.map(item => (
                <button
                  key={item.id}
                  className={`developer-layout__nav-item ${
                    activeTab === item.id ? 'developer-layout__nav-item--active' : ''
                  }`}
                  onClick={() => handleTabChange(item.id)}
                  type="button"
                  aria-current={activeTab === item.id ? 'page' : undefined}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          ))}
        </nav>

        <div className="developer-layout__sidebar-footer">
          <a
            className="developer-layout__footer-link"
            href="https://docs.orchestree.io"
            target="_blank"
            rel="noopener noreferrer"
          >
            Full Documentation
          </a>
          <a
            className="developer-layout__footer-link"
            href="https://status.orchestree.io"
            target="_blank"
            rel="noopener noreferrer"
          >
            API Status
          </a>
        </div>
      </aside>

      <main className="developer-layout__content">
        {activeTab === 'overview' ? (
          <DocsHomePage onNavigate={handleNavigate} />
        ) : (
          (() => {
            const ActivePage = PAGE_MAP[activeTab]
            return <ActivePage />
          })()
        )}
      </main>
      <DeveloperCopilotButton />
      <DeveloperCopilotPanel />
    </div>
  )
}

export default DeveloperLayout
