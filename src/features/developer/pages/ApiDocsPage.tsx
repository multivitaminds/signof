import { useState, useCallback } from 'react'
import { HttpMethod } from '../types'
import type { ApiEndpoint } from '../types'
import EndpointCard from '../components/EndpointCard/EndpointCard'
import './ApiDocsPage.css'

const BASE_URL = 'https://api.signof.io'

const ENDPOINTS: ApiEndpoint[] = [
  // ── Documents ─────────────────────────────────────────────
  {
    id: 'doc-list',
    method: HttpMethod.Get as typeof HttpMethod.Get,
    path: '/api/v1/documents',
    description: 'List all documents',
    category: 'Documents',
    parameters: [
      { name: 'status', type: 'string', required: false, description: 'Filter by status: draft, pending, completed, voided' },
      { name: 'limit', type: 'integer', required: false, description: 'Number of results (default 25, max 100)' },
      { name: 'offset', type: 'integer', required: false, description: 'Pagination offset' },
    ],
    requestBody: null,
    responseBody: `{
  "data": [
    {
      "id": "doc_abc123",
      "name": "Contract.pdf",
      "status": "pending",
      "created_at": "2025-12-20T10:00:00Z",
      "signers": [
        { "id": "sig_1", "name": "John Doe", "email": "john@example.com", "status": "pending" }
      ]
    }
  ],
  "has_more": false,
  "total": 1
}`,
    curlExample: `curl -X GET "${BASE_URL}/api/v1/documents?status=pending&limit=10" \\
  -H "Authorization: Bearer sk_live_..."`,
    jsExample: `import SignOf from '@signof/node';

const signof = new SignOf('sk_live_...');

const documents = await signof.documents.list({
  status: 'pending',
  limit: 10,
});

console.log(documents.data);`,
    pythonExample: `import signof

client = signof.Client("sk_live_...")

documents = client.documents.list(
    status="pending",
    limit=10,
)

print(documents.data)`,
  },
  {
    id: 'doc-create',
    method: HttpMethod.Post as typeof HttpMethod.Post,
    path: '/api/v1/documents',
    description: 'Create a new document',
    category: 'Documents',
    parameters: [],
    requestBody: `{
  "name": "Employment Agreement",
  "file_url": "https://files.example.com/agreement.pdf",
  "signers": [
    {
      "name": "Jane Smith",
      "email": "jane@example.com",
      "order": 1
    }
  ]
}`,
    responseBody: `{
  "id": "doc_xyz789",
  "name": "Employment Agreement",
  "status": "draft",
  "created_at": "2025-12-22T14:30:00Z",
  "signers": [
    {
      "id": "sig_new1",
      "name": "Jane Smith",
      "email": "jane@example.com",
      "status": "pending",
      "order": 1
    }
  ]
}`,
    curlExample: `curl -X POST "${BASE_URL}/api/v1/documents" \\
  -H "Authorization: Bearer sk_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Employment Agreement",
    "file_url": "https://files.example.com/agreement.pdf",
    "signers": [{ "name": "Jane Smith", "email": "jane@example.com", "order": 1 }]
  }'`,
    jsExample: `const doc = await signof.documents.create({
  name: 'Employment Agreement',
  file_url: 'https://files.example.com/agreement.pdf',
  signers: [
    { name: 'Jane Smith', email: 'jane@example.com', order: 1 },
  ],
});

console.log(doc.id);`,
    pythonExample: `doc = client.documents.create(
    name="Employment Agreement",
    file_url="https://files.example.com/agreement.pdf",
    signers=[
        {"name": "Jane Smith", "email": "jane@example.com", "order": 1},
    ],
)

print(doc.id)`,
  },
  {
    id: 'doc-get',
    method: HttpMethod.Get as typeof HttpMethod.Get,
    path: '/api/v1/documents/:id',
    description: 'Retrieve a document',
    category: 'Documents',
    parameters: [
      { name: 'id', type: 'string', required: true, description: 'Document ID' },
    ],
    requestBody: null,
    responseBody: `{
  "id": "doc_abc123",
  "name": "Contract.pdf",
  "status": "completed",
  "created_at": "2025-12-20T10:00:00Z",
  "updated_at": "2025-12-21T09:15:00Z",
  "file_url": "https://files.signof.io/doc_abc123.pdf",
  "signers": [
    {
      "id": "sig_1",
      "name": "John Doe",
      "email": "john@example.com",
      "status": "signed",
      "signed_at": "2025-12-21T09:15:00Z"
    }
  ],
  "audit": [
    { "action": "created", "timestamp": "2025-12-20T10:00:00Z" },
    { "action": "sent", "timestamp": "2025-12-20T10:05:00Z" },
    { "action": "signed", "timestamp": "2025-12-21T09:15:00Z" },
    { "action": "completed", "timestamp": "2025-12-21T09:15:00Z" }
  ]
}`,
    curlExample: `curl -X GET "${BASE_URL}/api/v1/documents/doc_abc123" \\
  -H "Authorization: Bearer sk_live_..."`,
    jsExample: `const doc = await signof.documents.retrieve('doc_abc123');

console.log(doc.status); // "completed"
console.log(doc.signers);`,
    pythonExample: `doc = client.documents.retrieve("doc_abc123")

print(doc.status)  # "completed"
print(doc.signers)`,
  },
  {
    id: 'doc-update',
    method: HttpMethod.Put as typeof HttpMethod.Put,
    path: '/api/v1/documents/:id',
    description: 'Update a document',
    category: 'Documents',
    parameters: [
      { name: 'id', type: 'string', required: true, description: 'Document ID' },
    ],
    requestBody: `{
  "name": "Updated Contract Name"
}`,
    responseBody: `{
  "id": "doc_abc123",
  "name": "Updated Contract Name",
  "status": "draft",
  "updated_at": "2025-12-22T15:00:00Z"
}`,
    curlExample: `curl -X PUT "${BASE_URL}/api/v1/documents/doc_abc123" \\
  -H "Authorization: Bearer sk_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{ "name": "Updated Contract Name" }'`,
    jsExample: `const doc = await signof.documents.update('doc_abc123', {
  name: 'Updated Contract Name',
});

console.log(doc.name);`,
    pythonExample: `doc = client.documents.update(
    "doc_abc123",
    name="Updated Contract Name",
)

print(doc.name)`,
  },
  {
    id: 'doc-delete',
    method: HttpMethod.Delete as typeof HttpMethod.Delete,
    path: '/api/v1/documents/:id',
    description: 'Delete a document',
    category: 'Documents',
    parameters: [
      { name: 'id', type: 'string', required: true, description: 'Document ID' },
    ],
    requestBody: null,
    responseBody: `{
  "deleted": true,
  "id": "doc_abc123"
}`,
    curlExample: `curl -X DELETE "${BASE_URL}/api/v1/documents/doc_abc123" \\
  -H "Authorization: Bearer sk_live_..."`,
    jsExample: `await signof.documents.delete('doc_abc123');`,
    pythonExample: `client.documents.delete("doc_abc123")`,
  },
  {
    id: 'doc-send',
    method: HttpMethod.Post as typeof HttpMethod.Post,
    path: '/api/v1/documents/:id/send',
    description: 'Send a document for signing',
    category: 'Documents',
    parameters: [
      { name: 'id', type: 'string', required: true, description: 'Document ID' },
    ],
    requestBody: `{
  "message": "Please review and sign this document.",
  "subject": "Document Ready for Signature"
}`,
    responseBody: `{
  "id": "doc_abc123",
  "status": "sent",
  "sent_at": "2025-12-22T15:30:00Z",
  "signers": [
    {
      "id": "sig_1",
      "name": "John Doe",
      "email": "john@example.com",
      "status": "pending",
      "signing_url": "https://sign.signof.io/s/abc123"
    }
  ]
}`,
    curlExample: `curl -X POST "${BASE_URL}/api/v1/documents/doc_abc123/send" \\
  -H "Authorization: Bearer sk_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{ "message": "Please review and sign.", "subject": "Document Ready" }'`,
    jsExample: `const result = await signof.documents.send('doc_abc123', {
  message: 'Please review and sign.',
  subject: 'Document Ready',
});

console.log(result.signers[0].signing_url);`,
    pythonExample: `result = client.documents.send(
    "doc_abc123",
    message="Please review and sign.",
    subject="Document Ready",
)

print(result.signers[0].signing_url)`,
  },
  // ── Signers ───────────────────────────────────────────────
  {
    id: 'signer-add',
    method: HttpMethod.Post as typeof HttpMethod.Post,
    path: '/api/v1/documents/:id/signers',
    description: 'Add a signer to a document',
    category: 'Signers',
    parameters: [
      { name: 'id', type: 'string', required: true, description: 'Document ID' },
    ],
    requestBody: `{
  "name": "Alice Johnson",
  "email": "alice@example.com",
  "order": 2
}`,
    responseBody: `{
  "id": "sig_new2",
  "name": "Alice Johnson",
  "email": "alice@example.com",
  "status": "pending",
  "order": 2
}`,
    curlExample: `curl -X POST "${BASE_URL}/api/v1/documents/doc_abc123/signers" \\
  -H "Authorization: Bearer sk_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{ "name": "Alice Johnson", "email": "alice@example.com", "order": 2 }'`,
    jsExample: `const signer = await signof.documents.signers.create('doc_abc123', {
  name: 'Alice Johnson',
  email: 'alice@example.com',
  order: 2,
});

console.log(signer.id);`,
    pythonExample: `signer = client.documents.signers.create(
    "doc_abc123",
    name="Alice Johnson",
    email="alice@example.com",
    order=2,
)

print(signer.id)`,
  },
  {
    id: 'signer-list',
    method: HttpMethod.Get as typeof HttpMethod.Get,
    path: '/api/v1/documents/:id/signers',
    description: 'List signers for a document',
    category: 'Signers',
    parameters: [
      { name: 'id', type: 'string', required: true, description: 'Document ID' },
    ],
    requestBody: null,
    responseBody: `{
  "data": [
    {
      "id": "sig_1",
      "name": "John Doe",
      "email": "john@example.com",
      "status": "signed",
      "order": 1,
      "signed_at": "2025-12-21T09:15:00Z"
    },
    {
      "id": "sig_2",
      "name": "Alice Johnson",
      "email": "alice@example.com",
      "status": "pending",
      "order": 2,
      "signed_at": null
    }
  ]
}`,
    curlExample: `curl -X GET "${BASE_URL}/api/v1/documents/doc_abc123/signers" \\
  -H "Authorization: Bearer sk_live_..."`,
    jsExample: `const signers = await signof.documents.signers.list('doc_abc123');

for (const signer of signers.data) {
  console.log(\`\${signer.name}: \${signer.status}\`);
}`,
    pythonExample: `signers = client.documents.signers.list("doc_abc123")

for signer in signers.data:
    print(f"{signer.name}: {signer.status}")`,
  },
  // ── Filings ───────────────────────────────────────────────
  {
    id: 'filing-list',
    method: HttpMethod.Get as typeof HttpMethod.Get,
    path: '/api/v1/filings',
    description: 'List all tax filings',
    category: 'Filings',
    parameters: [
      { name: 'tax_year', type: 'integer', required: false, description: 'Filter by tax year' },
      { name: 'type', type: 'string', required: false, description: 'Filter by form type (1099-NEC, W-9, etc.)' },
      { name: 'status', type: 'string', required: false, description: 'Filter by status: draft, submitted, accepted, rejected' },
    ],
    requestBody: null,
    responseBody: `{
  "data": [
    {
      "id": "fil_001",
      "type": "1099-NEC",
      "tax_year": 2025,
      "status": "submitted",
      "payer": { "name": "Acme Corp", "tin": "**-***1234" },
      "payee": { "name": "John Doe", "tin": "***-**-5678" },
      "amount": 50000.00,
      "submitted_at": "2025-12-15T10:00:00Z"
    }
  ],
  "has_more": false,
  "total": 1
}`,
    curlExample: `curl -X GET "${BASE_URL}/api/v1/filings?tax_year=2025&type=1099-NEC" \\
  -H "Authorization: Bearer sk_live_..."`,
    jsExample: `const filings = await signof.filings.list({
  tax_year: 2025,
  type: '1099-NEC',
});

console.log(filings.data);`,
    pythonExample: `filings = client.filings.list(
    tax_year=2025,
    type="1099-NEC",
)

print(filings.data)`,
  },
  {
    id: 'filing-create',
    method: HttpMethod.Post as typeof HttpMethod.Post,
    path: '/api/v1/filings',
    description: 'Create a new filing',
    category: 'Filings',
    parameters: [],
    requestBody: `{
  "type": "1099-NEC",
  "tax_year": 2025,
  "payer": {
    "name": "Acme Corp",
    "tin": "12-3456789",
    "address": "123 Main St, San Francisco, CA 94102"
  },
  "payee": {
    "name": "John Doe",
    "tin": "123-45-6789",
    "address": "456 Oak Ave, Portland, OR 97201"
  },
  "amount": 50000.00
}`,
    responseBody: `{
  "id": "fil_new002",
  "type": "1099-NEC",
  "tax_year": 2025,
  "status": "draft",
  "amount": 50000.00,
  "created_at": "2025-12-22T16:00:00Z"
}`,
    curlExample: `curl -X POST "${BASE_URL}/api/v1/filings" \\
  -H "Authorization: Bearer sk_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "type": "1099-NEC",
    "tax_year": 2025,
    "payer": { "name": "Acme Corp", "tin": "12-3456789" },
    "payee": { "name": "John Doe", "tin": "123-45-6789" },
    "amount": 50000.00
  }'`,
    jsExample: `const filing = await signof.filings.create({
  type: '1099-NEC',
  tax_year: 2025,
  payer: { name: 'Acme Corp', tin: '12-3456789' },
  payee: { name: 'John Doe', tin: '123-45-6789' },
  amount: 50000.00,
});

console.log(filing.id);`,
    pythonExample: `filing = client.filings.create(
    type="1099-NEC",
    tax_year=2025,
    payer={"name": "Acme Corp", "tin": "12-3456789"},
    payee={"name": "John Doe", "tin": "123-45-6789"},
    amount=50000.00,
)

print(filing.id)`,
  },
  {
    id: 'filing-submit',
    method: HttpMethod.Post as typeof HttpMethod.Post,
    path: '/api/v1/filings/:id/submit',
    description: 'Submit a filing to the IRS',
    category: 'Filings',
    parameters: [
      { name: 'id', type: 'string', required: true, description: 'Filing ID' },
    ],
    requestBody: null,
    responseBody: `{
  "id": "fil_001",
  "status": "submitted",
  "submitted_at": "2025-12-22T16:30:00Z",
  "confirmation_number": "IRS-2025-ABC123"
}`,
    curlExample: `curl -X POST "${BASE_URL}/api/v1/filings/fil_001/submit" \\
  -H "Authorization: Bearer sk_live_..."`,
    jsExample: `const result = await signof.filings.submit('fil_001');

console.log(result.confirmation_number);`,
    pythonExample: `result = client.filings.submit("fil_001")

print(result.confirmation_number)`,
  },
  // ── Bookings ──────────────────────────────────────────────
  {
    id: 'booking-list',
    method: HttpMethod.Get as typeof HttpMethod.Get,
    path: '/api/v1/bookings',
    description: 'List all bookings',
    category: 'Bookings',
    parameters: [
      { name: 'event_type', type: 'string', required: false, description: 'Filter by event type slug' },
      { name: 'status', type: 'string', required: false, description: 'Filter by status: confirmed, cancelled, completed' },
      { name: 'from', type: 'string', required: false, description: 'Start date (ISO 8601)' },
      { name: 'to', type: 'string', required: false, description: 'End date (ISO 8601)' },
    ],
    requestBody: null,
    responseBody: `{
  "data": [
    {
      "id": "bk_001",
      "event_type": "consultation",
      "invitee": { "name": "Sarah Lee", "email": "sarah@example.com" },
      "start_time": "2025-12-28T14:00:00Z",
      "end_time": "2025-12-28T14:30:00Z",
      "status": "confirmed",
      "location": "https://meet.signof.io/bk_001"
    }
  ],
  "has_more": false,
  "total": 1
}`,
    curlExample: `curl -X GET "${BASE_URL}/api/v1/bookings?status=confirmed" \\
  -H "Authorization: Bearer sk_live_..."`,
    jsExample: `const bookings = await signof.bookings.list({
  status: 'confirmed',
});

console.log(bookings.data);`,
    pythonExample: `bookings = client.bookings.list(
    status="confirmed",
)

print(bookings.data)`,
  },
  {
    id: 'booking-create',
    method: HttpMethod.Post as typeof HttpMethod.Post,
    path: '/api/v1/bookings',
    description: 'Create a new booking',
    category: 'Bookings',
    parameters: [],
    requestBody: `{
  "event_type": "consultation",
  "invitee": {
    "name": "Sarah Lee",
    "email": "sarah@example.com"
  },
  "start_time": "2025-12-30T10:00:00Z",
  "timezone": "America/New_York"
}`,
    responseBody: `{
  "id": "bk_new002",
  "event_type": "consultation",
  "invitee": { "name": "Sarah Lee", "email": "sarah@example.com" },
  "start_time": "2025-12-30T10:00:00Z",
  "end_time": "2025-12-30T10:30:00Z",
  "status": "confirmed",
  "location": "https://meet.signof.io/bk_new002",
  "created_at": "2025-12-22T17:00:00Z"
}`,
    curlExample: `curl -X POST "${BASE_URL}/api/v1/bookings" \\
  -H "Authorization: Bearer sk_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "event_type": "consultation",
    "invitee": { "name": "Sarah Lee", "email": "sarah@example.com" },
    "start_time": "2025-12-30T10:00:00Z",
    "timezone": "America/New_York"
  }'`,
    jsExample: `const booking = await signof.bookings.create({
  event_type: 'consultation',
  invitee: { name: 'Sarah Lee', email: 'sarah@example.com' },
  start_time: '2025-12-30T10:00:00Z',
  timezone: 'America/New_York',
});

console.log(booking.location);`,
    pythonExample: `booking = client.bookings.create(
    event_type="consultation",
    invitee={"name": "Sarah Lee", "email": "sarah@example.com"},
    start_time="2025-12-30T10:00:00Z",
    timezone="America/New_York",
)

print(booking.location)`,
  },
  {
    id: 'booking-cancel',
    method: HttpMethod.Post as typeof HttpMethod.Post,
    path: '/api/v1/bookings/:id/cancel',
    description: 'Cancel a booking',
    category: 'Bookings',
    parameters: [
      { name: 'id', type: 'string', required: true, description: 'Booking ID' },
    ],
    requestBody: `{
  "reason": "Schedule conflict"
}`,
    responseBody: `{
  "id": "bk_001",
  "status": "cancelled",
  "cancelled_at": "2025-12-22T17:30:00Z",
  "reason": "Schedule conflict"
}`,
    curlExample: `curl -X POST "${BASE_URL}/api/v1/bookings/bk_001/cancel" \\
  -H "Authorization: Bearer sk_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{ "reason": "Schedule conflict" }'`,
    jsExample: `const result = await signof.bookings.cancel('bk_001', {
  reason: 'Schedule conflict',
});

console.log(result.status); // "cancelled"`,
    pythonExample: `result = client.bookings.cancel(
    "bk_001",
    reason="Schedule conflict",
)

print(result.status)  # "cancelled"`,
  },
  // ── Databases ─────────────────────────────────────────────
  {
    id: 'db-list',
    method: HttpMethod.Get as typeof HttpMethod.Get,
    path: '/api/v1/databases',
    description: 'List all databases',
    category: 'Databases',
    parameters: [
      { name: 'limit', type: 'integer', required: false, description: 'Number of results (default 25)' },
    ],
    requestBody: null,
    responseBody: `{
  "data": [
    {
      "id": "db_001",
      "name": "Contacts",
      "record_count": 150,
      "fields": [
        { "name": "Name", "type": "text" },
        { "name": "Email", "type": "email" },
        { "name": "Status", "type": "select" }
      ],
      "created_at": "2025-11-01T00:00:00Z"
    }
  ],
  "has_more": false,
  "total": 1
}`,
    curlExample: `curl -X GET "${BASE_URL}/api/v1/databases" \\
  -H "Authorization: Bearer sk_live_..."`,
    jsExample: `const databases = await signof.databases.list();

console.log(databases.data);`,
    pythonExample: `databases = client.databases.list()

print(databases.data)`,
  },
  {
    id: 'db-create-record',
    method: HttpMethod.Post as typeof HttpMethod.Post,
    path: '/api/v1/databases/:id/records',
    description: 'Create a record in a database',
    category: 'Databases',
    parameters: [
      { name: 'id', type: 'string', required: true, description: 'Database ID' },
    ],
    requestBody: `{
  "fields": {
    "Name": "New Contact",
    "Email": "contact@example.com",
    "Status": "Active"
  }
}`,
    responseBody: `{
  "id": "rec_new001",
  "database_id": "db_001",
  "fields": {
    "Name": "New Contact",
    "Email": "contact@example.com",
    "Status": "Active"
  },
  "created_at": "2025-12-22T18:00:00Z"
}`,
    curlExample: `curl -X POST "${BASE_URL}/api/v1/databases/db_001/records" \\
  -H "Authorization: Bearer sk_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "fields": {
      "Name": "New Contact",
      "Email": "contact@example.com",
      "Status": "Active"
    }
  }'`,
    jsExample: `const record = await signof.databases.records.create('db_001', {
  fields: {
    Name: 'New Contact',
    Email: 'contact@example.com',
    Status: 'Active',
  },
});

console.log(record.id);`,
    pythonExample: `record = client.databases.records.create(
    "db_001",
    fields={
        "Name": "New Contact",
        "Email": "contact@example.com",
        "Status": "Active",
    },
)

print(record.id)`,
  },
]

