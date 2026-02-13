import { useState, useCallback } from 'react'
import { Settings } from 'lucide-react'
import usePlaygroundStore from '../../stores/usePlaygroundStore'
import { MODEL_CATALOG } from '../../lib/models'
import ModelSelector from '../ModelSelector/ModelSelector'
import AgentModeToggle from '../AgentModeToggle/AgentModeToggle'
import TokenUsageBar from '../TokenUsageBar/TokenUsageBar'
import './PlaygroundTopBar.css'

function PlaygroundTopBar() {
  const conversations = usePlaygroundStore((s) => s.conversations)
  const activeConversationId = usePlaygroundStore((s) => s.activeConversationId)
  const setModel = usePlaygroundStore((s) => s.setModel)
  const updateSettings = usePlaygroundStore((s) => s.updateSettings)
  const toggleSettingsPanel = usePlaygroundStore((s) => s.toggleSettingsPanel)
  const renameConversation = usePlaygroundStore((s) => s.renameConversation)

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
      <div className="playground-top-bar">
        <span className="playground-top-bar__empty">No conversation selected</span>
      </div>
    )
  }

  const model = MODEL_CATALOG[activeConversation.modelId]

  return (
    <div className="playground-top-bar">
      <div className="playground-top-bar__left">
        <ModelSelector value={activeConversation.modelId} onChange={setModel} />
        <AgentModeToggle
          enabled={activeConversation.settings.agentMode}
          onToggle={handleAgentToggle}
        />
      </div>

      <div className="playground-top-bar__center">
        {isEditingTitle ? (
          <input
            className="playground-top-bar__title-input"
            value={titleValue}
            onChange={(e) => setTitleValue(e.target.value)}
            onBlur={handleTitleConfirm}
            onKeyDown={handleTitleKeyDown}
            autoFocus
          />
        ) : (
          <button
            className="playground-top-bar__title"
            onClick={handleTitleClick}
            type="button"
          >
            {activeConversation.title}
          </button>
        )}
      </div>

      <div className="playground-top-bar__right">
        <button
          className="playground-top-bar__settings-btn"
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

export default PlaygroundTopBar
