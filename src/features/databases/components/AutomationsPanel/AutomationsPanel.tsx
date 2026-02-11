import { useState, useCallback } from 'react'
import { X, Zap } from 'lucide-react'
import { useDatabaseStore } from '../../stores/useDatabaseStore'
import type { DbField } from '../../types'
import type { AutomationRule } from '../../types/automation'
import AutomationsList from '../AutomationsList/AutomationsList'
import AutomationBuilder from '../AutomationBuilder/AutomationBuilder'
import './AutomationsPanel.css'

function rid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

interface AutomationsPanelProps {
  fields: DbField[]
  onClose: () => void
}

export default function AutomationsPanel({
  fields,
  onClose,
}: AutomationsPanelProps) {
  const automations = useDatabaseStore((s) => s.automations)
  const addAutomation = useDatabaseStore((s) => s.addAutomation)
  const updateAutomation = useDatabaseStore((s) => s.updateAutomation)
  const deleteAutomation = useDatabaseStore((s) => s.deleteAutomation)
  const toggleAutomation = useDatabaseStore((s) => s.toggleAutomation)

  const [showBuilder, setShowBuilder] = useState(false)
  const [editingRule, setEditingRule] = useState<AutomationRule | undefined>(undefined)

  const handleNew = useCallback(() => {
    setEditingRule(undefined)
    setShowBuilder(true)
  }, [])

  const handleEdit = useCallback((rule: AutomationRule) => {
    setEditingRule(rule)
    setShowBuilder(true)
  }, [])

  const handleDelete = useCallback((id: string) => {
    deleteAutomation(id)
  }, [deleteAutomation])

  const handleToggle = useCallback((id: string) => {
    toggleAutomation(id)
  }, [toggleAutomation])

  const handleSave = useCallback((data: Omit<AutomationRule, 'id' | 'createdAt' | 'lastRunAt' | 'runCount'>) => {
    if (editingRule) {
      updateAutomation(editingRule.id, data)
    } else {
      const rule: AutomationRule = {
        id: rid(),
        ...data,
        createdAt: new Date().toISOString(),
        lastRunAt: null,
        runCount: 0,
      }
      addAutomation(rule)
    }
    setShowBuilder(false)
    setEditingRule(undefined)
  }, [editingRule, addAutomation, updateAutomation])

  const handleBuilderClose = useCallback(() => {
    setShowBuilder(false)
    setEditingRule(undefined)
  }, [])

  const handleOverlayClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose()
  }, [onClose])

  return (
    <div className="modal-overlay" onClick={handleOverlayClick} role="dialog" aria-modal="true" aria-label="Automations Panel">
      <div className="modal-content automations-panel">
        <div className="modal-header">
          <h2 className="automations-panel__title">
            <Zap size={18} />
            Automations
          </h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div className="automations-panel__body">
          <AutomationsList
            automations={automations}
            onToggle={handleToggle}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onNew={handleNew}
          />
        </div>
      </div>

      {showBuilder && (
        <AutomationBuilder
          fields={fields}
          existingRule={editingRule}
          onSave={handleSave}
          onClose={handleBuilderClose}
        />
      )}
    </div>
  )
}
