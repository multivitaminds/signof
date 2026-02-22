import { useState, useCallback, useMemo } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { McpDomain, MCP_DOMAIN_LABELS } from '../types'
import type { McpTool, McpResource } from '../types'
import CodeBlock from '../components/CodeBlock/CodeBlock'
import './McpDocsPage.css'

// ─── Install Methods ────────────────────────────────────────────────────

const MCP_INSTALL_METHODS = [
  { id: 'npx', label: 'npx', command: 'npx @origina/mcp-server', note: 'Zero-install. Requires Node.js 18+.' },
  { id: 'docker', label: 'Docker', command: 'docker run -p 3100:3100 origina/mcp-server', note: 'Isolated environment. Auto-restarts.' },
  { id: 'manual', label: 'Manual', command: 'npm install -g @origina/mcp-server\norigina-mcp start', note: 'Global install. Use for custom configuration.' },
]

// ─── MCP Tools ──────────────────────────────────────────────────────────

const MCP_TOOLS: McpTool[] = [
  // Documents
  {
    id: 'mcp-t-1',
    name: 'list_documents',
    domain: McpDomain.Documents,
    description: 'List documents in the workspace, optionally filtered by status.',
    parameters: [{ name: 'status', type: 'string', required: false, description: 'Filter by status (draft|pending|completed)' }],
    returnType: 'Document[]',
    example: '{ "tools": [{ "name": "list_documents", "arguments": { "status": "pending" } }] }',
  },
  {
    id: 'mcp-t-2',
    name: 'create_document',
    domain: McpDomain.Documents,
    description: 'Create a new document from a file URL.',
    parameters: [
      { name: 'name', type: 'string', required: true, description: 'Document name' },
      { name: 'fileUrl', type: 'string', required: true, description: 'URL of the file to upload' },
    ],
    returnType: 'Document',
    example: '{ "tools": [{ "name": "create_document", "arguments": { "name": "NDA", "fileUrl": "https://..." } }] }',
  },
  {
    id: 'mcp-t-3',
    name: 'send_for_signing',
    domain: McpDomain.Documents,
    description: 'Send a document to one or more signers for signature.',
    parameters: [
      { name: 'documentId', type: 'string', required: true, description: 'Document ID' },
      { name: 'signers', type: 'string[]', required: true, description: 'Email addresses of signers' },
    ],
    returnType: 'Document',
    example: '{ "tools": [{ "name": "send_for_signing", "arguments": { "documentId": "doc_abc", "signers": ["alice@co.com"] } }] }',
  },
  {
    id: 'mcp-t-4',
    name: 'get_document_status',
    domain: McpDomain.Documents,
    description: 'Retrieve the current status of a document.',
    parameters: [{ name: 'documentId', type: 'string', required: true, description: 'Document ID' }],
    returnType: 'DocumentStatus',
    example: '{ "tools": [{ "name": "get_document_status", "arguments": { "documentId": "doc_abc" } }] }',
  },
  // Projects
  {
    id: 'mcp-t-5',
    name: 'list_issues',
    domain: McpDomain.Projects,
    description: 'List issues in a project, optionally filtered by status.',
    parameters: [
      { name: 'projectId', type: 'string', required: true, description: 'Project ID' },
      { name: 'status', type: 'string', required: false, description: 'Filter by status' },
    ],
    returnType: 'Issue[]',
    example: '{ "tools": [{ "name": "list_issues", "arguments": { "projectId": "proj_01" } }] }',
  },
  {
    id: 'mcp-t-6',
    name: 'create_issue',
    domain: McpDomain.Projects,
    description: 'Create a new issue in a project.',
    parameters: [
      { name: 'projectId', type: 'string', required: true, description: 'Project ID' },
      { name: 'title', type: 'string', required: true, description: 'Issue title' },
      { name: 'priority', type: 'string', required: false, description: 'low|medium|high|urgent' },
    ],
    returnType: 'Issue',
    example: '{ "tools": [{ "name": "create_issue", "arguments": { "projectId": "proj_01", "title": "Fix login bug" } }] }',
  },
  {
    id: 'mcp-t-7',
    name: 'update_issue_status',
    domain: McpDomain.Projects,
    description: 'Update the status of an existing issue.',
    parameters: [
      { name: 'issueId', type: 'string', required: true, description: 'Issue ID' },
      { name: 'status', type: 'string', required: true, description: 'todo|in-progress|done|cancelled' },
    ],
    returnType: 'Issue',
    example: '{ "tools": [{ "name": "update_issue_status", "arguments": { "issueId": "iss_42", "status": "done" } }] }',
  },
  {
    id: 'mcp-t-8',
    name: 'get_project_board',
    domain: McpDomain.Projects,
    description: 'Retrieve the board view for a project with all columns and issues.',
    parameters: [{ name: 'projectId', type: 'string', required: true, description: 'Project ID' }],
    returnType: 'Board',
    example: '{ "tools": [{ "name": "get_project_board", "arguments": { "projectId": "proj_01" } }] }',
  },
  // Scheduling
  {
    id: 'mcp-t-9',
    name: 'list_events',
    domain: McpDomain.Scheduling,
    description: 'List scheduled events within a date range.',
    parameters: [
      { name: 'startDate', type: 'string', required: false, description: 'Start date (ISO 8601)' },
      { name: 'endDate', type: 'string', required: false, description: 'End date (ISO 8601)' },
    ],
    returnType: 'Event[]',
    example: '{ "tools": [{ "name": "list_events", "arguments": { "startDate": "2025-01-01" } }] }',
  },
  {
    id: 'mcp-t-10',
    name: 'create_booking',
    domain: McpDomain.Scheduling,
    description: 'Create a new booking for an event type.',
    parameters: [
      { name: 'eventTypeId', type: 'string', required: true, description: 'Event type ID' },
      { name: 'startTime', type: 'string', required: true, description: 'Booking start time (ISO 8601)' },
      { name: 'attendeeEmail', type: 'string', required: true, description: 'Attendee email address' },
    ],
    returnType: 'Booking',
    example: '{ "tools": [{ "name": "create_booking", "arguments": { "eventTypeId": "evt_01", "startTime": "2025-03-15T10:00:00Z", "attendeeEmail": "guest@example.com" } }] }',
  },
  {
    id: 'mcp-t-11',
    name: 'check_availability',
    domain: McpDomain.Scheduling,
    description: 'Check available time slots for an event type on a specific date.',
    parameters: [
      { name: 'eventTypeId', type: 'string', required: true, description: 'Event type ID' },
      { name: 'date', type: 'string', required: true, description: 'Date to check (YYYY-MM-DD)' },
    ],
    returnType: 'TimeSlot[]',
    example: '{ "tools": [{ "name": "check_availability", "arguments": { "eventTypeId": "evt_01", "date": "2025-03-15" } }] }',
  },
  // Databases
  {
    id: 'mcp-t-12',
    name: 'query_database',
    domain: McpDomain.Databases,
    description: 'Query records from a database with optional filtering and sorting.',
    parameters: [
      { name: 'databaseId', type: 'string', required: true, description: 'Database ID' },
      { name: 'filter', type: 'object', required: false, description: 'Filter conditions' },
      { name: 'sort', type: 'string', required: false, description: 'Sort field and direction' },
    ],
    returnType: 'Record[]',
    example: '{ "tools": [{ "name": "query_database", "arguments": { "databaseId": "db_01", "filter": { "status": "active" } } }] }',
  },
  {
    id: 'mcp-t-13',
    name: 'create_record',
    domain: McpDomain.Databases,
    description: 'Create a new record in a database.',
    parameters: [
      { name: 'databaseId', type: 'string', required: true, description: 'Database ID' },
      { name: 'fields', type: 'object', required: true, description: 'Field values' },
    ],
    returnType: 'Record',
    example: '{ "tools": [{ "name": "create_record", "arguments": { "databaseId": "db_01", "fields": { "name": "Acme Corp" } } }] }',
  },
  {
    id: 'mcp-t-14',
    name: 'update_record',
    domain: McpDomain.Databases,
    description: 'Update fields on an existing database record.',
    parameters: [
      { name: 'recordId', type: 'string', required: true, description: 'Record ID' },
      { name: 'fields', type: 'object', required: true, description: 'Field values to update' },
    ],
    returnType: 'Record',
    example: '{ "tools": [{ "name": "update_record", "arguments": { "recordId": "rec_99", "fields": { "status": "closed" } } }] }',
  },
  // AI
  {
    id: 'mcp-t-15',
    name: 'spawn_agent',
    domain: McpDomain.Ai,
    description: 'Spawn an autonomous AI agent to perform a task.',
    parameters: [
      { name: 'type', type: 'string', required: true, description: 'Agent type (planner|researcher|writer|coder|reviewer|analyst)' },
      { name: 'task', type: 'string', required: true, description: 'Task description for the agent' },
      { name: 'context', type: 'object', required: false, description: 'Additional context for the agent' },
    ],
    returnType: 'AgentRun',
    example: '{ "tools": [{ "name": "spawn_agent", "arguments": { "type": "researcher", "task": "Summarize Q4 metrics" } }] }',
  },
  {
    id: 'mcp-t-16',
    name: 'get_agent_status',
    domain: McpDomain.Ai,
    description: 'Check the current status and output of a running agent.',
    parameters: [{ name: 'runId', type: 'string', required: true, description: 'Agent run ID' }],
    returnType: 'AgentStatus',
    example: '{ "tools": [{ "name": "get_agent_status", "arguments": { "runId": "run_abc" } }] }',
  },
  {
    id: 'mcp-t-17',
    name: 'list_agent_types',
    domain: McpDomain.Ai,
    description: 'List all available agent types and their capabilities.',
    parameters: [],
    returnType: 'AgentType[]',
    example: '{ "tools": [{ "name": "list_agent_types", "arguments": {} }] }',
  },
  // Workspace
  {
    id: 'mcp-t-18',
    name: 'search_pages',
    domain: McpDomain.Workspace,
    description: 'Full-text search across all workspace pages.',
    parameters: [
      { name: 'query', type: 'string', required: true, description: 'Search query' },
      { name: 'limit', type: 'number', required: false, description: 'Max results to return' },
    ],
    returnType: 'Page[]',
    example: '{ "tools": [{ "name": "search_pages", "arguments": { "query": "onboarding", "limit": 10 } }] }',
  },
  {
    id: 'mcp-t-19',
    name: 'create_page',
    domain: McpDomain.Workspace,
    description: 'Create a new page in the workspace.',
    parameters: [
      { name: 'title', type: 'string', required: true, description: 'Page title' },
      { name: 'parentId', type: 'string', required: false, description: 'Parent page ID for nesting' },
      { name: 'content', type: 'string', required: false, description: 'Initial page content (markdown)' },
    ],
    returnType: 'Page',
    example: '{ "tools": [{ "name": "create_page", "arguments": { "title": "Meeting Notes", "content": "# Agenda\\n- ..." } }] }',
  },
  {
    id: 'mcp-t-20',
    name: 'update_page',
    domain: McpDomain.Workspace,
    description: 'Update the content of an existing page.',
    parameters: [
      { name: 'pageId', type: 'string', required: true, description: 'Page ID' },
      { name: 'content', type: 'string', required: true, description: 'New page content (markdown)' },
    ],
    returnType: 'Page',
    example: '{ "tools": [{ "name": "update_page", "arguments": { "pageId": "pg_01", "content": "# Updated content" } }] }',
  },
]

