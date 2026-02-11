import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SandboxPage from './SandboxPage'

vi.mock('../stores/useSandboxStore', () => ({
  useSandboxStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({
      history: [],
      activeCodeLang: 'curl',
      addHistoryEntry: vi.fn(),
      clearHistory: vi.fn(),
      removeHistoryEntry: vi.fn(),
      setActiveCodeLang: vi.fn(),
    }),
  CodeExampleLang: {
    Curl: 'curl',
    JavaScript: 'javascript',
    Python: 'python',
  },
  generateCodeExample: () => 'curl -X GET "https://api.signof.io/api/v1/documents"',
}))

vi.mock('../components/CodeBlock/CodeBlock', () => ({
  default: ({ code }: { code: string }) => <pre data-testid="code-block">{code}</pre>,
}))

describe('SandboxPage', () => {
  it('renders the API Sandbox title', () => {
    render(<SandboxPage />)
    expect(screen.getByText('API Sandbox')).toBeInTheDocument()
  })

  it('renders the subtitle description', () => {
    render(<SandboxPage />)
    expect(
      screen.getByText(/Test API requests interactively/)
    ).toBeInTheDocument()
  })

  it('renders tabs for Playground, History, and Code Examples', () => {
    render(<SandboxPage />)
    expect(screen.getByRole('tab', { name: 'Playground' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /History/ })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Code Examples' })).toBeInTheDocument()
  })

  it('shows Playground tab by default', () => {
    render(<SandboxPage />)
    expect(screen.getByLabelText('HTTP method')).toBeInTheDocument()
    expect(screen.getByLabelText('Request URL')).toBeInTheDocument()
  })

  it('renders Send button', () => {
    render(<SandboxPage />)
    expect(screen.getByText('Send')).toBeInTheDocument()
  })

  it('renders the pre-built examples select', () => {
    render(<SandboxPage />)
    expect(screen.getByLabelText('Pre-built Examples')).toBeInTheDocument()
  })

  it('renders Headers textarea', () => {
    render(<SandboxPage />)
    expect(screen.getByLabelText('Headers')).toBeInTheDocument()
  })

  it('switches to History tab', async () => {
    const user = userEvent.setup()
    render(<SandboxPage />)
    await user.click(screen.getByRole('tab', { name: /History/ }))
    expect(screen.getByText(/No request history yet/)).toBeInTheDocument()
  })

  it('switches to Code Examples tab', async () => {
    const user = userEvent.setup()
    render(<SandboxPage />)
    await user.click(screen.getByRole('tab', { name: 'Code Examples' }))
    expect(screen.getByText(/Code examples for the current request/)).toBeInTheDocument()
  })

  it('renders About the Sandbox section', () => {
    render(<SandboxPage />)
    expect(screen.getByText('About the Sandbox')).toBeInTheDocument()
  })
})
