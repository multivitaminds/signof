import { useState, useCallback, useMemo } from 'react'
import { ChevronDown, ChevronRight, Search } from 'lucide-react'
import type { CliCommand } from '../types'
import { useDebouncedValue } from '../../../hooks/useDebouncedValue'
import CodeBlock from '../components/CodeBlock/CodeBlock'
import './CliDocsPage.css'

// ─── Install Methods ────────────────────────────────────────────────────

const InstallMethod = {
  Npm: 'npm',
  Homebrew: 'homebrew',
  Pip: 'pip',
} as const

type InstallMethod = (typeof InstallMethod)[keyof typeof InstallMethod]

const INSTALL_METHODS: {
  id: InstallMethod
  label: string
  command: string
  note: string
}[] = [
  { id: InstallMethod.Npm, label: 'npm', command: 'npm install -g @signof/cli', note: 'Requires Node.js 18 or later.' },
  { id: InstallMethod.Homebrew, label: 'Homebrew', command: 'brew tap signof-io/tap && brew install signof', note: 'macOS and Linux. Auto-updates with brew upgrade.' },
  { id: InstallMethod.Pip, label: 'pip', command: 'pip install signof-cli', note: 'Requires Python 3.9 or later.' },
]

// ─── Command Categories ─────────────────────────────────────────────────

const CommandCategory = {
  Auth: 'auth',
  Documents: 'documents',
  Filings: 'filings',
  Webhooks: 'webhooks',
  Config: 'config',
  Project: 'project',
  Deploy: 'deploy',
} as const

type CommandCategory = (typeof CommandCategory)[keyof typeof CommandCategory]

const CATEGORY_LABELS: Record<CommandCategory, string> = {
  [CommandCategory.Auth]: 'Authentication',
  [CommandCategory.Documents]: 'Documents',
  [CommandCategory.Filings]: 'Tax Filings',
  [CommandCategory.Webhooks]: 'Webhooks',
  [CommandCategory.Config]: 'Configuration',
  [CommandCategory.Project]: 'Project',
  [CommandCategory.Deploy]: 'Deployment',
}

// ─── CLI Commands ───────────────────────────────────────────────────────

interface CategorizedCommand extends CliCommand {
  category: CommandCategory
}

