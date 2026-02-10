import { useState, useCallback } from 'react'
import { Play, Loader2, Trash2, Clock } from 'lucide-react'
import { HttpMethod } from '../types'
import type { SandboxExample, SandboxResponse } from '../types'
import { useSandboxStore, CodeExampleLang, generateCodeExample } from '../stores/useSandboxStore'
import CodeBlock from '../components/CodeBlock/CodeBlock'
import './SandboxPage.css'

// ─── Sandbox Examples ───────────────────────────────────────────────────

const SANDBOX_EXAMPLES: SandboxExample[] = [
  {
    id: 'list-docs',
    name: 'List Documents',
    request: {
      method: HttpMethod.Get as typeof HttpMethod.Get,
      url: '/api/v1/documents',
      headers: '{\n  "Authorization": "Bearer sk_test_...",\n  "Content-Type": "application/json"\n}',
      body: '',
    },
  },
  {
    id: 'create-doc',
    name: 'Create Document',
    request: {
      method: HttpMethod.Post as typeof HttpMethod.Post,
      url: '/api/v1/documents',
      headers: '{\n  "Authorization": "Bearer sk_test_...",\n  "Content-Type": "application/json"\n}',
      body: '{\n  "name": "Test Contract",\n  "file_url": "https://files.example.com/test.pdf",\n  "signers": [\n    { "name": "Jane Doe", "email": "jane@example.com", "order": 1 }\n  ]\n}',
    },
  },
  {
    id: 'get-doc',
    name: 'Get Document',
    request: {
      method: HttpMethod.Get as typeof HttpMethod.Get,
      url: '/api/v1/documents/doc_abc123',
      headers: '{\n  "Authorization": "Bearer sk_test_...",\n  "Content-Type": "application/json"\n}',
      body: '',
    },
  },
  {
    id: 'delete-doc',
    name: 'Delete Document',
    request: {
      method: HttpMethod.Delete as typeof HttpMethod.Delete,
      url: '/api/v1/documents/doc_abc123',
      headers: '{\n  "Authorization": "Bearer sk_test_...",\n  "Content-Type": "application/json"\n}',
      body: '',
    },
  },
  {
    id: 'list-filings',
    name: 'List Filings',
    request: {
      method: HttpMethod.Get as typeof HttpMethod.Get,
      url: '/api/v1/filings',
      headers: '{\n  "Authorization": "Bearer sk_test_...",\n  "Content-Type": "application/json"\n}',
      body: '',
    },
  },
  {
    id: 'create-filing',
    name: 'Create Filing',
    request: {
      method: HttpMethod.Post as typeof HttpMethod.Post,
      url: '/api/v1/filings',
      headers: '{\n  "Authorization": "Bearer sk_test_...",\n  "Content-Type": "application/json"\n}',
      body: '{\n  "type": "1099-NEC",\n  "tax_year": 2025,\n  "payer": { "name": "Acme Corp", "tin": "12-3456789" },\n  "payee": { "name": "John Doe", "tin": "123-45-6789" },\n  "amount": 50000.00\n}',
    },
  },
  {
    id: 'list-bookings',
    name: 'List Bookings',
    request: {
      method: HttpMethod.Get as typeof HttpMethod.Get,
      url: '/api/v1/bookings',
      headers: '{\n  "Authorization": "Bearer sk_test_...",\n  "Content-Type": "application/json"\n}',
      body: '',
    },
  },
  {
    id: 'create-booking',
    name: 'Create Booking',
    request: {
      method: HttpMethod.Post as typeof HttpMethod.Post,
      url: '/api/v1/bookings',
      headers: '{\n  "Authorization": "Bearer sk_test_...",\n  "Content-Type": "application/json"\n}',
      body: '{\n  "event_type": "consultation",\n  "invitee": { "name": "Sarah Lee", "email": "sarah@example.com" },\n  "start_time": "2025-12-30T10:00:00Z",\n  "timezone": "America/New_York"\n}',
    },
  },
  {
    id: 'list-databases',
    name: 'List Databases',
    request: {
      method: HttpMethod.Get as typeof HttpMethod.Get,
      url: '/api/v1/databases',
      headers: '{\n  "Authorization": "Bearer sk_test_...",\n  "Content-Type": "application/json"\n}',
      body: '',
    },
  },
]

// ─── Mock Responses ─────────────────────────────────────────────────────

