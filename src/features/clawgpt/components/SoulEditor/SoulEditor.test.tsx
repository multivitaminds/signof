import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SoulEditor from './SoulEditor'
import type { SoulConfig, SoulPreset } from '../../types'

const mockConfig: SoulConfig = {
  name: 'ClawGPT',
  personality: 'Helpful and professional',
  systemPrompt: 'You are a helpful assistant.',
  rules: ['Be polite', 'Stay on topic'],
  context: ['Company: Orchestree'],
  responseStyle: 'professional',
  language: 'English',
  timezone: 'UTC',
}

const mockPresets: SoulPreset[] = [
  {
    id: 'preset-1',
    name: 'Customer Support',
    description: 'Optimized for support conversations',
    config: { ...mockConfig, name: 'Support Bot' },
  },
  {
    id: 'preset-2',
    name: 'Sales Agent',
    description: 'Optimized for sales',
    config: { ...mockConfig, name: 'Sales Bot' },
  },
]

describe('SoulEditor', () => {
  const defaultProps = {
    config: mockConfig,
    presets: mockPresets,
    activePresetId: null as string | null,
    onUpdate: vi.fn(),
    onSwitchPreset: vi.fn(),
    onReset: vi.fn(),
    onAddRule: vi.fn(),
    onRemoveRule: vi.fn(),
    onAddContext: vi.fn(),
    onRemoveContext: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders config name', () => {
    render(<SoulEditor {...defaultProps} />)
    const nameInput = screen.getByLabelText('Name') as HTMLInputElement
    expect(nameInput.value).toBe('ClawGPT')
  })

  it('renders personality textarea', () => {
    render(<SoulEditor {...defaultProps} />)
    const textarea = screen.getByLabelText('Personality') as HTMLTextAreaElement
    expect(textarea.value).toBe('Helpful and professional')
  })

  it('renders system prompt', () => {
    render(<SoulEditor {...defaultProps} />)
    const prompt = screen.getByLabelText('System Prompt') as HTMLTextAreaElement
    expect(prompt.value).toBe('You are a helpful assistant.')
  })

  it('renders response style radio buttons', () => {
    render(<SoulEditor {...defaultProps} />)
    const radios = screen.getAllByRole('radio')
    expect(radios).toHaveLength(6)
    const professional = screen.getByLabelText('Professional')
    expect(professional).toBeChecked()
  })

  it('renders preset selector with options', () => {
    render(<SoulEditor {...defaultProps} />)
    expect(screen.getByLabelText('Preset')).toBeInTheDocument()
    expect(screen.getByText('Customer Support')).toBeInTheDocument()
    expect(screen.getByText('Sales Agent')).toBeInTheDocument()
  })

  it('calls onSwitchPreset when preset is changed', async () => {
    const user = userEvent.setup()
    render(<SoulEditor {...defaultProps} />)
    await user.selectOptions(screen.getByLabelText('Preset'), 'preset-1')
    expect(defaultProps.onSwitchPreset).toHaveBeenCalledWith('preset-1')
  })

  it('renders rules', () => {
    render(<SoulEditor {...defaultProps} />)
    expect(screen.getByText('Be polite')).toBeInTheDocument()
    expect(screen.getByText('Stay on topic')).toBeInTheDocument()
  })

  it('calls onAddRule when adding a rule', async () => {
    const user = userEvent.setup()
    render(<SoulEditor {...defaultProps} />)
    const input = screen.getByLabelText('New rule')
    await user.type(input, 'New rule text')
    await user.click(screen.getAllByText('Add')[0]!)
    expect(defaultProps.onAddRule).toHaveBeenCalledWith('New rule text')
  })

  it('calls onRemoveRule when remove is clicked', async () => {
    const user = userEvent.setup()
    render(<SoulEditor {...defaultProps} />)
    await user.click(screen.getByLabelText('Remove rule: Be polite'))
    expect(defaultProps.onRemoveRule).toHaveBeenCalledWith(0)
  })

  it('renders context blocks', () => {
    render(<SoulEditor {...defaultProps} />)
    expect(screen.getByText('Company: Orchestree')).toBeInTheDocument()
  })

  it('calls onAddContext when adding context', async () => {
    const user = userEvent.setup()
    render(<SoulEditor {...defaultProps} />)
    const input = screen.getByLabelText('New context')
    await user.type(input, 'New context info')
    await user.click(screen.getAllByText('Add')[1]!)
    expect(defaultProps.onAddContext).toHaveBeenCalledWith('New context info')
  })

  it('calls onRemoveContext when remove is clicked', async () => {
    const user = userEvent.setup()
    render(<SoulEditor {...defaultProps} />)
    await user.click(screen.getByLabelText('Remove context: Company: Orchestree'))
    expect(defaultProps.onRemoveContext).toHaveBeenCalledWith(0)
  })

  it('calls onReset when reset button is clicked', async () => {
    const user = userEvent.setup()
    render(<SoulEditor {...defaultProps} />)
    await user.click(screen.getByLabelText('Reset configuration'))
    expect(defaultProps.onReset).toHaveBeenCalledOnce()
  })

  it('renders language and timezone inputs', () => {
    render(<SoulEditor {...defaultProps} />)
    const langInput = screen.getByLabelText('Language') as HTMLInputElement
    const tzInput = screen.getByLabelText('Timezone') as HTMLInputElement
    expect(langInput.value).toBe('English')
    expect(tzInput.value).toBe('UTC')
  })

  it('calls onUpdate when name changes', async () => {
    const user = userEvent.setup()
    render(<SoulEditor {...defaultProps} />)
    const nameInput = screen.getByLabelText('Name')
    await user.clear(nameInput)
    await user.type(nameInput, 'New Name')
    expect(defaultProps.onUpdate).toHaveBeenCalled()
  })
})
