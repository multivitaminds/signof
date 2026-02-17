import { useState, useCallback } from 'react'
import { useSoulStore } from '../stores/useSoulStore'
import { sendSoulUpdate, isGatewayConnected } from '../lib/gatewayClient'
import SoulEditor from '../components/SoulEditor/SoulEditor'
import './SoulPage.css'

export default function SoulPage() {
  const {
    soulConfig,
    presets,
    activePresetId,
    updateSoul,
    resetToDefault,
    switchPreset,
    addRule,
    removeRule,
    addContext,
    removeContext,
  } = useSoulStore()

  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [testMessage, setTestMessage] = useState('')
  const [testResponse, setTestResponse] = useState('')
  const [isTesting, setIsTesting] = useState(false)

  const handleSave = useCallback(() => {
    setSaveStatus('saving')
    sendSoulUpdate(soulConfig)
    setTimeout(() => {
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 2000)
    }, 500)
  }, [soulConfig])

  const handleReset = useCallback(() => {
    resetToDefault()
    setSaveStatus('idle')
  }, [resetToDefault])

  const handleTestPersonality = useCallback(async () => {
    if (!testMessage.trim()) return
    if (!isGatewayConnected()) {
      setTestResponse('Gateway is offline. Start the gateway first to test personality.')
      return
    }

    setIsTesting(true)
    setTestResponse('')

    try {
      const res = await fetch('/api/chat/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: testMessage }],
          systemPrompt: buildSimplePrompt(soulConfig),
          maxTokens: 200,
        }),
      })
      const data = await res.json() as { content?: string; error?: string }
      setTestResponse(data.content ?? data.error ?? 'No response')
    } catch {
      setTestResponse('Failed to reach server. Make sure the backend is running.')
    } finally {
      setIsTesting(false)
    }
  }, [testMessage, soulConfig])

  return (
    <div className="soul-page">
      <SoulEditor
        config={soulConfig}
        presets={presets}
        activePresetId={activePresetId}
        onUpdate={updateSoul}
        onSwitchPreset={switchPreset}
        onReset={resetToDefault}
        onAddRule={addRule}
        onRemoveRule={removeRule}
        onAddContext={addContext}
        onRemoveContext={removeContext}
      />

      <div className="soul-page__test-panel">
        <h4 className="soul-page__test-title">Test Personality</h4>
        <div className="soul-page__test-input-row">
          <input
            type="text"
            className="soul-page__test-input"
            placeholder="Type a test message..."
            value={testMessage}
            onChange={(e) => setTestMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleTestPersonality()
              }
            }}
            aria-label="Test message"
          />
          <button
            className="btn--outline"
            onClick={handleTestPersonality}
            disabled={isTesting || !testMessage.trim()}
          >
            {isTesting ? 'Testing...' : 'Test'}
          </button>
        </div>
        {testResponse && (
          <div className="soul-page__test-response">
            <strong>Atlas:</strong> {testResponse}
          </div>
        )}
      </div>

      <div className="soul-page__actions">
        <button className="btn--primary" onClick={handleSave} disabled={saveStatus === 'saving'}>
          {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved!' : 'Save Configuration'}
        </button>
        <button className="btn--secondary" onClick={handleReset}>
          Reset to Default
        </button>
      </div>
    </div>
  )
}

function buildSimplePrompt(config: { systemPrompt: string; rules: string[]; context: string[]; responseStyle: string; language: string; timezone: string }): string {
  const sections: string[] = []
  if (config.systemPrompt) sections.push(config.systemPrompt)
  if (config.rules.length > 0) {
    sections.push('Rules:\n' + config.rules.map((r, i) => `${i + 1}. ${r}`).join('\n'))
  }
  if (config.context.length > 0) {
    sections.push('Context:\n' + config.context.map((c) => `- ${c}`).join('\n'))
  }
  sections.push(`Response style: ${config.responseStyle}`)
  sections.push(`Language: ${config.language}`)
  sections.push(`Timezone: ${config.timezone}`)
  return sections.join('\n\n')
}
