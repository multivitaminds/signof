import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import FormView from './FormView'
import type { DbField } from '../../types'
import { DbFieldType } from '../../types'

function makeField(overrides: Partial<DbField> & { id: string; name: string; type: DbField['type'] }): DbField {
  return {
    width: 160,
    ...overrides,
  }
}

const textField = makeField({ id: 'f-name', name: 'Name', type: DbFieldType.Text })
const numberField = makeField({ id: 'f-age', name: 'Age', type: DbFieldType.Number })
const dateField = makeField({ id: 'f-date', name: 'Birthday', type: DbFieldType.Date })
const checkboxField = makeField({ id: 'f-active', name: 'Active', type: DbFieldType.Checkbox })
const urlField = makeField({ id: 'f-url', name: 'Website', type: DbFieldType.Url })
const emailField = makeField({ id: 'f-email', name: 'Email', type: DbFieldType.Email })
const selectField = makeField({
  id: 'f-status',
  name: 'Status',
  type: DbFieldType.Select,
  options: {
    choices: [
      { id: 'c1', name: 'Active', color: '#22C55E' },
      { id: 'c2', name: 'Inactive', color: '#EF4444' },
    ],
  },
})
const multiSelectField = makeField({
  id: 'f-tags',
  name: 'Tags',
  type: DbFieldType.MultiSelect,
  options: {
    choices: [
      { id: 'c3', name: 'Frontend', color: '#3B82F6' },
      { id: 'c4', name: 'Backend', color: '#8B5CF6' },
      { id: 'c5', name: 'DevOps', color: '#F59E0B' },
    ],
  },
})

const allFields: DbField[] = [textField, numberField, dateField, checkboxField, urlField, emailField, selectField, multiSelectField]

