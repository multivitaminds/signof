import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import DocumentNotes from './DocumentNotes'
import type { DocumentNote } from '../../../../types'

function makeNotes(): DocumentNote[] {
  return [
    {
      id: 'n1',
      authorName: 'Alice',
      content: 'Please review section 3.',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'n2',
      authorName: 'Bob',
      content: 'Looks good to me.',
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
  ]
}

describe('DocumentNotes', () => {
  it('renders the notes header with count', () => {
    render(
      <DocumentNotes notes={makeNotes()} onAddNote={vi.fn()} onDeleteNote={vi.fn()} />
    )
    expect(screen.getByText('Notes')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('renders notes with author names and content', () => {
    render(
      <DocumentNotes notes={makeNotes()} onAddNote={vi.fn()} onDeleteNote={vi.fn()} />
    )
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('Please review section 3.')).toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()
    expect(screen.getByText('Looks good to me.')).toBeInTheDocument()
  })

  it('shows empty state when no notes', () => {
    render(
      <DocumentNotes notes={[]} onAddNote={vi.fn()} onDeleteNote={vi.fn()} />
    )
    expect(screen.getByText('No notes yet')).toBeInTheDocument()
  })

  it('shows add note textarea', () => {
    render(
      <DocumentNotes notes={[]} onAddNote={vi.fn()} onDeleteNote={vi.fn()} />
    )
    expect(screen.getByLabelText('New note')).toBeInTheDocument()
  })

  it('submit button is disabled when textarea is empty', () => {
    render(
      <DocumentNotes notes={[]} onAddNote={vi.fn()} onDeleteNote={vi.fn()} />
    )
    expect(screen.getByLabelText('Submit note')).toBeDisabled()
  })

  it('calls onAddNote when form is submitted', async () => {
    const user = userEvent.setup()
    const onAddNote = vi.fn()
    render(
      <DocumentNotes notes={[]} onAddNote={onAddNote} onDeleteNote={vi.fn()} />
    )

    await user.type(screen.getByLabelText('New note'), 'This is a test note')
    await user.click(screen.getByLabelText('Submit note'))

    expect(onAddNote).toHaveBeenCalledWith('This is a test note')
  })

  it('clears textarea after successful submission', async () => {
    const user = userEvent.setup()
    render(
      <DocumentNotes notes={[]} onAddNote={vi.fn()} onDeleteNote={vi.fn()} />
    )

    const textarea = screen.getByLabelText('New note')
    await user.type(textarea, 'A note')
    await user.click(screen.getByLabelText('Submit note'))

    expect(textarea).toHaveValue('')
  })

  it('calls onDeleteNote when delete button is clicked', async () => {
    const user = userEvent.setup()
    const onDeleteNote = vi.fn()
    render(
      <DocumentNotes notes={makeNotes()} onAddNote={vi.fn()} onDeleteNote={onDeleteNote} />
    )

    await user.click(screen.getByLabelText('Delete note by Alice'))
    expect(onDeleteNote).toHaveBeenCalledWith('n1')
  })

  it('hides add form and delete buttons in readOnly mode', () => {
    render(
      <DocumentNotes
        notes={makeNotes()}
        onAddNote={vi.fn()}
        onDeleteNote={vi.fn()}
        readOnly
      />
    )
    expect(screen.queryByLabelText('New note')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Delete note by Alice')).not.toBeInTheDocument()
  })

  it('has region role with proper aria-label', () => {
    render(
      <DocumentNotes notes={[]} onAddNote={vi.fn()} onDeleteNote={vi.fn()} />
    )
    expect(screen.getByRole('region', { name: 'Document notes' })).toBeInTheDocument()
  })

  it('shows timestamp for notes', () => {
    render(
      <DocumentNotes notes={makeNotes()} onAddNote={vi.fn()} onDeleteNote={vi.fn()} />
    )
    // Recent note should show "Just now" or "Xm ago"
    const timeElements = screen.getAllByText(/ago|Just now/i)
    expect(timeElements.length).toBeGreaterThanOrEqual(1)
  })
})
