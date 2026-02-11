import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SimpleTableBlock from './SimpleTableBlock'
import { useWorkspaceStore } from '../../stores/useWorkspaceStore'

describe('SimpleTableBlock', () => {
  beforeEach(() => {
    useWorkspaceStore.setState({
      blocks: {
        'table-1': {
          id: 'table-1',
          type: 'simple_table',
          content: '',
          marks: [],
          children: [],
          properties: {
            rows: [
              ['Name', 'Age'],
              ['Alice', '30'],
            ],
          },
        },
      },
    })
  })

  it('renders table with rows and cells', () => {
    render(
      <SimpleTableBlock
        block={{
          id: 'table-1',
          type: 'simple_table',
          content: '',
          marks: [],
          children: [],
          properties: { rows: [['Name', 'Age'], ['Alice', '30']] },
        }}
        onContentChange={vi.fn()}
      />
    )
    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('Age')).toBeInTheDocument()
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('30')).toBeInTheDocument()
  })

  it('renders table role and cell roles', () => {
    render(
      <SimpleTableBlock
        block={{
          id: 'table-1',
          type: 'simple_table',
          content: '',
          marks: [],
          children: [],
          properties: { rows: [['A', 'B']] },
        }}
        onContentChange={vi.fn()}
      />
    )
    expect(screen.getByRole('table')).toBeInTheDocument()
    expect(screen.getAllByRole('cell')).toHaveLength(2)
    expect(screen.getAllByRole('row')).toHaveLength(1)
  })

  it('renders Add row and Add column buttons', () => {
    render(
      <SimpleTableBlock
        block={{
          id: 'table-1',
          type: 'simple_table',
          content: '',
          marks: [],
          children: [],
          properties: { rows: [['A']] },
        }}
        onContentChange={vi.fn()}
      />
    )
    expect(screen.getByLabelText('Add row')).toBeInTheDocument()
    expect(screen.getByLabelText('Add column')).toBeInTheDocument()
  })

  it('renders default 2x2 table when no rows property', () => {
    render(
      <SimpleTableBlock
        block={{
          id: 'table-1',
          type: 'simple_table',
          content: '',
          marks: [],
          children: [],
          properties: {},
        }}
        onContentChange={vi.fn()}
      />
    )
    expect(screen.getAllByRole('row')).toHaveLength(2)
    expect(screen.getAllByRole('cell')).toHaveLength(4)
  })

  it('opens cell editing on click', async () => {
    const user = userEvent.setup()
    render(
      <SimpleTableBlock
        block={{
          id: 'table-1',
          type: 'simple_table',
          content: '',
          marks: [],
          children: [],
          properties: { rows: [['Hello', 'World']] },
        }}
        onContentChange={vi.fn()}
      />
    )

    await user.click(screen.getByText('Hello'))
    // After clicking, an input should appear
    const input = screen.getByDisplayValue('Hello')
    expect(input).toBeInTheDocument()
  })

  it('has correct wrapper class', () => {
    const { container } = render(
      <SimpleTableBlock
        block={{
          id: 'table-1',
          type: 'simple_table',
          content: '',
          marks: [],
          children: [],
          properties: { rows: [['A']] },
        }}
        onContentChange={vi.fn()}
      />
    )
    expect(container.querySelector('.block-table')).toBeInTheDocument()
  })
})
