import { useState, useMemo, useCallback } from 'react'
import {
  Search, PenTool, Code2, Palette, BarChart3,
  ClipboardList, Users, CheckSquare, X,
  TrendingUp, Megaphone, DollarSign, Scale, ShieldCheck,
  UserPlus, HeartHandshake, Languages, Globe, Share2,
  Shield, Server, Circle, Plus,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { AGENT_DEFINITIONS } from '../../lib/agentDefinitions'
import { AgentCategory } from '../../types'
import type { AgentType } from '../../types'
import './NodePicker.css'

const ICON_MAP: Record<string, LucideIcon> = {
  Search, PenTool, Code2, Palette, BarChart3,
  ClipboardList, Users, CheckSquare,
  TrendingUp, Megaphone, DollarSign, Scale, ShieldCheck,
  UserPlus, HeartHandshake, Languages, Globe, Share2,
  Shield, Server,
}

function getIcon(iconName: string): LucideIcon {
  return ICON_MAP[iconName] ?? Circle
}

const CATEGORY_ORDER: Array<{ key: string; label: string }> = [
  { key: AgentCategory.Core, label: 'Core' },
  { key: AgentCategory.Creative, label: 'Creative' },
  { key: AgentCategory.Technical, label: 'Technical' },
  { key: AgentCategory.Business, label: 'Business' },
  { key: AgentCategory.Legal, label: 'Legal' },
  { key: AgentCategory.People, label: 'People' },
]

interface NodePickerProps {
  isOpen: boolean
  onClose: () => void
  onAddNode: (agentType: AgentType) => void
}

export default function NodePicker({ isOpen, onClose, onAddNode }: NodePickerProps) {
  const [search, setSearch] = useState('')

  const grouped = useMemo(() => {
    const q = search.toLowerCase()
    const filtered = search.trim()
      ? AGENT_DEFINITIONS.filter(a =>
          a.label.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q)
        )
      : AGENT_DEFINITIONS

    const groups: Array<{ category: string; agents: typeof AGENT_DEFINITIONS }> = []
    for (const cat of CATEGORY_ORDER) {
      const agents = filtered.filter(a => a.category === cat.key)
      if (agents.length > 0) {
        groups.push({ category: cat.label, agents })
      }
    }
    return groups
  }, [search])

  const handleAdd = useCallback((agentType: AgentType) => {
    onAddNode(agentType)
  }, [onAddNode])

  if (!isOpen) return null

  return (
    <div className="node-picker" role="complementary" aria-label="Add agent node">
      <div className="node-picker__header">
        <h3 className="node-picker__title">Add Node</h3>
        <button
          className="node-picker__close"
          onClick={onClose}
          aria-label="Close node picker"
        >
          <X size={16} />
        </button>
      </div>

      <div className="node-picker__search">
        <Search size={14} className="node-picker__search-icon" />
        <input
          className="node-picker__search-input"
          type="text"
          placeholder="Search agents..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          aria-label="Search agents"
        />
      </div>

      <div className="node-picker__list">
        {grouped.map(group => (
          <div key={group.category} className="node-picker__group">
            <h4 className="node-picker__group-label">{group.category}</h4>
            {group.agents.map(agent => {
              const IconComp = getIcon(agent.icon)
              return (
                <button
                  key={agent.type}
                  className="node-picker__item"
                  onClick={() => handleAdd(agent.type)}
                  aria-label={`Add ${agent.label} agent`}
                >
                  <div className="node-picker__item-icon" style={{ color: agent.color }}>
                    <IconComp size={16} />
                  </div>
                  <div className="node-picker__item-info">
                    <span className="node-picker__item-name">{agent.label}</span>
                    <span className="node-picker__item-desc">{agent.description}</span>
                  </div>
                  <Plus size={14} className="node-picker__item-add" />
                </button>
              )
            })}
          </div>
        ))}

        {grouped.length === 0 && (
          <p className="node-picker__empty">No agents match your search.</p>
        )}
      </div>
    </div>
  )
}
