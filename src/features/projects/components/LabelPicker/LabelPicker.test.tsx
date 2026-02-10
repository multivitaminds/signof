import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LabelPicker from './LabelPicker'
import type { Label } from '../../types'

const mockLabels: Label[] = [
  { id: 'l1', name: 'Bug', color: '#EF4444' },
  { id: 'l2', name: 'Feature', color: '#22C55E' },
  { id: 'l3', name: 'Improvement', color: '#3B82F6' },
]

describe('LabelPicker', () => {
  const defaultProps = {
    labels: mockLabels,
    selectedIds: [] as string[],
    onChange: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders trigger with placeholder when no labels selected', () => {
    render(<LabelPicker {...defaultProps} />)
    expect(screen.getByText('Add labels')).toBeInTheDocument()
  })

  it('renders selected label names in trigger', () => {
    render(<LabelPicker {...defaultProps} selectedIds={['l1', 'l3']} />)
    expect(screen.getByText('Bug')).toBeInTheDocument()
    expect(screen.getByText('Improvement')).toBeInTheDocument()
    expect(screen.queryByText('Feature')).not.toBeInTheDocument()
  })

  it('opens dropdown on click', async () => {
    const user = userEvent.setup()
    render(<LabelPicker {...defaultProps} />)

    await user.click(screen.getByRole('button'))
    expect(screen.getByRole('listbox')).toBeInTheDocument()
    expect(screen.getAllByRole('option')).toHaveLength(3)
  })

  it('shows all labels in dropdown', async () => {
    const user = userEvent.setup()
    render(<LabelPicker {...defaultProps} />)

    await user.click(screen.getByRole('button'))
    for (const label of mockLabels) {
      expect(screen.getByText(label.name)).toBeInTheDocument()
    }
  })

  it('adds label id when clicking unselected label', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<LabelPicker {...defaultProps} onChange={onChange} />)

    await user.click(screen.getByRole('button'))
    await user.click(screen.getByText('Bug'))
    expect(onChange).toHaveBeenCalledWith(['l1'])
  })

  it('removes label id when clicking selected label', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<LabelPicker {...defaultProps} selectedIds={['l1', 'l2']} onChange={onChange} />)

    await user.click(screen.getByRole('button'))
    // "Bug" appears in both trigger tag and dropdown option; click the one in the listbox
    const options = screen.getAllByRole('option')
    const bugOption = options.find(o => o.textContent?.includes('Bug'))!
    await user.click(bugOption)
    expect(onChange).toHaveBeenCalledWith(['l2'])
  })

  it('shows checkmarks on selected labels', async () => {
    const user = userEvent.setup()
    render(<LabelPicker {...defaultProps} selectedIds={['l2']} />)

    await user.click(screen.getByRole('button'))
    const selectedOption = screen.getByRole('option', { selected: true })
    expect(selectedOption).toHaveTextContent('Feature')
    expect(selectedOption).toHaveTextContent('✓')
  })

  it('closes dropdown on Escape', async () => {
    const user = userEvent.setup()
    render(<LabelPicker {...defaultProps} />)

    await user.click(screen.getByRole('button'))
    expect(screen.getByRole('listbox')).toBeInTheDocument()

    await user.keyboard('{Escape}')
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('keeps dropdown open after toggling a label', async () => {
    const user = userEvent.setup()
    render(<LabelPicker {...defaultProps} />)

    await user.click(screen.getByRole('button'))
    await user.click(screen.getByText('Bug'))
    // Dropdown stays open for multi-select
    expect(screen.getByRole('listbox')).toBeInTheDocument()
  })
})
