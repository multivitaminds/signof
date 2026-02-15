import { useState, useCallback } from 'react'
import type { TaxBanditConfig } from '../../types'
import './TaxBanditSettings.css'

interface TaxBanditSettingsProps {
  config: TaxBanditConfig
  isConnected: boolean
  onConfigChange: (config: Partial<TaxBanditConfig>) => void
  onTestConnection: () => Promise<boolean>
}

function TaxBanditSettings({
  config,
  isConnected,
  onConfigChange,
  onTestConnection,
}: TaxBanditSettingsProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null)

  const handleToggle = useCallback(() => {
    setIsExpanded((prev) => !prev)
  }, [])

  const handleTestConnection = useCallback(async () => {
    setIsTesting(true)
    setTestResult(null)
    try {
      const success = await onTestConnection()
      setTestResult(success ? 'success' : 'error')
    } catch {
      setTestResult('error')
    } finally {
      setIsTesting(false)
    }
  }, [onTestConnection])

  const hasCredentials =
    config.clientId.length > 0 &&
    config.clientSecret.length > 0 &&
    config.userToken.length > 0

  return (
    <div className="taxbandit-settings">
      <button
        className="taxbandit-settings__toggle"
        onClick={handleToggle}
        type="button"
        aria-expanded={isExpanded}
      >
        <div className="taxbandit-settings__toggle-left">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {isExpanded ? (
              <polyline points="6 9 12 15 18 9" />
            ) : (
              <polyline points="9 18 15 12 9 6" />
            )}
          </svg>
          <span className="taxbandit-settings__title">TaxBandit API</span>
        </div>
        <div className="taxbandit-settings__status">
          <span
            className={`taxbandit-settings__status-badge ${
              isConnected
                ? 'taxbandit-settings__status-badge--connected'
                : 'taxbandit-settings__status-badge--disconnected'
            }`}
          >
            {isConnected ? 'Connected' : 'Not Connected'}
          </span>
        </div>
      </button>

      {isExpanded && (
        <div className="taxbandit-settings__body">
          <p className="taxbandit-settings__info">
            Enter your TaxBandit API credentials to enable IRS e-filing. Get
            credentials at{' '}
            <strong>developer.taxbandits.com</strong>
          </p>

          <div className="taxbandit-settings__fields">
            <div className="taxbandit-settings__field">
              <label
                htmlFor="tb-client-id"
                className="taxbandit-settings__label"
              >
                Client ID
              </label>
              <input
                id="tb-client-id"
                type="password"
                value={config.clientId}
                onChange={(e) =>
                  onConfigChange({ clientId: e.target.value })
                }
                className="taxbandit-settings__input"
                placeholder="Your Client ID"
                autoComplete="off"
              />
            </div>

            <div className="taxbandit-settings__field">
              <label
                htmlFor="tb-client-secret"
                className="taxbandit-settings__label"
              >
                Client Secret
              </label>
              <input
                id="tb-client-secret"
                type="password"
                value={config.clientSecret}
                onChange={(e) =>
                  onConfigChange({ clientSecret: e.target.value })
                }
                className="taxbandit-settings__input"
                placeholder="Your Client Secret"
                autoComplete="off"
              />
            </div>

            <div className="taxbandit-settings__field">
              <label
                htmlFor="tb-user-token"
                className="taxbandit-settings__label"
              >
                User Token
              </label>
              <input
                id="tb-user-token"
                type="password"
                value={config.userToken}
                onChange={(e) =>
                  onConfigChange({ userToken: e.target.value })
                }
                className="taxbandit-settings__input"
                placeholder="Your User Token"
                autoComplete="off"
              />
            </div>
          </div>

          <div className="taxbandit-settings__actions">
            <div className="taxbandit-settings__environment-toggle">
              <button
                className={`taxbandit-settings__env-btn ${config.useSandbox ? 'taxbandit-settings__env-btn--active taxbandit-settings__env-btn--demo' : ''}`}
                onClick={() => onConfigChange({ useSandbox: true })}
                type="button"
              >
                Demo
              </button>
              <button
                className={`taxbandit-settings__env-btn ${!config.useSandbox ? 'taxbandit-settings__env-btn--active taxbandit-settings__env-btn--live' : ''}`}
                onClick={() => onConfigChange({ useSandbox: false })}
                type="button"
              >
                Live
              </button>
            </div>

            <button
              className="btn-primary taxbandit-settings__test-btn"
              onClick={handleTestConnection}
              disabled={!hasCredentials || isTesting}
              type="button"
            >
              {isTesting ? 'Testing...' : 'Test Connection'}
            </button>
          </div>

          {testResult === 'success' && (
            <div className="taxbandit-settings__result taxbandit-settings__result--success">
              Connection successful! TaxBandit API is ready.
            </div>
          )}
          {testResult === 'error' && (
            <div className="taxbandit-settings__result taxbandit-settings__result--error">
              Connection failed. Please check your credentials and try again.
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default TaxBanditSettings
