import { useState, useCallback, useMemo } from 'react'
import { ExternalLink, Copy, Check, Shield, Key, Globe } from 'lucide-react'
import type { SdkLanguage } from '../types'
import CodeBlock from '../components/CodeBlock/CodeBlock'
import './SdkPage.css'

// ─── Auth Environments ──────────────────────────────────────────────────

const AuthEnv = {
  Live: 'live',
  Test: 'test',
} as const

type AuthEnv = (typeof AuthEnv)[keyof typeof AuthEnv]

// ─── SDK Languages ──────────────────────────────────────────────────────

const SDK_LANGUAGES: SdkLanguage[] = [
  {
    id: 'javascript',
    name: 'JavaScript / TypeScript',
    version: '1.4.0',
    icon: 'JS',
    installCommand: 'npm install @origina/node',
    repoUrl: 'https://github.com/origina-io/origina-node',
    packageUrl: 'https://npmjs.com/package/@origina/node',
    initCode: `import OriginA from '@origina/node';

const origina = new OriginA('sk_live_...');

// Or with options
const origina = new OriginA({
  apiKey: 'sk_live_...',
  baseUrl: 'https://api.origina.io', // optional
  timeout: 30000,                    // optional, ms
});`,
    exampleCode: `// Create and send a document
const doc = await origina.documents.create({
  name: 'Sales Contract',
  file_url: 'https://files.example.com/contract.pdf',
  signers: [
    { name: 'Alice Lee', email: 'alice@company.com', order: 1 },
    { name: 'Bob Chen', email: 'bob@client.com', order: 2 },
  ],
});

// Send for signing
await origina.documents.send(doc.id, {
  subject: 'Contract Ready for Review',
  message: 'Please review and sign at your earliest convenience.',
});

// List all completed documents
const completed = await origina.documents.list({
  status: 'completed',
  limit: 50,
});

// Set up webhooks
const webhook = await origina.webhooks.create({
  url: 'https://api.yourapp.com/webhooks',
  events: ['document.completed', 'signer.declined'],
});`,
  },
  {
    id: 'python',
    name: 'Python',
    version: '1.2.0',
    icon: 'PY',
    installCommand: 'pip install origina',
    repoUrl: 'https://github.com/origina-io/origina-python',
    packageUrl: 'https://pypi.org/project/origina/',
    initCode: `import origina

client = origina.Client("sk_live_...")

# Or with options
client = origina.Client(
    api_key="sk_live_...",
    base_url="https://api.origina.io",  # optional
    timeout=30,                          # optional, seconds
)`,
    exampleCode: `# Create and send a document
doc = client.documents.create(
    name="Sales Contract",
    file_url="https://files.example.com/contract.pdf",
    signers=[
        {"name": "Alice Lee", "email": "alice@company.com", "order": 1},
        {"name": "Bob Chen", "email": "bob@client.com", "order": 2},
    ],
)

# Send for signing
client.documents.send(
    doc.id,
    subject="Contract Ready for Review",
    message="Please review and sign at your earliest convenience.",
)

# List all completed documents
completed = client.documents.list(
    status="completed",
    limit=50,
)

# Set up webhooks
webhook = client.webhooks.create(
    url="https://api.yourapp.com/webhooks",
    events=["document.completed", "signer.declined"],
)`,
  },
  {
    id: 'ruby',
    name: 'Ruby',
    version: '1.1.0',
    icon: 'RB',
    installCommand: 'gem install origina',
    repoUrl: 'https://github.com/origina-io/origina-ruby',
    packageUrl: 'https://rubygems.org/gems/origina',
    initCode: `require 'origina'

OriginA.api_key = 'sk_live_...'

# Or with a client instance
client = OriginA::Client.new(
  api_key: 'sk_live_...',
  base_url: 'https://api.origina.io', # optional
  timeout: 30                         # optional, seconds
)`,
    exampleCode: `# Create and send a document
doc = OriginA::Document.create(
  name: 'Sales Contract',
  file_url: 'https://files.example.com/contract.pdf',
  signers: [
    { name: 'Alice Lee', email: 'alice@company.com', order: 1 },
    { name: 'Bob Chen', email: 'bob@client.com', order: 2 }
  ]
)

# Send for signing
doc.send(
  subject: 'Contract Ready for Review',
  message: 'Please review and sign at your earliest convenience.'
)

# List all completed documents
completed = OriginA::Document.list(
  status: 'completed',
  limit: 50
)

# Set up webhooks
webhook = OriginA::Webhook.create(
  url: 'https://api.yourapp.com/webhooks',
  events: ['document.completed', 'signer.declined']
)`,
  },
  {
    id: 'go',
    name: 'Go',
    version: '1.0.0',
    icon: 'GO',
    installCommand: 'go get github.com/origina-io/origina-go',
    repoUrl: 'https://github.com/origina-io/origina-go',
    packageUrl: 'https://pkg.go.dev/github.com/origina-io/origina-go',
    initCode: `package main

import (
    "github.com/origina-io/origina-go"
)

func main() {
    client := origina.NewClient("sk_live_...")

    // Or with options
    client := origina.NewClient(
        "sk_live_...",
        origina.WithBaseURL("https://api.origina.io"),
        origina.WithTimeout(30 * time.Second),
    )
}`,
    exampleCode: `// Create and send a document
doc, err := client.Documents.Create(&origina.DocumentCreateParams{
    Name:    "Sales Contract",
    FileURL: "https://files.example.com/contract.pdf",
    Signers: []origina.SignerParams{
        {Name: "Alice Lee", Email: "alice@company.com", Order: 1},
        {Name: "Bob Chen", Email: "bob@client.com", Order: 2},
    },
})
if err != nil {
    log.Fatal(err)
}

// Send for signing
_, err = client.Documents.Send(doc.ID, &origina.DocumentSendParams{
    Subject: "Contract Ready for Review",
    Message: "Please review and sign at your earliest convenience.",
})

// List all completed documents
completed, err := client.Documents.List(&origina.DocumentListParams{
    Status: origina.String("completed"),
    Limit:  origina.Int64(50),
})

// Set up webhooks
webhook, err := client.Webhooks.Create(&origina.WebhookCreateParams{
    URL:    "https://api.yourapp.com/webhooks",
    Events: []string{"document.completed", "signer.declined"},
})`,
  },
  {
    id: 'java',
    name: 'Java',
    version: '1.0.0',
    icon: 'JV',
    installCommand: `<!-- Maven -->
<dependency>
  <groupId>io.origina</groupId>
  <artifactId>origina-java</artifactId>
  <version>1.0.0</version>
</dependency>

// Gradle
implementation 'io.origina:origina-java:1.0.0'`,
    repoUrl: 'https://github.com/origina-io/origina-java',
    packageUrl: 'https://central.sonatype.com/artifact/io.origina/origina-java',
    initCode: `import io.origina.OriginA;
import io.origina.OriginAConfig;

// Simple initialization
OriginA origina = new OriginA("sk_live_...");

// Or with options
OriginAConfig config = OriginAConfig.builder()
    .apiKey("sk_live_...")
    .baseUrl("https://api.origina.io")  // optional
    .timeout(30000)                     // optional, ms
    .build();

OriginA origina = new OriginA(config);`,
    exampleCode: `// Create and send a document
Document doc = origina.documents().create(
    DocumentCreateParams.builder()
        .name("Sales Contract")
        .fileUrl("https://files.example.com/contract.pdf")
        .addSigner(new Signer("Alice Lee", "alice@company.com", 1))
        .addSigner(new Signer("Bob Chen", "bob@client.com", 2))
        .build()
);

// Send for signing
origina.documents().send(doc.getId(),
    DocumentSendParams.builder()
        .subject("Contract Ready for Review")
        .message("Please review and sign at your earliest convenience.")
        .build()
);

// List all completed documents
DocumentList completed = origina.documents().list(
    DocumentListParams.builder()
        .status("completed")
        .limit(50)
        .build()
);

// Set up webhooks
Webhook webhook = origina.webhooks().create(
    WebhookCreateParams.builder()
        .url("https://api.yourapp.com/webhooks")
        .addEvent("document.completed")
        .addEvent("signer.declined")
        .build()
);`,
  },
]

