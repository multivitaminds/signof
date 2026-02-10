import { useState, useCallback } from 'react'
import { HttpMethod } from '../types'
import type { SandboxExample } from '../types'
import ApiPlayground from '../components/ApiPlayground/ApiPlayground'
import './SandboxPage.css'

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

function SandboxPage() {
  const [selectedExample, setSelectedExample] = useState<SandboxExample>(SANDBOX_EXAMPLES[0]!)
  const [playgroundKey, setPlaygroundKey] = useState(0)

  const handleExampleChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const example = SANDBOX_EXAMPLES.find(ex => ex.id === e.target.value)
    if (example) {
      setSelectedExample(example)
      setPlaygroundKey(prev => prev + 1)
    }
  }, [])

  return (
    <div className="sandbox-page">
      <div className="sandbox-page__header">
        <h1 className="sandbox-page__title">API Sandbox</h1>
        <p className="sandbox-page__subtitle">
          Test API requests interactively. All requests in the sandbox use mock responses
          matching the API specification. Switch to Test mode to use real test credentials.
        </p>
      </div>

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

      <ApiPlayground
        key={playgroundKey}
        initialMethod={selectedExample.request.method}
        initialUrl={selectedExample.request.url}
        initialHeaders={selectedExample.request.headers}
        initialBody={selectedExample.request.body}
      />

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
