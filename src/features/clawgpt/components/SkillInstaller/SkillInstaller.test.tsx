import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SkillInstaller from './SkillInstaller'
import type { Skill } from '../../types'

const mockSkill: Skill = {
  id: 'skill-1',
  name: 'Web Search',
  description: 'Search the web for real-time information',
  category: 'productivity',
  version: '1.2.0',
  author: 'Orchestree',
  icon: 'S',
  installed: true,
  enabled: true,
  config: { apiKey: 'sk-123', maxResults: '10' },
  triggers: [],
  actions: [],
}

describe('SkillInstaller', () => {
  const defaultProps = {
    skill: mockSkill,
    onSave: vi.fn(),
    onCancel: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders skill name', () => {
    render(<SkillInstaller {...defaultProps} />)
    expect(screen.getByText('Web Search')).toBeInTheDocument()
  })

  it('renders skill description', () => {
    render(<SkillInstaller {...defaultProps} />)
    expect(screen.getByText('Search the web for real-time information')).toBeInTheDocument()
  })

  it('renders version and category', () => {
    render(<SkillInstaller {...defaultProps} />)
    expect(screen.getByText(/1\.2\.0/)).toBeInTheDocument()
    expect(screen.getByText(/Productivity/)).toBeInTheDocument()
  })

  it('renders config fields', () => {
    render(<SkillInstaller {...defaultProps} />)
    expect(screen.getByLabelText('apiKey')).toBeInTheDocument()
    expect(screen.getByLabelText('maxResults')).toBeInTheDocument()
  })

  it('pre-fills config values', () => {
    render(<SkillInstaller {...defaultProps} />)
    const apiKeyInput = screen.getByLabelText('apiKey') as HTMLInputElement
    expect(apiKeyInput.value).toBe('sk-123')
  })

  it('calls onSave with config values', async () => {
    const user = userEvent.setup()
    render(<SkillInstaller {...defaultProps} />)

    const apiKeyInput = screen.getByLabelText('apiKey')
    await user.clear(apiKeyInput)
    await user.type(apiKeyInput, 'sk-new')

    await user.click(screen.getByText('Save'))
    expect(defaultProps.onSave).toHaveBeenCalledOnce()
    const savedConfig = defaultProps.onSave.mock.calls[0]![0]
    expect(savedConfig.apiKey).toBe('sk-new')
    expect(savedConfig.maxResults).toBe('10')
  })

  it('calls onCancel when Cancel is clicked', async () => {
    const user = userEvent.setup()
    render(<SkillInstaller {...defaultProps} />)
    await user.click(screen.getByText('Cancel'))
    expect(defaultProps.onCancel).toHaveBeenCalledOnce()
  })

  it('does not render config section when no config keys', () => {
    const skill: Skill = { ...mockSkill, config: {} }
    render(<SkillInstaller {...defaultProps} skill={skill} />)
    expect(screen.queryByText('Configuration')).not.toBeInTheDocument()
  })
})