const MOCK_RESPONSES: Record<string, { status: number; body: object }> = {
  'GET /api/v1/documents': {
    status: 200,
    body: {
      data: [
        { id: 'doc_abc123', name: 'Contract.pdf', status: 'completed', created_at: '2025-12-20T10:00:00Z' },
        { id: 'doc_def456', name: 'NDA.pdf', status: 'pending', created_at: '2025-12-21T14:30:00Z' },
      ],
      has_more: false,
      total: 2,
    },
  },
  'POST /api/v1/documents': {
    status: 201,
    body: { id: 'doc_new789', name: 'New Document', status: 'draft', created_at: new Date().toISOString(), signers: [] },
  },
  'GET /api/v1/documents/:id': {
    status: 200,
    body: {
      id: 'doc_abc123',
      name: 'Contract.pdf',
      status: 'completed',
      created_at: '2025-12-20T10:00:00Z',
      signers: [{ id: 'sig_1', name: 'John Doe', email: 'john@example.com', status: 'signed' }],
      signatures: [{ signer_id: 'sig_1', signed_at: '2025-12-21T09:15:00Z' }],
    },
  },
  'DELETE /api/v1/documents/:id': { status: 204, body: {} },
  'GET /api/v1/filings': {
    status: 200,
    body: { data: [{ id: 'fil_001', type: '1099-NEC', tax_year: 2025, status: 'submitted' }], has_more: false, total: 1 },
  },
  'POST /api/v1/filings': {
    status: 201,
    body: { id: 'fil_new002', type: '1099-NEC', tax_year: 2025, status: 'draft', created_at: new Date().toISOString() },
  },
  'GET /api/v1/bookings': {
    status: 200,
    body: { data: [{ id: 'bk_001', event_type: 'consultation', start_time: '2025-12-28T14:00:00Z', status: 'confirmed' }], has_more: false, total: 1 },
  },
  'POST /api/v1/bookings': {
    status: 201,
    body: { id: 'bk_new002', event_type: 'consultation', start_time: '2025-12-30T10:00:00Z', status: 'confirmed', created_at: new Date().toISOString() },
  },
  'GET /api/v1/databases': {
    status: 200,
    body: { data: [{ id: 'db_001', name: 'Contacts', record_count: 150, created_at: '2025-11-01T00:00:00Z' }], has_more: false, total: 1 },
  },
}

function getStatusColor(code: number): string {
  if (code >= 200 && code < 300) return 'var(--color-success)'
  if (code >= 400 && code < 500) return 'var(--color-warning)'
  return 'var(--color-danger)'
}

function findMockResponse(method: string, url: string): { status: number; body: object } {
  const key = `${method} ${url}`
  if (MOCK_RESPONSES[key]) return MOCK_RESPONSES[key]
  const normalizedUrl = url.replace(/\/[a-zA-Z0-9_]+$/, '/:id')
  const keyWithId = `${method} ${normalizedUrl}`
  if (MOCK_RESPONSES[keyWithId]) return MOCK_RESPONSES[keyWithId]
  return { status: method === 'POST' ? 201 : method === 'DELETE' ? 204 : 200, body: { message: 'OK', data: {} } }
}

const CODE_LANG_LABELS: Record<CodeExampleLang, string> = {
  [CodeExampleLang.Curl]: 'cURL',
  [CodeExampleLang.JavaScript]: 'JavaScript',
  [CodeExampleLang.Python]: 'Python',
}

// ─── Tabs ───────────────────────────────────────────────────────────────

const SandboxTab = {
  Playground: 'playground',
  History: 'history',
  CodeExamples: 'code_examples',
} as const

type SandboxTab = (typeof SandboxTab)[keyof typeof SandboxTab]

// ─── Component ──────────────────────────────────────────────────────────

