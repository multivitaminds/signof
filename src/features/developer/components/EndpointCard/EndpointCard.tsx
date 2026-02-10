import { useState, useCallback } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { HttpMethod } from '../../types'
import type { ApiEndpoint } from '../../types'
import CodeBlock from '../CodeBlock/CodeBlock'
import './EndpointCard.css'

interface EndpointCardProps {
  endpoint: ApiEndpoint
  expanded: boolean
  onToggle: () => void
}

const METHOD_COLORS: Record<string, string> = {
  [HttpMethod.Get]: '#00D4AA',
  [HttpMethod.Post]: '#635BFF',
  [HttpMethod.Put]: '#F5A623',
  [HttpMethod.Patch]: '#F5A623',
  [HttpMethod.Delete]: '#FF5A5A',
}

type CodeTab = 'curl' | 'javascript' | 'python'

function highlightPath(path: string): React.ReactNode {
  const parts = path.split(/(:[\w]+)/g)
  return parts.map((part, i) =>
    part.startsWith(':') ? (
      <span className="endpoint-card__param" key={i}>{part}</span>
    ) : (
      <span key={i}>{part}</span>
    )
  )
}

function EndpointCard({ endpoint, expanded, onToggle }: EndpointCardProps) {
  const [codeTab, setCodeTab] = useState<CodeTab>('curl')

  const methodColor = METHOD_COLORS[endpoint.method] ?? '#8898AA'

  const handleTabChange = useCallback((tab: CodeTab) => {
    setCodeTab(tab)
  }, [])

  const codeMap: Record<CodeTab, { code: string; lang: string }> = {
    curl: { code: endpoint.curlExample, lang: 'bash' },
    javascript: { code: endpoint.jsExample, lang: 'javascript' },
    python: { code: endpoint.pythonExample, lang: 'python' },
  }

  const activeCode = codeMap[codeTab]

  return (
    <div className={`endpoint-card ${expanded ? 'endpoint-card--expanded' : ''}`}>
      <button
        className="endpoint-card__header"
        onClick={onToggle}
        type="button"
        aria-expanded={expanded}
        aria-label={`${endpoint.method} ${endpoint.path}`}
      >
        <div className="endpoint-card__left">
          <span
            className="endpoint-card__method"
            style={{ backgroundColor: methodColor }}
          >
            {endpoint.method}
          </span>
          <span className="endpoint-card__path">
            {highlightPath(endpoint.path)}
          </span>
        </div>
        <div className="endpoint-card__right">
          <span className="endpoint-card__description">{endpoint.description}</span>
          {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </div>
      </button>

      {expanded && (
        <div className="endpoint-card__details">
          {endpoint.parameters.length > 0 && (
            <div className="endpoint-card__section">
              <h4 className="endpoint-card__section-title">Parameters</h4>
              <table className="endpoint-card__table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Required</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  {endpoint.parameters.map(param => (
                    <tr key={param.name}>
                      <td>
                        <code className="endpoint-card__code">{param.name}</code>
                      </td>
                      <td>
                        <span className="endpoint-card__type">{param.type}</span>
                      </td>
                      <td>
                        {param.required ? (
                          <span className="endpoint-card__required">Required</span>
                        ) : (
                          <span className="endpoint-card__optional">Optional</span>
                        )}
                      </td>
                      <td>{param.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {endpoint.requestBody && (
            <div className="endpoint-card__section">
              <h4 className="endpoint-card__section-title">Request Body</h4>
              <CodeBlock code={endpoint.requestBody} language="json" />
            </div>
          )}

          <div className="endpoint-card__section">
            <h4 className="endpoint-card__section-title">Response</h4>
            <CodeBlock code={endpoint.responseBody} language="json" />
          </div>

          <div className="endpoint-card__section">
            <h4 className="endpoint-card__section-title">Code Examples</h4>
            <div className="endpoint-card__tabs">
              <button
                className={`endpoint-card__tab ${codeTab === 'curl' ? 'endpoint-card__tab--active' : ''}`}
                onClick={() => handleTabChange('curl')}
                type="button"
              >
                cURL
              </button>
              <button
                className={`endpoint-card__tab ${codeTab === 'javascript' ? 'endpoint-card__tab--active' : ''}`}
                onClick={() => handleTabChange('javascript')}
                type="button"
              >
                JavaScript
              </button>
              <button
                className={`endpoint-card__tab ${codeTab === 'python' ? 'endpoint-card__tab--active' : ''}`}
                onClick={() => handleTabChange('python')}
                type="button"
              >
                Python
              </button>
            </div>
            <CodeBlock code={activeCode.code} language={activeCode.lang} />
          </div>
        </div>
      )}
    </div>
  )
}

export default EndpointCard
