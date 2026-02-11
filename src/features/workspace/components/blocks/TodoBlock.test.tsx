import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TodoBlock from './TodoBlock'
import { useWorkspaceStore } from '../../stores/useWorkspaceStore'
import type { BlockComponentProps } from './types'

vi.mock('../EditableContent/EditableContent', () => ({
  default: ({ content, placeholder }: { content: string; placeholder?: string }) => (
    <div data-testid="editable-content" data-placeholder={placeholder}>
      {content}
    </div>
  ),
}))

function makeProps(overrides: Partial<BlockComponentProps> = {}): BlockComponentProps {
  return {
    block: {
      id: 'todo-1',
      type: 'todo_list',
      content: 'Buy milk',
      marks: [],
      children: [],
      properties: { checked: false },
    },
    onContentChange: vi.fn(),
    onMarksChange: vi.fn(),
    onEnter: vi.fn(),
    onBackspace: vi.fn(),
    onArrowUp: vi.fn(),
    onArrowDown: vi.fn(),
    onSlash: vi.fn(),
    onSelectionChange: vi.fn(),
    onFormatShortcut: vi.fn(),
    ...overrides,
  }
}

describe('TodoBlock', () => {
  beforeEach(() => {
    // Set up store with the todo block
    useWorkspaceStore.setState({
      blocks: {
        'todo-1': {
          id: 'todo-1',
          type: 'todo_list',
          content: 'Buy milk',
          marks: [],
          children: [],
          properties: { checked: false },
        },
      },
    })
  })

  it('renders todo content', () => {
    render(<TodoBlock {...makeProps()} />)
    expect(screen.getByText('Buy milk')).toBeInTheDocument()
  })

  it('renders unchecked checkbox by default', () => {
    render(<TodoBlock {...makeProps()} />)
    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).not.toBeChecked()
  })

  it('renders checked checkbox when checked property is true', () => {
    render(
      <TodoBlock
        {...makeProps({
          block: {
            id: 'todo-1',
            type: 'todo_list',
            content: 'Done task',
            marks: [],
            children: [],
            properties: { checked: true },
          },
        })}
      />
    )
    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toBeChecked()
  })

  it('applies checked class when checked', () => {
    const { container } = render(
      <TodoBlock
        {...makeProps({
          block: {
            id: 'todo-1',
            type: 'todo_list',
            content: 'Done task',
            marks: [],
            children: [],
            properties: { checked: true },
          },
        })}
      />
    )
    expect(container.querySelector('.block-todo--checked')).toBeInTheDocument()
  })

  it('does not apply checked class when unchecked', () => {
    const { container } = render(<TodoBlock {...makeProps()} />)
    expect(container.querySelector('.block-todo--checked')).not.toBeInTheDocument()
  })

  it('toggles checkbox on click', async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 })
    render(<TodoBlock {...makeProps()} />)
    const checkbox = screen.getByRole('checkbox')
    await user.click(checkbox)
    const updatedBlock = useWorkspaceStore.getState().blocks['todo-1']
    expect(updatedBlock?.properties.checked).toBe(true)
  })

  it('has correct aria-label for unchecked state', () => {
    render(<TodoBlock {...makeProps()} />)
    expect(screen.getByLabelText('Mark as complete')).toBeInTheDocument()
  })

  it('has correct aria-label for checked state', () => {
    render(
      <TodoBlock
        {...makeProps({
          block: {
            id: 'todo-1',
            type: 'todo_list',
            content: 'Done',
            marks: [],
            children: [],
            properties: { checked: true },
          },
        })}
      />
    )
    expect(screen.getByLabelText('Mark as incomplete')).toBeInTheDocument()
  })
})
