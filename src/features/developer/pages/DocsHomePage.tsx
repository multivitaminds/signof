import { useCallback } from 'react'
import { Book, Package, Terminal, Bot } from 'lucide-react'
import './DocsHomePage.css'

// ─── Data ────────────────────────────────────────────────────────────────────

const QUICK_START_CARDS = [
  { icon: 'book', title: 'API Reference', description: 'Explore endpoints for documents, projects, scheduling, and databases', tabTarget: 'api-docs' },
  { icon: 'package', title: 'SDKs', description: 'Official libraries for JavaScript, Python, Ruby, Go, and Java', tabTarget: 'sdks' },
  { icon: 'terminal', title: 'CLI & Shell', description: 'Manage your workspace from the command line', tabTarget: 'cli' },
  { icon: 'bot', title: 'Agent Toolkit', description: 'Build autonomous AI agents for your workflows', tabTarget: 'agent-toolkit' },
]

const PRODUCT_API_CARDS = [
  { name: 'Documents', description: 'Upload, send, and track document signatures', color: '#4F46E5', endpointCount: 12 },
  { name: 'Projects', description: 'Issues, boards, cycles, and team workflows', color: '#059669', endpointCount: 8 },
  { name: 'Scheduling', description: 'Events, bookings, and availability management', color: '#D97706', endpointCount: 6 },
  { name: 'Databases', description: 'Multi-view tables, records, and queries', color: '#DC2626', endpointCount: 10 },
  { name: 'AI Agents', description: 'Spawn, manage, and orchestrate autonomous agents', color: '#7C3AED', endpointCount: 5 },
  { name: 'Tax & Accounting', description: 'Filings, compliance, and financial reporting', color: '#0891B2', endpointCount: 7 },
]

const GETTING_STARTED_STEPS = [
  { number: 1, title: 'Get your API keys', description: 'Create a test-mode key in the API Keys dashboard' },
  { number: 2, title: 'Install an SDK', description: 'npm install @origina/sdk or pick your language' },
  { number: 3, title: 'Make your first call', description: 'List documents, create a project, or spawn an agent' },
  { number: 4, title: 'Go live', description: 'Switch to live-mode keys and deploy to production' },
]

const RESOURCE_LINKS = [
  { title: 'API Status', href: 'https://status.origina.io', description: 'Real-time availability and incident history' },
  { title: 'Changelog', href: 'https://origina.io/changelog', description: 'Latest updates, new endpoints, and breaking changes' },
  { title: 'Community', href: 'https://community.origina.io', description: 'Ask questions, share integrations, and get help' },
  { title: 'GitHub', href: 'https://github.com/origina-io', description: 'Open-source SDKs, examples, and starter kits' },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

function renderIcon(iconName: string) {
  switch (iconName) {
    case 'book': return <Book size={24} />
    case 'package': return <Package size={24} />
    case 'terminal': return <Terminal size={24} />
    case 'bot': return <Bot size={24} />
    default: return null
  }
}

// ─── Component ───────────────────────────────────────────────────────────────

interface DocsHomePageProps {
  onNavigate?: (tab: string) => void
}

function DocsHomePage({ onNavigate }: DocsHomePageProps) {
  const handleCardClick = useCallback((tabTarget: string) => {
    onNavigate?.(tabTarget)
  }, [onNavigate])

  const handleCardKeyDown = useCallback((e: React.KeyboardEvent, tabTarget: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onNavigate?.(tabTarget)
    }
  }, [onNavigate])

  return (
    <div className="docs-home">
      {/* Hero */}
      <div className="docs-home__hero">
        <h1 className="docs-home__title">Build with OriginA</h1>
        <p className="docs-home__subtitle">
          Everything you need to integrate documents, projects, scheduling, databases, and AI agents into your product.
        </p>
      </div>

      {/* Quick Start Grid */}
      <section className="docs-home__section">
        <h2 className="docs-home__section-title">Quick Start</h2>
        <div className="docs-home__quick-start-grid">
          {QUICK_START_CARDS.map(card => (
            <div
              key={card.tabTarget}
              className="docs-home__quick-start-card"
              role="button"
              tabIndex={0}
              onClick={() => handleCardClick(card.tabTarget)}
              onKeyDown={(e) => handleCardKeyDown(e, card.tabTarget)}
            >
              <div className="docs-home__quick-start-icon">{renderIcon(card.icon)}</div>
              <h3 className="docs-home__quick-start-title">{card.title}</h3>
              <p className="docs-home__quick-start-desc">{card.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Product APIs Grid */}
      <section className="docs-home__section">
        <h2 className="docs-home__section-title">Product APIs</h2>
        <div className="docs-home__product-grid">
          {PRODUCT_API_CARDS.map(card => (
            <div key={card.name} className="docs-home__product-card" style={{ borderLeftColor: card.color }}>
              <h3 className="docs-home__product-name">{card.name}</h3>
              <p className="docs-home__product-desc">{card.description}</p>
              <span className="docs-home__product-count">{card.endpointCount} endpoints</span>
            </div>
          ))}
        </div>
      </section>

      {/* Getting Started Steps */}
      <section className="docs-home__section">
        <h2 className="docs-home__section-title">Getting Started</h2>
        <div className="docs-home__steps">
          {GETTING_STARTED_STEPS.map(step => (
            <div key={step.number} className="docs-home__step">
              <span className="docs-home__step-number">{step.number}</span>
              <div className="docs-home__step-content">
                <h3 className="docs-home__step-title">{step.title}</h3>
                <p className="docs-home__step-desc">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Resources Grid */}
      <section className="docs-home__section">
        <h2 className="docs-home__section-title">Resources</h2>
        <div className="docs-home__resources-grid">
          {RESOURCE_LINKS.map(link => (
            <a
              key={link.title}
              className="docs-home__resource-card"
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
            >
              <h3 className="docs-home__resource-title">{link.title}</h3>
              <p className="docs-home__resource-desc">{link.description}</p>
            </a>
          ))}
        </div>
      </section>
    </div>
  )
}

export default DocsHomePage
