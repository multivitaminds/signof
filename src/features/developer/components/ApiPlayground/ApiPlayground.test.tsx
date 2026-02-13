import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ApiPlayground from './ApiPlayground'

vi.mock('../CodeBlock/CodeBlock', () => ({
  default: ({ code, language }: { code: string; language: string }) => (
    <pre data-testid="code-block" data-language={language}>{code}</pre>
  ),
}))

describe('ApiPlayground', () => {
  it('renders method selector with GET default', () => {
    render(<ApiPlayground />)
    const select = screen.getByLabelText('HTTP method')
    expect(select).toHaveValue('GET')
  })

  it('renders URL input with default URL', () => {
    render(<ApiPlayground />)
    expect(screen.getByLabelText('Request URL')).toHaveValue('/api/v1/documents')
  })

  it('renders Headers textarea', () => {
    render(<ApiPlayground />)
    expect(screen.getByLabelText('Headers')).toBeInTheDocument()
  })

  it('does not show Body textarea for GET method', () => {
    render(<ApiPlayground />)
    expect(screen.queryByLabelText('Body')).not.toBeInTheDocument()
  })

  it('shows Body textarea for POST method', async () => {
    const user = userEvent.setup()
    render(<ApiPlayground />)
    await user.selectOptions(screen.getByLabelText('HTTP method'), 'POST')
    expect(screen.getByLabelText('Body')).toBeInTheDocument()
  })

  it('does not show Body textarea for DELETE method', async () => {
    const user = userEvent.setup()
    render(<ApiPlayground />)
    await user.selectOptions(screen.getByLabelText('HTTP method'), 'DELETE')
    expect(screen.queryByLabelText('Body')).not.toBeInTheDocument()
  })

  it('renders Send button', () => {
    render(<ApiPlayground />)
    expect(screen.getByText('Send')).toBeInTheDocument()
  })

  it('shows response after clicking Send', async () => {
    const user = userEvent.setup()
    render(<ApiPlayground />)
    await user.click(screen.getByText('Send'))
    await waitFor(() => {
      expect(screen.getByText('Response')).toBeInTheDocument()
    }, { timeout: 2000 })
    expect(screen.getByTestId('code-block')).toBeInTheDocument()
  })

  it('uses initial props', () => {
    render(<ApiPlayground initialMethod="POST" initialUrl="/api/v1/filings" />)
    expect(screen.getByLabelText('HTTP method')).toHaveValue('POST')
    expect(screen.getByLabelText('Request URL')).toHaveValue('/api/v1/filings')
  })

  it('allows changing URL', async () => {
    const user = userEvent.setup()
    render(<ApiPlayground />)
    const urlInput = screen.getByLabelText('Request URL')
    await user.clear(urlInput)
    await user.type(urlInput, '/api/v1/bookings')
    expect(urlInput).toHaveValue('/api/v1/bookings')
  })
})
