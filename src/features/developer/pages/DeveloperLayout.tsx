import { useState, useCallback } from 'react'
import {
  Book,
  Terminal,
  Webhook,
  Package,
  PlayCircle,
  Key,
} from 'lucide-react'
import ModuleHeader from '../../../components/ui/ModuleHeader'
import { DemoVideoSection } from '../../../components/ui/DemoVideo'
import DeveloperCopilotButton from '../components/DeveloperCopilotButton/DeveloperCopilotButton'
import DeveloperCopilotPanel from '../components/DeveloperCopilotPanel/DeveloperCopilotPanel'
import './DeveloperLayout.css'

type DeveloperTab =
  | 'api-docs'
  | 'cli'
  | 'webhooks'
  | 'sdks'
  | 'sandbox'
  | 'api-keys'

interface NavItem {
  id: DeveloperTab
  label: string
  icon: React.ReactNode
}

const NAV_ITEMS: NavItem[] = [
  { id: 'api-docs', label: 'API Reference', icon: <Book size={18} /> },
  { id: 'cli', label: 'CLI', icon: <Terminal size={18} /> },
  { id: 'webhooks', label: 'Webhooks', icon: <Webhook size={18} /> },
  { id: 'sdks', label: 'SDKs', icon: <Package size={18} /> },
  { id: 'sandbox', label: 'Sandbox', icon: <PlayCircle size={18} /> },
  { id: 'api-keys', label: 'API Keys', icon: <Key size={18} /> },
]

// Lazy-load pages inline to avoid circular deps
import ApiDocsPage from './ApiDocsPage'
import CliDocsPage from './CliDocsPage'
import WebhooksPage from './WebhooksPage'
import SdkPage from './SdkPage'
import SandboxPage from './SandboxPage'
import ApiKeysPage from './ApiKeysPage'

const PAGE_MAP: Record<DeveloperTab, React.FC> = {
  'api-docs': ApiDocsPage,
  'cli': CliDocsPage,
  'webhooks': WebhooksPage,
  'sdks': SdkPage,
  'sandbox': SandboxPage,
  'api-keys': ApiKeysPage,
}

function DeveloperLayout() {
  const [activeTab, setActiveTab] = useState<DeveloperTab>('api-docs')

  const handleTabChange = useCallback((tab: DeveloperTab) => {
    setActiveTab(tab)
  }, [])

  const ActivePage = PAGE_MAP[activeTab]

  return (
    <div className="developer-layout">
      <aside className="developer-layout__sidebar">
        <ModuleHeader title="Developer" subtitle="API docs, webhooks, and SDKs" />

        <DemoVideoSection videos={[
          { title: 'API Playground Tour', description: 'Test API endpoints interactively in the sandbox.', duration: '4:00' },
          { title: 'SDK Integration Guide', description: 'Integrate Orchestree into your app with our SDKs.', duration: '5:30' },
        ]} />

        <nav className="developer-layout__nav">
          {NAV_ITEMS.map(item => (
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
        <ActivePage />
      </main>
      <DeveloperCopilotButton />
      <DeveloperCopilotPanel />
    </div>
  )
}

export default DeveloperLayout
