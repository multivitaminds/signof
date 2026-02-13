import { useEffect, useCallback } from 'react'
import usePlaygroundStore from '../stores/usePlaygroundStore'
import ModuleHeader from '../../../components/ui/ModuleHeader'
import ConversationSidebar from '../components/ConversationSidebar/ConversationSidebar'
import PlaygroundTopBar from '../components/PlaygroundTopBar/PlaygroundTopBar'
import ChatArea from '../components/ChatArea/ChatArea'
import ChatInput from '../components/ChatInput/ChatInput'
import SettingsPanel from '../components/SettingsPanel/SettingsPanel'
import './PlaygroundLayout.css'

export default function PlaygroundLayout() {
  const conversations = usePlaygroundStore((s) => s.conversations)
  const activeConversationId = usePlaygroundStore((s) => s.activeConversationId)
  const isTyping = usePlaygroundStore((s) => s.isTyping)
  const settingsPanelOpen = usePlaygroundStore((s) => s.settingsPanelOpen)
  const createConversation = usePlaygroundStore((s) => s.createConversation)
  const sendMessage = usePlaygroundStore((s) => s.sendMessage)
  const updateSettings = usePlaygroundStore((s) => s.updateSettings)
  const toggleSettingsPanel = usePlaygroundStore((s) => s.toggleSettingsPanel)

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
    <div className={`playground-layout ${settingsPanelOpen ? 'playground-layout--settings-open' : ''}`}>
      <aside className="playground-layout__sidebar">
        <ModuleHeader title="Playground" subtitle="Test AI models and conversations" />
        <ConversationSidebar />
      </aside>
      <main className="playground-layout__main">
        <PlaygroundTopBar />
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
        <aside className="playground-layout__settings">
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
