import { useState, useCallback } from 'react'
import { Settings } from 'lucide-react'
import useStudioStore from '../../stores/useStudioStore'
import { MODEL_CATALOG } from '../../lib/models'
import ModelSelector from '../ModelSelector/ModelSelector'
import AgentModeToggle from '../AgentModeToggle/AgentModeToggle'
import TokenUsageBar from '../TokenUsageBar/TokenUsageBar'
import './StudioTopBar.css'

function StudioTopBar() {
  const conversations = useStudioStore((s) => s.conversations)
  const activeConversationId = useStudioStore((s) => s.activeConversationId)
  const setModel = useStudioStore((s) => s.setModel)
  const updateSettings = useStudioStore((s) => s.updateSettings)
  const toggleSettingsPanel = useStudioStore((s) => s.toggleSettingsPanel)
  const renameConversation = useStudioStore((s) => s.renameConversation)

  const activeConversation = conversations.find((c) => c.id === activeConversationId) ?? null

  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [titleValue, setTitleValue] = useState('')

  const handleTitleClick = useCallback(() => {
    if (!activeConversation) return
    setTitleValue(activeConversation.title)
    setIsEditingTitle(true)
  }, [activeConversation])

  const handleTitleConfirm = useCallback(() => {
    if (activeConversation && titleValue.trim()) {
      renameConversation(activeConversation.id, titleValue.trim())
    }
    setIsEditingTitle(false)
  }, [activeConversation, titleValue, renameConversation])

  const handleTitleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleTitleConfirm()
    if (e.key === 'Escape') setIsEditingTitle(false)
  }, [handleTitleConfirm])

  const handleAgentToggle = useCallback(() => {
    if (!activeConversation) return
    updateSettings({ agentMode: !activeConversation.settings.agentMode })
  }, [activeConversation, updateSettings])

  if (!activeConversation) {
    return (
      <div className="studio-top-bar">
        <span className="studio-top-bar__empty">No conversation selected</span>
      </div>
    )
  }

  const model = MODEL_CATALOG[activeConversation.modelId]

  return (
    <div className="studio-top-bar">
      <div className="studio-top-bar__left">
        <ModelSelector value={activeConversation.modelId} onChange={setModel} />
        <AgentModeToggle
          enabled={activeConversation.settings.agentMode}
          onToggle={handleAgentToggle}
        />
      </div>

      <div className="studio-top-bar__center">
        {isEditingTitle ? (
          <input
            className="studio-top-bar__title-input"
            value={titleValue}
            onChange={(e) => setTitleValue(e.target.value)}
            onBlur={handleTitleConfirm}
            onKeyDown={handleTitleKeyDown}
            autoFocus
          />
        ) : (
          <button
            className="studio-top-bar__title"
            onClick={handleTitleClick}
            type="button"
          >
            {activeConversation.title}
          </button>
        )}
      </div>

      <div className="studio-top-bar__right">
        <button
          className="studio-top-bar__settings-btn"
          onClick={toggleSettingsPanel}
          type="button"
          aria-label="Toggle settings"
        >
          <Settings size={18} />
        </button>
        <TokenUsageBar
          used={activeConversation.totalTokens}
          total={model.contextWindow}
        />
      </div>
    </div>
  )
}

export default StudioTopBar
