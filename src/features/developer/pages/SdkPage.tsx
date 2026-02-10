import { useState, useCallback } from 'react'
import { ExternalLink } from 'lucide-react'
import type { SdkLanguage } from '../types'
import CodeBlock from '../components/CodeBlock/CodeBlock'
import './SdkPage.css'

const SDK_LANGUAGES: SdkLanguage[] = [
  {
    id: 'javascript',
    name: 'JavaScript / TypeScript',
    version: '1.4.0',
    icon: 'JS',
    installCommand: 'npm install @signof/node',
    repoUrl: 'https://github.com/signof-io/signof-node',
    packageUrl: 'https://npmjs.com/package/@signof/node',
    initCode: `import SignOf from '@signof/node';

const signof = new SignOf('sk_live_...');

// Or with options
const signof = new SignOf({
  apiKey: 'sk_live_...',
  baseUrl: 'https://api.signof.io', // optional
  timeout: 30000,                    // optional, ms
});`,
    exampleCode: `// Create and send a document
const doc = await signof.documents.create({
  name: 'Sales Contract',
  file_url: 'https://files.example.com/contract.pdf',
  signers: [
    { name: 'Alice Lee', email: 'alice@company.com', order: 1 },
    { name: 'Bob Chen', email: 'bob@client.com', order: 2 },
  ],
});

// Send for signing
await signof.documents.send(doc.id, {
  subject: 'Contract Ready for Review',
  message: 'Please review and sign at your earliest convenience.',
});

// List all completed documents
const completed = await signof.documents.list({
  status: 'completed',
  limit: 50,
});

// Set up webhooks
const webhook = await signof.webhooks.create({
  url: 'https://api.yourapp.com/webhooks',
  events: ['document.completed', 'signer.declined'],
});`,
  },
  {
    id: 'python',
    name: 'Python',
    version: '1.2.0',
    icon: 'PY',
    installCommand: 'pip install signof',
    repoUrl: 'https://github.com/signof-io/signof-python',
    packageUrl: 'https://pypi.org/project/signof/',
    initCode: `import signof

client = signof.Client("sk_live_...")

# Or with options
client = signof.Client(
    api_key="sk_live_...",
    base_url="https://api.signof.io",  # optional
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
    installCommand: 'gem install signof',
    repoUrl: 'https://github.com/signof-io/signof-ruby',
    packageUrl: 'https://rubygems.org/gems/signof',
    initCode: `require 'signof'

Signof.api_key = 'sk_live_...'

# Or with a client instance
client = Signof::Client.new(
  api_key: 'sk_live_...',
  base_url: 'https://api.signof.io', # optional
  timeout: 30                         # optional, seconds
)`,
    exampleCode: `# Create and send a document
doc = Signof::Document.create(
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
completed = Signof::Document.list(
  status: 'completed',
  limit: 50
)

# Set up webhooks
webhook = Signof::Webhook.create(
  url: 'https://api.yourapp.com/webhooks',
  events: ['document.completed', 'signer.declined']
)`,
  },
  {
    id: 'go',
    name: 'Go',
    version: '1.0.0',
    icon: 'GO',
    installCommand: 'go get github.com/signof-io/signof-go',
    repoUrl: 'https://github.com/signof-io/signof-go',
    packageUrl: 'https://pkg.go.dev/github.com/signof-io/signof-go',
    initCode: `package main

import (
    "github.com/signof-io/signof-go"
)

func main() {
    client := signof.NewClient("sk_live_...")

    // Or with options
    client := signof.NewClient(
        "sk_live_...",
        signof.WithBaseURL("https://api.signof.io"),
        signof.WithTimeout(30 * time.Second),
    )
}`,
    exampleCode: `// Create and send a document
doc, err := client.Documents.Create(&signof.DocumentCreateParams{
    Name:    "Sales Contract",
    FileURL: "https://files.example.com/contract.pdf",
    Signers: []signof.SignerParams{
        {Name: "Alice Lee", Email: "alice@company.com", Order: 1},
        {Name: "Bob Chen", Email: "bob@client.com", Order: 2},
    },
})
if err != nil {
    log.Fatal(err)
}

// Send for signing
_, err = client.Documents.Send(doc.ID, &signof.DocumentSendParams{
    Subject: "Contract Ready for Review",
    Message: "Please review and sign at your earliest convenience.",
})

// List all completed documents
completed, err := client.Documents.List(&signof.DocumentListParams{
    Status: signof.String("completed"),
    Limit:  signof.Int64(50),
})

// Set up webhooks
webhook, err := client.Webhooks.Create(&signof.WebhookCreateParams{
    URL:    "https://api.yourapp.com/webhooks",
    Events: []string{"document.completed", "signer.declined"},
})`,
  },
]

function SdkPage() {
  const [activeLanguage, setActiveLanguage] = useState('javascript')

  const handleLanguageChange = useCallback((id: string) => {
    setActiveLanguage(id)
  }, [])

  const activeSdk = SDK_LANGUAGES.find(l => l.id === activeLanguage) ?? SDK_LANGUAGES[0]

  return (
    <div className="sdk-page">
      <div className="sdk-page__header">
        <h1 className="sdk-page__title">SDKs</h1>
        <p className="sdk-page__subtitle">
          Official client libraries for the SignOf API. Each SDK provides typed methods,
          automatic retries, and webhook signature verification.
        </p>
      </div>

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

      {activeSdk && (
        <div className="sdk-page__details">
          <div className="sdk-page__section">
            <h2 className="sdk-page__section-title">Installation</h2>
            <CodeBlock code={activeSdk.installCommand} language="bash" />
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
              language={activeSdk.id === 'go' ? 'go' : activeSdk.id === 'ruby' ? 'ruby' : activeSdk.id}
              showLineNumbers
            />
          </div>

          <div className="sdk-page__section">
            <h2 className="sdk-page__section-title">Usage Example</h2>
            <CodeBlock
              code={activeSdk.exampleCode}
              language={activeSdk.id === 'go' ? 'go' : activeSdk.id === 'ruby' ? 'ruby' : activeSdk.id}
              showLineNumbers
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default SdkPage
