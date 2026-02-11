import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import FilterBar from './FilterBar'
import type { DbField, Filter, Sort } from '../../types'
import { DbFieldType, FilterOperator } from '../../types'

const mockFields: DbField[] = [
  { id: 'f-name', name: 'Name', type: DbFieldType.Text, width: 200 },
  { id: 'f-status', name: 'Status', type: DbFieldType.Select, width: 140 },
]

describe('FilterBar', () => {
  const defaultProps = {
    fields: mockFields,
    filters: [] as Filter[],
    sorts: [] as Sort[],
    onFiltersChange: vi.fn(),
    onSortsChange: vi.fn(),
  }

  it('renders Filter and Sort buttons', () => {
    render(<FilterBar {...defaultProps} />)
    expect(screen.getByText('Filter')).toBeInTheDocument()
    expect(screen.getByText('Sort')).toBeInTheDocument()
  })

  it('calls onFiltersChange when Filter button is clicked', async () => {
    const user = userEvent.setup()
    const onFiltersChange = vi.fn()
    render(<FilterBar {...defaultProps} onFiltersChange={onFiltersChange} />)
    await user.click(screen.getByText('Filter'))
    expect(onFiltersChange).toHaveBeenCalledTimes(1)
    expect(onFiltersChange).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ fieldId: 'f-name', operator: FilterOperator.Contains }),
      ])
    )
  })

  it('calls onSortsChange when Sort button is clicked', async () => {
    const user = userEvent.setup()
    const onSortsChange = vi.fn()
    render(<FilterBar {...defaultProps} onSortsChange={onSortsChange} />)
    await user.click(screen.getByText('Sort'))
    expect(onSortsChange).toHaveBeenCalledTimes(1)
    expect(onSortsChange).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ fieldId: 'f-name', direction: 'asc' }),
      ])
    )
  })

  it('shows existing filters when present', () => {
    const filters: Filter[] = [
      { id: 'filter-1', fieldId: 'f-name', operator: FilterOperator.Contains, value: 'test' },
    ]
    render(<FilterBar {...defaultProps} filters={filters} />)
    expect(screen.getByDisplayValue('test')).toBeInTheDocument()
  })

  it('shows existing sorts when present', () => {
    const sorts: Sort[] = [{ fieldId: 'f-name', direction: 'desc' }]
    render(<FilterBar {...defaultProps} sorts={sorts} />)
    expect(screen.getByDisplayValue('Descending')).toBeInTheDocument()
  })

  it('shows Add filter button when filters are visible', () => {
    const filters: Filter[] = [
      { id: 'filter-1', fieldId: 'f-name', operator: FilterOperator.Contains, value: '' },
    ]
    render(<FilterBar {...defaultProps} filters={filters} />)
    expect(screen.getByText('Add filter')).toBeInTheDocument()
  })
})