const CATEGORIES = ['Documents', 'Signers', 'Filings', 'Bookings', 'Databases']

function ApiDocsPage() {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [filterCategory, setFilterCategory] = useState<string | null>(null)

  const handleToggle = useCallback((id: string) => {
    setExpandedId(prev => prev === id ? null : id)
  }, [])

  const handleFilterCategory = useCallback((cat: string | null) => {
    setFilterCategory(cat)
  }, [])

  const filteredEndpoints = filterCategory
    ? ENDPOINTS.filter(ep => ep.category === filterCategory)
    : ENDPOINTS

  return (
    <div className="api-docs-page">
      <div className="api-docs-page__header">
        <h1 className="api-docs-page__title">API Reference</h1>
        <p className="api-docs-page__subtitle">
          Complete reference for the SignOf REST API. All endpoints require authentication
          via Bearer token in the Authorization header.
        </p>
      </div>

      <div className="api-docs-page__base-url">
        <span className="api-docs-page__base-url-label">Base URL</span>
        <code className="api-docs-page__base-url-value">{BASE_URL}</code>
      </div>

      <div className="api-docs-page__filters">
        <button
          className={`api-docs-page__filter ${filterCategory === null ? 'api-docs-page__filter--active' : ''}`}
          onClick={() => handleFilterCategory(null)}
          type="button"
        >
          All ({ENDPOINTS.length})
        </button>
        {CATEGORIES.map(cat => {
          const count = ENDPOINTS.filter(ep => ep.category === cat).length
          return (
            <button
              key={cat}
              className={`api-docs-page__filter ${filterCategory === cat ? 'api-docs-page__filter--active' : ''}`}
              onClick={() => handleFilterCategory(cat)}
              type="button"
            >
              {cat} ({count})
            </button>
          )
        })}
      </div>

      <div className="api-docs-page__endpoints">
        {filteredEndpoints.map(endpoint => (
          <EndpointCard
            key={endpoint.id}
            endpoint={endpoint}
            expanded={expandedId === endpoint.id}
            onToggle={() => handleToggle(endpoint.id)}
          />
        ))}
      </div>
    </div>
  )
}

export default ApiDocsPage