// ─── MCP Resources ──────────────────────────────────────────────────────

const MCP_RESOURCES: McpResource[] = [
  { id: 'r1', name: 'Workspace Info', uri: 'origina://workspace/info', domain: McpDomain.Workspace, description: 'Current workspace name, plan, and member count' },
  { id: 'r2', name: 'Document Templates', uri: 'origina://documents/templates', domain: McpDomain.Documents, description: 'Available document templates and their fields' },
  { id: 'r3', name: 'Project List', uri: 'origina://projects/list', domain: McpDomain.Projects, description: 'All projects with status and member assignments' },
  { id: 'r4', name: 'Upcoming Events', uri: 'origina://scheduling/upcoming', domain: McpDomain.Scheduling, description: 'Next 30 days of scheduled events and bookings' },
  { id: 'r5', name: 'Database Schema', uri: 'origina://databases/schema', domain: McpDomain.Databases, description: 'All database definitions, fields, and relationships' },
  { id: 'r6', name: 'Agent Catalog', uri: 'origina://ai/agents', domain: McpDomain.Ai, description: 'Available agent types with capabilities and constraints' },
]

// ─── Client Configs ─────────────────────────────────────────────────────

const CLIENT_CONFIGS = [
  { id: 'claude', label: 'Claude Desktop', language: 'json', code: `{
  "mcpServers": {
    "origina": {
      "command": "npx",
      "args": ["@origina/mcp-server"],
      "env": {
        "ORIGINA_API_KEY": "sk_live_..."
      }
    }
  }
}` },
  { id: 'cursor', label: 'Cursor', language: 'json', code: `{
  "mcpServers": {
    "origina": {
      "command": "npx",
      "args": ["@origina/mcp-server"],
      "env": {
        "ORIGINA_API_KEY": "sk_live_..."
      }
    }
  }
}` },
  { id: 'vscode', label: 'VS Code', language: 'json', code: `{
  "mcp": {
    "servers": {
      "origina": {
        "command": "npx",
        "args": ["@origina/mcp-server"],
        "env": {
          "ORIGINA_API_KEY": "sk_live_..."
        }
      }
    }
  }
}` },
  { id: 'custom', label: 'Custom', language: 'javascript', code: `import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js'

const transport = new StdioClientTransport({
  command: 'npx',
  args: ['@origina/mcp-server'],
  env: { ORIGINA_API_KEY: process.env.ORIGINA_API_KEY },
})

const client = new Client({ name: 'my-app', version: '1.0.0' })
await client.connect(transport)

const tools = await client.listTools()
console.log('Available tools:', tools)` },
]

