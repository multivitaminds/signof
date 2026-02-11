import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PageProperties from './PageProperties'

describe('PageProperties', () => {
  const baseProps = {
    properties: {},
    onUpdate: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders Add a property button', () => {
    render(<PageProperties {...baseProps} />)
    expect(screen.getByText('Add a property')).toBeInTheDocument()
  })

  it('renders existing properties', () => {
    render(
      <PageProperties
        properties={{
          Author: { type: 'text', value: 'Alice' },
          Due: { type: 'date', value: '2026-03-01' },
        }}
        onUpdate={vi.fn()}
      />
    )
    expect(screen.getByText('Author')).toBeInTheDocument()
    expect(screen.getByText('Due')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Alice')).toBeInTheDocument()
    expect(screen.getByDisplayValue('2026-03-01')).toBeInTheDocument()
  })

  it('shows add property form when button is clicked', async () => {
    const user = userEvent.setup()
    render(<PageProperties {...baseProps} />)
    await user.click(screen.getByText('Add a property'))
    expect(screen.getByPlaceholderText('Property name')).toBeInTheDocument()
  })

  it('adds new property on form submit', async () => {
    const user = userEvent.setup()
    const onUpdate = vi.fn()
    render(<PageProperties properties={{}} onUpdate={onUpdate} />)
    await user.click(screen.getByText('Add a property'))
    await user.type(screen.getByPlaceholderText('Property name'), 'Status')
    await user.click(screen.getByText('Add'))
    expect(onUpdate).toHaveBeenCalledWith({
      Status: { type: 'text', value: '' },
    })
  })

  it('shows cancel button when adding property', async () => {
    const user = userEvent.setup()
    render(<PageProperties {...baseProps} />)
    await user.click(screen.getByText('Add a property'))
    expect(screen.getByText('Cancel')).toBeInTheDocument()
  })

  it('hides add form when cancel is clicked', async () => {
    const user = userEvent.setup()
    render(<PageProperties {...baseProps} />)
    await user.click(screen.getByText('Add a property'))
    expect(screen.getByPlaceholderText('Property name')).toBeInTheDocument()
    await user.click(screen.getByText('Cancel'))
    expect(screen.queryByPlaceholderText('Property name')).not.toBeInTheDocument()
  })

  it('calls onUpdate when property value changes', async () => {
    const user = userEvent.setup()
    const onUpdate = vi.fn()
    render(
      <PageProperties
        properties={{ Name: { type: 'text', value: 'Old' } }}
        onUpdate={onUpdate}
      />
    )
    const input = screen.getByDisplayValue('Old')
    await user.clear(input)
    await user.type(input, 'New')
    expect(onUpdate).toHaveBeenCalled()
  })

  it('renders remove button for each property', () => {
    render(
      <PageProperties
        properties={{
          Author: { type: 'text', value: 'Alice' },
        }}
        onUpdate={vi.fn()}
      />
    )
    expect(screen.getByLabelText('Remove Author')).toBeInTheDocument()
  })

  it('calls onUpdate to remove property', async () => {
    const user = userEvent.setup()
    const onUpdate = vi.fn()
    render(
      <PageProperties
        properties={{
          Author: { type: 'text', value: 'Alice' },
          Status: { type: 'text', value: 'Draft' },
        }}
        onUpdate={onUpdate}
      />
    )
    await user.click(screen.getByLabelText('Remove Author'))
    expect(onUpdate).toHaveBeenCalledWith({
      Status: { type: 'text', value: 'Draft' },
    })
  })

  it('renders property type selector in add form', async () => {
    const user = userEvent.setup()
    render(<PageProperties {...baseProps} />)
    await user.click(screen.getByText('Add a property'))
    const select = screen.getByRole('combobox')
    expect(select).toBeInTheDocument()
    // Check options
    expect(screen.getByText('Text')).toBeInTheDocument()
    expect(screen.getByText('Select')).toBeInTheDocument()
    expect(screen.getByText('Date')).toBeInTheDocument()
    expect(screen.getByText('URL')).toBeInTheDocument()
  })

  it('renders date input for date type properties', () => {
    render(
      <PageProperties
        properties={{ Due: { type: 'date', value: '2026-03-01' } }}
        onUpdate={vi.fn()}
      />
    )
    const input = screen.getByDisplayValue('2026-03-01')
    expect(input).toHaveAttribute('type', 'date')
  })

  it('renders url input for url type properties', () => {
    render(
      <PageProperties
        properties={{ Link: { type: 'url', value: 'https://test.com' } }}
        onUpdate={vi.fn()}
      />
    )
    const input = screen.getByDisplayValue('https://test.com')
    expect(input).toHaveAttribute('type', 'url')
  })
})
