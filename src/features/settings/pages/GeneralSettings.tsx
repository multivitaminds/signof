import { useCallback, useState } from 'react'
import { useSettingsStore } from '../stores/useSettingsStore'
import './GeneralSettings.css'

export default function GeneralSettings() {
  const workspace = useSettingsStore((s) => s.workspace)
  const updateWorkspace = useSettingsStore((s) => s.updateWorkspace)
  const [name, setName] = useState(workspace.name)

  const handleSave = useCallback(() => {
    updateWorkspace({ name: name.trim() || workspace.name })
  }, [name, workspace.name, updateWorkspace])

  return (
    <div className="general-settings">
      <h1 className="general-settings__title">General</h1>
      <p className="general-settings__subtitle">Manage your workspace settings</p>

      <div className="general-settings__section">
        <h3 className="general-settings__section-title">Workspace Name</h3>
        <div className="general-settings__field">
          <input
            className="general-settings__input"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={handleSave}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSave() }}
          />
        </div>
      </div>

      <div className="general-settings__section">
        <h3 className="general-settings__section-title">Language</h3>
        <select
          className="general-settings__select"
          value={workspace.language}
          onChange={(e) => updateWorkspace({ language: e.target.value })}
        >
          <option value="en">English</option>
          <option value="es">Spanish</option>
          <option value="fr">French</option>
          <option value="de">German</option>
          <option value="ja">Japanese</option>
        </select>
      </div>

      <div className="general-settings__section">
        <h3 className="general-settings__section-title">Date Format</h3>
        <select
          className="general-settings__select"
          value={workspace.dateFormat}
          onChange={(e) => updateWorkspace({ dateFormat: e.target.value })}
        >
          <option value="MM/DD/YYYY">MM/DD/YYYY</option>
          <option value="DD/MM/YYYY">DD/MM/YYYY</option>
          <option value="YYYY-MM-DD">YYYY-MM-DD</option>
        </select>
      </div>

      <div className="general-settings__section">
        <h3 className="general-settings__section-title">Timezone</h3>
        <select
          className="general-settings__select"
          value={workspace.timezone}
          onChange={(e) => updateWorkspace({ timezone: e.target.value })}
        >
          <option value="America/New_York">Eastern Time (ET)</option>
          <option value="America/Chicago">Central Time (CT)</option>
          <option value="America/Denver">Mountain Time (MT)</option>
          <option value="America/Los_Angeles">Pacific Time (PT)</option>
          <option value="Europe/London">London (GMT)</option>
          <option value="Europe/Paris">Paris (CET)</option>
          <option value="Asia/Tokyo">Tokyo (JST)</option>
        </select>
      </div>

      <div className="general-settings__section general-settings__danger">
        <h3 className="general-settings__section-title">Danger Zone</h3>
        <p className="general-settings__danger-text">
          Permanently delete this workspace and all its data. This action cannot be undone.
        </p>
        <button className="btn-danger">Delete Workspace</button>
      </div>
    </div>
  )
}