function SandboxPage() {
  const [selectedExample, setSelectedExample] = useState<SandboxExample>(SANDBOX_EXAMPLES[0]!)
  const [activeTab, setActiveTab] = useState<SandboxTab>(SandboxTab.Playground)
  const [method, setMethod] = useState(selectedExample.request.method)
  const [url, setUrl] = useState(selectedExample.request.url)
  const [headers, setHeaders] = useState(selectedExample.request.headers)
  const [body, setBody] = useState(selectedExample.request.body)
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState<SandboxResponse | null>(null)

  const history = useSandboxStore((s) => s.history)
  const addHistoryEntry = useSandboxStore((s) => s.addHistoryEntry)
  const clearHistory = useSandboxStore((s) => s.clearHistory)
  const removeHistoryEntry = useSandboxStore((s) => s.removeHistoryEntry)
  const activeCodeLang = useSandboxStore((s) => s.activeCodeLang)
  const setActiveCodeLang = useSandboxStore((s) => s.setActiveCodeLang)

  const handleExampleChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const example = SANDBOX_EXAMPLES.find(ex => ex.id === e.target.value)
    if (example) {
      setSelectedExample(example)
      setMethod(example.request.method)
      setUrl(example.request.url)
      setHeaders(example.request.headers)
      setBody(example.request.body)
      setResponse(null)
    }
  }, [])

  const handleSend = useCallback(() => {
    setLoading(true)
    setResponse(null)
    const startTime = performance.now()
    const delay = 200 + Math.random() * 600

    setTimeout(() => {
      const endTime = performance.now() + delay
      const mock = findMockResponse(method, url)
      const resp: SandboxResponse = {
        statusCode: mock.status,
        body: JSON.stringify(mock.body, null, 2),
        responseTime: Math.round(endTime - startTime),
      }
      setResponse(resp)
      setLoading(false)
      addHistoryEntry({ method: method as typeof HttpMethod.Get, url, headers, body }, resp)
    }, delay)
  }, [method, url, headers, body, addHistoryEntry])

  const handleHistoryReplay = useCallback((entry: typeof history[0]) => {
    setMethod(entry.request.method)
    setUrl(entry.request.url)
    setHeaders(entry.request.headers)
    setBody(entry.request.body)
    setResponse(entry.response)
    setActiveTab(SandboxTab.Playground)
  }, [])

  const handleTabChange = useCallback((tab: SandboxTab) => {
    setActiveTab(tab)
  }, [])

  const currentRequest = { method: method as typeof HttpMethod.Get, url, headers, body }

  return (
    <div className="sandbox-page">
      <div className="sandbox-page__header">
        <h1 className="sandbox-page__title">API Sandbox</h1>
        <p className="sandbox-page__subtitle">
          Test API requests interactively. All requests in the sandbox use mock responses
          matching the API specification.
        </p>
      </div>

      {/* Tabs */}
      <div className="sandbox-page__tabs" role="tablist">
        <button
          className={`sandbox-page__tab ${activeTab === SandboxTab.Playground ? 'sandbox-page__tab--active' : ''}`}
          onClick={() => handleTabChange(SandboxTab.Playground)}
          role="tab"
          aria-selected={activeTab === SandboxTab.Playground}
          type="button"
        >
          Playground
        </button>
        <button
          className={`sandbox-page__tab ${activeTab === SandboxTab.History ? 'sandbox-page__tab--active' : ''}`}
          onClick={() => handleTabChange(SandboxTab.History)}
          role="tab"
          aria-selected={activeTab === SandboxTab.History}
          type="button"
        >
          History ({history.length})
        </button>
        <button
          className={`sandbox-page__tab ${activeTab === SandboxTab.CodeExamples ? 'sandbox-page__tab--active' : ''}`}
          onClick={() => handleTabChange(SandboxTab.CodeExamples)}
          role="tab"
          aria-selected={activeTab === SandboxTab.CodeExamples}
          type="button"
        >
          Code Examples
        </button>
      </div>

      {/* ─── Playground Tab ─────────────────────────────────── */}
      {activeTab === SandboxTab.Playground && (
        <div className="sandbox-page__playground" role="tabpanel">
          <div className="sandbox-page__examples">
            <label className="sandbox-page__examples-label" htmlFor="sandbox-example-select">
              Pre-built Examples
            </label>
            <select
              id="sandbox-example-select"
              className="sandbox-page__examples-select"
              value={selectedExample.id}
              onChange={handleExampleChange}
            >
              {SANDBOX_EXAMPLES.map(ex => (
                <option key={ex.id} value={ex.id}>{ex.name}</option>
              ))}
            </select>
          </div>

          <div className="sandbox-page__request">
            <div className="sandbox-page__url-bar">
              <select
                className="sandbox-page__method-select"
                value={method}
                onChange={(e) => setMethod(e.target.value as HttpMethod)}
                aria-label="HTTP method"
              >
                {Object.values(HttpMethod).map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              <input
                className="sandbox-page__url-input"
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="/api/v1/..."
                aria-label="Request URL"
              />
              <button
                className="btn-primary sandbox-page__send-btn"
                onClick={handleSend}
                disabled={loading}
                type="button"
              >
                {loading ? <Loader2 size={16} className="sandbox-page__spinner" /> : <Play size={16} />}
                {loading ? 'Sending...' : 'Send'}
              </button>
            </div>

            <div className="sandbox-page__editors">
              <div className="sandbox-page__editor">
                <label className="sandbox-page__editor-label" htmlFor="sb-headers">
                  Headers
                </label>
                <textarea
                  id="sb-headers"
                  className="sandbox-page__textarea"
                  value={headers}
                  onChange={(e) => setHeaders(e.target.value)}
                  rows={4}
                  spellCheck={false}
                />
              </div>

              {(method === HttpMethod.Post || method === HttpMethod.Put || method === HttpMethod.Patch) && (
                <div className="sandbox-page__editor">
                  <label className="sandbox-page__editor-label" htmlFor="sb-body">
                    Body
                  </label>
                  <textarea
                    id="sb-body"
                    className="sandbox-page__textarea"
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    rows={6}
                    placeholder='{ "name": "My Document" }'
                    spellCheck={false}
                  />
                </div>
              )}
            </div>
          </div>

          {response && (
            <div className="sandbox-page__response">
              <div className="sandbox-page__response-header">
                <h4 className="sandbox-page__response-title">Response</h4>
                <div className="sandbox-page__response-meta">
                  <span
                    className="sandbox-page__status-badge"
                    style={{ backgroundColor: getStatusColor(response.statusCode) }}
                  >
                    {response.statusCode}
                  </span>
                  <span className="sandbox-page__time">{response.responseTime}ms</span>
                </div>
              </div>
              <CodeBlock code={response.body} language="json" showLineNumbers />
            </div>
          )}
        </div>
      )}

      {/* ─── History Tab ────────────────────────────────────── */}
      {activeTab === SandboxTab.History && (
        <div className="sandbox-page__history" role="tabpanel">
          {history.length === 0 ? (
            <div className="sandbox-page__empty">
              <Clock size={32} />
              <p>No request history yet. Send a request from the Playground tab to see it here.</p>
            </div>
          ) : (
            <>
              <div className="sandbox-page__history-header">
                <span className="sandbox-page__history-count">
                  Last {history.length} request{history.length !== 1 ? 's' : ''}
                </span>
                <button
                  className="btn-secondary sandbox-page__clear-btn"
                  onClick={clearHistory}
                  type="button"
                >
                  Clear All
                </button>
              </div>
              <div className="sandbox-page__history-list">
                {history.map((entry) => (
                  <div key={entry.id} className="sandbox-page__history-item">
                    <button
                      className="sandbox-page__history-item-main"
                      onClick={() => handleHistoryReplay(entry)}
                      type="button"
                    >
                      <span
                        className={`sandbox-page__history-method sandbox-page__history-method--${entry.request.method.toLowerCase()}`}
                      >
                        {entry.request.method}
                      </span>
                      <span className="sandbox-page__history-url">{entry.request.url}</span>
                      <span
                        className="sandbox-page__history-status"
                        style={{ color: getStatusColor(entry.response.statusCode) }}
                      >
                        {entry.response.statusCode}
                      </span>
                      <span className="sandbox-page__history-time">
                        {entry.response.responseTime}ms
                      </span>
                      <span className="sandbox-page__history-date">
                        {new Date(entry.timestamp).toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </span>
                    </button>
                    <button
                      className="sandbox-page__history-delete"
                      onClick={() => removeHistoryEntry(entry.id)}
                      type="button"
                      aria-label="Remove from history"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* ─── Code Examples Tab ──────────────────────────────── */}
      {activeTab === SandboxTab.CodeExamples && (
        <div className="sandbox-page__code-examples" role="tabpanel">
          <p className="sandbox-page__code-desc">
            Code examples for the current request: <code>{method} {url}</code>
          </p>

          <div className="sandbox-page__code-lang-tabs">
            {Object.values(CodeExampleLang).map((lang) => (
              <button
                key={lang}
                className={`sandbox-page__code-lang-tab ${
                  activeCodeLang === lang ? 'sandbox-page__code-lang-tab--active' : ''
                }`}
                onClick={() => setActiveCodeLang(lang)}
                type="button"
              >
                {CODE_LANG_LABELS[lang]}
              </button>
            ))}
          </div>

          <CodeBlock
            code={generateCodeExample(activeCodeLang, currentRequest)}
            language={activeCodeLang === CodeExampleLang.Curl ? 'bash' : activeCodeLang === CodeExampleLang.Python ? 'python' : 'javascript'}
            showLineNumbers
          />
        </div>
      )}

      <div className="sandbox-page__info">
        <h3 className="sandbox-page__info-title">About the Sandbox</h3>
        <ul className="sandbox-page__info-list">
          <li>Responses are simulated and match the API documentation schema.</li>
          <li>No actual API calls are made -- data is generated locally.</li>
          <li>Use test API keys (<code>sk_test_...</code>) for integration testing against the real API.</li>
          <li>Rate limits do not apply in sandbox mode.</li>
        </ul>
      </div>
    </div>
  )
}

export default SandboxPage
