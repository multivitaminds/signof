import { useState, useCallback } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import type { CliCommand } from '../types'
import CodeBlock from '../components/CodeBlock/CodeBlock'
import './CliDocsPage.css'

const CLI_COMMANDS: CliCommand[] = [
  {
    name: 'login',
    description: 'Authenticate with your SignOf account. Opens a browser window for OAuth or accepts an API key directly.',
    usage: 'signof login [--key <api-key>]',
    flags: [
      { name: '--key', alias: '-k', description: 'Authenticate with an API key instead of browser OAuth', required: false },
      { name: '--env', alias: '-e', description: 'Environment to authenticate against (live, test)', required: false },
    ],
    examples: [
      'signof login',
      'signof login --key sk_live_abc123...',
      'signof login --env test',
    ],
  },
  {
    name: 'logout',
    description: 'Remove stored credentials and clear the current session.',
    usage: 'signof logout',
    flags: [
      { name: '--all', alias: '-a', description: 'Remove all stored credentials across environments', required: false },
    ],
    examples: [
      'signof logout',
      'signof logout --all',
    ],
  },
  {
    name: 'documents list',
    description: 'List documents in your workspace. Supports filtering by status and pagination.',
    usage: 'signof documents list [flags]',
    flags: [
      { name: '--status', alias: '-s', description: 'Filter by status (draft, pending, completed, voided)', required: false },
      { name: '--limit', alias: '-l', description: 'Number of results to return (default: 25)', required: false },
      { name: '--format', alias: '-f', description: 'Output format: table, json, csv (default: table)', required: false },
    ],
    examples: [
      'signof documents list',
      'signof documents list --status pending --limit 10',
      'signof documents list --format json',
    ],
  },
  {
    name: 'documents create',
    description: 'Create a new document from a local file or URL.',
    usage: 'signof documents create <file> [flags]',
    flags: [
      { name: '--name', alias: '-n', description: 'Document name (defaults to filename)', required: false },
      { name: '--signer', alias: '-s', description: 'Add a signer (format: "Name <email>"). Can be repeated.', required: false },
      { name: '--send', alias: null, description: 'Send immediately after creation', required: false },
    ],
    examples: [
      'signof documents create ./contract.pdf',
      'signof documents create ./nda.pdf --name "NDA Agreement" --signer "John <john@example.com>"',
      'signof documents create ./offer.pdf --signer "Alice <alice@co.com>" --signer "Bob <bob@co.com>" --send',
    ],
  },
  {
    name: 'documents send',
    description: 'Send a draft document for signing. Notifies all signers via email.',
    usage: 'signof documents send <document-id> [flags]',
    flags: [
      { name: '--message', alias: '-m', description: 'Custom message to include in the signing email', required: false },
      { name: '--subject', alias: '-s', description: 'Custom email subject line', required: false },
    ],
    examples: [
      'signof documents send doc_abc123',
      'signof documents send doc_abc123 --message "Please review and sign by Friday."',
    ],
  },
  {
    name: 'filings list',
    description: 'List all tax filings. Filter by year, type, or status.',
    usage: 'signof filings list [flags]',
    flags: [
      { name: '--year', alias: '-y', description: 'Tax year to filter by', required: false },
      { name: '--type', alias: '-t', description: 'Form type (1099-NEC, W-9, etc.)', required: false },
      { name: '--status', alias: '-s', description: 'Filter by status (draft, submitted, accepted)', required: false },
      { name: '--format', alias: '-f', description: 'Output format: table, json, csv (default: table)', required: false },
    ],
    examples: [
      'signof filings list',
      'signof filings list --year 2025 --type 1099-NEC',
      'signof filings list --status submitted --format json',
    ],
  },
  {
    name: 'filings submit',
    description: 'Submit a draft filing to the IRS. Validates all required fields before submission.',
    usage: 'signof filings submit <filing-id> [flags]',
    flags: [
      { name: '--dry-run', alias: null, description: 'Validate without actually submitting', required: false },
      { name: '--confirm', alias: '-y', description: 'Skip confirmation prompt', required: false },
    ],
    examples: [
      'signof filings submit fil_001',
      'signof filings submit fil_001 --dry-run',
      'signof filings submit fil_001 --confirm',
    ],
  },
  {
    name: 'webhooks list',
    description: 'List all configured webhooks with their status and subscribed events.',
    usage: 'signof webhooks list [flags]',
    flags: [
      { name: '--format', alias: '-f', description: 'Output format: table, json (default: table)', required: false },
    ],
    examples: [
      'signof webhooks list',
      'signof webhooks list --format json',
    ],
  },
  {
    name: 'webhooks create',
    description: 'Create a new webhook endpoint.',
    usage: 'signof webhooks create <url> [flags]',
    flags: [
      { name: '--event', alias: '-e', description: 'Event to subscribe to. Can be repeated. Defaults to all events.', required: false },
      { name: '--secret', alias: '-s', description: 'Custom signing secret (auto-generated if omitted)', required: false },
    ],
    examples: [
      'signof webhooks create https://api.example.com/hooks',
      'signof webhooks create https://api.example.com/hooks --event document.created --event document.completed',
    ],
  },
  {
    name: 'config set',
    description: 'Set a CLI configuration value. Stored in ~/.signof/config.json.',
    usage: 'signof config set <key> <value>',
    flags: [],
    examples: [
      'signof config set default_env test',
      'signof config set output_format json',
      'signof config set editor vim',
    ],
  },
  {
    name: 'config get',
    description: 'Read a CLI configuration value.',
    usage: 'signof config get <key>',
    flags: [],
    examples: [
      'signof config get default_env',
      'signof config get output_format',
    ],
  },
  {
    name: 'init',
    description: 'Initialize a new SignOf project in the current directory. Creates a signof.config.json file.',
    usage: 'signof init [flags]',
    flags: [
      { name: '--template', alias: '-t', description: 'Project template (default, react, node, python)', required: false },
      { name: '--name', alias: '-n', description: 'Project name', required: false },
    ],
    examples: [
      'signof init',
      'signof init --template react --name "My App"',
    ],
  },
]

