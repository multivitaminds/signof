import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { MemoryEntry } from '../../types'
import MemoryEntryModal from './MemoryEntryModal'

const makeEntry = (): MemoryEntry => ({
  id: 'edit-1',
  title: 'Existing Entry',
  content: 'Existing content for editing.',
  category: 'facts',
  tags: ['tag1', 'tag2'],
  scope: 'personal',
  tokenCount: 7,
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
  pinned: false,
  sourceType: null,
  sourceRef: null,
  lastAccessedAt: '2025-01-01T00:00:00.000Z',
  accessCount: 0,
})

describe('MemoryEntryModal', () => {
  const onSave = vi.fn()
  const onCancel = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders in add mode with empty fields', () => {
    render(<MemoryEntryModal onSave={onSave} onCancel={onCancel} />)
    expect(screen.getByRole('heading', { name: 'Add Entry' })).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Memory entry title')).toHaveValue('')
    expect(screen.getByPlaceholderText(/Enter the content/)).toHaveValue('')
  })

  it('renders in edit mode with pre-filled fields', () => {
    const entry = makeEntry()
    render(<MemoryEntryModal entry={entry} onSave={onSave} onCancel={onCancel} />)
    expect(screen.getByText('Edit Entry')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Existing Entry')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Existing content for editing.')).toBeInTheDocument()
    expect(screen.getByText('tag1')).toBeInTheDocument()
    expect(screen.getByText('tag2')).toBeInTheDocument()
  })

  it('shows scope radio buttons with correct default for add mode', () => {
    render(<MemoryEntryModal onSave={onSave} onCancel={onCancel} />)
    const workspaceRadio = screen.getByRole('radio', { name: 'Workspace' })
    expect(workspaceRadio).toBeChecked()
  })

  it('shows scope radio buttons with correct value for edit mode', () => {
    render(<MemoryEntryModal entry={makeEntry()} onSave={onSave} onCancel={onCancel} />)
    const personalRadio = screen.getByRole('radio', { name: 'Personal' })
    expect(personalRadio).toBeChecked()
  })

  it('category pills render for all 6 categories', () => {
    render(<MemoryEntryModal onSave={onSave} onCancel={onCancel} />)
    expect(screen.getByRole('radio', { name: 'Decisions' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'Workflows' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'Preferences' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'People' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'Projects' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'Facts' })).toBeInTheDocument()
  })

  it('defaults category to facts in add mode', () => {
    render(<MemoryEntryModal onSave={onSave} onCancel={onCancel} />)
    const factsRadio = screen.getByRole('radio', { name: 'Facts' })
    expect(factsRadio).toHaveAttribute('aria-checked', 'true')
  })

  it('clicking a category pill changes the selected category', async () => {
    const user = userEvent.setup()
    render(<MemoryEntryModal onSave={onSave} onCancel={onCancel} />)

    const decisionsBtn = screen.getByRole('radio', { name: 'Decisions' })
    await user.click(decisionsBtn)
    expect(decisionsBtn).toHaveAttribute('aria-checked', 'true')

    const factsBtn = screen.getByRole('radio', { name: 'Facts' })
    expect(factsBtn).toHaveAttribute('aria-checked', 'false')
  })

  it('calls onSave with correct values including category', async () => {
    const user = userEvent.setup()
    render(<MemoryEntryModal onSave={onSave} onCancel={onCancel} />)

    await user.type(screen.getByPlaceholderText('Memory entry title'), 'My Title')
    await user.type(screen.getByPlaceholderText(/Enter the content/), 'Some content')
    await user.click(screen.getByRole('button', { name: /add entry/i }))

    expect(onSave).toHaveBeenCalledWith('My Title', 'Some content', 'facts', [], 'workspace')
  })

  it('calls onSave with selected category', async () => {
    const user = userEvent.setup()
    render(<MemoryEntryModal onSave={onSave} onCancel={onCancel} />)

    await user.type(screen.getByPlaceholderText('Memory entry title'), 'Title')
    await user.type(screen.getByPlaceholderText(/Enter the content/), 'Content')
    await user.click(screen.getByRole('radio', { name: 'Workflows' }))
    await user.click(screen.getByRole('button', { name: /add entry/i }))

    expect(onSave).toHaveBeenCalledWith('Title', 'Content', 'workflows', [], 'workspace')
  })

  it('calls onCancel when cancel is clicked', async () => {
    const user = userEvent.setup()
    render(<MemoryEntryModal onSave={onSave} onCancel={onCancel} />)
    await user.click(screen.getByRole('button', { name: /cancel/i }))
    expect(onCancel).toHaveBeenCalledOnce()
  })

  it('calls onCancel when close button is clicked', async () => {
    const user = userEvent.setup()
    render(<MemoryEntryModal onSave={onSave} onCancel={onCancel} />)
    await user.click(screen.getByRole('button', { name: /close/i }))
    expect(onCancel).toHaveBeenCalledOnce()
  })

  it('disables save when title is empty', () => {
    render(<MemoryEntryModal onSave={onSave} onCancel={onCancel} />)
    const addBtn = screen.getByRole('button', { name: /add entry/i })
    expect(addBtn).toBeDisabled()
  })

  it('adds tags on Enter key', async () => {
    const user = userEvent.setup()
    render(<MemoryEntryModal onSave={onSave} onCancel={onCancel} />)

    const tagInput = screen.getByPlaceholderText(/type a tag/i)
    await user.type(tagInput, 'newtag{Enter}')

    expect(screen.getByText('newtag')).toBeInTheDocument()
  })

  it('removes tags when X is clicked', async () => {
    const user = userEvent.setup()
    render(<MemoryEntryModal entry={makeEntry()} onSave={onSave} onCancel={onCancel} />)

    const chip = screen.getByText('tag1').closest('.memory-modal__tag-chip')!
    const removeBtn = within(chip as HTMLElement).getByRole('button', { name: /remove tag tag1/i })
    await user.click(removeBtn)

    expect(screen.queryByText('tag1')).not.toBeInTheDocument()
    expect(screen.getByText('tag2')).toBeInTheDocument()
  })

  it('shows live token count for content', async () => {
    const user = userEvent.setup()
    render(<MemoryEntryModal onSave={onSave} onCancel={onCancel} />)

    await user.type(screen.getByPlaceholderText(/Enter the content/), 'a'.repeat(100))

    // 100 chars / 4 = 25 tokens
    expect(screen.getByText('25 tokens')).toBeInTheDocument()
  })

  it('changes scope when radio is selected', async () => {
    const user = userEvent.setup()
    render(<MemoryEntryModal onSave={onSave} onCancel={onCancel} />)

    await user.type(screen.getByPlaceholderText('Memory entry title'), 'Title')
    await user.type(screen.getByPlaceholderText(/Enter the content/), 'Content')
    await user.click(screen.getByRole('radio', { name: 'Team' }))
    await user.click(screen.getByRole('button', { name: /add entry/i }))

    expect(onSave).toHaveBeenCalledWith('Title', 'Content', 'facts', [], 'team')
  })

  // --- New tests for enhanced features ---

  it('renders Write and From Template tabs in add mode', () => {
    render(<MemoryEntryModal onSave={onSave} onCancel={onCancel} />)
    expect(screen.getByRole('tab', { name: 'Write' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'From Template' })).toBeInTheDocument()
  })

  it('default tab is Write', () => {
    render(<MemoryEntryModal onSave={onSave} onCancel={onCancel} />)
    const writeTab = screen.getByRole('tab', { name: 'Write' })
    expect(writeTab).toHaveAttribute('aria-selected', 'true')
  })

  it('clicking "From Template" tab shows template grid', async () => {
    const user = userEvent.setup()
    render(<MemoryEntryModal onSave={onSave} onCancel={onCancel} />)

    await user.click(screen.getByRole('tab', { name: 'From Template' }))

    expect(screen.getByText('Team Decision Record')).toBeInTheDocument()
    expect(screen.getByText('Standard Operating Procedure')).toBeInTheDocument()
  })

  it('clicking a template card pre-fills the form and switches to Write tab', async () => {
    const user = userEvent.setup()
    render(<MemoryEntryModal onSave={onSave} onCancel={onCancel} />)

    // Switch to template tab
    await user.click(screen.getByRole('tab', { name: 'From Template' }))
    // Click first template (Team Decision Record)
    await user.click(screen.getByText('Team Decision Record'))

    // Should switch back to Write tab and form should be pre-filled
    expect(screen.getByDisplayValue('Team Decision Record')).toBeInTheDocument()
    // The decisions category pill should be active
    const decisionsRadio = screen.getByRole('radio', { name: 'Decisions' })
    expect(decisionsRadio).toHaveAttribute('aria-checked', 'true')
  })

  it('does not show tabs in edit mode', () => {
    render(<MemoryEntryModal entry={makeEntry()} onSave={onSave} onCancel={onCancel} />)
    expect(screen.queryByRole('tab', { name: 'Write' })).not.toBeInTheDocument()
    expect(screen.queryByRole('tab', { name: 'From Template' })).not.toBeInTheDocument()
  })

  it('tag suggestions render when existingTags are provided', () => {
    render(
      <MemoryEntryModal
        onSave={onSave}
        onCancel={onCancel}
        existingTags={['suggested1', 'suggested2']}
      />
    )
    expect(screen.getByText('Suggested:')).toBeInTheDocument()
    expect(screen.getByText('suggested1')).toBeInTheDocument()
    expect(screen.getByText('suggested2')).toBeInTheDocument()
  })

  it('clicking a suggested tag adds it to the tags list', async () => {
    const user = userEvent.setup()
    render(
      <MemoryEntryModal
        onSave={onSave}
        onCancel={onCancel}
        existingTags={['suggested1']}
      />
    )

    await user.click(screen.getByText('suggested1'))

    // The tag should now appear as a tag chip
    const chip = screen.getByText('suggested1').closest('.memory-modal__tag-chip')
    expect(chip).toBeInTheDocument()
  })

  it('does not show suggested tags that are already added', () => {
    render(
      <MemoryEntryModal
        entry={makeEntry()}
        onSave={onSave}
        onCancel={onCancel}
        existingTags={['tag1', 'other-tag']}
      />
    )
    // tag1 is already in the entry, so only other-tag should be suggested
    expect(screen.getByText('Suggested:')).toBeInTheDocument()
    // other-tag should be a suggestion button, not a tag chip
    const suggestions = screen.getByText('other-tag').closest('.memory-modal__tag-suggestion')
    expect(suggestions).toBeInTheDocument()
  })
})
