import { useState, useMemo, useCallback } from 'react'
import useConnectorStore from '../stores/useConnectorStore'
import './ConnectorHubPage.css'

const STATUS_COLORS: Record<string, string> = {
  connected: '#059669',
  disconnected: '#6b7280',
  error: '#dc2626',
}

export default function ConnectorHubPage() {
  const connectors = useConnectorStore((s) => s.connectors)
  const getCategories = useConnectorStore((s) => s.getCategories)
  const setConnectorStatus = useConnectorStore((s) => s.setConnectorStatus)

  const [activeCategory, setActiveCategory] = useState('all')
  const [search, setSearch] = useState('')

  const categories = useMemo(() => getCategories(), [getCategories])
  const connectedCount = useMemo(() => connectors.filter((c) => c.status === 'connected').length, [connectors])

  const filtered = useMemo(() => {
    let result = connectors
    if (activeCategory !== 'all') {
      result = result.filter((c) => c.category === activeCategory)
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter((c) => c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q))
    }
    return result
  }, [connectors, activeCategory, search])

  const handleToggle = useCallback(
    (id: string) => {
      const c = connectors.find((con) => con.id === id)
      if (c) {
        setConnectorStatus(id, c.status === 'connected' ? 'disconnected' : 'connected')
      }
    },
    [connectors, setConnectorStatus],
  )

  return (
    <div className="conn-hub">
      <div className="conn-hub__stats">
        <div className="conn-hub__stat">
          <span className="conn-hub__stat-val">{connectors.length}</span>
          <span className="conn-hub__stat-lbl">Total Connectors</span>
        </div>
        <div className="conn-hub__stat">
          <span className="conn-hub__stat-val" style={{ color: '#059669' }}>{connectedCount}</span>
          <span className="conn-hub__stat-lbl">Connected</span>
        </div>
        <div className="conn-hub__stat">
          <span className="conn-hub__stat-val" style={{ color: 'var(--color-primary)' }}>{categories.length}</span>
          <span className="conn-hub__stat-lbl">Categories</span>
        </div>
      </div>

      <div className="conn-hub__controls">
        <input
          className="conn-hub__search"
          type="text"
          placeholder="Search connectors..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search connectors"
        />
        <div className="conn-hub__filters">
          <button
            className={`conn-hub__pill${activeCategory === 'all' ? ' conn-hub__pill--active' : ''}`}
            onClick={() => setActiveCategory('all')}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              className={`conn-hub__pill${activeCategory === cat ? ' conn-hub__pill--active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="conn-hub__grid">
        {filtered.map((c) => (
          <div key={c.id} className="conn-hub__card">
            <div className="conn-hub__card-top">
              <div className="conn-hub__icon">{c.icon}</div>
              <div className="conn-hub__card-info">
                <span className="conn-hub__card-name">{c.name}</span>
                <span className="conn-hub__card-cat">{c.category}</span>
              </div>
              <span className="conn-hub__dot" style={{ background: STATUS_COLORS[c.status] ?? '#6b7280' }} />
            </div>
            <p className="conn-hub__card-desc">{c.description}</p>
            <div className="conn-hub__card-footer">
              <span className="conn-hub__card-actions">{c.actions.length} actions</span>
              <button
                className={`conn-hub__toggle${c.status === 'connected' ? ' conn-hub__toggle--active' : ''}`}
                onClick={() => handleToggle(c.id)}
              >
                {c.status === 'connected' ? 'Disconnect' : 'Connect'}
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="conn-hub__empty">No connectors match your search.</p>
        )}
      </div>
    </div>
  )
}
