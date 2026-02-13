import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import EndpointCard from './EndpointCard'
import type { ApiEndpoint } from '../../types'

vi.mock('../CodeBlock/CodeBlock', () => ({
  default: ({ code, language }: { code: string; language: string }) => (
    <pre data-testid="code-block" data-language={language}>{code}</pre>
  ),
}))

const mockEndpoint: ApiEndpoint = {
  id: 'ep-1',
  method: 'GET',
  path: '/api/v1/documents/:id',
  description: 'Get a single document',
  category: 'Documents',
  parameters: [
    { name: 'id', type: 'string', required: true, description: 'Document ID' },
  ],
  requestBody: null,
  responseBody: '{"id":"doc_123","name":"Test"}',
  curlExample: 'curl -X GET /api/v1/documents/doc_123',
  jsExample: 'fetch("/api/v1/documents/doc_123")',
  pythonExample: 'requests.get("/api/v1/documents/doc_123")',
}

describe('EndpointCard', () => {
  const defaultProps = {
    endpoint: mockEndpoint,
    expanded: false,
    onToggle: vi.fn(),
  }

  beforeEach(() => {
    defaultProps.onToggle.mockClear()
  })

  it('renders method badge', () => {
    render(<EndpointCard {...defaultProps} />)
    expect(screen.getByText('GET')).toBeInTheDocument()
  })

  it('renders endpoint description', () => {
    render(<EndpointCard {...defaultProps} />)
    expect(screen.getByText('Get a single document')).toBeInTheDocument()
  })

  it('highlights path params', () => {
    const { container } = render(<EndpointCard {...defaultProps} />)
    const paramSpan = container.querySelector('.endpoint-card__param')
    expect(paramSpan).toBeInTheDocument()
    expect(paramSpan).toHaveTextContent(':id')
  })

  it('calls onToggle when clicking header', async () => {
    const user = userEvent.setup()
    render(<EndpointCard {...defaultProps} />)
    await user.click(screen.getByRole('button', { name: 'GET /api/v1/documents/:id' }))
    expect(defaultProps.onToggle).toHaveBeenCalled()
  })

  it('sets aria-expanded to false when collapsed', () => {
    render(<EndpointCard {...defaultProps} expanded={false} />)
    expect(screen.getByRole('button', { name: 'GET /api/v1/documents/:id' })).toHaveAttribute('aria-expanded', 'false')
  })

  it('sets aria-expanded to true when expanded', () => {
    render(<EndpointCard {...defaultProps} expanded={true} />)
    expect(screen.getByRole('button', { name: 'GET /api/v1/documents/:id' })).toHaveAttribute('aria-expanded', 'true')
  })

  it('shows parameters table when expanded', () => {
    render(<EndpointCard {...defaultProps} expanded={true} />)
    expect(screen.getByText('Parameters')).toBeInTheDocument()
    expect(screen.getByText('Document ID')).toBeInTheDocument()
    expect(screen.getAllByText('Required').length).toBeGreaterThanOrEqual(1)
  })

  it('shows response code block when expanded', () => {
    render(<EndpointCard {...defaultProps} expanded={true} />)
    expect(screen.getByText('Response')).toBeInTheDocument()
  })

  it('shows code example tabs when expanded', () => {
    render(<EndpointCard {...defaultProps} expanded={true} />)
    expect(screen.getByText('cURL')).toBeInTheDocument()
    expect(screen.getByText('JavaScript')).toBeInTheDocument()
    expect(screen.getByText('Python')).toBeInTheDocument()
  })

  it('switches code tab to JavaScript', async () => {
    const user = userEvent.setup()
    render(<EndpointCard {...defaultProps} expanded={true} />)
    await user.click(screen.getByText('JavaScript'))
    const codeBlocks = screen.getAllByTestId('code-block')
    const jsBlock = codeBlocks.find(b => b.getAttribute('data-language') === 'javascript')
    expect(jsBlock).toBeDefined()
  })

  it('switches code tab to Python', async () => {
    const user = userEvent.setup()
    render(<EndpointCard {...defaultProps} expanded={true} />)
    await user.click(screen.getByText('Python'))
    const codeBlocks = screen.getAllByTestId('code-block')
    const pyBlock = codeBlocks.find(b => b.getAttribute('data-language') === 'python')
    expect(pyBlock).toBeDefined()
  })

  it('does not show details when collapsed', () => {
    render(<EndpointCard {...defaultProps} expanded={false} />)
    expect(screen.queryByText('Parameters')).not.toBeInTheDocument()
    expect(screen.queryByText('Code Examples')).not.toBeInTheDocument()
  })
})
