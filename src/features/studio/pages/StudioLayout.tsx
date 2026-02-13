import { useEffect, useCallback } from 'react'
import useStudioStore from '../stores/useStudioStore'
import ConversationSidebar from '../components/ConversationSidebar/ConversationSidebar'
import StudioTopBar from '../components/StudioTopBar/StudioTopBar'
import ChatArea from '../components/ChatArea/ChatArea'
import ChatInput from '../components/ChatInput/ChatInput'
import SettingsPanel from '../components/SettingsPanel/SettingsPanel'
import './StudioLayout.css'

export default function StudioLayout() {
  const conversations = useStudioStore((s) => s.conversations)
  const activeConversationId = useStudioStore((s) => s.activeConversationId)
  const isTyping = useStudioStore((s) => s.isTyping)
  const settingsPanelOpen = useStudioStore((s) => s.settingsPanelOpen)
  const createConversation = useStudioStore((s) => s.createConversation)
  const sendMessage = useStudioStore((s) => s.sendMessage)
  const updateSettings = useStudioStore((s) => s.updateSettings)
  const toggleSettingsPanel = useStudioStore((s) => s.toggleSettingsPanel)

  const activeConversation = conversations.find((c) => c.id === activeConversationId) ?? null

  useEffect(() => {
    if (conversations.length === 0) {
      createConversation()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSend = useCallback((content: string) => {
    sendMessage(content)
  }, [sendMessage])

  const handleSettingsUpdate = useCallback((settings: Parameters<typeof updateSettings>[0]) => {
    updateSettings(settings)
  }, [updateSettings])

  const handleSettingsClose = useCallback(() => {
    toggleSettingsPanel()
  }, [toggleSettingsPanel])

  return (
    <div className={`studio-layout ${settingsPanelOpen ? 'studio-layout--settings-open' : ''}`}>
      <aside className="studio-layout__sidebar">
        <ConversationSidebar />
      </aside>
      <main className="studio-layout__main">
        <StudioTopBar />
        <ChatArea
          messages={activeConversation?.messages ?? []}
          isTyping={isTyping}
        />
        <ChatInput
          onSend={handleSend}
          disabled={!activeConversation || isTyping}
        />
      </main>
      {settingsPanelOpen && activeConversation && (
        <aside className="studio-layout__settings">
          <SettingsPanel
            settings={activeConversation.settings}
            onUpdate={handleSettingsUpdate}
            onClose={handleSettingsClose}
          />
        </aside>
      )}
    </div>
  )
}
