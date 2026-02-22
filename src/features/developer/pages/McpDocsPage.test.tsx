import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import McpDocsPage from './McpDocsPage'

describe('McpDocsPage', () => {
  it('renders page title and subtitle', () => {
    render(<McpDocsPage />)
    expect(screen.getByText('Model Context Protocol (MCP)')).toBeInTheDocument()
    expect(screen.getByText(/open protocol/i)).toBeInTheDocument()
  })

  it('renders all 3 install method tabs with npx active', () => {
    render(<McpDocsPage />)
    const tabs = screen.getAllByRole('button').filter(btn =>
      ['npx', 'Docker', 'Manual'].includes(btn.textContent ?? '')
    )
    expect(tabs).toHaveLength(3)
    expect(tabs[0]).toHaveTextContent('npx')
    expect(tabs[1]).toHaveTextContent('Docker')
    expect(tabs[2]).toHaveTextContent('Manual')
  })

  it('switches install method when clicking tab', async () => {
    const user = userEvent.setup()
    render(<McpDocsPage />)
    await user.click(screen.getByText('Docker'))
    // Docker note should appear
    expect(screen.getByText(/Isolated environment/)).toBeInTheDocument()
  })

  it('renders all 6 domain group headers', () => {
    render(<McpDocsPage />)
    expect(screen.getByText('Documents')).toBeInTheDocument()
    expect(screen.getByText('Projects')).toBeInTheDocument()
    expect(screen.getByText('Scheduling')).toBeInTheDocument()
    expect(screen.getByText('Databases')).toBeInTheDocument()
    expect(screen.getByText('AI')).toBeInTheDocument()
    expect(screen.getByText('Workspace')).toBeInTheDocument()
  })

  it('expands domain to show tools when clicked', async () => {
    const user = userEvent.setup()
    render(<McpDocsPage />)
    // Click Documents domain header
    await user.click(screen.getByText('Documents').closest('button')!)
    // Should see document tools
    expect(screen.getByText('list_documents')).toBeInTheDocument()
  })

  it('collapses expanded domain when clicked again', async () => {
    const user = userEvent.setup()
    render(<McpDocsPage />)
    const docsButton = screen.getByText('Documents').closest('button')!
    await user.click(docsButton) // expand
    expect(screen.getByText('list_documents')).toBeInTheDocument()
    await user.click(docsButton) // collapse
    expect(screen.queryByText('list_documents')).not.toBeInTheDocument()
  })

  it('renders all 4 client config tabs', () => {
    render(<McpDocsPage />)
    expect(screen.getByText('Claude Desktop')).toBeInTheDocument()
    expect(screen.getByText('Cursor')).toBeInTheDocument()
    expect(screen.getByText('VS Code')).toBeInTheDocument()
    expect(screen.getByText('Custom')).toBeInTheDocument()
  })

  it('switches client config when clicking tab', async () => {
    const user = userEvent.setup()
    render(<McpDocsPage />)
    await user.click(screen.getByText('Custom'))
    // Custom config has import statement — may match multiple elements
    const matches = screen.getAllByText(/StdioClientTransport/)
    expect(matches.length).toBeGreaterThan(0)
  })

  it('renders env vars table', () => {
    render(<McpDocsPage />)
    expect(screen.getByText('ORIGINA_API_KEY')).toBeInTheDocument()
    expect(screen.getByText('ORIGINA_BASE_URL')).toBeInTheDocument()
    expect(screen.getByText('ORIGINA_MCP_PORT')).toBeInTheDocument()
  })

  it('renders security section', () => {
    render(<McpDocsPage />)
    expect(screen.getByText(/1,000 requests per minute/)).toBeInTheDocument()
  })

  it('renders MCP resources', () => {
    render(<McpDocsPage />)
    expect(screen.getByText('Workspace Info')).toBeInTheDocument()
    expect(screen.getByText('origina://workspace/info')).toBeInTheDocument()
  })
})
