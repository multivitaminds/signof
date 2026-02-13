import { Search, Star } from 'lucide-react'
import type { CategoryTab } from '../../lib/agentIcons'
import './AgentCategoryFilter.css'

interface AgentCategoryFilterProps {
  categories: CategoryTab[]
  activeCategory: string
  onCategoryChange: (key: string) => void
  searchQuery: string
  onSearchChange: (query: string) => void
}

export default function AgentCategoryFilter({
  categories,
  activeCategory,
  onCategoryChange,
  searchQuery,
  onSearchChange,
}: AgentCategoryFilterProps) {
  return (
    <div className="copilot-agents__filters">
      <div className="copilot-agents__category-pills" role="tablist" aria-label="Agent categories">
        {categories.map(tab => (
          <button
            key={tab.key}
            className={`copilot-agents__category-pill${activeCategory === tab.key ? ' copilot-agents__category-pill--active' : ''}`}
            onClick={() => onCategoryChange(tab.key)}
            role="tab"
            aria-selected={activeCategory === tab.key}
          >
            {tab.key === 'favorites' && <Star size={12} />}
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>
      <div className="copilot-agents__search-bar">
        <Search size={16} className="copilot-agents__search-icon" />
        <input
          className="copilot-agents__search-input"
          type="text"
          placeholder="Search agents..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          aria-label="Search agents"
        />
      </div>
    </div>
  )
}