const CLI_COMMANDS: CategorizedCommand[] = [
  {
    name: 'login',
    category: CommandCategory.Auth,
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
    category: CommandCategory.Auth,
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
    category: CommandCategory.Documents,
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
    category: CommandCategory.Documents,
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
    category: CommandCategory.Documents,
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
    category: CommandCategory.Filings,
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
    category: CommandCategory.Filings,
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
    category: CommandCategory.Webhooks,
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
    category: CommandCategory.Webhooks,
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
    name: 'deploy',
    category: CommandCategory.Deploy,
    description: 'Deploy your SignOf project to production. Pushes configuration, templates, and webhook endpoints to the live environment.',
    usage: 'signof deploy [flags]',
    flags: [
      { name: '--env', alias: '-e', description: 'Target environment: live, staging (default: live)', required: false },
      { name: '--dry-run', alias: null, description: 'Preview changes without deploying', required: false },
      { name: '--force', alias: '-f', description: 'Deploy without confirmation prompt', required: false },
      { name: '--message', alias: '-m', description: 'Deployment note for audit log', required: false },
      { name: '--rollback', alias: null, description: 'Roll back to the previous deployment', required: false },
    ],
    examples: [
      'signof deploy',
      'signof deploy --env staging --dry-run',
      'signof deploy --force --message "Release v2.1.0"',
      'signof deploy --rollback',
    ],
  },
  {
    name: 'deploy status',
    category: CommandCategory.Deploy,
    description: 'Show the current deployment status and recent deployment history.',
    usage: 'signof deploy status [flags]',
    flags: [
      { name: '--env', alias: '-e', description: 'Environment to check (default: live)', required: false },
      { name: '--format', alias: '-f', description: 'Output format: table, json (default: table)', required: false },
    ],
    examples: [
      'signof deploy status',
      'signof deploy status --env staging --format json',
    ],
  },
  {
    name: 'config set',
    category: CommandCategory.Config,
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
    category: CommandCategory.Config,
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
    category: CommandCategory.Project,
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
  const [searchQuery, setSearchQuery] = useState('')
  const [installMethod, setInstallMethod] = useState<InstallMethod>(InstallMethod.Npm)

  const handleToggle = useCallback((name: string) => {
    setExpandedCmd(prev => prev === name ? null : name)
  }, [])

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }, [])

  const handleInstallMethodChange = useCallback((method: InstallMethod) => {
    setInstallMethod(method)
  }, [])

  const activeInstall = useMemo(() => {
    const found = INSTALL_METHODS.find(m => m.id === installMethod)
    return found ?? INSTALL_METHODS[0]!
  }, [installMethod])

  const debouncedSearch = useDebouncedValue(searchQuery, 200)

  const filteredCommands = useMemo(() => {
    if (!debouncedSearch.trim()) return CLI_COMMANDS
    const q = debouncedSearch.toLowerCase().trim()
    return CLI_COMMANDS.filter(cmd =>
      cmd.name.toLowerCase().includes(q) ||
      cmd.description.toLowerCase().includes(q) ||
      cmd.usage.toLowerCase().includes(q) ||
      cmd.flags.some(f =>
        f.name.toLowerCase().includes(q) ||
        f.description.toLowerCase().includes(q)
      ) ||
      cmd.examples.some(ex => ex.toLowerCase().includes(q))
    )
  }, [debouncedSearch])

  // Group filtered commands by category
  const groupedCommands = useMemo(() => {
    const groups: { category: CommandCategory; label: string; commands: CategorizedCommand[] }[] = []
    const seen = new Set<CommandCategory>()

    for (const cmd of filteredCommands) {
      if (!seen.has(cmd.category)) {
        seen.add(cmd.category)
        groups.push({
          category: cmd.category,
          label: CATEGORY_LABELS[cmd.category],
          commands: filteredCommands.filter(c => c.category === cmd.category),
        })
      }
    }

    return groups
  }, [filteredCommands])

  const commandCount = filteredCommands.length
  const totalCount = CLI_COMMANDS.length

  return (
    <div className="cli-docs-page">
      <div className="cli-docs-page__header">
        <h1 className="cli-docs-page__title">CLI Reference</h1>
        <p className="cli-docs-page__subtitle">
          The SignOf CLI lets you manage documents, filings, webhooks, deployments, and more from your terminal.
        </p>
      </div>

      {/* Installation with method tabs */}
      <div className="cli-docs-page__install">
        <h2 className="cli-docs-page__section-title">Installation</h2>
        <div className="cli-docs-page__install-tabs">
          {INSTALL_METHODS.map(method => (
            <button
              key={method.id}
              className={`cli-docs-page__install-tab ${installMethod === method.id ? 'cli-docs-page__install-tab--active' : ''}`}
              onClick={() => handleInstallMethodChange(method.id)}
              type="button"
            >
              {method.label}
            </button>
          ))}
        </div>
        <CodeBlock code={activeInstall.command} language="bash" />
        <p className="cli-docs-page__install-note">
          {activeInstall.note} After installing, run <code>signof login</code> to authenticate.
        </p>
      </div>

      {/* Verify */}
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
  deploy         Deploy to production
  config         CLI configuration
  init           Initialize a project`}
          language="bash"
        />
      </div>

      {/* Commands with search */}
      <div className="cli-docs-page__commands">
        <div className="cli-docs-page__commands-header">
          <h2 className="cli-docs-page__section-title">Commands</h2>
          <span className="cli-docs-page__command-count">
            {commandCount === totalCount
              ? `${totalCount} commands`
              : `${commandCount} of ${totalCount} commands`
            }
          </span>
        </div>

        <div className="cli-docs-page__search">
          <Search size={16} className="cli-docs-page__search-icon" />
          <input
            type="text"
            className="cli-docs-page__search-input"
            placeholder="Search commands, flags, descriptions..."
            value={searchQuery}
            onChange={handleSearchChange}
            aria-label="Search CLI commands"
          />
          {searchQuery && (
            <button
              className="cli-docs-page__search-clear"
              onClick={() => setSearchQuery('')}
              type="button"
              aria-label="Clear search"
            >
              Clear
            </button>
          )}
        </div>

        {groupedCommands.length === 0 ? (
          <div className="cli-docs-page__no-results">
            <p>No commands match &ldquo;{searchQuery}&rdquo;</p>
            <button
              className="cli-docs-page__no-results-clear"
              onClick={() => setSearchQuery('')}
              type="button"
            >
              Clear search
            </button>
          </div>
        ) : (
          <div className="cli-docs-page__command-groups">
            {groupedCommands.map(group => (
              <div key={group.category} className="cli-docs-page__command-group">
                <h3 className="cli-docs-page__group-title">{group.label}</h3>
                <div className="cli-docs-page__command-list">
                  {group.commands.map(cmd => {
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
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default CliDocsPage
