import { useCallback } from 'react'
import { useSoulStore } from '../stores/useSoulStore'
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

  const handleSave = useCallback(() => {
    updateSoul({})
  }, [updateSoul])

  const handleReset = useCallback(() => {
    resetToDefault()
  }, [resetToDefault])

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

      <div className="soul-page__actions">
        <button className="btn--primary" onClick={handleSave}>
          Save Configuration
        </button>
        <button className="btn--secondary" onClick={handleReset}>
          Reset to Default
        </button>
      </div>
    </div>
  )
}
