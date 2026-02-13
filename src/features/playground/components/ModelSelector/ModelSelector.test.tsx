import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ModelSelector from './ModelSelector'
import { ModelId } from '../../types'

describe('ModelSelector', () => {
  const defaultProps = {
    value: ModelId.ClaudeSonnet,
    onChange: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders current model name', () => {
    render(<ModelSelector {...defaultProps} />)
    expect(screen.getByText('Claude Sonnet')).toBeInTheDocument()
  })

  it('opens dropdown on click', async () => {
    const user = userEvent.setup()
    render(<ModelSelector {...defaultProps} />)

    await user.click(screen.getByRole('button', { name: 'Select model' }))
    expect(screen.getByRole('listbox')).toBeInTheDocument()
  })

  it('shows provider groups', async () => {
    const user = userEvent.setup()
    render(<ModelSelector {...defaultProps} />)

    await user.click(screen.getByRole('button', { name: 'Select model' }))
    expect(screen.getByText('Anthropic')).toBeInTheDocument()
    expect(screen.getByText('OpenAI')).toBeInTheDocument()
    expect(screen.getByText('Google')).toBeInTheDocument()
    expect(screen.getByText('Meta')).toBeInTheDocument()
  })

  it('calls onChange when option selected', async () => {
    const user = userEvent.setup()
    render(<ModelSelector {...defaultProps} />)

    await user.click(screen.getByRole('button', { name: 'Select model' }))
    await user.click(screen.getByRole('option', { name: /GPT-4o Mini/ }))

    expect(defaultProps.onChange).toHaveBeenCalledWith(ModelId.Gpt4oMini)
  })
})
