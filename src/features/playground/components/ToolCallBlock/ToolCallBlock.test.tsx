import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ToolCallBlock from './ToolCallBlock'
import type { ToolCall } from '../../types'

vi.mock('../../../../features/developer/components/CodeBlock/CodeBlock', () => ({
  default: ({ code }: { code: string }) => <pre data-testid="code-block">{code}</pre>,
}))

function createToolCall(overrides: Partial<ToolCall> = {}): ToolCall {
  return {
    id: 'tc-1',
    name: 'web_search',
    input: '{"query": "test"}',
    output: '{"results": []}',
    status: 'completed',
    durationMs: 350,
    ...overrides,
  }
}

describe('ToolCallBlock', () => {
  it('renders tool name', () => {
    render(<ToolCallBlock toolCall={createToolCall()} />)
    expect(screen.getByText('web_search')).toBeInTheDocument()
  })

  it('toggles expanded on click', async () => {
    const user = userEvent.setup()
    render(<ToolCallBlock toolCall={createToolCall()} />)

    expect(screen.queryByText('Input')).not.toBeInTheDocument()
    await user.click(screen.getByText('web_search'))
    expect(screen.getByText('Input')).toBeInTheDocument()
    expect(screen.getByText('Output')).toBeInTheDocument()
  })

  it('shows duration', () => {
    render(<ToolCallBlock toolCall={createToolCall({ durationMs: 500 })} />)
    expect(screen.getByText('500ms')).toBeInTheDocument()
  })
})
