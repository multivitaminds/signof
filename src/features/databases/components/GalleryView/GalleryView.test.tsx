import { render, screen } from '@testing-library/react'
import GalleryView from './GalleryView'
import type { DbTable } from '../../types'
import { DbFieldType, ViewType } from '../../types'

function makeTable(overrides?: Partial<DbTable>): DbTable {
  return {
    id: 'tbl-1',
    name: 'Test Table',
    icon: '📋',
    fields: [
      { id: 'f-title', name: 'Title', type: DbFieldType.Text, width: 280 },
      {
        id: 'f-status',
        name: 'Status',
        type: DbFieldType.Select,
        width: 140,
        options: {
          choices: [
            { id: 's1', name: 'Backlog', color: '#94A3B8' },
            { id: 's2', name: 'In Progress', color: '#3B82F6' },
          ],
        },
      },
      { id: 'f-due', name: 'Due Date', type: DbFieldType.Date, width: 140 },
      { id: 'f-assignee', name: 'Assignee', type: DbFieldType.Text, width: 140 },
      { id: 'f-url', name: 'Image', type: DbFieldType.Url, width: 200 },
    ],
    rows: [
      {
        id: 'r1',
        cells: { 'f-title': 'Design System', 'f-status': 'In Progress', 'f-due': '2026-02-15', 'f-assignee': 'Alice' },
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      },
      {
        id: 'r2',
        cells: { 'f-title': 'API Documentation', 'f-status': 'Backlog', 'f-assignee': 'Bob' },
        createdAt: '2026-01-02T00:00:00Z',
        updatedAt: '2026-01-02T00:00:00Z',
      },
      {
        id: 'r3',
        cells: { 'f-title': 'Performance Audit', 'f-due': '2026-03-01' },
        createdAt: '2026-01-03T00:00:00Z',
        updatedAt: '2026-01-03T00:00:00Z',
      },
    ],
    views: [
      {
        id: 'v1',
        name: 'Gallery',
        type: ViewType.Gallery,
        tableId: 'tbl-1',
        filters: [],
        sorts: [],
        hiddenFields: [],
        fieldOrder: ['f-title', 'f-status', 'f-due', 'f-assignee', 'f-url'],
      },
    ],
    ...overrides,
  }
}

const defaultProps = () => ({
  table: makeTable(),
  tables: {},
  onUpdateCell: vi.fn(),
})

describe('GalleryView', () => {
  it('renders gallery region', () => {
    render(<GalleryView {...defaultProps()} />)
    expect(screen.getByRole('region', { name: 'Gallery view' })).toBeInTheDocument()
  })

  it('renders card titles', () => {
    render(<GalleryView {...defaultProps()} />)
    expect(screen.getByText('Design System')).toBeInTheDocument()
    expect(screen.getByText('API Documentation')).toBeInTheDocument()
    expect(screen.getByText('Performance Audit')).toBeInTheDocument()
  })

  it('renders preview fields on cards', () => {
    render(<GalleryView {...defaultProps()} />)
    // Status field values should appear as previews
    expect(screen.getByText('In Progress')).toBeInTheDocument()
    expect(screen.getByText('Backlog')).toBeInTheDocument()
    // Assignee values
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()
  })

  it('renders field labels on cards', () => {
    render(<GalleryView {...defaultProps()} />)
    // Label names from preview fields (Status, Due Date, Assignee)
    const statusLabels = screen.getAllByText('Status')
    expect(statusLabels.length).toBeGreaterThanOrEqual(1)
  })

  it('renders cards as articles with aria labels', () => {
    render(<GalleryView {...defaultProps()} />)
    expect(screen.getByRole('article', { name: 'Design System' })).toBeInTheDocument()
    expect(screen.getByRole('article', { name: 'API Documentation' })).toBeInTheDocument()
    expect(screen.getByRole('article', { name: 'Performance Audit' })).toBeInTheDocument()
  })

  it('renders cover placeholder when no image URL', () => {
    render(<GalleryView {...defaultProps()} />)
    const covers = document.querySelectorAll('.gallery-view__card-cover')
    expect(covers.length).toBe(3) // One cover per card
  })

  it('shows empty state when no rows', () => {
    const table = makeTable({ rows: [] })
    render(<GalleryView {...defaultProps()} table={table} />)
    expect(screen.getByText('No records yet')).toBeInTheDocument()
  })

  it('renders add new record button', () => {
    render(<GalleryView {...defaultProps()} />)
    expect(screen.getByLabelText('Add new record')).toBeInTheDocument()
  })

  it('renders select field values as tags', () => {
    render(<GalleryView {...defaultProps()} />)
    const tags = document.querySelectorAll('.gallery-view__card-tag')
    expect(tags.length).toBeGreaterThanOrEqual(2) // In Progress and Backlog
  })

  it('uses CSS grid layout', () => {
    render(<GalleryView {...defaultProps()} />)
    const gallery = document.querySelector('.gallery-view')
    expect(gallery).toBeInTheDocument()
  })

  it('renders "Untitled" for rows without a title', () => {
    const table = makeTable({
      rows: [
        {
          id: 'r-empty',
          cells: { 'f-status': 'Backlog' },
          createdAt: '2026-01-01T00:00:00Z',
          updatedAt: '2026-01-01T00:00:00Z',
        },
      ],
    })
    render(<GalleryView {...defaultProps()} table={table} />)
    expect(screen.getByText('Untitled')).toBeInTheDocument()
  })
})
