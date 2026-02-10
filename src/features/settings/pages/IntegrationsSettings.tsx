import { useSettingsStore } from '../stores/useSettingsStore'
import './IntegrationsSettings.css'

export default function IntegrationsSettings() {
  const integrations = useSettingsStore((s) => s.integrations)
  const toggleIntegration = useSettingsStore((s) => s.toggleIntegration)

  return (
    <div className="integrations-settings">
      <h1 className="integrations-settings__title">Integrations</h1>
      <p className="integrations-settings__subtitle">Connect your favorite tools to SignOf</p>

      <div className="integrations-settings__grid">
        {integrations.map((integration) => (
          <div key={integration.id} className="integrations-settings__card">
            <div className="integrations-settings__card-header">
              <span className="integrations-settings__card-icon">{integration.icon}</span>
              <div className="integrations-settings__card-info">
                <span className="integrations-settings__card-name">{integration.name}</span>
                <span className="integrations-settings__card-desc">{integration.description}</span>
              </div>
            </div>
            <div className="integrations-settings__card-footer">
              {integration.connected && (
                <span className="integrations-settings__connected-badge">Connected</span>
              )}
              <button
                className={integration.connected ? 'btn-secondary' : 'btn-primary'}
                onClick={() => toggleIntegration(integration.id)}
              >
                {integration.connected ? 'Disconnect' : 'Connect'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
