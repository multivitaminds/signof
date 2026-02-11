import { render, screen } from '@testing-library/react'
import ColumnLayoutBlock from './ColumnLayoutBlock'
import { useWorkspaceStore } from '../../stores/useWorkspaceStore'

vi.mock('../BlockEditor/BlockEditor', () => ({
  default: ({ blockIds }: { blockIds: string[] }) => (
    <div data-testid="block-editor" data-block-ids={blockIds.join(',')}>
      Block editor for {blockIds.join(', ')}
    </div>
  ),
}))

describe('ColumnLayoutBlock', () => {
  beforeEach(() => {
    useWorkspaceStore.setState({
      blocks: {
        'col-layout': {
          id: 'col-layout',
          type: 'column_layout',
          content: '',
          marks: [],
          children: ['col-1', 'col-2'],
          properties: {},
        },
        'col-1': {
          id: 'col-1',
          type: 'paragraph',
          content: 'Column 1',
          marks: [],
          children: ['child-1'],
          properties: {},
        },
        'col-2': {
          id: 'col-2',
          type: 'paragraph',
          content: 'Column 2',
          marks: [],
          children: ['child-2'],
          properties: {},
        },
        'child-1': {
          id: 'child-1',
          type: 'paragraph',
          content: 'Content 1',
          marks: [],
          children: [],
          properties: {},
        },
        'child-2': {
          id: 'child-2',
          type: 'paragraph',
          content: 'Content 2',
          marks: [],
          children: [],
          properties: {},
        },
      },
    })
  })

  it('renders columns with BlockEditor for each', () => {
    const block = useWorkspaceStore.getState().blocks['col-layout']!
    render(<ColumnLayoutBlock block={block} pageId="page-1" />)
    const editors = screen.getAllByTestId('block-editor')
    expect(editors).toHaveLength(2)
  })

  it('renders empty message when no children', () => {
    useWorkspaceStore.setState({
      blocks: {
        'empty-layout': {
          id: 'empty-layout',
          type: 'column_layout',
          content: '',
          marks: [],
          children: [],
          properties: {},
        },
      },
    })
    const block = useWorkspaceStore.getState().blocks['empty-layout']!
    render(<ColumnLayoutBlock block={block} pageId="page-1" />)
    expect(screen.getByText(/No columns/)).toBeInTheDocument()
  })

  it('renders empty message when children blocks do not exist in store', () => {
    useWorkspaceStore.setState({
      blocks: {
        'bad-layout': {
          id: 'bad-layout',
          type: 'column_layout',
          content: '',
          marks: [],
          children: ['nonexistent-1', 'nonexistent-2'],
          properties: {},
        },
      },
    })
    const block = useWorkspaceStore.getState().blocks['bad-layout']!
    render(<ColumnLayoutBlock block={block} pageId="page-1" />)
    expect(screen.getByText(/No columns/)).toBeInTheDocument()
  })

  it('has correct wrapper class', () => {
    const block = useWorkspaceStore.getState().blocks['col-layout']!
    const { container } = render(<ColumnLayoutBlock block={block} pageId="page-1" />)
    expect(container.querySelector('.block-column-layout')).toBeInTheDocument()
  })

  it('sets grid template columns based on number of columns', () => {
    const block = useWorkspaceStore.getState().blocks['col-layout']!
    const { container } = render(<ColumnLayoutBlock block={block} pageId="page-1" />)
    const layout = container.querySelector('.block-column-layout')
    expect(layout).toHaveStyle({ gridTemplateColumns: 'repeat(2, 1fr)' })
  })
})