// ─── Getting Started Steps ──────────────────────────────────────────────

interface GettingStartedStep {
  number: number
  title: string
  description: string
}

const GETTING_STARTED_STEPS: GettingStartedStep[] = [
  {
    number: 1,
    title: 'Create an account',
    description: 'Sign up at origina.io and navigate to Settings > API Keys.',
  },
  {
    number: 2,
    title: 'Generate an API key',
    description: 'Create a key for your environment. Use sk_test_ keys for development and sk_live_ keys for production.',
  },
  {
    number: 3,
    title: 'Install an SDK',
    description: 'Pick your language above and install the package with your preferred package manager.',
  },
  {
    number: 4,
    title: 'Make your first API call',
    description: 'Initialize the client with your API key and start creating documents.',
  },
]

function SdkPage() {
  const [activeLanguage, setActiveLanguage] = useState('javascript')
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [authEnv, setAuthEnv] = useState<AuthEnv>(AuthEnv.Test)

  const handleLanguageChange = useCallback((id: string) => {
    setActiveLanguage(id)
  }, [])

  const handleCopy = useCallback((text: string, key: string) => {
    navigator.clipboard.writeText(text).catch(() => {
      // Fallback: do nothing
    })
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2000)
  }, [])

  const handleAuthEnvChange = useCallback((env: AuthEnv) => {
    setAuthEnv(env)
  }, [])

  const activeSdk = SDK_LANGUAGES.find(l => l.id === activeLanguage) ?? SDK_LANGUAGES[0]

  const authSetupCode = useMemo(() => {
    const prefix = authEnv === AuthEnv.Live ? 'sk_live' : 'sk_test'
    const envLabel = authEnv === AuthEnv.Live ? 'production' : 'test'

    switch (activeLanguage) {
      case 'javascript':
        return `// Store your API key in an environment variable
// .env
ORIGINA_API_KEY=${prefix}_your_api_key_here

// app.js
import OriginA from '@origina/node';

const origina = new OriginA(process.env.ORIGINA_API_KEY);

// Verify authentication
const me = await origina.account.retrieve();
console.log('Authenticated as:', me.email);
console.log('Environment: ${envLabel}');`
      case 'python':
        return `# Store your API key in an environment variable
# .env
ORIGINA_API_KEY=${prefix}_your_api_key_here

# app.py
import os
import origina

client = origina.Client(os.environ["ORIGINA_API_KEY"])

# Verify authentication
me = client.account.retrieve()
print(f"Authenticated as: {me.email}")
print(f"Environment: ${envLabel}")`
      case 'ruby':
        return `# Store your API key in an environment variable
# .env
ORIGINA_API_KEY=${prefix}_your_api_key_here

# app.rb
require 'origina'

OriginA.api_key = ENV['ORIGINA_API_KEY']

# Verify authentication
me = OriginA::Account.retrieve
puts "Authenticated as: #{me.email}"
puts "Environment: ${envLabel}"`
      case 'go':
        return `// Store your API key in an environment variable
// export ORIGINA_API_KEY=${prefix}_your_api_key_here

package main

import (
    "fmt"
    "os"
    "github.com/origina-io/origina-go"
)

func main() {
    client := origina.NewClient(os.Getenv("ORIGINA_API_KEY"))

    // Verify authentication
    me, err := client.Account.Retrieve()
    if err != nil {
        log.Fatal(err)
    }
    fmt.Printf("Authenticated as: %s\\n", me.Email)
    fmt.Printf("Environment: ${envLabel}\\n")
}`
      case 'java':
        return `// Store your API key in an environment variable
// export ORIGINA_API_KEY=${prefix}_your_api_key_here

import io.origina.OriginA;
import io.origina.model.Account;

public class App {
    public static void main(String[] args) {
        OriginA origina = new OriginA(System.getenv("ORIGINA_API_KEY"));

        // Verify authentication
        Account me = origina.account().retrieve();
        System.out.println("Authenticated as: " + me.getEmail());
        System.out.println("Environment: ${envLabel}");
    }
}`
      default:
        return ''
    }
  }, [activeLanguage, authEnv])

  return (
    <div className="sdk-page">
      <div className="sdk-page__header">
        <h1 className="sdk-page__title">SDKs</h1>
        <p className="sdk-page__subtitle">
          Official client libraries for the OriginA API. Each SDK provides typed methods,
          automatic retries, and webhook signature verification.
        </p>
      </div>

      {/* SDK Cards */}
      <div className="sdk-page__cards">
        {SDK_LANGUAGES.map(sdk => (
          <button
            key={sdk.id}
            className={`sdk-page__card ${activeLanguage === sdk.id ? 'sdk-page__card--active' : ''}`}
            onClick={() => handleLanguageChange(sdk.id)}
            type="button"
          >
            <span className="sdk-page__card-icon">{sdk.icon}</span>
            <div className="sdk-page__card-info">
              <span className="sdk-page__card-name">{sdk.name}</span>
              <span className="sdk-page__card-version">v{sdk.version}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Getting Started Guide */}
      <div className="sdk-page__getting-started">
        <h2 className="sdk-page__section-title">Getting Started</h2>
        <div className="sdk-page__steps">
          {GETTING_STARTED_STEPS.map(step => (
            <div key={step.number} className="sdk-page__step">
              <div className="sdk-page__step-number">{step.number}</div>
              <div className="sdk-page__step-content">
                <h4 className="sdk-page__step-title">{step.title}</h4>
                <p className="sdk-page__step-desc">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Authentication Setup */}
      <div className="sdk-page__auth">
        <h2 className="sdk-page__section-title">
          <Shield size={20} />
          Authentication
        </h2>
        <p className="sdk-page__auth-desc">
          All API requests require a valid API key passed via the SDK client. Keys are scoped to environments
          and can be rotated at any time from your dashboard.
        </p>

        <div className="sdk-page__auth-keys">
          <div className="sdk-page__auth-key">
            <div className="sdk-page__auth-key-header">
              <Key size={14} />
              <span className="sdk-page__auth-key-label">Test Key</span>
            </div>
            <div className="sdk-page__auth-key-value">
              <code>sk_test_xxxxxxxxxxxxxxxxxxxxxxxx</code>
              <button
                className="sdk-page__copy-btn"
                onClick={() => handleCopy('sk_test_xxxxxxxxxxxxxxxxxxxxxxxx', 'test-key')}
                type="button"
                aria-label="Copy test key"
              >
                {copiedKey === 'test-key' ? <Check size={14} /> : <Copy size={14} />}
              </button>
            </div>
            <span className="sdk-page__auth-key-note">Safe for development. No real data affected.</span>
          </div>
          <div className="sdk-page__auth-key">
            <div className="sdk-page__auth-key-header">
              <Globe size={14} />
              <span className="sdk-page__auth-key-label">Live Key</span>
            </div>
            <div className="sdk-page__auth-key-value">
              <code>sk_live_xxxxxxxxxxxxxxxxxxxxxxxx</code>
              <button
                className="sdk-page__copy-btn"
                onClick={() => handleCopy('sk_live_xxxxxxxxxxxxxxxxxxxxxxxx', 'live-key')}
                type="button"
                aria-label="Copy live key"
              >
                {copiedKey === 'live-key' ? <Check size={14} /> : <Copy size={14} />}
              </button>
            </div>
            <span className="sdk-page__auth-key-note">Production use. Handle with care.</span>
          </div>
        </div>

        <div className="sdk-page__auth-env-tabs">
          <button
            className={`sdk-page__auth-env-tab ${authEnv === AuthEnv.Test ? 'sdk-page__auth-env-tab--active' : ''}`}
            onClick={() => handleAuthEnvChange(AuthEnv.Test)}
            type="button"
          >
            Test Environment
          </button>
          <button
            className={`sdk-page__auth-env-tab ${authEnv === AuthEnv.Live ? 'sdk-page__auth-env-tab--active' : ''}`}
            onClick={() => handleAuthEnvChange(AuthEnv.Live)}
            type="button"
          >
            Live Environment
          </button>
        </div>

        <CodeBlock
          code={authSetupCode}
          language={activeLanguage === 'go' ? 'go' : activeLanguage === 'ruby' ? 'ruby' : activeLanguage === 'java' ? 'java' : activeLanguage}
          showLineNumbers
        />

        <div className="sdk-page__auth-tips">
          <h4 className="sdk-page__auth-tips-title">Security Best Practices</h4>
          <ul className="sdk-page__auth-tips-list">
            <li>Never hard-code API keys in source code. Use environment variables.</li>
            <li>Use <code>sk_test_</code> keys during development, <code>sk_live_</code> for production.</li>
            <li>Rotate keys periodically from Settings &gt; API Keys.</li>
            <li>Use webhook signature verification to validate incoming events.</li>
            <li>Set up IP allowlists for production keys in your dashboard.</li>
          </ul>
        </div>
      </div>

      {/* SDK Details */}
      {activeSdk && (
        <div className="sdk-page__details">
          <div className="sdk-page__section">
            <h2 className="sdk-page__section-title">Installation</h2>
            <CodeBlock code={activeSdk.installCommand} language={activeLanguage === 'java' ? 'xml' : 'bash'} />
          </div>

          <div className="sdk-page__links">
            <a
              className="sdk-page__link"
              href={activeSdk.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink size={14} />
              GitHub Repository
            </a>
            <a
              className="sdk-page__link"
              href={activeSdk.packageUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink size={14} />
              Package Registry
            </a>
          </div>

          <div className="sdk-page__section">
            <h2 className="sdk-page__section-title">Initialization</h2>
            <CodeBlock
              code={activeSdk.initCode}
              language={activeLanguage === 'go' ? 'go' : activeLanguage === 'ruby' ? 'ruby' : activeLanguage === 'java' ? 'java' : activeLanguage}
              showLineNumbers
            />
          </div>

          <div className="sdk-page__section">
            <h2 className="sdk-page__section-title">Usage Example</h2>
            <CodeBlock
              code={activeSdk.exampleCode}
              language={activeLanguage === 'go' ? 'go' : activeLanguage === 'ruby' ? 'ruby' : activeLanguage === 'java' ? 'java' : activeLanguage}
              showLineNumbers
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default SdkPage