describe('FormView', () => {
  it('renders form title with table name', () => {
    render(<FormView fields={[textField]} tableName="Contacts" onSubmit={vi.fn()} />)
    expect(screen.getByText('Contacts Form')).toBeInTheDocument()
  })

  it('renders default title when no table name', () => {
    render(<FormView fields={[textField]} onSubmit={vi.fn()} />)
    expect(screen.getByText('Submit a response')).toBeInTheDocument()
  })

  it('renders form description when provided', () => {
    render(
      <FormView
        fields={[textField]}
        formDescription="Fill out this form to apply."
        onSubmit={vi.fn()}
      />
    )
    expect(screen.getByText('Fill out this form to apply.')).toBeInTheDocument()
  })

  it('renders all field types', () => {
    render(<FormView fields={allFields} onSubmit={vi.fn()} />)

    expect(screen.getByLabelText('Name')).toBeInTheDocument()
    expect(screen.getByLabelText('Age')).toBeInTheDocument()
    expect(screen.getByLabelText('Birthday')).toBeInTheDocument()
    expect(screen.getByLabelText('Website')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    // Select
    expect(screen.getByText('Status')).toBeInTheDocument()
    // Multi-select
    expect(screen.getByText('Tags')).toBeInTheDocument()
    expect(screen.getByText('Frontend')).toBeInTheDocument()
    expect(screen.getByText('Backend')).toBeInTheDocument()
    expect(screen.getByText('DevOps')).toBeInTheDocument()
  })

  it('renders text input for text field', () => {
    render(<FormView fields={[textField]} onSubmit={vi.fn()} />)
    const input = screen.getByLabelText('Name')
    expect(input).toHaveAttribute('type', 'text')
  })

  it('renders number input for number field', () => {
    render(<FormView fields={[numberField]} onSubmit={vi.fn()} />)
    const input = screen.getByLabelText('Age')
    expect(input).toHaveAttribute('type', 'number')
  })

  it('renders date input for date field', () => {
    render(<FormView fields={[dateField]} onSubmit={vi.fn()} />)
    const input = screen.getByLabelText('Birthday')
    expect(input).toHaveAttribute('type', 'date')
  })

  it('renders url input for url field', () => {
    render(<FormView fields={[urlField]} onSubmit={vi.fn()} />)
    const input = screen.getByLabelText('Website')
    expect(input).toHaveAttribute('type', 'url')
  })

  it('renders select for select field', () => {
    render(<FormView fields={[selectField]} onSubmit={vi.fn()} />)
    const select = screen.getByLabelText('Status')
    expect(select.tagName).toBe('SELECT')
    expect(screen.getByText('Active')).toBeInTheDocument()
    expect(screen.getByText('Inactive')).toBeInTheDocument()
  })

  it('submits form values and shows success', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()

    render(<FormView fields={[textField, numberField]} onSubmit={onSubmit} />)

    await user.type(screen.getByLabelText('Name'), 'Alice')
    await user.type(screen.getByLabelText('Age'), '30')
    await user.click(screen.getByRole('button', { name: 'Submit' }))

    expect(onSubmit).toHaveBeenCalledWith({
      'f-name': 'Alice',
      'f-age': 30,
    })
    expect(screen.getByText('Response submitted')).toBeInTheDocument()
    expect(screen.getByText('1 response submitted')).toBeInTheDocument()
  })

  it('shows submit another button after submission', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()

    render(<FormView fields={[textField]} onSubmit={onSubmit} />)

    await user.type(screen.getByLabelText('Name'), 'Bob')
    await user.click(screen.getByRole('button', { name: 'Submit' }))

    expect(screen.getByText('Response submitted')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Submit another' }))

    // Back to the form
    expect(screen.getByText('Submit a response')).toBeInTheDocument()
  })

  it('submits checkbox values correctly', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()

    render(<FormView fields={[checkboxField]} onSubmit={onSubmit} />)

    // Click the checkbox
    const checkbox = screen.getByRole('checkbox')
    await user.click(checkbox)
    await user.click(screen.getByRole('button', { name: 'Submit' }))

    expect(onSubmit).toHaveBeenCalledWith({
      'f-active': true,
    })
  })

  it('submits select values correctly', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()

    render(<FormView fields={[selectField]} onSubmit={onSubmit} />)

    await user.selectOptions(screen.getByLabelText('Status'), 'Active')
    await user.click(screen.getByRole('button', { name: 'Submit' }))

    expect(onSubmit).toHaveBeenCalledWith({
      'f-status': 'Active',
    })
  })

  it('submits multi-select values correctly', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()

    render(<FormView fields={[multiSelectField]} onSubmit={onSubmit} />)

    await user.click(screen.getByText('Frontend'))
    await user.click(screen.getByText('DevOps'))
    await user.click(screen.getByRole('button', { name: 'Submit' }))

    expect(onSubmit).toHaveBeenCalledWith({
      'f-tags': ['Frontend', 'DevOps'],
    })
  })

  it('toggles multi-select options', async () => {
    const user = userEvent.setup()

    render(<FormView fields={[multiSelectField]} onSubmit={vi.fn()} />)

    const frontendBtn = screen.getByText('Frontend')
    await user.click(frontendBtn)
    expect(frontendBtn).toHaveAttribute('aria-pressed', 'true')

    await user.click(frontendBtn)
    expect(frontendBtn).toHaveAttribute('aria-pressed', 'false')
  })

  it('renders shareable hint', () => {
    render(<FormView fields={[textField]} onSubmit={vi.fn()} />)
    expect(screen.getByText(/shared publicly/)).toBeInTheDocument()
  })

  it('shows required asterisk for required fields', () => {
    const requiredField = makeField({
      id: 'f-req',
      name: 'Required Field',
      type: DbFieldType.Text,
      required: true,
    })
    render(<FormView fields={[requiredField]} onSubmit={vi.fn()} />)
    expect(screen.getByText('*')).toBeInTheDocument()
  })

  it('resets form after submission', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()

    render(<FormView fields={[textField]} onSubmit={onSubmit} />)

    await user.type(screen.getByLabelText('Name'), 'Test')
    await user.click(screen.getByRole('button', { name: 'Submit' }))

    // Click submit another
    await user.click(screen.getByRole('button', { name: 'Submit another' }))

    // Input should be empty
    expect(screen.getByLabelText('Name')).toHaveValue('')
  })
})
