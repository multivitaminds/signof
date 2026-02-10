import { useState, useCallback } from 'react'
import { Play, Loader2 } from 'lucide-react'
import { HttpMethod } from '../../types'
import type { SandboxResponse } from '../../types'
import CodeBlock from '../CodeBlock/CodeBlock'
import './ApiPlayground.css'

interface ApiPlaygroundProps {
  initialMethod?: string
  initialUrl?: string
  initialHeaders?: string
  initialBody?: string
}

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
    body: {
      id: 'doc_new789',
      name: 'New Document',
      status: 'draft',
      created_at: new Date().toISOString(),
      signers: [],
    },
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
  'DELETE /api/v1/documents/:id': {
    status: 204,
    body: {},
  },
  'GET /api/v1/filings': {
    status: 200,
    body: {
      data: [
        { id: 'fil_001', type: '1099-NEC', tax_year: 2025, status: 'submitted' },
      ],
      has_more: false,
      total: 1,
    },
  },
  'POST /api/v1/filings': {
    status: 201,
    body: {
      id: 'fil_new002',
      type: '1099-NEC',
      tax_year: 2025,
      status: 'draft',
      created_at: new Date().toISOString(),
    },
  },
  'GET /api/v1/bookings': {
    status: 200,
    body: {
      data: [
        { id: 'bk_001', event_type: 'consultation', start_time: '2025-12-28T14:00:00Z', status: 'confirmed' },
      ],
      has_more: false,
      total: 1,
    },
  },
  'POST /api/v1/bookings': {
    status: 201,
    body: {
      id: 'bk_new002',
      event_type: 'consultation',
      start_time: '2025-12-30T10:00:00Z',
      status: 'confirmed',
      created_at: new Date().toISOString(),
    },
  },
  'GET /api/v1/databases': {
    status: 200,
    body: {
      data: [
        { id: 'db_001', name: 'Contacts', record_count: 150, created_at: '2025-11-01T00:00:00Z' },
      ],
      has_more: false,
      total: 1,
    },
  },
}

function getStatusColor(code: number): string {
  if (code >= 200 && code < 300) return 'var(--color-success)'
  if (code >= 400 && code < 500) return 'var(--color-warning)'
  return 'var(--color-danger)'
}

function findMockResponse(method: string, url: string): { status: number; body: object } {
  // Try exact match
  const key = `${method} ${url}`
  if (MOCK_RESPONSES[key]) return MOCK_RESPONSES[key]

  // Try with :id pattern
  const normalizedUrl = url.replace(/\/[a-zA-Z0-9_]+$/, '/:id')
  const keyWithId = `${method} ${normalizedUrl}`
  if (MOCK_RESPONSES[keyWithId]) return MOCK_RESPONSES[keyWithId]

  // Default
  return {
    status: method === 'POST' ? 201 : method === 'DELETE' ? 204 : 200,
    body: { message: 'OK', data: {} },
  }
}

function ApiPlayground({
  initialMethod = HttpMethod.Get,
  initialUrl = '/api/v1/documents',
  initialHeaders = '{\n  "Authorization": "Bearer sk_test_...",\n  "Content-Type": "application/json"\n}',
  initialBody = '',
}: ApiPlaygroundProps) {
  const [method, setMethod] = useState(initialMethod)
  const [url, setUrl] = useState(initialUrl)
  const [headers, setHeaders] = useState(initialHeaders)
  const [body, setBody] = useState(initialBody)
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState<SandboxResponse | null>(null)

  const handleSend = useCallback(() => {
    setLoading(true)
    setResponse(null)

    const startTime = performance.now()

    // Simulate network delay
    const delay = 200 + Math.random() * 600
    setTimeout(() => {
      const endTime = performance.now() + delay
      const mock = findMockResponse(method, url)

      setResponse({
        statusCode: mock.status,
        body: JSON.stringify(mock.body, null, 2),
        responseTime: Math.round(endTime - startTime),
      })
      setLoading(false)
    }, delay)
  }, [method, url])

  const handleMethodChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setMethod(e.target.value)
  }, [])

  const handleUrlChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value)
  }, [])

  const handleHeadersChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setHeaders(e.target.value)
  }, [])

  const handleBodyChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setBody(e.target.value)
  }, [])

  return (
    <div className="api-playground">
      <div className="api-playground__request">
        <div className="api-playground__url-bar">
          <select
            className="api-playground__method-select"
            value={method}
            onChange={handleMethodChange}
            aria-label="HTTP method"
          >
            {Object.values(HttpMethod).map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          <input
            className="api-playground__url-input"
            type="text"
            value={url}
            onChange={handleUrlChange}
            placeholder="/api/v1/..."
            aria-label="Request URL"
          />
          <button
            className="btn-primary api-playground__send"
            onClick={handleSend}
            disabled={loading}
            type="button"
          >
            {loading ? <Loader2 size={16} className="api-playground__spinner" /> : <Play size={16} />}
            {loading ? 'Sending...' : 'Send'}
          </button>
        </div>

        <div className="api-playground__editors">
          <div className="api-playground__editor">
            <label className="api-playground__editor-label" htmlFor="playground-headers">
              Headers
            </label>
            <textarea
              id="playground-headers"
              className="api-playground__textarea"
              value={headers}
              onChange={handleHeadersChange}
              rows={4}
              spellCheck={false}
            />
          </div>

          {(method === HttpMethod.Post || method === HttpMethod.Put || method === HttpMethod.Patch) && (
            <div className="api-playground__editor">
              <label className="api-playground__editor-label" htmlFor="playground-body">
                Body
              </label>
              <textarea
                id="playground-body"
                className="api-playground__textarea"
                value={body}
                onChange={handleBodyChange}
                rows={6}
                placeholder='{ "name": "My Document" }'
                spellCheck={false}
              />
            </div>
          )}
        </div>
      </div>

      {response && (
        <div className="api-playground__response">
          <div className="api-playground__response-header">
            <h4 className="api-playground__response-title">Response</h4>
            <div className="api-playground__response-meta">
              <span
                className="api-playground__status-badge"
                style={{ backgroundColor: getStatusColor(response.statusCode) }}
              >
                {response.statusCode}
              </span>
              <span className="api-playground__time">{response.responseTime}ms</span>
            </div>
          </div>
          <CodeBlock code={response.body} language="json" showLineNumbers />
        </div>
      )}
    </div>
  )
}

export default ApiPlayground