// ─── Environment Variables ──────────────────────────────────────────────

const ENV_VARS = [
  { name: 'ORIGINA_API_KEY', description: 'Your API key for authentication', default: '\u2014' },
  { name: 'ORIGINA_BASE_URL', description: 'API base URL', default: 'https://api.origina.io' },
  { name: 'ORIGINA_MCP_PORT', description: 'MCP server port', default: '3100' },
]

// ─── Component ──────────────────────────────────────────────────────────

function McpDocsPage() {
  const [installMethod, setInstallMethod] = useState('npx')
  const [expandedDomains, setExpandedDomains] = useState<Set<string>>(new Set())
  const [activeClient, setActiveClient] = useState('claude')

  const handleInstallChange = useCallback((method: string) => {
    setInstallMethod(method)
  }, [])

  const handleToggleDomain = useCallback((domain: string) => {
    setExpandedDomains(prev => {
      const next = new Set(prev)
      if (next.has(domain)) {
        next.delete(domain)
      } else {
        next.add(domain)
      }
      return next
    })
  }, [])

  const handleClientChange = useCallback((client: string) => {
    setActiveClient(client)
  }, [])

  const activeInstall = useMemo(
    () => MCP_INSTALL_METHODS.find(m => m.id === installMethod) ?? MCP_INSTALL_METHODS[0]!,
    [installMethod],
  )

  const activeConfig = useMemo(
    () => CLIENT_CONFIGS.find(c => c.id === activeClient) ?? CLIENT_CONFIGS[0]!,
    [activeClient],
  )

  const toolsByDomain = useMemo(() => {
    const groups: { domain: McpDomain; label: string; tools: McpTool[] }[] = []
    const domainOrder: McpDomain[] = [
      McpDomain.Documents,
      McpDomain.Projects,
      McpDomain.Scheduling,
      McpDomain.Databases,
      McpDomain.Ai,
      McpDomain.Workspace,
    ]
    for (const d of domainOrder) {
      const domainTools = MCP_TOOLS.filter(t => t.domain === d)
      if (domainTools.length > 0) {
        groups.push({ domain: d, label: MCP_DOMAIN_LABELS[d], tools: domainTools })
      }
    }
    return groups
  }, [])

  return (
    <div className="mcp-docs">
      {/* Header */}
      <div className="mcp-docs__header">
        <h1 className="mcp-docs__title">Model Context Protocol (MCP)</h1>
        <p className="mcp-docs__subtitle">
          Connect AI assistants to every part of your OriginA workspace through the open Model Context Protocol.
        </p>
      </div>

      {/* Overview */}
      <div className="mcp-docs__section">
        <h2 className="mcp-docs__section-title">Overview</h2>
        <p className="mcp-docs__overview">
          MCP is an open protocol that standardizes how AI assistants interact with external tools and data sources.
          The OriginA MCP server exposes all platform capabilities — documents, projects, scheduling, databases,
          AI agents, and workspace pages — so any MCP-compatible client can read, create, and manage your data
          through natural language.
        </p>
      </div>

      {/* Installation */}
      <div className="mcp-docs__section">
        <h2 className="mcp-docs__section-title">Installation</h2>
        <div className="mcp-docs__install-tabs">
          {MCP_INSTALL_METHODS.map(method => (
            <button
              key={method.id}
              className={`mcp-docs__install-tab ${installMethod === method.id ? 'mcp-docs__install-tab--active' : ''}`}
              onClick={() => handleInstallChange(method.id)}
              type="button"
            >
              {method.label}
            </button>
          ))}
        </div>
        <CodeBlock code={activeInstall.command} language="bash" />
        <p className="mcp-docs__install-note">{activeInstall.note}</p>
      </div>

      {/* Available Tools */}
      <div className="mcp-docs__section">
        <h2 className="mcp-docs__section-title">Available Tools</h2>
        <div className="mcp-docs__domain-groups">
          {toolsByDomain.map(group => {
            const isExpanded = expandedDomains.has(group.domain)
            return (
              <div key={group.domain} className="mcp-docs__domain-group">
                <button
                  className="mcp-docs__domain-header"
                  onClick={() => handleToggleDomain(group.domain)}
                  type="button"
                  aria-expanded={isExpanded}
                >
                  {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  <span className="mcp-docs__domain-label">{group.label}</span>
                  <span className="mcp-docs__domain-count">{group.tools.length} tools</span>
                </button>
                {isExpanded && (
                  <div className="mcp-docs__domain-tools">
                    {group.tools.map(tool => (
                      <div key={tool.id} className="mcp-docs__tool-card">
                        <code className="mcp-docs__tool-name">{tool.name}</code>
                        <p className="mcp-docs__tool-desc">{tool.description}</p>
                        {tool.parameters.length > 0 && (
                          <table className="mcp-docs__params-table">
                            <thead>
                              <tr>
                                <th>Name</th>
                                <th>Type</th>
                                <th>Required</th>
                                <th>Description</th>
                              </tr>
                            </thead>
                            <tbody>
                              {tool.parameters.map(param => (
                                <tr key={param.name}>
                                  <td><code>{param.name}</code></td>
                                  <td><code>{param.type}</code></td>
                                  <td>{param.required ? 'Yes' : 'No'}</td>
                                  <td>{param.description}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                        <p className="mcp-docs__tool-return">
                          Returns: <code>{tool.returnType}</code>
                        </p>
                        <CodeBlock code={tool.example} language="json" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Resources */}
      <div className="mcp-docs__section">
        <h2 className="mcp-docs__section-title">Resources</h2>
        <div className="mcp-docs__resources-grid">
          {MCP_RESOURCES.map(resource => (
            <div key={resource.id} className="mcp-docs__resource-card">
              <span className="mcp-docs__resource-name">{resource.name}</span>
              <code className="mcp-docs__resource-uri">{resource.uri}</code>
              <p className="mcp-docs__resource-desc">{resource.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Configuration */}
      <div className="mcp-docs__section">
        <h2 className="mcp-docs__section-title">Configuration</h2>
        <div className="mcp-docs__config-tabs">
          {CLIENT_CONFIGS.map(config => (
            <button
              key={config.id}
              className={`mcp-docs__config-tab ${activeClient === config.id ? 'mcp-docs__config-tab--active' : ''}`}
              onClick={() => handleClientChange(config.id)}
              type="button"
            >
              {config.label}
            </button>
          ))}
        </div>
        <CodeBlock code={activeConfig.code} language={activeConfig.language} />
        <table className="mcp-docs__env-table">
          <thead>
            <tr>
              <th>Variable</th>
              <th>Description</th>
              <th>Default</th>
            </tr>
          </thead>
          <tbody>
            {ENV_VARS.map(v => (
              <tr key={v.name}>
                <td><code>{v.name}</code></td>
                <td>{v.description}</td>
                <td><code>{v.default}</code></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Security */}
      <div className="mcp-docs__section">
        <h2 className="mcp-docs__section-title">Security</h2>
        <ul className="mcp-docs__security-list">
          <li>Rate limiting: 1,000 requests per minute per API key</li>
          <li>Token scopes: read, write, admin — tools respect your key's permissions</li>
          <li>Audit logging: all MCP tool invocations are logged and queryable</li>
        </ul>
      </div>
    </div>
  )
}

export default McpDocsPage
