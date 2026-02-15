import { useState, useMemo, useCallback } from 'react'
import { getNodesByCategory, getAllNodeDefinitions } from '../../lib/nodeDefinitions'
import type { WorkflowNodeDefinition } from '../../types'
import './WorkflowNodePalette.css'

interface WorkflowNodePaletteProps {
  onNodeSelect?: (nodeType: string) => void
}

const CATEGORIES: Array<{
  key: WorkflowNodeDefinition['category']
  label: string
  color: string
}> = [
  { key: 'trigger', label: 'Triggers', color: '#8B5CF6' },
  { key: 'action', label: 'Actions', color: '#3B82F6' },
  { key: 'agent', label: 'Agents', color: '#EC4899' },
  { key: 'logic', label: 'Logic', color: '#F59E0B' },
  { key: 'transform', label: 'Transforms', color: '#10B981' },
]

export default function WorkflowNodePalette({ onNodeSelect }: WorkflowNodePaletteProps) {
  const [search, setSearch] = useState('')
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})

  const allNodes = useMemo(() => getAllNodeDefinitions(), [])

  const filteredGroups = useMemo(() => {
    const q = search.toLowerCase().trim()
    return CATEGORIES.map((cat) => {
      const catNodes = getNodesByCategory(cat.key)
      const filtered = q
        ? catNodes.filter(
            (n) =>
              n.label.toLowerCase().includes(q) ||
              n.description.toLowerCase().includes(q) ||
              n.type.toLowerCase().includes(q),
          )
        : catNodes
      return { ...cat, nodes: filtered }
    }).filter((g) => g.nodes.length > 0)
  }, [search])

  const toggleCategory = useCallback((key: string) => {
    setCollapsed((prev) => ({ ...prev, [key]: !prev[key] }))
  }, [])

  const handleDragStart = useCallback((e: React.DragEvent, nodeType: string) => {
    e.dataTransfer.setData('application/workflow-node-type', nodeType)
    e.dataTransfer.effectAllowed = 'copy'
  }, [])

  return (
    <div className="wf-palette" role="complementary" aria-label="Workflow node palette">
      <div className="wf-palette__header">
        <h3 className="wf-palette__title">Nodes</h3>
        <span className="wf-palette__count">{allNodes.length}</span>
      </div>

      <div className="wf-palette__search">
        <input
          className="wf-palette__search-input"
          type="text"
          placeholder="Search nodes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search nodes"
        />
      </div>

      <div className="wf-palette__list">
        {filteredGroups.map((group) => {
          const isCollapsed = collapsed[group.key] ?? false
          return (
            <div key={group.key} className="wf-palette__group">
              <button
                className="wf-palette__group-header"
                onClick={() => toggleCategory(group.key)}
                aria-expanded={!isCollapsed}
              >
                <span className="wf-palette__group-dot" style={{ background: group.color }} />
                <span className="wf-palette__group-chevron">{isCollapsed ? '\u25B6' : '\u25BC'}</span>
                <span className="wf-palette__group-label">{group.label}</span>
                <span className="wf-palette__group-count">{group.nodes.length}</span>
              </button>
              {!isCollapsed && (
                <div className="wf-palette__group-items">
                  {group.nodes.map((node) => (
                    <div
                      key={node.type}
                      className="wf-palette__item"
                      draggable
                      onDragStart={(e) => handleDragStart(e, node.type)}
                      onClick={() => onNodeSelect?.(node.type)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          onNodeSelect?.(node.type)
                        }
                      }}
                    >
                      <div className="wf-palette__item-icon" style={{ color: node.color }}>
                        {node.icon}
                      </div>
                      <div className="wf-palette__item-info">
                        <span className="wf-palette__item-label">{node.label}</span>
                        <span className="wf-palette__item-desc">{node.description}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
        {filteredGroups.length === 0 && (
          <p className="wf-palette__empty">No nodes match your search.</p>
        )}
      </div>
    </div>
  )
}
