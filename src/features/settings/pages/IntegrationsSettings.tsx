import { useCallback } from 'react'
import { useIntegrationsStore } from '../stores/useIntegrationsStore'
import './IntegrationsSettings.css'

function formatConnectedDate(isoDate: string): string {
  const date = new Date(isoDate)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function IntegrationsSettings() {
  const integrations = useIntegrationsStore((s) => s.integrations)
  const connectIntegration = useIntegrationsStore((s) => s.connectIntegration)
  const disconnectIntegration = useIntegrationsStore((s) => s.disconnectIntegration)

  const handleToggle = useCallback(
    (id: string, isConnected: boolean) => {
      if (isConnected) {
        disconnectIntegration(id)
      } else {
        connectIntegration(id)
      }
    },
    [connectIntegration, disconnectIntegration]
  )

  return (
    <div className="integrations-settings">
      <h1 className="integrations-settings__title">Integrations</h1>
      <p className="integrations-settings__subtitle">Connect your favorite tools to OriginA</p>

      <div className="integrations-settings__grid">
        {integrations.map((integration) => (
          <div
            key={integration.id}
            className={`integrations-settings__card ${integration.connected ? 'integrations-settings__card--connected' : ''}`}
          >
            <div className="integrations-settings__card-header">
              <span className="integrations-settings__card-icon">{integration.icon}</span>
              <div className="integrations-settings__card-info">
                <span className="integrations-settings__card-name">{integration.name}</span>
                <span className="integrations-settings__card-desc">{integration.description}</span>
              </div>
            </div>
            <div className="integrations-settings__card-footer">
              <div className="integrations-settings__card-status">
                {integration.connected && integration.connectedAt && (
                  <>
                    <span className="integrations-settings__connected-badge">Connected</span>
                    <span className="integrations-settings__connected-date">
                      since {formatConnectedDate(integration.connectedAt)}
                    </span>
                  </>
                )}
              </div>
              <button
                className={integration.connected ? 'btn-secondary' : 'btn-primary'}
                onClick={() => handleToggle(integration.id, integration.connected)}
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