function CliDocsPage() {
  const [expandedCmd, setExpandedCmd] = useState<string | null>(null)

  const handleToggle = useCallback((name: string) => {
    setExpandedCmd(prev => prev === name ? null : name)
  }, [])

  return (
    <div className="cli-docs-page">
      <div className="cli-docs-page__header">
        <h1 className="cli-docs-page__title">CLI Reference</h1>
        <p className="cli-docs-page__subtitle">
          The SignOf CLI lets you manage documents, filings, webhooks, and more from your terminal.
        </p>
      </div>

      <div className="cli-docs-page__install">
        <h2 className="cli-docs-page__section-title">Installation</h2>
        <CodeBlock
          code="npm install -g @signof/cli"
          language="bash"
        />
        <p className="cli-docs-page__install-note">
          Requires Node.js 18 or later. After installing, run <code>signof login</code> to authenticate.
        </p>
      </div>

      <div className="cli-docs-page__verify">
        <h2 className="cli-docs-page__section-title">Verify Installation</h2>
        <CodeBlock
          code={`$ signof --version
@signof/cli v1.0.0

$ signof --help
Usage: signof <command> [options]

Commands:
  login          Authenticate with SignOf
  logout         Clear stored credentials
  documents      Manage documents
  filings        Manage tax filings
  webhooks       Manage webhooks
  config         CLI configuration
  init           Initialize a project`}
          language="bash"
        />
      </div>

      <div className="cli-docs-page__commands">
        <h2 className="cli-docs-page__section-title">Commands</h2>
        <div className="cli-docs-page__command-list">
          {CLI_COMMANDS.map(cmd => {
            const isExpanded = expandedCmd === cmd.name
            return (
              <div
                key={cmd.name}
                className={`cli-docs-page__command ${isExpanded ? 'cli-docs-page__command--expanded' : ''}`}
              >
                <button
                  className="cli-docs-page__command-header"
                  onClick={() => handleToggle(cmd.name)}
                  type="button"
                  aria-expanded={isExpanded}
                >
                  <div className="cli-docs-page__command-left">
                    {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    <code className="cli-docs-page__command-name">signof {cmd.name}</code>
                  </div>
                  <span className="cli-docs-page__command-desc">{cmd.description.split('.')[0]}</span>
                </button>

                {isExpanded && (
                  <div className="cli-docs-page__command-details">
                    <p className="cli-docs-page__command-full-desc">{cmd.description}</p>

                    <div className="cli-docs-page__command-section">
                      <h4 className="cli-docs-page__command-section-title">Usage</h4>
                      <CodeBlock code={cmd.usage} language="bash" />
                    </div>

                    {cmd.flags.length > 0 && (
                      <div className="cli-docs-page__command-section">
                        <h4 className="cli-docs-page__command-section-title">Flags</h4>
                        <table className="cli-docs-page__flags-table">
                          <thead>
                            <tr>
                              <th>Flag</th>
                              <th>Alias</th>
                              <th>Description</th>
                              <th>Required</th>
                            </tr>
                          </thead>
                          <tbody>
                            {cmd.flags.map(flag => (
                              <tr key={flag.name}>
                                <td><code>{flag.name}</code></td>
                                <td>{flag.alias ? <code>{flag.alias}</code> : <span className="cli-docs-page__na">--</span>}</td>
                                <td>{flag.description}</td>
                                <td>{flag.required ? 'Yes' : 'No'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    <div className="cli-docs-page__command-section">
                      <h4 className="cli-docs-page__command-section-title">Examples</h4>
                      <CodeBlock
                        code={cmd.examples.map(ex => `$ ${ex}`).join('\n')}
                        language="bash"
                      />
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default CliDocsPage
