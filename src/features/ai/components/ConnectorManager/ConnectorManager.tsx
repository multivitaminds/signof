import { useState, useMemo } from 'react'
import type { ConnectorDefinition } from '../../types'
import './ConnectorManager.css'

interface ConnectorManagerProps {
  connectors: ConnectorDefinition[]
  categories: string[]
  onToggleConnection?: (connectorId: string) => void
}

const STATUS_COLORS: Record<string, string> = {
  connected: '#059669',
  disconnected: '#6b7280',
  error: '#dc2626',
}

export default function ConnectorManager({ connectors, categories, onToggleConnection }: ConnectorManagerProps) {
  const [activeCategory, setActiveCategory] = useState('all')

  const filtered = useMemo(() => {
    if (activeCategory === 'all') return connectors
    return connectors.filter((c) => c.category === activeCategory)
  }, [connectors, activeCategory])

  return (
    <div className="conn-manager">
      <div className="conn-manager__filters">
        <button
          className={`conn-manager__filter-pill${activeCategory === 'all' ? ' conn-manager__filter-pill--active' : ''}`}
          onClick={() => setActiveCategory('all')}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            className={`conn-manager__filter-pill${activeCategory === cat ? ' conn-manager__filter-pill--active' : ''}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="conn-manager__grid">
        {filtered.map((c) => (
          <div key={c.id} className="conn-manager__card">
            <div className="conn-manager__card-header">
              <span className="conn-manager__icon">{c.icon}</span>
              <div className="conn-manager__card-info">
                <span className="conn-manager__name">{c.name}</span>
                <span className="conn-manager__category">{c.category}</span>
              </div>
              <span
                className="conn-manager__status-dot"
                style={{ background: STATUS_COLORS[c.status] ?? '#6b7280' }}
                title={c.status}
              />
            </div>
            <p className="conn-manager__desc">{c.description}</p>
            <div className="conn-manager__footer">
              <span className="conn-manager__action-count">{c.actions.length} actions</span>
              <button
                className={`conn-manager__toggle ${c.status === 'connected' ? 'conn-manager__toggle--disconnect' : ''}`}
                onClick={() => onToggleConnection?.(c.id)}
              >
                {c.status === 'connected' ? 'Disconnect' : 'Connect'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
